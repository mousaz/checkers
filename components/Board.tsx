import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Tile from "../game/Tile";
import { PieceColor } from "../game/Piece";

export interface BoardProps {
  size: number;
  tiles: Tile[];
  highlightedTiles: number[];
  lockMode: { mode: PieceColor | "all"; pieceNumber?: number };
  showPossibleMoves: (pieceIndex: number) => void;
  movePiece: (fromIndex: number, toIndex: number) => void;
}

export default function Board({
  size,
  tiles,
  highlightedTiles,
  showPossibleMoves,
  movePiece,
  lockMode,
}: BoardProps): JSX.Element {
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);

  function renderRowTiles(rIndex: number): JSX.Element[] {
    const tiles: JSX.Element[] = [];
    for (let cIndex = 0; cIndex < size; cIndex++) {
      tiles.push(renderTile(rIndex, cIndex));
    }

    return tiles;
  }

  function renderTile(rIndex: number, cIndex: number): JSX.Element {
    const tileIndex = rIndex * size + cIndex;
    const highlighted = highlightedTiles.includes(tileIndex);
    return (
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: (rIndex + cIndex) % 2 ? "darkgray" : "gray",
          justifyContent: "center",
          alignItems: "center",
          borderColor: highlighted
            ? "blue"
            : (rIndex + cIndex) % 2
            ? "darkgray"
            : "gray",
          borderWidth: 2,
        }}
        activeOpacity={1}
        onPress={() => {
          if (highlighted && selectedPiece != null) {
            movePiece(selectedPiece, tileIndex);
            setSelectedPiece(null);
          }
        }}>
        {renderPiece(rIndex, cIndex)}
      </TouchableOpacity>
    );
  }

  function renderPiece(rIndex: number, cIndex: number): JSX.Element | null {
    const pieceIndex = rIndex * size + cIndex;
    const isSelected = pieceIndex === selectedPiece;
    const piece = tiles[pieceIndex].piece;
    if (!piece) return null;
    return (
      <TouchableOpacity
        style={{
          backgroundColor: piece.color === "dark" ? "black" : "white",
          borderRadius: 20,
          borderColor: "blue",
          borderWidth: isSelected ? 2 : 0,
          flex: 0.7,
          aspectRatio: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        activeOpacity={1}
        onPress={() => {
          if (
            lockMode.mode !== piece.color &&
            (lockMode.pieceNumber === undefined ||
              lockMode.pieceNumber !== pieceIndex)
          ) {
            return;
          }

          showPossibleMoves(pieceIndex);
          setSelectedPiece(pieceIndex);
        }}>
        {piece.isKing && renderKingMark()}
      </TouchableOpacity>
    );
  }

  function renderKingMark(): JSX.Element {
    return <Text style={{ color: "gold", fontWeight: "bold" }}>K</Text>;
  }

  function renderRow(rIndex: number): JSX.Element {
    return (
      <View
        key={`board-row-${rIndex}`}
        style={{ flex: 1, flexDirection: "row" }}>
        {renderRowTiles(rIndex)}
      </View>
    );
  }

  function renderRows(): JSX.Element[] {
    const rows: JSX.Element[] = [];
    for (let rIndex = 0; rIndex < size; rIndex++) {
      rows.push(renderRow(rIndex));
    }

    return rows;
  }

  return (
    <View key="board-container" style={{ aspectRatio: 1 }}>
      {renderRows()}
    </View>
  );
}
