import React, { useMemo, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { RadioGroup } from "react-native-radio-buttons-group";
import Player, { PlayerType } from "../players/Player";
import AlpahBetaPlayer, { PlayerLevel } from "../players/AlphaBetaPlayer";
import HumanPlayer from "../players/HumanPlayer";

export interface NewGameControlsProps {
  close: (players: Player[]) => void;
}

interface PlayerModel {
  name: string;
  type: PlayerType;
  level?: PlayerLevel;
}

export default function NewGameControls({
  close,
}: NewGameControlsProps): JSX.Element {
  const playersTypesRadioBtns = useMemo(
    () => [
      {
        id: "Human",
        label: "Human",
        value: "Human",
      },
      {
        id: "PC",
        label: "PC",
        value: "PC",
      },
    ],
    [],
  );
  const playersLevelsRadioBtns = useMemo(
    () => [
      {
        id: "Beginner",
        label: "Beginner",
        value: "Beginner",
      },
      {
        id: "Normal",
        label: "Normal",
        value: "NOrmal",
      },
      {
        id: "Expert",
        label: "Expert",
        value: "Expert",
      },
    ],
    [],
  );
  const defaultPlayers: PlayerModel[] = useMemo(
    () => [
      {
        name: "",
        type: "Human",
      },
      {
        name: "",
        type: "PC",
        level: "Beginner",
      },
    ],
    [],
  );

  const [players, setPlayers] = useState<PlayerModel[]>(defaultPlayers);

  function renderPlayerSection(id: number): JSX.Element {
    return (
      <View style={{ marginRight: 5, padding: 30 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>{`Player ${
          id + 1
        }`}</Text>
        <View style={{ flexDirection: "row", marginTop: 20 }}>
          <Text style={{ padding: 3, marginRight: 3, fontSize: 16 }}>
            Name:
          </Text>
          <TextInput
            style={{ minWidth: 150 }}
            onChangeText={(text: string) => {
              players[id].name = text;
              setPlayers([...players]);
            }}
            value={players[id]?.name || defaultPlayers[id].name}></TextInput>
        </View>
        <Text style={{ padding: 3, marginTop: 10, fontSize: 16 }}>
          Player Type:
        </Text>
        <RadioGroup
          radioButtons={playersTypesRadioBtns}
          onPress={selectedId => {
            const playerType = players[id].type;
            players[id].type = selectedId as typeof playerType;
            setPlayers([...players]);
          }}
          selectedId={players[id].type}
          layout="row"
        />
        {players[id].type === "PC" && (
          <View style={{}}>
            <Text style={{ padding: 3, marginTop: 10, fontSize: 16 }}>
              Level:
            </Text>
            <RadioGroup
              radioButtons={playersLevelsRadioBtns}
              onPress={selectedId => {
                const playerLevel = players[id].level;
                players[id].level = selectedId as typeof playerLevel;
                setPlayers([...players]);
              }}
              selectedId={players[id].level}
              containerStyle={{ alignItems: "baseline" }}
            />
          </View>
        )}
      </View>
    );
  }

  function renderSeparator(): JSX.Element {
    return (
      <View
        style={{
          backgroundColor: "black",
          flex: 1,
          maxWidth: 2,
          margin: 10,
          minWidth: 2,
        }}></View>
    );
  }

  function renderButton(): JSX.Element {
    return (
      <Button
        title="Start!"
        onPress={() => {
          close([
            players[0].type === "Human"
              ? new HumanPlayer(players[0].name, "dark")
              : new AlpahBetaPlayer(players[0].name, players[0].level!, "dark"),
            players[1].type === "Human"
              ? new HumanPlayer(players[1].name, "light")
              : new AlpahBetaPlayer(
                  players[1].name,
                  players[1].level!,
                  "light",
                ),
          ]);
        }}
        color={"lightblue"}></Button>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        alignContent: "center",
        backgroundColor: "white",
        padding: 30,
        borderRadius: 15,
        shadowColor: "black",
        shadowOffset: { height: 20, width: 30 },
        minHeight: 450,
      }}>
      <View style={{ flexDirection: "row", flex: 9, justifyContent: "center" }}>
        {renderPlayerSection(0)}
        {renderSeparator()}
        {renderPlayerSection(1)}
      </View>
      {renderButton()}
    </View>
  );
}
