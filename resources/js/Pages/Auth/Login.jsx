import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        if (status) {
            toast.success(status);
        }
    }, [status]);

    useEffect(() => {
        if (errors.username || errors.password) {
            toast.error('Username atau password salah!');
        }
    }, [errors]);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
            onError: () => {
                toast.error('Login gagal! Periksa kembali username dan password.');
            },
        });
    };

    const handleSocialLogin = (provider) => {
        window.location.href = route('social.redirect', provider);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-300 to-pink-300 flex items-center justify-center p-4">
            <Head title="Login" />
            
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    {/* Logo & Title */}
                    <div className="text-center mb-8">
                        <motion.div 
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full mb-4"
                        >
                            <span className="text-4xl">📚</span>
                        </motion.div>
                        <h2 className="text-3xl font-bold text-gray-800">Selamat Datang!</h2>
                        <p className="text-gray-600 mt-2">Login untuk mulai belajar</p>
                    </div>

                    {status && (
                        <div className="alert alert-success mb-4">
                            <span>{status}</span>
                        </div>
                    )}

                    {/* Social Login Buttons (Hanya untuk Guru) */}
                    <div className="space-y-3 mb-6">
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('google')}
                            className="btn btn-outline btn-lg w-full gap-2"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Login dengan Google
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSocialLogin('facebook')}
                            className="btn btn-outline btn-lg w-full gap-2"
                        >
                            <svg className="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Login dengan Facebook
                        </button>
                    </div>

                    <div className="divider">ATAU</div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Username */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-semibold text-lg">Username</span>
                            </label>
                            <input
                                type="text"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                className={`input input-bordered input-lg text-lg w-full ${errors.username ? 'input-error' : ''}`}
                                placeholder="guru_budi atau siswa_ani"
                                autoFocus
                                required
                            />
                            {errors.username && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.username}</span>
                                </label>
                            )}
                        </div>

                        {/* Password */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-semibold text-lg">Password</span>
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={`input input-bordered input-lg text-lg w-full ${errors.password ? 'input-error' : ''}`}
                                placeholder="••••••••"
                                required
                            />
                            {errors.password && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.password}</span>
                                </label>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="form-control">
                            <label className="label cursor-pointer justify-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="checkbox checkbox-primary"
                                />
                                <span className="label-text">Ingat saya</span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn btn-primary btn-lg w-full text-lg"
                        >
                            {processing ? (
                                <span className="loading loading-spinner"></span>
                            ) : (
                                <>
                                    <span>🚀</span> Masuk
                                </>
                            )}
                        </button>

                        {/* Links */}
                        <div className="text-center space-y-2">
                            <p className="text-gray-600">
                                Belum punya akun guru?{' '}
                                <Link
                                    href={route('register')}
                                    className="link link-primary font-semibold"
                                >
                                    Daftar di sini
                                </Link>
                            </p>
                        </div>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 font-semibold mb-2">Demo Login:</p>
                        <div className="text-xs text-gray-600 space-y-1">
                            <p>👨‍🏫 Guru: <code className="bg-white px-2 py-1 rounded">guru_budi</code> / password</p>
                            <p>🎒 Siswa: <code className="bg-white px-2 py-1 rounded">siswa_ani</code> / password</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
