import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export default function CreateStudent() {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        full_name: '',
        password: '',
    });

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            toast.error('Terdapat kesalahan pada form!');
        }
    }, [errors]);

    const submit = (e) => {
        e.preventDefault();
        post(route('teacher.students.store'), {
            onSuccess: () => {
                toast.success('Akun siswa berhasil dibuat!');
            },
            onError: () => {
                toast.error('Gagal membuat akun siswa!');
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Tambah Siswa" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-6">Tambah Akun Siswa Baru</h2>

                            <form onSubmit={submit} className="space-y-6">
                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text font-semibold">Username</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        className={`input input-bordered w-full ${errors.username ? 'input-error' : ''}`}
                                        placeholder="contoh: siswa_ani"
                                        required
                                    />
                                    {errors.username && <span className="text-error text-sm mt-1">{errors.username}</span>}
                                </div>

                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text font-semibold">Nama Lengkap</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.full_name}
                                        onChange={(e) => setData('full_name', e.target.value)}
                                        className={`input input-bordered w-full ${errors.full_name ? 'input-error' : ''}`}
                                        placeholder="Ani Wijaya"
                                        required
                                    />
                                    {errors.full_name && <span className="text-error text-sm mt-1">{errors.full_name}</span>}
                                </div>

                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text font-semibold">Password</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
                                        placeholder="Minimal 6 karakter"
                                        required
                                    />
                                    {errors.password && <span className="text-error text-sm mt-1">{errors.password}</span>}
                                    <label className="label">
                                        <span className="label-text-alt text-gray-500">
                                            Password ini akan digunakan siswa untuk login
                                        </span>
                                    </label>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="btn btn-primary flex-1"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => window.history.back()}
                                        className="btn btn-ghost"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
