import Piece from "./Piece";

export default class Tile {
  private _piece?: Piece;

  constructor(piece?: Piece) {
    this._piece = piece;
  }

  public get piece(): Piece | undefined {
    return this._piece;
  }

  public set piece(value: Piece) {
    this._piece = value;
  }

  public emptyTile(): Piece | undefined {
    const piece = this._piece;
    this._piece = undefined;
    return piece;
  }
}
