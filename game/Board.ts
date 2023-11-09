import Piece, { PieceColor } from "./Piece";
import Tile from "./Tile";

export type BoardEventHandler = (eventData: any) => void;
export type BoardEvent = "BoardUpdated";

export interface Move {
  isKill: boolean;
  from: number;
  to: number;
}

export default class Board {
  private readonly _tiles: Tile[];
  private _pieces: Piece[];
  private readonly _size: number;

  private readonly _events: Map<BoardEvent, BoardEventHandler[]>;

  constructor(size: number) {
    this._size = size;
    this._events = new Map<BoardEvent, BoardEventHandler[]>();
    this._events.set("BoardUpdated", []);
    this._pieces = [];
    this._tiles = this.initialize();
  }

  public getTiles(): Tile[] {
    return this._tiles;
  }

  public subscribeToEvent(
    event: BoardEvent,
    eventHandler: BoardEventHandler,
  ): void {
    this._events.get(event)?.push(eventHandler);
  }

  public unsubscribeToEvent(
    event: BoardEvent,
    eventHandler: BoardEventHandler,
  ): void {
    const eventHandlers = this._events.get(event);
    if (!eventHandlers) return;
    this._events.set(
      event,
      eventHandlers.filter(e => e != eventHandler),
    );
  }

  public movePiece(fromIndex: number, toIndex: number): void {
    const fullSize = this._size * this._size;
    if (
      fromIndex < 0 ||
      fromIndex >= fullSize ||
      toIndex < 0 ||
      toIndex >= fullSize
    ) {
      throw new RangeError(
        `Incorrect indices: from=${fromIndex}, to=${toIndex}`,
      );
    }

    const pieceRawIndex = Math.floor(fromIndex / this._size);
    const pieceColumnIndex = fromIndex % this._size;
    const tileRawIndex = Math.floor(toIndex / this._size);
    const tileColumnIndex = toIndex % this._size;
    if (!this._tiles[fromIndex].piece) {
      throw new Error(`Illegal move: No piece found at index: ${fromIndex}`);
    }

    if (this._tiles[toIndex].piece) {
      throw new Error(`Illegal move: Tile at index ${toIndex} is not empty.`);
    }

    const rowDiff = tileRawIndex - pieceRawIndex;
    const colDiff = tileColumnIndex - pieceColumnIndex;
    if (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 1) {
      this.performNormalMove(fromIndex, toIndex);
      return;
    }

    if (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2) {
      this.performKillMove(fromIndex, toIndex, rowDiff, colDiff);
      return;
    }

    throw new Error("Illegal move: Step difference is not expected.");
  }

  public getAllPossibleMovesForPieces(pieceColor: PieceColor): Move[] {
    let hasKillMoves = false;
    let moves: Move[] = [];

    const piecesThatCanMove = this._tiles.reduce(
      (pieces: Piece[], currentTile: Tile) => {
        if (
          currentTile.piece?.color === pieceColor &&
          currentTile.piece?.canMove
        ) {
          pieces.push(currentTile.piece);
        }

        return pieces;
      },
      [],
    );

    for (const piece of piecesThatCanMove) {
      if (piece) {
        const foundMoves = this.getPossibleMovesForPiece(piece.tileNumber);
        hasKillMoves = hasKillMoves || foundMoves.some(m => m.isKill);
        moves = [...moves, ...foundMoves];
      }
    }

    return hasKillMoves ? moves.filter(m => m.isKill) : moves;
  }

  public getPossibleMovesForPiece(tileNumber: number): Move[] {
    return Board.getMovesForPiece(tileNumber, this._tiles.flat(), this._size);
  }

  public static getMovesForPiece(
    tileNumber: number,
    tiles: Tile[],
    size: number,
  ): Move[] {
    const fullSize = size * size;
    if (tileNumber < 0 || tileNumber >= fullSize) {
      throw new RangeError(`Incorrect index. Tile#: ${tileNumber}`);
    }

    const tileRowIndex = Math.floor(tileNumber / size);
    const tileColumnIndex = tileNumber % size;
    const tile = tiles[tileNumber];
    const piece = tile.piece;
    if (!piece) throw new Error("Tile is empty");

    let potentialMoves = Board.getPotentialMoves(
      tileRowIndex,
      tileColumnIndex,
      size,
      piece.color === "dark" ? -1 : 1,
    );

    if (piece.isKing) {
      potentialMoves = [
        ...potentialMoves,
        ...Board.getPotentialMoves(
          tileRowIndex,
          tileColumnIndex,
          size,
          piece.color === "dark" ? 1 : -1,
        ),
      ];
    }

    const moves: number[][] = [];
    const killMoves: number[][] = [];
    for (let i = 0; i < potentialMoves.length; i++) {
      const [r, c] = potentialMoves[i];
      if (!tiles[r * size + c].piece) {
        // Target tile is empty so move can be done
        moves.push(potentialMoves[i]);
      } else if (tiles[r * size + c].piece!.color !== piece.color) {
        // Tile contains opponent's piece
        // Check if possible to kill piece (target tile is empty)
        const jumpRawIndex = r * 2 - tileRowIndex;
        const jumpColIndex = c * 2 - tileColumnIndex;
        if (
          jumpRawIndex >= 0 &&
          jumpRawIndex < size &&
          jumpColIndex >= 0 &&
          jumpColIndex < size &&
          !tiles[jumpRawIndex * size + jumpColIndex].piece
        ) {
          // Add this tile to kill moves
          killMoves.push([jumpRawIndex, jumpColIndex]);
        }
      }
    }

    // If there are kill moves then they are the only possible moves
    // If not return the normal moves.
    return (killMoves.length ? killMoves : moves).flatMap(m => {
      return {
        isKill: !!killMoves.length,
        from: tileNumber,
        to: m[0] * size + m[1],
      };
    });
  }

