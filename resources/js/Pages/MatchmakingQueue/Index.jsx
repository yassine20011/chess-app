import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

function Index({ user }) {

    const handleJoinGame = async (e, time) => {
        e.preventDefault();
        router.post("/", {
            data: {
                game_time: time,
            },
        });
    };

    return (
        <>
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Matchmaking
                    </h2>
                }
            >
                <Head title="Join a game" />

                <div className="flex flex-col items-center justify-center mt-10">
                    <h1 className="text-4xl font-bold text-center text-gray-900">
                        Join a game
                    </h1>
                    <p className="text-center text-gray-700">
                        Select a time control
                    </p>
                </div>

                <div className="flex content-center justify-center mt-10">
                    <form className="mt-4">
                        <div
                            className="inline-flex rounded-md shadow-sm"
                            role="group"
                        >
                            <button
                                type="submit"
                                onClick={(e) => handleJoinGame(e, 10 * 60)}
                                className="px-4 py-2 text-2xl font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-orange-700 focus:z-10 focus:ring-2 focus:ring-orange-700 focus:text-orange-700"
                            >
                                10 min
                            </button>
                            <button
                                type="submit"
                                onClick={(e) => handleJoinGame(e, 15 * 60)}
                                className="px-4 py-2 text-2xl font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-orange-700 focus:z-10 focus:ring-2 focus:ring-orange-700 focus:text-orange-700"
                            >
                                15 min | +15 sec
                            </button>
                            <button
                                type="submit"
                                onClick={(e) => handleJoinGame(e, 30 * 60)}
                                className="px-4 py-2 text-2xl font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-orange-700 focus:z-10 focus:ring-2 focus:ring-orange-700 focus:text-orange-700"
                            >
                                30 min
                            </button>
                        </div>
                    </form>
                </div>
            </AuthenticatedLayout>
        </>
    );
}

export default Index;
