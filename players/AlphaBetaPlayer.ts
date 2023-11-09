import Board, { Move } from "../game/Board";
import Piece, { PieceColor } from "../game/Piece";
import Tile from "../game/Tile";
import Player, { MoveOutcome } from "./Player";

export type PlayerLevel = "Beginner" | "Normal" | "Expert";

type MoveState = { actualMove?: Move; move: Move; state: Tile[] };

export default class AlphaBetaPlayer extends Player {
  private readonly _level: number;

  constructor(name: string, level: PlayerLevel | number, color: PieceColor) {
    super(name, "PC", color);
    this._level = this.getExpansionDepth(level);
  }

  public play(board: Board): Promise<{ result: MoveOutcome; move?: Move }> {
    return new Promise((resolve, _) => {
      setTimeout(() => {
        const moves = board.getAllPossibleMovesForPieces(this._color);
        if (!moves?.length) {
          // player has no moves; so player lost game
          resolve({ result: "NoMove" });
          return;
        }

        const handler = (result: {
          updateType: string;
          shouldContinue: boolean;
          move: Move;
        }): void => {
          board.unsubscribeToEvent("BoardUpdated", handler);

          if (result.updateType !== "PieceMoved") {
            throw new Error(`Unexpected event type: ${result.updateType}`);
          }

          resolve({
            result: result.shouldContinue ? "Continue" : "Yield",
            move: result.move,
          });
        };

        board.subscribeToEvent("BoardUpdated", handler);

        const nextMove =
          moves.length === 1 ? moves[0] : this.getNextMove(board.getTiles());
        board.movePiece(nextMove.from, nextMove.to);
      }, 1000);
    });
  }

  private getNextMove(tiles: Tile[]): Move {
    return this.executeAlphaBeta(tiles, -Infinity, Infinity, true, this._level)
      .move!;
  }

  private executeAlphaBeta(
    state: Tile[],
    alpha: number,
    beta: number,
    isMax: boolean,
    depth: number,
  ): { move: Move | null; value: number } {
    const children: MoveState[] = this.expandChildren(state);
    if (depth === 0 || !children.length) {
      return { value: this.evaluate(state), move: null };
    }

    let bestMove: Move = children[0].move;
    if (isMax) {
      let value = -Infinity;
      for (let i = 0; i < children.length; i++) {
        const moveValue = this.executeAlphaBeta(
          children[i].state,
          alpha,
          beta,
          false,
          depth - 1,
        );
        value = Math.max(value, moveValue.value);

        if (value > alpha) {
          alpha = value;
          bestMove = children[i].actualMove!;
        }

        if (beta <= alpha) break;
      }

      return { move: bestMove, value: value };
    }

    let value = Infinity;
    for (let i = 0; i < children.length; i++) {
      const moveValue = this.executeAlphaBeta(
        children[i].state,
        alpha,
        beta,
        true,
        depth - 1,
      );
      value = Math.min(value, moveValue.value);

      if (value < beta) {
        beta = value;
        bestMove = children[i].actualMove!;
      }

      if (beta <= alpha) break;
    }

    return { move: bestMove, value: value };
  }

  private evaluate(state: Tile[]): number {
    let numOfPieces: number = 0;
    for (let i = 0; i < state.length; i++) {
      const piece = state[i].piece;
      if (!piece || piece.color !== this._color) continue;
      numOfPieces++;
    }

    return numOfPieces;
  }

  private evaluate2(state: Tile[]): number {
    const size = Math.sqrt(state.length);
    const middleRange = [
      state.length / 2 - size * 2,
      state.length / 2 + size * 2 - 1,
    ];
    let numOfMen = 0;
    let numOfKings = 0;
    let numOfAttackingPieces = 0;
    let numOfMiddlePieces = 0;
    let numOfPossibleMoves = 0;
    let numOfOpponentPieces = 0;
    for (let i = 0; i < state.length; i++) {
      const piece = state[i].piece;
      if (!piece) continue;
      const moves = Board.getMovesForPiece(piece.tileNumber, state, size);

      if (piece.color === this._color) {
        piece.isKing ? numOfKings++ : numOfMen++;
        if (moves.some(m => m.isKill)) numOfAttackingPieces++;
        if (i >= middleRange[0] && i <= middleRange[1]) numOfMiddlePieces++;
        numOfPossibleMoves += moves.length;
      } else {
        numOfOpponentPieces++;
      }
    }

    const numberOfKills = 12 - numOfOpponentPieces;
    return (
      2 * numOfMen +
      3 * numOfKings +
      2 * numOfAttackingPieces +
      5 * numOfMiddlePieces +
      numOfPossibleMoves +
      10 * numberOfKills
    );
  }

  private expandChildren(state: Tile[]): MoveState[] {
    let children: MoveState[] = [];
    for (let i = 0; i < state.length; i++) {
      const piece = state[i].piece;
      if (!piece || piece.color !== this._color) continue;
      const size = Math.sqrt(state.length);
      children = [
        ...children,
        ...this.expandChildrenForMove(
          { move: { from: -1, to: i, isKill: false }, state },
          size,
          false,
        ),
      ];
    }

    const hasKills = children.some(c => c.actualMove!.isKill);
    return !hasKills ? children : children.filter(c => c.actualMove!.isKill);
  }

  private expandChildrenForMove(
    { actualMove, move, state }: MoveState,
    size: number,
    includeState: boolean,
  ): MoveState[] {
    let children: MoveState[] = [];
    const moves: Move[] = Board.getMovesForPiece(move.to, state, size);
    if (!moves.length && includeState) {
      children.push({
        actualMove: actualMove,
        move: move,
        state: state,
      });
      return children;
    }

    for (let j = 0; j < moves.length; j++) {
      const moveState: MoveState = this.generateStateFromMove(
        { actualMove: actualMove || moves[j], move: moves[j], state: state },
        size,
      );

      if (moves[j].isKill) {
        children = [
          ...children,
          ...this.expandChildrenForMove(moveState, size, true),
        ];
      } else {
        children.push(moveState);
      }
    }

    return children;
  }

  private generateStateFromMove(
    { actualMove, move, state }: MoveState,
    size: number,
  ): MoveState {
    const newState: Tile[] = [...state];
    const piece = new Piece(this._color, false, move.to);
    Board.setIsKing(piece, size);
    newState[move.to] = new Tile(piece);
    newState[move.from] = new Tile();
    if (move.isKill) {
      newState[(move.to - move.from) / 2 + move.from] = new Tile();
    }

    return { actualMove, move, state: newState };
  }

  private getExpansionDepth(level: PlayerLevel | number): number {
    switch (level) {
      case "Beginner":
        return 3;
      case "Normal":
        return 5;
      case "Expert":
        return 9;
      default:
        return typeof level === "number" && level >= 2 ? level : 3;
    }
  }
}
