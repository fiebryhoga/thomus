<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PemainSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Looping untuk membuat 4 Pemain
        for ($i = 1; $i <= 4; $i++) {
            User::create([
                'name' => 'Pemain ' . $i,
                'email' => 'pemain' . $i . '@thom-us.com',
                'password' => Hash::make('password'), // Password disamakan
            ]);
        }
    }
}