  public static setIsKing(piece: Piece, size: number) {
    piece.isKing =
      piece.isKing ||
      (piece.color === "dark" && Math.floor(piece.tileNumber / size) === 0) ||
      (piece.color === "light" &&
        Math.floor(piece.tileNumber / size) === size - 1);
  }

  private static getPotentialMoves(
    raw: number,
    column: number,
    size: number,
    rowStep: -1 | 1,
  ): number[][] {
    const moves = [];
    const r = raw + rowStep;
    const c1 = column - 1;
    const c2 = column + 1;
    if (r >= 0 && r < size) {
      if (c1 >= 0) moves.push([r, c1]);
      if (c2 < size) moves.push([r, c2]);
    }

    return moves;
  }

  private initialize(): Tile[] {
    let tiles: Tile[] = [];
    for (let i = 0; i < this._size; i++) {
      tiles = [...tiles, ...this.getInitialRaw(i)];
    }

    return tiles;
  }

  private getInitialRaw(rawIndex: number): Tile[] {
    const row: Tile[] = [];
    const shouldFillRow = rawIndex < 3 || rawIndex > 4;
    for (let i = 0; i < this._size; i++) {
      let piece: Piece | undefined = undefined;
      if (shouldFillRow && (rawIndex + i) % 2 === 0) {
        piece = new Piece(
          rawIndex < 3 ? "light" : "dark",
          rawIndex === 5,
          rawIndex * this._size + i,
        );
        piece.tileNumber = rawIndex * this._size + i;
        this._pieces.push(piece);
      }
      row.push(new Tile(piece));
    }

    return row;
  }

  private performNormalMove(fromIndex: number, toIndex: number): void {
    const piece = this._tiles[fromIndex].piece!;
    this._tiles[toIndex].piece = piece;
    piece.tileNumber = toIndex;
    this._tiles[fromIndex].emptyTile();
    Board.setIsKing(piece!, this._size);
    this.updatePieces(piece, false);
    this.raiseEvent("BoardUpdated", {
      updateType: "PieceMoved",
      move: {
        isKill: false,
        from: fromIndex,
        to: toIndex,
      },
    });
  }

  private performKillMove(
    fromIndex: number,
    toIndex: number,
    rowDiff: number,
    colDiff: number,
  ): void {
    const piece = this._tiles[fromIndex].piece!;
    this._tiles[toIndex].piece = piece;
    piece.tileNumber = toIndex;
    const isAlreadyAKing = piece.isKing;
    this._tiles[fromIndex].emptyTile();
    const killedPiece =
      this._tiles[
        (Math.floor(fromIndex / this._size) + rowDiff / 2) * this._size +
          (fromIndex % this._size) +
          colDiff / 2
      ].emptyTile()!;
    !isAlreadyAKing && Board.setIsKing(piece, this._size);
    const shouldContinue =
      (isAlreadyAKing || !piece.isKing) && this.canPieceKill(piece);
    this.updatePieces(piece, shouldContinue, killedPiece);
    this.raiseEvent("BoardUpdated", {
      updateType: "PieceMoved",
      shouldContinue: shouldContinue,
      move: {
        isKill: true,
        from: fromIndex,
        to: toIndex,
      },
    });
  }

  private updatePieces(
    movedPiece: Piece,
    shouldContinue: boolean,
    killedPiece?: Piece,
  ): void {
    this._pieces = this._pieces.reduce((updated: Piece[], currentPiece) => {
      if (currentPiece !== killedPiece) {
        currentPiece.canMove =
          (currentPiece === movedPiece && shouldContinue) ||
          (!shouldContinue &&
            currentPiece.color !== movedPiece.color &&
            this.canPieceMove(currentPiece));
        updated.push(currentPiece);
      }

      return updated;
    }, []);
  }

  private canPieceMove(piece: Piece): boolean {
    return !!Board.getMovesForPiece(piece.tileNumber, this._tiles, this._size)
      .length;
  }

  private canPieceKill(piece: Piece): boolean {
    return Board.getMovesForPiece(
      piece.tileNumber,
      this._tiles,
      this._size,
    ).some(m => m.isKill);
  }

  private raiseEvent(event: BoardEvent, eventData: any) {
    const eventHandlers = this._events.get(event);
    if (!eventHandlers?.length) return;
    eventHandlers.forEach(e => e(eventData));
  }
}
