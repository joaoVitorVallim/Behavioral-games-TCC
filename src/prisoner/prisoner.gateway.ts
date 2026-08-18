import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { PrisonerService } from './prisoner.service';
import { JoinPrisonerMatchDto } from './dto/join-prisoner-match.dto';
import { SubmitChoiceDto } from './dto/submit-choice.dto';
import { ParseSocketBodyPipe } from '../common/pipes/parse-socket-body.pipe';
import { PrisonerMatchState } from './interfaces/prisoner-match.interface';

@WebSocketGateway({ namespace: '/prisoner', cors: { origin: '*' } })
export class PrisonerGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly prisonerService: PrisonerService) {}

  afterInit() {
    this.prisonerService.setRoundTimeoutCallback((matchId) => {
      this.handleRoundTimeout(matchId).catch((err) => {
        console.error(`[Prisoner] Falha ao resolver timeout da match ${matchId}:`, err);
      });
    });
  }

  private emitRoundStart(state: PrisonerMatchState) {
    this.server.to(state.matchId).emit('roundStart', {
      matchId: state.matchId,
      round: state.currentRound,
      totalRounds: state.totalRounds,
      roundEndsAt: state.roundDeadline,
      serverNow: Date.now(),
    });
  }

  private totalPointsFor(state: PrisonerMatchState, isPlayer1: boolean) {
    const show = state.userViewPoints;
    return {
      player1: isPlayer1 || show ? state.player1TotalPoints : null,
      player2: !isPlayer1 || show ? state.player2TotalPoints : null,
    };
  }

  private async emitRoundOutcome(state: PrisonerMatchState, timedOut: boolean) {
    const finished = state.status === 'finished';
    const roundNumber = finished ? state.totalRounds : state.currentRound - 1;
    const result = state.moves[String(roundNumber)];

    if (timedOut) {
      this.server.to(state.matchId).emit('roundTimeout', {
        matchId: state.matchId,
        round: roundNumber,
      });
    }

    const sendResult = (socketId: string | null, isPlayer1: boolean) => {
      if (!socketId) return;
      this.server.to(socketId).emit('roundResult', {
        round: roundNumber,
        result,
        totalPoints: this.totalPointsFor(state, isPlayer1),
        nextRound: finished ? null : state.currentRound,
        timedOut,
      });
    };
    sendResult(state.player1SocketId, true);
    sendResult(state.player2SocketId, false);

    if (finished) {
      await this.prisonerService.finalizeMatch(state.matchId);
      this.server.to(state.matchId).emit('matchFinished', {
        matchId: state.matchId,
        moves: state.moves,
        finalScore: {
          player1: state.player1TotalPoints,
          player2: state.player2TotalPoints,
        },
      });
    } else {
      this.emitRoundStart(state);
    }
  }

  private async handleRoundTimeout(matchId: string) {
    const resolved = this.prisonerService.forceResolveRound(matchId);
    if (!resolved) return;
    await this.emitRoundOutcome(resolved.state, true);
  }

  handleConnection(client: Socket) {
    console.log(`[Prisoner] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const state = this.prisonerService.disconnectPlayer(client.id);
    if (state) {
      this.server.to(state.matchId).emit('playerDisconnected', {
        matchId: state.matchId,
        status: state.status,
      });
    }
  }

  @SubscribeMessage('joinMatch')
  @UsePipes(new ParseSocketBodyPipe(), new ValidationPipe({ whitelist: true }))
  async handleJoinMatch(
    @MessageBody() dto: JoinPrisonerMatchDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Always call initMatch — it's idempotent and handles concurrent calls safely
      await this.prisonerService.initMatch(dto.matchId);

      const state = this.prisonerService.connectPlayer(dto.matchId, dto.playerId, client.id);
      client.join(dto.matchId);

      if (state.status === 'finished') {
        client.emit('matchFinished', {
          matchId: dto.matchId,
          moves: state.moves,
          finalScore: {
            player1: state.player1TotalPoints,
            player2: state.player2TotalPoints,
          },
        });
        return;
      }

      client.emit('joinedMatch', {
        matchId: dto.matchId,
        playerId: dto.playerId,
        totalRounds: state.totalRounds,
        roundTimeLimit: state.roundTimeLimit,
        userViewPoints: state.userViewPoints,
        status: 'waiting',
      });

      if (state.status === 'in_progress') {

        const sendReady = (socketId: string | null, isPlayer1: boolean) => {
          if (!socketId) return;
          this.server.to(socketId).emit('matchReady', {
            matchId: dto.matchId,
            currentRound: state.currentRound,
            totalRounds: state.totalRounds,
            roundTimeLimit: state.roundTimeLimit,
            userViewPoints: state.userViewPoints,
            player1Id: state.player1Id,
            player2Id: state.player2Id,
            totalPoints: this.totalPointsFor(state, isPlayer1),
            pendingChoices: {
              player1: state.pendingChoices.player1 !== undefined,
              player2: state.pendingChoices.player2 !== undefined,
            },
            roundEndsAt: state.roundDeadline,
            serverNow: Date.now(),
          });
        };
        sendReady(state.player1SocketId, true);
        sendReady(state.player2SocketId, false);

        this.emitRoundStart(state);
      }
    } catch (err: unknown) {

      const finished = await this.prisonerService
        .getFinishedMatchPayload(dto.matchId, dto.playerId)
        .catch(() => null);
      if (finished) {
        client.emit('matchFinished', finished);
        return;
      }

      client.emit('error', { message: (err as Error).message });
    }
  }

  @SubscribeMessage('submitChoice')
  @UsePipes(new ParseSocketBodyPipe(), new ValidationPipe({ whitelist: true }))
  async handleSubmitChoice(
    @MessageBody() dto: SubmitChoiceDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { state, roundResolved } = this.prisonerService.submitChoice(
        dto.matchId,
        dto.playerId,
        dto.choice,
        dto.round,
      );

      client.emit('choiceReceived', { matchId: dto.matchId, round: state.currentRound });

      if (roundResolved) {
        await this.emitRoundOutcome(state, false);
      }
    } catch (err: unknown) {
      client.emit('error', { message: (err as Error).message });
    }
  }

  @SubscribeMessage('getMatchState')
  handleGetMatchState(
    @MessageBody(new ParseSocketBodyPipe()) body: { matchId: string; playerId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const state = this.prisonerService.getState(body.matchId);

      const isPlayer1 = state.player1SocketId === client.id;
      const isPlayer2 = state.player2SocketId === client.id;
      if (!isPlayer1 && !isPlayer2) {
        throw new Error('Socket is not connected to this match');
      }
      client.emit('matchState', {
        matchId: state.matchId,
        currentRound: state.currentRound,
        totalRounds: state.totalRounds,
        roundTimeLimit: state.roundTimeLimit,
        userViewPoints: state.userViewPoints,
        status: state.status,
        totalPoints: this.totalPointsFor(state, isPlayer1),
        pendingChoices: {
          player1: state.pendingChoices.player1 !== undefined,
          player2: state.pendingChoices.player2 !== undefined,
        },
        roundEndsAt: state.roundDeadline,
        serverNow: Date.now(),
      });
    } catch (err: unknown) {
      client.emit('error', { message: (err as Error).message });
    }
  }
}
