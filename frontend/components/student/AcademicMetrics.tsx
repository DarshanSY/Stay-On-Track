'use client';

import { GraduationCap, Clock, Activity } from 'lucide-react';

interface AcademicMetricsProps {
    cgpa: number;
    attendance: number;
    lmsLogins: number;
}

export default function AcademicMetrics({ cgpa, attendance, lmsLogins }: AcademicMetricsProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Key Academic Metrics</h3>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50/50 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-3 text-blue-600">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{cgpa}</span>
                    <span className="text-xs text-gray-500">CGPA</span>
                </div>

                <div className="bg-green-50/50 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-3 text-green-600">
                        <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{attendance}%</span>
                    <span className="text-xs text-gray-500">Attendance</span>
                </div>

                <div className="bg-purple-50/50 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-3 text-purple-600">
                        <Activity className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{lmsLogins}</span>
                    <span className="text-xs text-gray-500">LMS Logins (30d)</span>
                </div>
            </div>
        </div>
    );
}
