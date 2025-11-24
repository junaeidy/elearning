<?php

namespace Database\Seeders;

use App\Models\Achievement;
use Illuminate\Database\Seeder;

class AchievementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $achievements = [
            [
                'name' => 'Pelajar Pemula',
                'description' => 'Menyelesaikan pelajaran pertama',
                'icon' => '🎯',
                'criteria' => json_encode(['type' => 'lesson_completed', 'count' => 1]),
                'points' => 10,
                'badge_color' => '#95E1D3',
            ],
            [
                'name' => 'Kuis Master',
                'description' => 'Mendapat nilai 100 pada kuis',
                'icon' => '🏆',
                'criteria' => json_encode(['type' => 'perfect_score', 'score' => 100]),
                'points' => 50,
                'badge_color' => '#FFD700',
            ],
            [
                'name' => 'Rajin Belajar',
                'description' => 'Menyelesaikan 5 pelajaran',
                'icon' => '📚',
                'criteria' => json_encode(['type' => 'lesson_completed', 'count' => 5]),
                'points' => 25,
                'badge_color' => '#4ECDC4',
            ],
            [
                'name' => 'Siswa Aktif',
                'description' => 'Mengirim 50 pesan di chat',
                'icon' => '💬',
                'criteria' => json_encode(['type' => 'chat_messages', 'count' => 50]),
                'points' => 15,
                'badge_color' => '#FF6B6B',
            ],
            [
                'name' => 'Juara Kelas',
                'description' => 'Masuk top 3 leaderboard',
                'icon' => '👑',
                'criteria' => json_encode(['type' => 'leaderboard', 'position' => 3]),
                'points' => 100,
                'badge_color' => '#FFE66D',
            ],
        ];

        foreach ($achievements as $achievement) {
            Achievement::create($achievement);
        }
    }
}
