<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect to provider
     */
    public function redirect($provider)
    {
        // Hanya google dan facebook yang didukung
        if (!in_array($provider, ['google', 'facebook'])) {
            abort(404);
        }

        return Socialite::driver($provider)->redirect();
    }

    /**
     * Handle callback from provider
     */
    public function callback($provider)
    {
        try {
            $socialUser = Socialite::driver($provider)->user();
            
            // Cek apakah user sudah ada berdasarkan provider ID
            $user = User::where($provider . '_id', $socialUser->getId())->first();
            
            // Jika belum ada, buat user baru (sebagai teacher)
            if (!$user) {
                // Generate unique username dari email atau nama
                $username = $this->generateUsername($socialUser->getEmail() ?? $socialUser->getName());
                
                $user = User::create([
                    'username' => $username,
                    'name' => $socialUser->getName(),
                    'full_name' => $socialUser->getName(),
                    'email' => $socialUser->getEmail(),
                    'avatar' => $socialUser->getAvatar(),
                    'role' => 'teacher', // Social login hanya untuk guru
                    'provider' => $provider,
                    $provider . '_id' => $socialUser->getId(),
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]);
            }

            // Login user
            Auth::login($user);

            // Redirect ke dashboard
            return redirect()->route('teacher.dashboard')
                ->with('success', 'Berhasil login dengan ' . ucfirst($provider) . '!');

        } catch (\Exception $e) {
            return redirect()->route('login')
                ->with('error', 'Gagal login dengan ' . ucfirst($provider) . '. Silakan coba lagi.');
        }
    }

    /**
     * Generate unique username
     */
    private function generateUsername($email)
    {
        // Ambil bagian sebelum @ dari email
        $base = explode('@', $email)[0] ?? 'user';
        $base = Str::slug($base, '_');
        
        $username = $base;
        $counter = 1;
        
        // Cek keunikan
        while (User::where('username', $username)->exists()) {
            $username = $base . '_' . $counter;
            $counter++;
        }
        
        return $username;
    }
}
