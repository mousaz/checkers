import { Text, TouchableOpacity, View } from "react-native";
import Player from "../players/Player";
import getIcon from "../resources/icons";

export interface PlayerComponentProps {
  player: Player;
  isTurn: boolean;
}

export default function PlayerComponent({
  player,
  isTurn,
}: PlayerComponentProps): JSX.Element {
  return (
    <View
      key={`${player.color}-player-area`}
      style={{
        flex: 1,
        backgroundColor: "white",
        borderRadius: 15,
        borderWidth: 2,
        borderColor: isTurn ? "red" : "white",
        margin: 10,
        padding: 10,
      }}>
      <Text
        lineBreakMode="tail"
        numberOfLines={2}
        ellipsizeMode="tail"
        style={{ fontWeight: "bold", fontSize: 20 }}>
        {player.name || player.color}
      </Text>
      {player.type === "Human" && isTurn && (
        <TouchableOpacity
          style={{
            backgroundColor: "lightblue",
            borderBlockColor: "blue",
            width: 60,
            height: 30,
            justifyContent: "center",
            alignContent: "center",
          }}>
          <img src={`data:image/jpeg;base64,${getIcon("concede")}`} />
        </TouchableOpacity>
      )}
    </View>
  );
}
