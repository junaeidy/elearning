import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        full_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            toast.error('Terdapat kesalahan pada form!');
        }
    }, [errors]);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onError: () => {
                toast.error('Registrasi gagal! Periksa kembali data Anda.');
            },
        });
    };

    const handleSocialLogin = (provider) => {
        window.location.href = route('social.redirect', provider);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-yellow-300 flex items-center justify-center p-4">
            <Head title="Daftar Akun Guru" />
            
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    {/* Logo & Title */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full mb-4">
                            <span className="text-4xl">👨‍🏫</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">Daftar Akun Guru</h2>
                        <p className="text-gray-600 mt-2">Buat akun untuk mulai mengajar</p>
                    </div>

                    {/* Social Login Buttons */}
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
                            Daftar dengan Google
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSocialLogin('facebook')}
                            className="btn btn-outline btn-lg w-full gap-2"
                        >
                            <svg className="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Daftar dengan Facebook
                        </button>
                    </div>

                    <div className="divider">ATAU</div>

                    <form onSubmit={submit} className="space-y-4">
                        {/* Username */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-semibold">Username</span>
                            </label>
                            <input
                                type="text"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                className={`input input-bordered input-lg w-full ${errors.username ? 'input-error' : ''}`}
                                placeholder="contoh: guru_budi"
                                required
                            />
                            {errors.username && <span className="text-error text-sm mt-1">{errors.username}</span>}
                        </div>

                        {/* Full Name */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-semibold">Nama Lengkap</span>
                            </label>
                            <input
                                type="text"
                                value={data.full_name}
                                onChange={(e) => setData('full_name', e.target.value)}
                                className={`input input-bordered input-lg w-full ${errors.full_name ? 'input-error' : ''}`}
                                placeholder="Budi Santoso, S.Pd"
                                required
                            />
                            {errors.full_name && <span className="text-error text-sm mt-1">{errors.full_name}</span>}
                        </div>

                        {/* Email (Optional) */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-semibold">Email (Opsional)</span>
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={`input input-bordered input-lg w-full ${errors.email ? 'input-error' : ''}`}
                                placeholder="email@guru.com"
                            />
                            {errors.email && <span className="text-error text-sm mt-1">{errors.email}</span>}
                        </div>

                        {/* Password */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-semibold">Password</span>
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={`input input-bordered input-lg w-full ${errors.password ? 'input-error' : ''}`}
                                placeholder="Minimal 8 karakter"
                                required
                            />
                            {errors.password && <span className="text-error text-sm mt-1">{errors.password}</span>}
                        </div>

                        {/* Confirm Password */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-semibold">Ulangi Password</span>
                            </label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="input input-bordered input-lg w-full"
                                placeholder="Ketik ulang password"
                                required
                            />
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
                                    <span>🚀</span> Daftar Sekarang
                                </>
                            )}
                        </button>

                        {/* Login Link */}
                        <p className="text-center text-gray-600">
                            Sudah punya akun?{' '}
                            <Link href={route('login')} className="text-primary font-semibold hover:underline">
                                Login di sini
                            </Link>
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
