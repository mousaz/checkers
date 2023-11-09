export type GameOutcome =
  | "NotStarted"
  | "InProgress"
  | "Player1Won"
  | "Player2Won"
  | "Player1Conceded"
  | "Player2Conceded"
  | "Tie";

export type Player = {
  name: string;
  type: "Human" | "PC";
  level: "Expert" | "Normal" | "Beginner";
};

export type Commentary = {
  player1Comment?: string;
  player2Comment?: string;
  gameComment?: string;
  helpComment?: string;
};

export type WhosTurn = 0 | 1 | 2;

export interface AppState {
  gameState: GameState;
}

export interface GameState {
  gameOutCome: GameOutcome;
  player1?: Player;
  player2?: Player;
  whosTurn: WhosTurn;
  commentary: Commentary;
}
