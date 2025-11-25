import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FunButton from '@/Components/FunButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function Join({ flash }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        lesson_code: '',
    });

    const [isValidating, setIsValidating] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        post(route('student.lessons.join'), {
            onSuccess: () => {
                // Fire confetti on success
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b']
                });
                reset();
            },
        });
    };

    const handleCodeChange = (e) => {
        const value = e.target.value.toUpperCase();
        setData('lesson_code', value);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        Gabung Kelas Baru 🎓
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Masukkan kode kelas yang diberikan oleh guru Anda
                    </p>
                </div>
            }
        >
            <Head title="Gabung Kelas" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
            >
                <motion.div variants={itemVariants}>
                    <div className="max-w-2xl mx-auto">
                        {/* Main Card */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            {/* Header with gradient */}
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-white">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">🎒</div>
                                    <h3 className="text-2xl font-bold mb-2">
                                        Siap untuk Belajar?
                                    </h3>
                                    <p className="text-purple-100">
                                        Masukkan kode unik kelas untuk bergabung
                                    </p>
                                </div>
                            </div>

                            {/* Form Section */}
                            <div className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <InputLabel htmlFor="lesson_code" value="Kode Kelas" />
                                        
                                        <div className="mt-2">
                                            <TextInput
                                                id="lesson_code"
                                                type="text"
                                                value={data.lesson_code}
                                                onChange={handleCodeChange}
                                                className="w-full text-center text-2xl font-mono tracking-widest uppercase"
                                                placeholder="ABC123"
                                                maxLength={6}
                                                autoFocus
                                                required
                                            />
                                        </div>

                                        <InputError message={errors.lesson_code} className="mt-2 text-center" />
                                        
                                        <p className="mt-2 text-sm text-gray-500 text-center">
                                            Kode terdiri dari 6 karakter (huruf dan angka)
                                        </p>
                                    </div>

                                    <div className="flex justify-center">
                                        <FunButton
                                            type="submit"
                                            variant="primary"
                                            size="lg"
                                            icon="🚀"
                                            disabled={processing || data.lesson_code.length !== 6}
                                            loading={processing}
                                            className="w-full max-w-md"
                                        >
                                            {processing ? 'Bergabung...' : 'Gabung Sekarang'}
                                        </FunButton>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                            <motion.div
                                variants={itemVariants}
                                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center"
                            >
                                <div className="text-4xl mb-2">📚</div>
                                <h4 className="font-semibold text-gray-900 mb-1">Akses Materi</h4>
                                <p className="text-sm text-gray-600">
                                    Dapatkan akses ke semua materi pembelajaran
                                </p>
                            </motion.div>

                            <motion.div
                                variants={itemVariants}
                                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center"
                            >
                                <div className="text-4xl mb-2">✍️</div>
                                <h4 className="font-semibold text-gray-900 mb-1">Kerjakan Quiz</h4>
                                <p className="text-sm text-gray-600">
                                    Uji pemahaman Anda dengan berbagai quiz
                                </p>
                            </motion.div>

                            <motion.div
                                variants={itemVariants}
                                className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center"
                            >
                                <div className="text-4xl mb-2">🏆</div>
                                <h4 className="font-semibold text-gray-900 mb-1">Raih Pencapaian</h4>
                                <p className="text-sm text-gray-600">
                                    Kumpulkan lencana dan sertifikat
                                </p>
                            </motion.div>
                        </div>

                        {/* Help Section */}
                        <div className="mt-8 bg-gray-50 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="text-3xl">💡</div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">
                                        Butuh Bantuan?
                                    </h4>
                                    <ul className="space-y-1 text-sm text-gray-600">
                                        <li>• Kode kelas diberikan oleh guru Anda</li>
                                        <li>• Pastikan kode dimasukkan dengan benar (case insensitive)</li>
                                        <li>• Jika kelas penuh, hubungi guru untuk informasi lebih lanjut</li>
                                        <li>• Jika kode tidak valid, periksa kembali dengan guru Anda</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AuthenticatedLayout>
    );
}
