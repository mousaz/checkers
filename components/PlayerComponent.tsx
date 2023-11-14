import { Text, TouchableOpacity, View, Image } from "react-native";
import Player from "../players/Player";
import Piece from "../game/Piece";

export interface PlayerComponentProps {
  pieces: Piece[];
  player: Player;
  isTurn: boolean;
  isWinner?: boolean;
  onConcede: () => void;
}

export default function PlayerComponent({
  pieces,
  player,
  isTurn,
  isWinner,
  onConcede,
}: PlayerComponentProps): JSX.Element {
  const fontColor = player.color === "light" ? "black" : "white";
  return (
    <View
      key={`${player.color}-player-area`}
      style={{
        flex: 1,
        backgroundColor: player.color === "light" ? "white" : "black",
        borderRadius: 15,
        borderWidth: 2,
        borderColor:
          isWinner === undefined
            ? isTurn
              ? "red"
              : "white"
            : isWinner
            ? "gold"
            : "gray",
        margin: 10,
        padding: 10,
      }}>
      <Text
        lineBreakMode="tail"
        numberOfLines={2}
        ellipsizeMode="tail"
        style={{ fontWeight: "bold", fontSize: 20, color: fontColor }}>
        {player.name || player.color}
      </Text>
      <Text style={{ color: fontColor }}>{`🪦 ${12 - pieces.length}\t亗 ${
        pieces.filter(p => p.isKing).length
      }`}</Text>
      {player.type === "Human" && isTurn && (
        <TouchableOpacity
          style={{ flexDirection: "row-reverse" }}
          onPress={onConcede}>
          <Text
            style={{
              width: 20,
              height: 20,
              fontWeight: "bold",
              color: "yellow",
            }}>
            🏳
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
