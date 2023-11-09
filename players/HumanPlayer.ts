import Board, { Move } from "../game/Board";
import { PieceColor } from "../game/Piece";
import Player, { MoveOutcome, PlayerType } from "./Player";

export default class HumanPlayer extends Player {
  constructor(name: string, color: PieceColor) {
    super(name, "Human", color);
  }

  public play(board: Board): Promise<{ result: MoveOutcome; move?: Move }> {
    return new Promise((resolve, _) => {
      const moves = board.getAllPossibleMovesForPieces(this._color);
      if (!moves?.length) {
        // player has no moves; so player lost game
        resolve({ result: "NoMove" });
        return;
      }

      const handler = ({
        updateType,
        shouldContinue,
        move,
      }: {
        updateType: string;
        isKill: boolean;
        shouldContinue: boolean;
        move?: Move;
      }) => {
        if (updateType === "PieceMoved") {
          if (shouldContinue) {
            resolve({ result: "Continue", move });
            return;
          }

          board.unsubscribeToEvent("BoardUpdated", handler);
          resolve({ result: "Yield", move });
          return;
        }

        board.unsubscribeToEvent("BoardUpdated", handler);
        if (updateType === "Conceded") {
          resolve({ result: "Concede" });
          return;
        }
      };

      board.subscribeToEvent("BoardUpdated", handler);
    });
  }
}
