import React from "react";
import { View, Text } from "react-native";
import { Button } from "react-native-windows";
import { useSelector } from "react-redux";
import { commentarySelector, whosTurnSelector } from "../store/selectors";

export interface ControlsProps {
  startNewGame: () => void;
}

export default function Controls({ startNewGame }: ControlsProps): JSX.Element {
  const commentary = useSelector(commentarySelector);
  const whosTrun = useSelector(whosTurnSelector);

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        padding: 5,
      }}>
      <Button title="New Game!" onPress={startNewGame} />
      <View>
        <Text key="move-info" style={{ margin: 3 }}>
          {commentary.gameComment}
        </Text>
        <Text key="whos-turn-text" style={{ margin: 3 }}>
          {whosTrun}
        </Text>
      </View>
    </View>
  );
}
