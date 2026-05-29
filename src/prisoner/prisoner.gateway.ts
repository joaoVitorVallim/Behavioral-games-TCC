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

@WebSocketGateway({ namespace: '/prisoner', cors: { origin: '*' } })
export class PrisonerGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly prisonerService: PrisonerService) {}

  afterInit() {
    this.prisonerService.setRoundTimeoutCallback((matchId) => {
      this.handleRoundTimeout(matchId);
    });
  }

  private async handleRoundTimeout(matchId: string) {
    const result = this.prisonerService.forceResolveRound(matchId);
    if (!result) return;

    const { state } = result;
    const roundNumber = state.status === 'finished' ? state.totalRounds : state.currentRound - 1;

    this.server.to(matchId).emit('roundTimeout', { matchId, round: roundNumber });

    this.server.to(matchId).emit('roundResult', {
      round: roundNumber,
      result: state.moves[String(roundNumber)],
      totalPoints: {
        player1: state.player1TotalPoints,
        player2: state.player2TotalPoints,
      },
      nextRound: state.status === 'finished' ? null : state.currentRound,
      timedOut: true,
    });

    if (state.status === 'finished') {
      await this.prisonerService.finalizeMatch(matchId);
      this.server.to(matchId).emit('matchFinished', {
        matchId,
        moves: state.moves,
        finalScore: {
          player1: state.player1TotalPoints,
          player2: state.player2TotalPoints,
        },
      });
    }
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

      client.emit('joinedMatch', {
        matchId: dto.matchId,
        playerId: dto.playerId,
        totalRounds: state.totalRounds,
        roundTimeLimit: state.roundTimeLimit,
        userViewPoints: state.userViewPoints,
        status: 'waiting',
      });

      if (state.status === 'in_progress') {
        this.server.to(dto.matchId).emit('matchReady', {
          matchId: dto.matchId,
          currentRound: state.currentRound,
          totalRounds: state.totalRounds,
          roundTimeLimit: state.roundTimeLimit,
          userViewPoints: state.userViewPoints,
          player1Id: state.player1Id,
          player2Id: state.player2Id,
        });
      }
    } catch (err: unknown) {
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
      );

      client.emit('choiceReceived', { matchId: dto.matchId, round: state.currentRound });

      if (roundResolved) {
        const roundNumber = state.status === 'finished'
          ? state.totalRounds
          : state.currentRound - 1;

        this.server.to(dto.matchId).emit('roundResult', {
          round: roundNumber,
          result: state.moves[String(roundNumber)],
          totalPoints: {
            player1: state.player1TotalPoints,
            player2: state.player2TotalPoints,
          },
          nextRound: state.status === 'finished' ? null : state.currentRound,
          timedOut: false,
        });

        if (state.status === 'finished') {
          await this.prisonerService.finalizeMatch(dto.matchId);
          this.server.to(dto.matchId).emit('matchFinished', {
            matchId: dto.matchId,
            moves: state.moves,
            finalScore: {
              player1: state.player1TotalPoints,
              player2: state.player2TotalPoints,
            },
          });
        }
      }
    } catch (err: unknown) {
      client.emit('error', { message: (err as Error).message });
    }
  }

  @SubscribeMessage('getMatchState')
  handleGetMatchState(
    @MessageBody(new ParseSocketBodyPipe()) body: { matchId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const state = this.prisonerService.getState(body.matchId);
      client.emit('matchState', {
        matchId: state.matchId,
        currentRound: state.currentRound,
        totalRounds: state.totalRounds,
        roundTimeLimit: state.roundTimeLimit,
        userViewPoints: state.userViewPoints,
        status: state.status,
        totalPoints: {
          player1: state.player1TotalPoints,
          player2: state.player2TotalPoints,
        },
      });
    } catch (err: unknown) {
      client.emit('error', { message: (err as Error).message });
    }
  }
}
