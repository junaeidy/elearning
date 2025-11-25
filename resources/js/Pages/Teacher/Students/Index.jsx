import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import toast from 'react-hot-toast';

export default function StudentsIndex({ students, flash }) {
    const handleDelete = (student) => {
        if (confirm(`Yakin ingin menghapus akun ${student.username}?`)) {
            router.delete(route('teacher.students.destroy', student.id), {
                onSuccess: () => {
                    toast.success('Akun siswa berhasil dihapus!');
                },
                onError: () => {
                    toast.error('Gagal menghapus akun siswa!');
                },
            });
        }
    };
    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Siswa" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Daftar Siswa</h2>
                                <Link href={route('teacher.students.create')}>
                                    <button className="btn btn-primary">
                                        <span>➕</span> Tambah Siswa
                                    </button>
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>Nama Lengkap</th>
                                            <th>Status</th>
                                            <th>Dibuat</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.data.map((student) => (
                                            <tr key={student.id}>
                                                <td>
                                                    <code className="bg-gray-100 px-2 py-1 rounded">
                                                        {student.username}
                                                    </code>
                                                </td>
                                                <td>{student.full_name}</td>
                                                <td>
                                                    <span className={`badge ${student.is_active ? 'badge-success' : 'badge-error'}`}>
                                                        {student.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </td>
                                                <td>{new Date(student.created_at).toLocaleDateString('id-ID')}</td>
                                                <td className="flex gap-2">
                                                    <Link href={route('teacher.students.edit', student.id)}>
                                                        <button className="btn btn-sm btn-ghost">✏️</button>
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(student)}
                                                        className="btn btn-sm btn-ghost text-error"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
