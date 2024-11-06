import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';


export default function Dashboard({ user }) {


    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            {/*  create game */}

            <div className="flex flex-col items-center justify-center">
                <div className="mt-4">
                    <h1 className="text-3xl font-bold text-gray-800">Create Game</h1>
                </div>
                <div className="mt-4">
                    <Link href="/matchmaking" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Create Game</Link>
                </div>
            </div>



        </AuthenticatedLayout>
    );
}
