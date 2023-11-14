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
        const possibleMoves = board.getAllPossibleMovesForPieces(this._color);
        if (!possibleMoves?.length) {
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
          possibleMoves.length === 1
            ? possibleMoves[0]
            : this.getNextMove(board.getTiles());
        board.movePiece(nextMove.from, nextMove.to);
      }, 1000);
    });
  }

  private getNextMove(tiles: Tile[]): Move {
    console.log("--------------------Turn Start----------------");
    const res = this.executeAlphaBeta(
      tiles,
      -Infinity,
      Infinity,
      true,
      this._level,
    );
    console.log(`Chosen value is: ${res.value}`);
    console.log("--------------------Turn end------------------");
    return res.move!;
  }

  private executeAlphaBeta(
    state: Tile[],
    alpha: number,
    beta: number,
    isMax: boolean,
    depth: number,
  ): { move: Move | null; value: number } {
    console.log(`Step is ${isMax ? "Max" : "Min"} with depth: ${depth}`);
    const children: MoveState[] = this.expandChildren(
      state,
      isMax ? this._color : this._color === "dark" ? "light" : "dark",
    );
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

        if (beta <= alpha) {
          console.log(`Cut in Max at depth ${depth}`);
          break;
        }
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

      if (beta <= alpha) {
        console.log(`Cut in Min at depth ${depth}`);
        break;
      }
    }

    return { move: bestMove, value: value };
  }

  private evaluate(state: Tile[]): number {
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
    let numOfOpponentMen = 0;
    let numOfOpponentKings = 0;
    let numOfUnsafePieces = 0;
    for (let i = 0; i < state.length; i++) {
      const piece = state[i].piece;
      if (!piece) continue;
      const moves = Board.getMovesForPiece(piece.tileNumber, state, size);

      if (piece.color === this._color) {
        piece.isKing ? numOfKings++ : numOfMen++;
        if (moves.some(m => m.isKill)) {
          numOfAttackingPieces++;
        }

        if (i >= middleRange[0] && i <= middleRange[1]) {
          numOfMiddlePieces++;
        }

        numOfPossibleMoves += moves.length;
        if (!this.isPieceSafe(state, piece.tileNumber, size)) {
          numOfUnsafePieces++;
        }
      } else {
        piece.isKing ? numOfOpponentKings++ : numOfOpponentMen++;
      }
    }

    console.log(
      `NumberOfPieces: ${numOfMen}, NumberOfKings: ${numOfKings},
      NumberOfAttackingPieces: ${numOfAttackingPieces}, numOfMiddlePieces: ${numOfMiddlePieces}, 
      numOfPossibleMoves: ${numOfPossibleMoves}, numOfOpponentKings: ${numOfOpponentKings}
      numOfOpponentMen: ${numOfOpponentMen}, numOfUnsafePieces: ${numOfUnsafePieces}`,
    );

    const attackingWeight = 2 * Math.pow(2, numOfKings);
    const menWeight = 2;
    const middlePiecesWeight = 10;
    const possibleMovesWeight = 2;
    const numOfUnsafePiecesWeight =
      numOfMen + numOfKings < numOfOpponentKings + numOfOpponentMen + 5 ? 3 : 1;
    const kingsWeight = 10;

    let value =
      menWeight * numOfMen +
      kingsWeight * numOfKings +
      attackingWeight * numOfAttackingPieces +
      middlePiecesWeight * numOfMiddlePieces +
      possibleMovesWeight * numOfPossibleMoves -
      menWeight * numOfOpponentMen -
      kingsWeight * numOfOpponentKings -
      numOfUnsafePiecesWeight * numOfUnsafePieces;

    console.log(`Value is: ${value}`);
    return value;
  }

  private isPieceSafe(
    state: Tile[],
    tileNumber: number,
    size: number,
  ): boolean {
    const piece = state[tileNumber].piece!;
    const row = Math.floor(tileNumber / size);
    const column = tileNumber % size;
    for (const rowStep of [1, -1]) {
      const r = row + rowStep;
      if (r < 0 || r >= size) continue;
      for (const colStep of [1, -1]) {
        const c = column + colStep;
        if (c >= 0 && c < size) {
          const opponentPiece = state[r * size + c].piece;
          if (opponentPiece && opponentPiece.color !== piece.color) {
            // Check if opponent piece can do the kill move
            if (
              opponentPiece.isKing ||
              (opponentPiece.color === "dark" && rowStep === 1) ||
              (opponentPiece.color === "light" && rowStep === -1)
            ) {
              const jumpRow = row + rowStep * -1;
              const jumpCol = column + colStep * -1;
              if (
                jumpRow >= 0 &&
                jumpRow < size &&
                jumpCol >= 0 &&
                jumpCol < size &&
                !state[jumpRow * size + jumpCol].piece
              ) {
                return false;
              }
            }
          }
        }
      }
    }

    return true;
  }

  private expandChildren(state: Tile[], pieceColor: PieceColor): MoveState[] {
    let children: MoveState[] = [];
    for (let i = 0; i < state.length; i++) {
      const piece = state[i].piece;
      if (!piece || piece.color !== pieceColor) continue;
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
    return this.shuffle(
      !hasKills ? children : children.filter(c => c.actualMove!.isKill),
    );
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

  private shuffle(children: MoveState[]): MoveState[] {
    if (children.length <= 2) return children;
    for (let i = 0; i < children.length; i++) {
      const j = Math.floor(Math.random() * (i + 1));
      [children[i], children[j]] = [children[j], children[i]];
    }

    return children;
  }

  private getExpansionDepth(level: PlayerLevel | number): number {
    switch (level) {
      case "Beginner":
        return 2;
      case "Normal":
        return 4;
      case "Expert":
        return 8;
      default:
        return typeof level === "number" && level > 0 ? level : 2;
    }
  }
}
