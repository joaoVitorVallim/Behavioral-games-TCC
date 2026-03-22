import type { BettingGameConfig, BetPopupData, BetResult } from '../types'

// Mock data for testing
const MOCK_CONFIG: BettingGameConfig = {
  id: 'config-1',
  configName: 'Demo Configuration',
  game: 'betting',
  startingPoints: 500,
  redMultiplier: 2,
  blackMultiplier: 2,
  blueMultiplier: 5,
  limitMode: 'points',
  limitValue: 200,
  bonusPoints: 50,
  bonusIntervalRounds: 3,
  popupAtTimePercent: 50,
  popupAtPointsValue: 150,
  demoMode: true,
}

const MOCK_POPUP_DATA: BetPopupData = {
  id: 'popup-1',
  phrase: 'Excelente desempenho! Continue assim!',
  selectedStudentCount: 3,
  timeGainedPerStudentSeconds: 30,
  gamesUntilBonusActivation: 5,
  sessionId: 'demo',
}

export const bettingService = {
  getGameConfig: async (sessionId: string): Promise<BettingGameConfig> => {
    // Mock: simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))
    console.log(`[MOCK] getGameConfig(${sessionId})`)
    return MOCK_CONFIG
  },

  getPopupData: async (sessionId: string): Promise<BetPopupData> => {
    // Mock: simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200))
    console.log(`[MOCK] getPopupData(${sessionId})`)
    return MOCK_POPUP_DATA
  },

  submitGameResult: async (sessionId: string, result: BetResult): Promise<void> => {
    // Mock: simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 150))
    console.log(`[MOCK] submitGameResult(${sessionId}):`, result)
  },

  submitMarkedStudents: async (sessionId: string, popupId: string, markedStudentIds: string[]): Promise<void> => {
    // Mock: simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 150))
    console.log(`[MOCK] submitMarkedStudents(${sessionId}, ${popupId}):`, markedStudentIds)
  },
}
