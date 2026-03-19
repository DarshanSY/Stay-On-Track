'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    BarChart2,
    Settings,
    LogOut,
    Brain,
    LineChart,
    HeartHandshake,
    Bell,
    Scale
} from 'lucide-react';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', href: '/dashboard/students', icon: Users },
    { name: 'Trends', href: '/dashboard/trends', icon: LineChart },
    { name: 'Interventions', href: '/dashboard/interventions', icon: BookOpen },
    { name: 'Counseling', href: '/dashboard/counseling', icon: HeartHandshake },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
    { name: 'Fairness', href: '/dashboard/fairness', icon: Scale },
    { name: 'Alerts', href: '/dashboard/alerts', icon: Bell },
    { name: 'Predictions', href: '/predictions', icon: Brain },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-[#0f172a] text-white transition-all duration-300 z-30 hidden md:flex flex-col border-r border-gray-800">
            <div className="p-6">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <span className="text-white">StayOnTrack</span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                <div className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">Menu</div>
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                                ${isActive
                                    ? 'bg-[#1e293b] text-blue-400 border border-blue-500/20'
                                    : 'text-gray-400 hover:bg-[#1e293b] hover:text-white'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-400 rounded-lg hover:bg-[#1e293b] hover:text-white transition-colors">
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
