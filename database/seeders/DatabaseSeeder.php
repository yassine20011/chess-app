<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Yassine amjad',
            'email' => 'player1@chess.com',
            'password' => bcrypt('password'),
        ]);

        User::factory()->create([
            'name' => 'Zakaria Ouahdani',
            'email' => 'player2@chess.com',
            'password' => bcrypt('player2@chess.com'),
        ]);

    }
}
