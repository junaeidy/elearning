import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export default function TeacherDashboard({ auth, flash }) {
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash]);
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard Guru
                </h2>
            }
        >
            <Head title="Dashboard Guru" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-2xl font-bold mb-4">
                                Selamat datang, {auth.user.full_name}! 👨‍🏫
                            </h3>
                            <p className="mb-6">Ini adalah dashboard untuk guru.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Link href={route('teacher.students.index')} className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow">
                                    <div className="card-body">
                                        <h2 className="card-title">👥 Manajemen Siswa</h2>
                                        <p>Kelola akun siswa</p>
                                    </div>
                                </Link>
                                
                                <div className="card bg-base-200 shadow-xl opacity-50">
                                    <div className="card-body">
                                        <h2 className="card-title">📚 Manajemen Lesson</h2>
                                        <p>Coming soon in Step 4...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
