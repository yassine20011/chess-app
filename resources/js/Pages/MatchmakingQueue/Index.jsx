import { router } from '@inertiajs/react'


function Index({queue, user}) {

    console.log(queue)

    const handleJoinGame = async (e) => {
        e.preventDefault()
        router.post('/matchmaking')

    }

    return (
        <>
            <div>
                <h1>Matchmaking Queue</h1>
                <ul>
                    {queue.map((player) => {
                        return <li key={player.id}>{player.status}</li>
                    })}
                </ul>
            </div>



            {/*  join game */}
           <form onSubmit={handleJoinGame}>
                <button type="submit">Join Game</button>
            </form>

        </>
    );
}

export default Index;
