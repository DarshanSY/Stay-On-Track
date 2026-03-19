'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Student {
    name: string;
    student_id: string;
    risk_category: string;
    risk_score: number;
    cgpa: number;
    attendance_percentage: number;
    current_semester: number;
    fees_paid_status: number;
    outstanding_fees_amount: number;
}

interface Alert {
    message: string;
    type: string;
    timestamp: string;
}

interface Intervention {
    title: string;
    status: string;
    type: string;
}

export default function StudentDashboard() {
    const params = useParams();
    const router = useRouter();
    const [student, setStudent] = useState<Student | null>(null);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check auth
        const stored = localStorage.getItem('student');
        if (!stored) {
            router.push('/student/login');
            return;
        }

        // Fetch dashboard data
        const fetchDashboard = async () => {
            try {
                const studentId = params.student_id;
                const res = await fetch(`http://localhost:5000/api/student/dashboard/${studentId}`);
                if (res.ok) {
                    const data = await res.json();
                    setStudent(data.student);
                    setAlerts(data.alerts);
                    setInterventions(data.interventions);
                } else {
                    console.error('Failed to fetch dashboard');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (params.student_id) {
            fetchDashboard();
        }
    }, [params.student_id, router]);

    const handleLogout = () => {
        localStorage.removeItem('student');
        router.push('/student/login');
    };

    if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;
    if (!student) return <div className="p-10 text-center">Student not found</div>;

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'Low': return 'bg-green-100 text-green-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'High': return 'bg-orange-100 text-orange-800';
            case 'Critical': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-blue-600 text-white p-4 shadow-md">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="font-bold text-xl">My Portal</div>
                    <div className="flex gap-4 items-center">
                        <span>Welcome, {student.name}</span>
                        <button onClick={handleLogout} className="bg-blue-700 px-3 py-1 rounded hover:bg-blue-800 text-sm">Logout</button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                {/* Header Stats */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                        <dt className="text-sm font-medium text-gray-500 truncate">Current Semester</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{student.current_semester}</dd>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                        <dt className="text-sm font-medium text-gray-500 truncate">CGPA</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{student.cgpa}</dd>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                        <dt className="text-sm font-medium text-gray-500 truncate">Attendance</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{student.attendance_percentage}%</dd>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                        <dt className="text-sm font-medium text-gray-500 truncate">Risk Status</dt>
                        <dd className="mt-1">
                            <span className={`px-2 py-1 text-sm font-medium rounded-full ${getRiskColor(student.risk_category)}`}>
                                {student.risk_category}
                            </span>
                        </dd>
                    </div>
                    {/* Fee Status Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                        <dt className="text-sm font-medium text-gray-500 truncate">Fee Status</dt>
                        <dd className="mt-1">
                            {student.fees_paid_status === 1 ? (
                                <span className="px-2 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                                    Paid
                                </span>
                            ) : (
                                <div className="flex flex-col">
                                    <span className="px-2 py-1 w-max text-sm font-medium rounded-full bg-red-100 text-red-800 mb-1">
                                        Pending
                                    </span>
                                    <span className="text-xs text-red-600 font-semibold">
                                        Due: ${student.outstanding_fees_amount?.toLocaleString() || '0'}
                                    </span>
                                </div>
                            )}
                        </dd>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Interventions */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">My Interventions</h3>
                        {interventions.length === 0 ? (
                            <p className="text-gray-500 italic">No active interventions.</p>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {interventions.map((intervention, idx) => (
                                    <li key={idx} className="py-4">
                                        <div className="flex justify-between">
                                            <div className="text-sm font-medium text-gray-900">{intervention.title}</div>
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {intervention.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{intervention.type}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Alerts */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Recent Alerts</h3>
                        {alerts.length === 0 ? (
                            <p className="text-gray-500 italic">No recent notifications.</p>
                        ) : (
                            <ul className="space-y-4">
                                {alerts.map((alert, idx) => (
                                    <li key={idx} className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
                                        <div className="flex">
                                            <div className="ml-3">
                                                <p className="text-sm text-yellow-700">{alert.message}</p>
                                                <p className="text-xs text-yellow-500 mt-1">{new Date(alert.timestamp).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
