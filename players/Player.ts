import Board, { Move } from "../game/Board";
import { PieceColor } from "../game/Piece";

export type MoveOutcome = "Concede" | "Continue" | "Yield" | "NoMove";
export type PlayerType = "Human" | "PC";

export default abstract class Player {
  protected readonly _name: string;
  protected readonly _type: PlayerType;
  protected readonly _color: PieceColor;

  constructor(name: string, type: PlayerType, color: PieceColor) {
    this._name = name;
    this._type = type;
    this._color = color;
  }

  public get name(): string {
    return this._name;
  }

  public get type(): string {
    return this._type;
  }

  public get color(): PieceColor {
    return this._color;
  }

  public abstract play(
    board: Board,
  ): Promise<{ result: MoveOutcome; move?: Move }>;
}
