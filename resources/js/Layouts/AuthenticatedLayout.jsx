import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import Notification from '@/Components/Notification';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingSidebar, setShowingSidebar] = useState(false);
    const [showingMobileMenu, setShowingMobileMenu] = useState(false);

    // Define menu items based on role
    const getMenuItems = () => {
        if (user.role === 'teacher') {
            return [
                { name: 'Dashboard', icon: '📊', href: route('teacher.dashboard'), active: route().current('teacher.dashboard') },
                { name: 'Pelajaran Saya', icon: '📚', href: route('teacher.lessons.index'), active: route().current('teacher.lessons.*') || route().current('teacher.quizzes.*') },
                { name: 'Siswa', icon: '👥', href: route('teacher.students.index'), active: route().current('teacher.students.*') },
                { name: 'Analitik', icon: '📈', href: '#', active: false },
            ];
        } else {
            return [
                { name: 'Dashboard', icon: '🏠', href: route('student.dashboard'), active: route().current('student.dashboard') },
                { name: 'Kelas Saya', icon: '📚', href: '#', active: route().current('student.lessons.*') || route().current('student.quizzes.*') },
                { name: 'Gabung Kelas', icon: '➕', href: '#', active: false },
                { name: 'Pencapaian', icon: '🏆', href: '#', active: false },
                { name: 'Sertifikat', icon: '🎓', href: '#', active: false },
            ];
        }
    };

    const menuItems = getMenuItems();

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
            <Notification />
            {/* Top Navbar */}
            <nav className="bg-white/80 backdrop-blur-lg border-b border-purple-100 sticky top-0 z-50 shadow-lg">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        {/* Logo and Brand */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowingSidebar(!showingSidebar)}
                                className="lg:hidden p-2 rounded-lg hover:bg-purple-100 transition-colors"
                            >
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            
                            <Link href={route('dashboard')} className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-2xl">🎓</span>
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        E-Learning
                                    </h1>
                                    <p className="text-xs text-gray-500 capitalize">{user.role} Portal</p>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-2">
                            {menuItems.slice(0, 3).map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                        item.active
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                            : 'text-gray-700 hover:bg-purple-100'
                                    }`}
                                >
                                    <span>{item.icon}</span>
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Right side - Notifications & Profile */}
                        <div className="flex items-center gap-3">
                            {/* Notifications */}
                            <button className="relative p-2 rounded-lg hover:bg-purple-100 transition-colors">
                                <span className="text-2xl">🔔</span>
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            {/* Profile Dropdown */}
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-purple-100 transition-colors">
                                        <img
                                            src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=8B5CF6&color=fff`}
                                            alt={user.full_name}
                                            className="w-10 h-10 rounded-full ring-2 ring-purple-200"
                                        />
                                        <div className="hidden md:block text-left">
                                            <p className="text-sm font-semibold text-gray-900">{user.full_name}</p>
                                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                        </div>
                                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                    <Dropdown.Link href={route('profile.edit')}>
                                        <span className="mr-2">👤</span> Profil
                                    </Dropdown.Link>
                                    <Dropdown.Link href="#">
                                        <span className="mr-2">⚙️</span> Pengaturan
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        <span className="mr-2">🚪</span> Keluar
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setShowingMobileMenu(!showingMobileMenu)}
                                className="lg:hidden p-2 rounded-lg hover:bg-purple-100 transition-colors"
                            >
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {showingMobileMenu ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {showingMobileMenu && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden border-t border-purple-100 bg-white/95 backdrop-blur-lg"
                        >
                            <div className="px-4 py-4 space-y-2">
                                {menuItems.map((item, index) => (
                                    <Link
                                        key={index}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                            item.active
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                                : 'text-gray-700 hover:bg-purple-100'
                                        }`}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Main Content */}
            <div className="flex">
                {/* Sidebar for Desktop */}
                <aside className="hidden lg:block w-64 min-h-screen bg-white/80 backdrop-blur-lg border-r border-purple-100 shadow-lg">
                    <div className="p-6 space-y-2">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Menu</h2>
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                    item.active
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                                        : 'text-gray-700 hover:bg-purple-100 hover:translate-x-1'
                                }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        ))}
                    </div>
                </aside>

                {/* Page Content */}
                <div className="flex-1">
                    {header && (
                        <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-purple-100">
                            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                                {header}
                            </div>
                        </header>
                    )}

                    <main className="p-4 sm:p-6 lg:p-8">
                        {children}
                    </main>

                    {/* Footer */}
                    <footer className="bg-white/80 backdrop-blur-lg border-t border-purple-100 mt-12">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="text-center md:text-left">
                                    <p className="text-sm text-gray-600">
                                        © 2025 Platform E-Learning. Dibuat dengan <span className="text-red-500">❤️</span> untuk pendidikan
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">Bantuan</a>
                                    <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">Privasi</a>
                                    <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">Ketentuan</a>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
