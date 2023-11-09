export type PieceColor = "light" | "dark";

export default class Piece {
  private readonly _color: PieceColor;
  private _isKing: boolean;
  private _canMove: boolean;
  private _tileNumber: number;

  constructor(color: PieceColor, canMove: boolean, tileNumber: number) {
    this._color = color;
    this._isKing = false;
    this._canMove = canMove;
    this._tileNumber = tileNumber;
  }

  public get color(): PieceColor {
    return this._color;
  }

  public get isKing(): boolean {
    return this._isKing;
  }

  public set isKing(value: boolean) {
    this._isKing = value;
  }

  public get canMove(): boolean {
    return this._canMove;
  }

  public set canMove(value: boolean) {
    this._canMove = value;
  }

  public get tileNumber(): number {
    return this._tileNumber;
  }

  public set tileNumber(value: number) {
    this._tileNumber = value;
  }
}
