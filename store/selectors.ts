import { AppState, Commentary } from "./models";

export function commentarySelector(state: AppState): Commentary {
  return state.gameState.commentary;
}

export function whosTurnSelector(state: AppState): string {
  switch (state.gameState.whosTurn) {
    case 1:
      return "It's Player 1 turn";
    case 2:
      return "It's Player 2 turn";
    default:
      return "";
  }
}
