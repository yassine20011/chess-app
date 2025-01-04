import React, { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import axios from "axios";
import { Head } from "@inertiajs/react";

function playSound(sound) {
    let audio = new Audio(sound);
    audio.play();
}

const isCastling = (move) => {
    return move.flags.includes("k") || move.flags.includes("q");
};

function PlayRandomMoveEngine({
    gameinfo,
    user,
    moves,
    media,
    player1,
    player2,
}) {
    const isWhite = user.id === gameinfo.player1_id;
    const isBlack = user.id === gameinfo.player2_id;
    const [movesList, setMovesList] = useState([]);
    const movesListRef = useRef(null);
    let [gameStatus, setGameStatus] = useState(gameinfo.status);
    let [chess, setChess] = useState(new Chess());
    let [clock, setClock] = useState({
        white: 600,
        black: 600,
    });

    const GameLogic = (moveMade) => {
        if (isCastling(moveMade)) {
            playSound(media.castling);
        } else if (moveMade.flags.includes("e")) {
            playSound(media.enpassant);
        } else if (chess.inCheck()) {
            playSound(media.check);
        } else {
            playSound(media.move);
        }
    };

    // initial setup
    useEffect(() => {
        if (moves.length === 0) return;
        setMovesList(moves);
        setChess(new Chess(moves[moves.length - 1].fen));
    }, []);

    // scroll to bottom of moves list
    useEffect(() => {
        if (movesListRef.current) {
            movesListRef.current.scrollTop = movesListRef.current.scrollHeight;
        }
    }, [movesList]);

    // listen for opponent's move
    useEffect(() => {
        const channel = Echo.private("game." + gameinfo.id);

        channel.listenForWhisper("move", (e) => {
            try {
                const move = e.move;
                const moveMade = chess.move({
                    from: move.from,
                    to: move.to,
                });

                // if move is illegal or not user's turn
                if (moveMade === null) {
                    playSound(media.illegal);
                    return;
                }

                setChess(new Chess(chess.fen()));
                GameLogic(moveMade);
                setMovesList([
                    ...movesList,
                    {
                        piece: move.piece,
                        position_from: move.from,
                        position_to: move.to,
                    },
                ]);
            } catch {
                playSound(media.illegal);
            }
        });

        return () => {
            channel.stopListeningForWhisper("move");
        };
    }, [chess]);

    // listen for opponent's time and calculate the ping
    useEffect(() => {
        const channel = Echo.private("game." + gameinfo.id);

        channel.listenForWhisper("time", (e) => {
            setClock({
                white: e.game_time.white,
                black: e.game_time.black,
            });
        });

        const interval = setInterval(() => {
            let turn = chess.turn();

            setClock((prevClock) => {
                let newClock = { ...prevClock };

                if (newClock.white === 0 || newClock.black === 0) {
                    // send a post request to end the game
                    const request = axios.patch("/game/" + gameinfo.id + "/status", {
                        status: "timeout",
                        time: newClock,
                    });

                    request.then((response) => {
                        if (response.status === 200) {
                            setGameStatus("timeout");
                        }
                    });

                    clearInterval(interval);
                    return newClock;
                }

                if (turn === "w") {
                    newClock.white -= 1;
                } else if (turn === "b") {
                    newClock.black -= 1;
                }
                channel.whisper("time", {
                    game_time: newClock,
                });

                return newClock;
            });
        }, 1000);

        return () => {
            channel.stopListeningForWhisper("time");
            clearInterval(interval);
        };
    }, [chess.turn()]);

    // handle user's move
    const handleDrop = (sourceSquare, targetSquare) => {
        try {
            const moveMade = chess.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: "q",
            });

            if (moveMade === null) {
                playSound(media.illegal);
                return;
            }

            setChess(new Chess(chess.fen()));
            GameLogic(moveMade);

            Echo.private("game." + gameinfo.id).whisper("move", {
                move: {
                    from: sourceSquare,
                    to: targetSquare,
                    piece: moveMade.piece,
                    fen: chess.fen(),
                },
            });

            setMovesList([
                ...movesList,
                {
                    piece: moveMade.piece,
                    position_from: sourceSquare,
                    position_to: targetSquare,
                },
            ]);

            axios.post("/game/" + gameinfo.id, {
                    from: sourceSquare,
                    to: targetSquare,
                    piece: moveMade.piece,
                    fen: chess.fen(),
                    player_time:
                        chess.turn() === "w" ? clock.white : clock.black,
                })
                .then((response) => {
                    console.log(response.data);
                })
                .catch((error) => {
                    console.log(error);
                });
        } catch {
            playSound(media.illegal);
        }
    };

    return (
        <>
            <div className="flex justify-center">
                <div className="w-1/2">
                    <Chessboard
                        allowDragOutsideBoard={false}
                        position={chess.fen()}
                        onPieceDrop={handleDrop}
                        orientation={isWhite ? "white" : "black"}
                        boardOrientation={isWhite ? "white" : "black"}
                        isDraggablePiece={({ piece }) => {
                            if (isWhite && piece[0] === "w") return true;
                            if (isBlack && piece[0] === "b") return true;
                        }}
                    />
                </div>

                {/*  contoler */}
                <div className="h-96 overflow-y-auto w-1/2" ref={movesListRef}>
                    <div className="flex justify-between">
                        <div className="text-lg font-semibold">
                            {player1.name} {isWhite ? "(You)" : ""}
                        </div>
                        <div className="text-lg font-semibold">
                            {player2.name} {isBlack ? "(You)" : ""}
                        </div>
                    </div>

                    {/*  players clock */}
                    <div className="flex justify-between">
                        <div className="text-lg font-semibold">
                            {Math.floor(clock.white / 60)}:
                            {clock.white % 60 < 10
                                ? "0" + (clock.white % 60)
                                : clock.white % 60}
                        </div>
                        <div className="text-lg font-semibold">
                            {Math.floor(clock.black / 60)}:
                            {clock.black % 60 < 10
                                ? "0" + (clock.black % 60)
                                : clock.black % 60}
                        </div>
                    </div>

                    {movesList.map((move, index) => (
                        <div
                            key={index}
                            className={`flex justify-between ${
                                index % 2 === 0 ? "bg-gray-100" : ""
                            }`}
                        >
                            <div className="text-sm">{index + 1}</div>
                            <div className="text-sm">{move.position_to}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default function MatchStarted({
    game,
    user,
    moves,
    player1,
    player2,
    media,
}) {
    return (
        <>
            <Head title={`${player1.name} vs ${player2.name}`} />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <PlayRandomMoveEngine
                                gameinfo={game}
                                user={user}
                                moves={moves}
                                media={media}
                                player1={player1}
                                player2={player2}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
