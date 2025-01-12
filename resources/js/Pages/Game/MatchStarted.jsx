import React, { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

function playSound(sound) {
    let audio = new Audio(sound);
    audio.play();
}

const isCastling = (move) => {
    return move.flags.includes("k") || move.flags.includes("q");
};

function PlayerVsPlayer({
    gameinfo,
    user,
    moves,
    media,
    player1Props,
    player2Props,
}) {
    const isWhite = user.id === gameinfo.player1_id;
    const isBlack = user.id === gameinfo.player2_id;
    const [movesList, setMovesList] = useState([]);
    const movesListRef = useRef(null);
    let [chess, setChess] = useState(new Chess());
    let [clock, setClock] = useState({
        white: isWhite ? gameinfo.player1_time : gameinfo.player2_time,
        black: isBlack ? gameinfo.player1_time : gameinfo.player2_time,
    });
    const [winner, setWinner] = useState(Number(gameinfo?.winner_id || null));
    const [gameStatus, setGameStatus] = useState(gameinfo.status);
    const [player1, setPlayer1] = useState(player1Props);
    const [player2, setPlayer2] = useState(player2Props);

    const GameLogic = (moveMade) => {
        if (chess.isCheckmate()) {
            playSound(media.checkmate);
            (async () => {
                const res = await axios.patch(
                    "/game/" + gameinfo.id + "/status",
                    {
                        status: "checkmate",
                        time: clock,
                        winner:
                            player1.id === user.id ? player2.id : player1.id,
                    }
                );

                if (res.status === 200) {
                    setGameStatus("checkmate");
                    setPlayer1({
                        ...player1,
                        rating: res.data.player1.rating,
                    });
                    setPlayer2({
                        ...player2,
                        rating: res.data.player2.rating,
                    });
                }
            })();
            setWinner(chess.turn() === "w" ? player2.id : player1.id);
            return;
        } else if (isCastling(moveMade)) {
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
        setGameStatus(gameinfo.status);
        setMovesList(moves);
        setChess(new Chess(moves[moves.length - 1].fen));
        console.table(gameinfo);
        console.table(player1);
        console.table(player2);
    }, []);

    // scroll to bottom of moves list
    useEffect(() => {
        if (movesListRef.current) {
            movesListRef.current.scrollTop = movesListRef.current.scrollHeight;
        }
    }, [movesList]);

    // listen for opponent's move
    useEffect(() => {
        if (gameStatus === "checkmate") return; // Stop listening if checkmate

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
    }, [chess, gameStatus]);

    // listen for opponent's time and calculate the ping
    useEffect(() => {
        if (gameStatus === "checkmate") return; // Stop listening if checkmate

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
                    const request = axios.patch(
                        "/game/" + gameinfo.id + "/status",
                        {
                            status: "timeout",
                            time: newClock,
                        }
                    );

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
    }, [chess.turn(), gameStatus]);

    // handle user's move
    const handleDrop = (sourceSquare, targetSquare) => {
        if (gameStatus === "checkmate") return; // Stop handling moves if checkmate

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

            axios
                .post("/game/" + gameinfo.id, {
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
            <div className="flex">
                <div className={`inline-block border-2 border-gray-600 rounded-lg w-1/2 ${winner ? "opacity-50 pointer-events-none" : ""}`

                }>
                    <div className="flex justify-between">
                        <div className="text-lg font-semibold border-r-2 pr-2 border-gray-600 p-2">
                            <p>
                                {player1.name === user.name
                                    ? "You"
                                    : player1.name}
                            </p>
                            <span className="text-sm font-normal">
                                ELO: {player1.rating}
                            </span>
                        </div>

                        {winner && (
                            <h3
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    color: "green",
                                }}
                            >
                                {winner === player1.id
                                    ? player1.name
                                    : player2.name}{" "}
                                Wins by {gameStatus}
                            </h3>
                        )}

                        <div className="text-lg font-semibold border-l-2 pl-2 border-gray-600 p-2">
                            <p className="text-lg font-semibold">
                                {player2.name === user.name
                                    ? "You"
                                    : player2.name}
                            </p>
                            <span className="text-sm font-normal">
                                ELO: {player2.rating}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-between">
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
                    <div className="flex justify-between">
                        <div className="text-lg font-semibold border-r-2 pr-2 border-gray-600 p-2">
                            {Math.floor(clock.white / 60)}:
                            {clock.white % 60 < 10
                                ? "0" + (clock.white % 60)
                                : clock.white % 60}
                        </div>
                        <div className="text-lg font-semibold border-l-2 pl-2 border-gray-600 p-2">
                            {Math.floor(clock.black / 60)}:
                            {clock.black % 60 < 10
                                ? "0" + (clock.black % 60)
                                : clock.black % 60}
                        </div>
                    </div>
                </div>
                {/*  controller */}
                <div className="w-1/2">
                    <div
                        className="overflow-y-auto h-96 border-2 border-gray-600 rounded-lg ml-2"
                        ref={movesListRef}
                    >
                        <ul className="divide-y divide-gray-200">
                            {movesList.map((move, index) => (
                                <li
                                    key={index}
                                    className="flex justify-between p-2"
                                >
                                    <span>{move.piece}</span>
                                    <span>
                                        {move.position_from} -&gt;{" "}
                                        {move.position_to}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/*  resign button & draw button */}
                    <div className="flex justify-between p-2">
                        <button className="w-1/2 bg-red-600 text-white font-semibold rounded-lg p-2">
                            Resign
                        </button>
                        <button className="w-1/2 bg-blue-600 text-white font-semibold rounded-lg p-2">
                            Draw
                        </button>
                    </div>
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
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {player1.name} vs {player2.name}
                    </h2>
                }
            >
                <Head title={`${player1.name} vs ${player2.name}`} />
                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                <PlayerVsPlayer
                                    gameinfo={game}
                                    user={user}
                                    moves={moves}
                                    media={media}
                                    player1Props={player1}
                                    player2Props={player2}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    );
}
