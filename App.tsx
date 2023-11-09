import React, { useEffect, useState } from "react";
import { useColorScheme, View, Text } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";
import Controls from "./components/Controls";
import Board from "./components/Board";
import { Provider } from "react-redux";
import { store } from "./store";
import GameBoard, { Move } from "./game/Board";
import Tile from "./game/Tile";
import Player, { MoveOutcome } from "./players/Player";
import NewGameControls from "./components/NewGameControls";
import { PieceColor } from "./game/Piece";
import PlayerComponent from "./components/PlayerComponent";

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === "dark";

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [isControlsOpened, setIsControlsOpened] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameBoard, setGameBoard] = useState<GameBoard>();
  const [highlightedTiles, setHighlightedTiles] = useState<number[]>([]);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | undefined>();
  const [boardLockMode, setBoardLockMode] = useState<{
    mode: PieceColor | "all";
    lockOnPieceNumber?: number;
  }>({ mode: "all" });
  const [gameResult, setGameResult] = useState<{}>();

  useEffect(() => {
    if (gameBoard) {
      setTiles(gameBoard.getTiles());
      gameBoard.subscribeToEvent("BoardUpdated", () => {
        setTiles(gameBoard.getTiles());
        setHighlightedTiles([]);
      });
    }
  }, [gameBoard]);

  useEffect(() => {
    if (!players?.length || currentPlayer === undefined) return;
    setBoardLockMode({
      mode: currentPlayer.type === "PC" ? "all" : currentPlayer.color,
    });

    const handler = ({
      result,
      move,
    }: {
      result: MoveOutcome;
      move?: Move;
    }) => {
      switch (result) {
        case "Yield":
          setCurrentPlayer(
            currentPlayer === players[0] ? players[1] : players[0],
          );
          break;
        case "Concede":
          setGameResult({});
          break;
        case "Continue":
          if (currentPlayer.type === "Human") {
            const continueIndex = move?.to!;
            showPossibleMoves(continueIndex);
            setBoardLockMode({
              mode: currentPlayer.color,
              lockOnPieceNumber: continueIndex,
            });
          }
          currentPlayer.play(gameBoard!).then(handler);
          break;
        case "NoMove":
          setGameResult({});
          break;
      }
    };

    currentPlayer.play(gameBoard!).then(handler);
  }, [players, currentPlayer]);

  function showPossibleMoves(tileIndex: number): void {
    if (!gameBoard || !currentPlayer) return;
    const allMoves = gameBoard.getAllPossibleMovesForPieces(
      currentPlayer.color,
    );
    setHighlightedTiles(
      allMoves.reduce((moves: number[], m: Move) => {
        if (m.from === tileIndex) moves.push(m.to);
        return moves;
      }, []),
    );
  }

  function movePiece(fromIndex: number, toIndex: number): void {
    if (!gameBoard) return;
    gameBoard.movePiece(fromIndex, toIndex);
  }

  function renderNewGameControls(): JSX.Element {
    return (
      <View
        style={{
          flex: 1,
          alignContent: "center",
          justifyContent: "center",
          padding: 100,
          backgroundColor: "lightgray",
        }}>
        <Text style={{ textAlign: "center", fontSize: 30, fontWeight: "bold" }}>
          Let's Play Checkers
        </Text>
        <Text style={{ textAlign: "center", fontSize: 15, margin: 5 }}>
          Choose players and click start
        </Text>
        <NewGameControls
          close={(players: Player[]) => {
            setPlayers(players);
            setIsControlsOpened(false);
            setGameBoard(new GameBoard(8));
            setTiles(() => gameBoard?.getTiles()!);
            setCurrentPlayer(players[0]);
          }}
        />
      </View>
    );
  }

  function renderGamePlayBoard(): JSX.Element {
    return (
      <>
        <View
          key="board-area"
          style={{
            flex: 5,
            flexDirection: "row",
            padding: 5,
            margin: 3,
            minHeight: 200,
            justifyContent: "center",
          }}>
          {tiles?.length && (
            <Board
              size={8}
              tiles={tiles}
              highlightedTiles={highlightedTiles}
              showPossibleMoves={showPossibleMoves}
              movePiece={movePiece}
              lockMode={boardLockMode}
            />
          )}
        </View>
        <View
          key="controls-area"
          style={{
            flex: 1,
            flexDirection: "row",
            padding: 5,
            margin: 3,
            minHeight: 50,
            backgroundColor: "lightblue",
          }}>
          <PlayerComponent
            player={players[0]}
            isTurn={currentPlayer === players[0]}
          />
          <Controls
            startNewGame={() => {
              setPlayers([]);
              setIsControlsOpened(true);
            }}
          />
          <PlayerComponent
            player={players[1]}
            isTurn={currentPlayer === players[1]}
          />
        </View>
      </>
    );
  }

  return (
    <Provider store={store}>
      <View
        style={{
          flex: 1,
          height: "100%",
          width: "100%",
          padding: 5,
          backgroundColor: backgroundStyle.backgroundColor,
        }}>
        {isControlsOpened ? renderNewGameControls() : renderGamePlayBoard()}
      </View>
    </Provider>
  );
}

export default App;
