import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import FunButton from '@/Components/FunButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Edit({ student }) {
    const [showPasswordField, setShowPasswordField] = useState(false);
    
    const { data, setData, put, processing, errors } = useForm({
        username: student.username || '',
        full_name: student.full_name || '',
        password: '',
        is_active: student.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('teacher.students.update', student.id), {
            preserveScroll: true,
        });
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
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Edit Data Siswa ✏️
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Perbarui informasi akun siswa
                        </p>
                    </div>
                    <Link href={route('teacher.students.index')}>
                        <FunButton variant="ghost" size="md" icon="←">
                            Kembali
                        </FunButton>
                    </Link>
                </div>
            }
        >
            <Head title="Edit Siswa" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
            >
                <motion.div variants={itemVariants}>
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            {/* Header Card */}
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl">
                                        👤
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">{student.full_name}</h3>
                                        <p className="text-blue-100">@{student.username}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Form Section */}
                            <form onSubmit={submit} className="p-8 space-y-6">
                                {/* Username Field */}
                                <div>
                                    <InputLabel htmlFor="username" value="Username" />
                                    <div className="mt-2">
                                        <TextInput
                                            id="username"
                                            type="text"
                                            value={data.username}
                                            onChange={(e) => setData('username', e.target.value)}
                                            className="w-full"
                                            placeholder="contoh: siswa_ani"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.username} className="mt-2" />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Username digunakan untuk login
                                    </p>
                                </div>

                                {/* Full Name Field */}
                                <div>
                                    <InputLabel htmlFor="full_name" value="Nama Lengkap" />
                                    <div className="mt-2">
                                        <TextInput
                                            id="full_name"
                                            type="text"
                                            value={data.full_name}
                                            onChange={(e) => setData('full_name', e.target.value)}
                                            className="w-full"
                                            placeholder="Ani Wijaya"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.full_name} className="mt-2" />
                                </div>

                                {/* Password Field (Optional) */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <InputLabel htmlFor="password" value="Password" />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordField(!showPasswordField)}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            {showPasswordField ? '🔒 Sembunyikan' : '🔓 Ubah Password'}
                                        </button>
                                    </div>
                                    
                                    {showPasswordField && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <TextInput
                                                id="password"
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className="w-full"
                                                placeholder="Minimal 6 karakter"
                                            />
                                            <InputError message={errors.password} className="mt-2" />
                                            <p className="mt-1 text-sm text-gray-500">
                                                Kosongkan jika tidak ingin mengubah password
                                            </p>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Status Active Toggle */}
                                <div>
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <div>
                                            <InputLabel value="Status Akun" />
                                            <p className="text-sm text-gray-600 mt-1">
                                                {data.is_active ? 'Akun aktif dan dapat login' : 'Akun dinonaktifkan'}
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>

                                {/* Info Box */}
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">ℹ️</span>
                                        <div className="text-sm text-gray-700">
                                            <p className="font-semibold mb-1">Informasi Penting:</p>
                                            <ul className="space-y-1 text-gray-600">
                                                <li>• Username harus unik dan tidak boleh sama dengan siswa lain</li>
                                                <li>• Password minimal 6 karakter</li>
                                                <li>• Jika akun dinonaktifkan, siswa tidak dapat login</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 pt-4">
                                    <FunButton
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        icon="💾"
                                        disabled={processing}
                                        loading={processing}
                                        className="flex-1"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </FunButton>
                                    <Link href={route('teacher.students.index')} className="flex-1">
                                        <FunButton
                                            type="button"
                                            variant="ghost"
                                            size="lg"
                                            className="w-full"
                                        >
                                            Batal
                                        </FunButton>
                                    </Link>
                                </div>
                            </form>
                        </div>

                        {/* Additional Info Card */}
                        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span>📊</span> Informasi Akun
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">ID Siswa</p>
                                    <p className="font-semibold text-gray-900">#{student.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                        student.is_active 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                        {student.is_active ? '✅ Aktif' : '❌ Nonaktif'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Dibuat</p>
                                    <p className="font-semibold text-gray-900">
                                        {new Date(student.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Terakhir Update</p>
                                    <p className="font-semibold text-gray-900">
                                        {new Date(student.updated_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AuthenticatedLayout>
    );
}
