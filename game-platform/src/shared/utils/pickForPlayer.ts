/**
 * The `isPlayer1 ? player1Value : player2Value` perspective-mapping ternary,
 * duplicated 4x in GameScene.ts and once in ResultPage.tsx before this extraction.
 */
export function pickForPlayer<T>(is_player1: boolean, player1_value: T, player2_value: T): T {
  return is_player1 ? player1_value : player2_value
}
