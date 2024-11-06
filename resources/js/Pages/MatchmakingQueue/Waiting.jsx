import React from 'react';


function Waiting({userId}) {

    window.Echo.private('user.' + userId)
    .listen('GameCreated', (e) => {
        console.log('Game created:', e.game);
        window.location.href = '/game/' + e.game.id;
    });


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32 mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700">Waiting for an opponent...</h2>
                <p className="text-gray-500">Please wait while we find a match for you.</p>
            </div>
        </div>
    );
};

export default Waiting;
