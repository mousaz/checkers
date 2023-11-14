import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import ScoreComponent, { GameStatus } from "./components/ScoreComponent";
import Board from "./components/Board";
import GameBoard, { Move } from "./game/Board";
import Tile from "./game/Tile";
import Player, { MoveOutcome } from "./players/Player";
import NewGameControls from "./components/NewGameControls";
import Piece, { PieceColor } from "./game/Piece";
import PlayerComponent from "./components/PlayerComponent";

function App(): JSX.Element {
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
  const [gameStatus, setGameStatus] = useState<GameStatus>({
    status: "Running",
    comment: "Let's Start!",
  });
  const [movesHistory, setMovesHistory] = useState<Move[]>([]);
  const [stateHistory, setStateHistory] = useState<{ [key: string]: number }>(
    {},
  );
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [error, setError] = useState<Error>();

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
    gameStatus.status === "Over" && setBoardLockMode({ mode: "all" });
  }, [gameStatus]);

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
      const nextTurnPlayerId = currentPlayer === players[0] ? 1 : 0;
      switch (result) {
        case "Yield":
          if (updateStateHistory(move!)) {
            setCurrentPlayer(players[nextTurnPlayerId]);
          }

          setPieces(gameBoard?.getPieces()!);
          break;
        case "Concede":
          setGameStatus({
            status: "Over",
            winner: players[nextTurnPlayerId],
            comment: `${currentPlayer.name || currentPlayer.color} conceded`,
          });
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

          if (updateStateHistory(move!)) {
            currentPlayer.play(gameBoard!).then(handler);
          }

          setPieces(gameBoard?.getPieces()!);
          setGameStatus({
            ...gameStatus,
            comment: "Things are getting serious!",
          });
          break;
        case "NoMove":
          setGameStatus({
            status: "Over",
            winner: players[nextTurnPlayerId],
            comment: `${currentPlayer.name || currentPlayer.color} can't move`,
          });
          break;
      }
    };

    currentPlayer
      .play(gameBoard!)
      .then(handler)
      .catch(err => setError(err));
  }, [players, currentPlayer]);

  function showPossibleMoves(tileIndex: number): void {
    if (!gameBoard || !currentPlayer) return;
    const moves = gameBoard!.getPossibleMovesForPiece(tileIndex);
    setHighlightedTiles(moves.map(m => m.to));
  }

  function updateStateHistory(move: Move): boolean {
    movesHistory.push(move);
    if (
      movesHistory.length >= 100 &&
      !movesHistory.slice(-100).some(m => m.isKill)
    ) {
      setGameStatus({
        status: "Over",
        comment: "100 moves without any kills.",
      });
      return false;
    }

    const state = gameBoard?.getTiles();
    const stateKey = state?.reduce((agg, t) => {
      const piece = t.piece;
      if (!piece) {
        agg += "0";
      } else {
        switch (piece.color) {
          case "dark":
            agg += piece.isKing ? "2" : "1";
            break;
          case "light":
            agg += piece.isKing ? "4" : "3";
            break;
        }
      }

      return agg;
    }, "")!;

    stateHistory[stateKey] = !stateHistory[stateKey]
      ? 1
      : stateHistory[stateKey] + 1;

    if (stateHistory[stateKey] === 3) {
      setGameStatus({
        status: "Over",
        comment: "Same state repeated three times!",
      });
      return false;
    }

    setGameStatus({ ...gameStatus, comment: "It's on!" });

    return true;
  }

  function movePiece(fromIndex: number, toIndex: number): void {
    if (!gameBoard) return;
    gameBoard.movePiece(fromIndex, toIndex);
  }

  function startNewGame(): void {
    setPlayers([]);
    setIsControlsOpened(true);
    setGameStatus({
      status: "Running",
      comment: "Let's Start!",
    });
    setMovesHistory([]);
    setStateHistory({});
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
            pieces={pieces.filter(p => p.color === players[0].color)}
            player={players[0]}
            isTurn={currentPlayer === players[0]}
            isWinner={
              gameStatus.status === "Over"
                ? gameStatus.winner === players[0]
                : undefined
            }
            onConcede={() => {
              setGameStatus({
                status: "Over",
                winner: players[1],
                comment: `${
                  currentPlayer?.name || currentPlayer?.color
                } conceded`,
              });
            }}
          />
          <ScoreComponent
            status={gameStatus}
            currentPlayer={
              gameStatus.status === "Running" ? currentPlayer : undefined
            }
          />
          <PlayerComponent
            pieces={pieces.filter(p => p.color === players[1].color)}
            player={players[1]}
            isTurn={currentPlayer === players[1]}
            isWinner={
              gameStatus.status === "Over"
                ? gameStatus.winner === players[1]
                : undefined
            }
            onConcede={() => {
              setGameStatus({
                status: "Over",
                winner: players[0],
                comment: `${
                  currentPlayer?.name || currentPlayer?.color
                } conceded`,
              });
            }}
          />
        </View>
        <View style={{ flex: 0.4, marginBottom: 5 }}>
          <TouchableOpacity
            style={{
              alignSelf: "center",
              backgroundColor: "pink",
              width: 30,
              height: 30,
              borderRadius: 5,
            }}
            onPress={startNewGame}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                textAlign: "center",
                textAlignVertical: "center",
              }}>
              ⟳
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  function renderErrorBanner(): JSX.Element {
    return (
      <View
        style={{
          minHeight: 35,
          backgroundColor: "pink",
          padding: 6,
        }}>
        <Text
          style={{
            color: "red",
          }}>
          {error?.message}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        height: "100%",
        width: "100%",
        padding: 5,
      }}>
      {error && renderErrorBanner()}
      {isControlsOpened ? renderNewGameControls() : renderGamePlayBoard()}
    </View>
  );
}

export default App;
