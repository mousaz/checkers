import React from "react";
import { View, Text, ColorValue } from "react-native";
import Player from "../players/Player";

export interface GameStatus {
  status: "Over" | "Running" | "Paused";
  winner?: Player;
  comment?: string;
}

export interface ScoreComponentProps {
  status: GameStatus;
  currentPlayer?: Player;
}

export default function ScoreComponent({
  currentPlayer,
  status,
}: ScoreComponentProps): JSX.Element {
  function getStatusColor(): ColorValue {
    switch (status.status) {
      case "Over":
        return status.winner ? "red" : "lightgray";
      case "Running":
        return "olive";
      default:
        return "orange";
    }
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 5,
        backgroundColor: "white",
        borderRadius: 15,
        borderWidth: 2,
        borderColor: getStatusColor(),
      }}>
      <Text
        key="game-status"
        style={{
          margin: 3,
          fontSize: 15,
          fontWeight: "bold",
          alignSelf: "center",
        }}>
        {`Game ${status.status}`}
      </Text>
      <Text key="whos-turn-text" style={{ margin: 3, alignSelf: "center" }}>
        {currentPlayer
          ? `It's ${currentPlayer.name || currentPlayer.color}'s turn`
          : status.winner
          ? `☆☆ ${status.winner.name || status.winner.color} Won ☆☆`
          : "It's a draw!"}
      </Text>
      {status.comment && (
        <Text key="status-comment" style={{ margin: 3, alignSelf: "center" }}>
          {status.comment}
        </Text>
      )}
    </View>
  );
}
