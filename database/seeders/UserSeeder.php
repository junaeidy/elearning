<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Teacher (bisa register sendiri)
        User::create([
            'username' => 'guru_budi',
            'name' => 'Budi Santoso',
            'full_name' => 'Budi Santoso, S.Pd',
            'email' => 'guru@test.com', // optional untuk teacher
            'password' => Hash::make('password'),
            'role' => 'teacher',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create Students (dibuat oleh guru)
        // Email tidak wajib untuk student
        $students = [
            ['username' => 'siswa_ani', 'name' => 'Ani Wijaya'],
            ['username' => 'siswa_budi', 'name' => 'Budi Setiawan'],
            ['username' => 'siswa_citra', 'name' => 'Citra Dewi'],
            ['username' => 'siswa_dedi', 'name' => 'Dedi Pratama'],
            ['username' => 'siswa_eka', 'name' => 'Eka Putri'],
        ];

        foreach ($students as $student) {
            User::create([
                'username' => $student['username'],
                'name' => $student['name'],
                'full_name' => $student['name'],
                'email' => null, // siswa tidak perlu email
                'password' => Hash::make('password'), // default password
                'role' => 'student',
                'is_active' => true,
            ]);
        }
    }
}
