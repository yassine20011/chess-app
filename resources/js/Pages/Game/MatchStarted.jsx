import React, { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import axios from "axios";
import { Head } from "@inertiajs/react";

function PlayRandomMoveEngine({
    gameinfo,
    user,
    moves,
    media,
    player1,
    player2,
}) {
    const [chess, setChess] = useState(new Chess());
    const isWhite = user.id === gameinfo.player1_id;
    const isBlack = user.id === gameinfo.player2_id;
    const [movesList, setMovesList] = useState([]);
    const movesListRef = useRef(null);

    const playSound = (media) => {
        const sound = new Audio(media);
        sound.play();
    };

    const isCastling = (move) => {
        return move.flags.includes("k") || move.flags.includes("q");
    };


    useEffect(() => {
        if (moves.length === 0) return;
        setMovesList(moves);
        setChess(new Chess(moves[moves.length - 1].fen));
    }, []);

    useEffect(() => {
        if (movesListRef.current) {
            movesListRef.current.scrollTop = movesListRef.current.scrollHeight;
        }
    }, [movesList]);

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
                if (moveMade === null)
                {
                    playSound(media.illegal);
                    return;
                }

                setChess(new Chess(chess.fen()));
                // check if move is castling
                if (isCastling(moveMade)) {
                    playSound(media.castling);
                } else {
                    playSound(media.move);
                }

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
             // check if castle move
             if (isCastling(moveMade)) {
                playSound(media.castle);
            } else {
                playSound(media.move);
            }


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

                <div className="h-96 overflow-y-auto w-1/2" ref={movesListRef}>
                    <table className="overflow-x-auto w-full">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Piece</th>
                                <th className="px-4 py-2">Player</th>
                                <th className="px-4 py-2">from</th>
                                <th className="px-4 py-2">to</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movesList.map((move, index) => (
                                <tr key={index}>
                                    <td className="border px-4 py-2">
                                        {move.piece}
                                    </td>
                                    <td className="border px-4 py-2">
                                        {index % 2 === 0
                                            ? player1.name
                                            : player2.name}
                                    </td>
                                    <td className="border px-4 py-2">
                                        {move.position_from}
                                    </td>
                                    <td className="border px-4 py-2">
                                        {move.position_to}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
