import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import axios from "axios";

function PlayRandomMoveEngine({ gameinfo, user, moves }) {
    const [chess, setChess] = useState(new Chess());
    const isWhite = user.id === gameinfo.player1_id;
    const isBlack = user.id === gameinfo.player2_id;
    const [piece, setPiece] = useState(null);

    useEffect(() => {
        console.log(moves);
        if (moves.length === 0) return;
        setChess(new Chess(moves[moves.length - 1].fen));
    }, []);

    const handleDrop = (sourceSquare, targetSquare) => {
        setPiece(chess.get(sourceSquare));

        const moveMade = chess.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q",
        });

        if (moveMade === null) return;

        setChess(new Chess(chess.fen()));

        Echo.private("game." + gameinfo.id).whisper("move", {
            move: {
                from: sourceSquare,
                to: targetSquare,
                piece: moveMade.piece,
                fen: chess.fen(),
            },
        });

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
    };

    useEffect(() => {
        const channel = Echo.private("game." + gameinfo.id);

        channel.listenForWhisper("move", (e) => {
            const move = e.move;
            const moveMade = chess.move({
                from: move.from,
                to: move.to,
            });

            if (moveMade === null) return;

            setChess(new Chess(chess.fen()));
        });

        return () => {
            channel.stopListeningForWhisper("move");
        };
    }, [chess]);

    return (
        <div className="flex justify-center space-x-4 w-[600px] h-[600px]">
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
    );
}

export default function MatchStarted({ game, user, moves }) {
    return (
        <div className="py-12">
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        <PlayRandomMoveEngine gameinfo={game} user={user} moves={moves} />
                    </div>
                </div>
            </div>
        </div>
    );
}
