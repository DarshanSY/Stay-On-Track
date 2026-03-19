'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import { ArrowLeft, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface FeeRecord {
    id: number;
    student_id: string;
    semester: number;
    total_fees: number;
    fees_paid: number;
    pending_amount: number;
    status: string;
    payment_date: string | null;
}

interface StudentFeeSummary {
    student_id: string;
    name: string;
    total_pending: number;
    details: FeeRecord[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function FeesPage() {
    const [pendingData, setPendingData] = useState<StudentFeeSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFees = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/fees/pending');
                setPendingData(response.data);
            } catch (error) {
                console.error("Failed to fetch fee data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFees();
    }, []);

    // Calculate high level stats
    const totalOutstanding = pendingData.reduce((acc, curr) => acc + curr.total_pending, 0);
    const studentsWithDues = pendingData.length;

    // Prepare chart data
    const pieData = [
        { name: 'Pending', value: totalOutstanding },
        { name: 'Collected (Mock)', value: totalOutstanding * 1.5 } // Mock collected for visualization
    ];

    // Timeline mock data (would normally be aggregated from history)
    const timelineData = [
        { month: 'Jan', collected: 4000, pending: 2400 },
        { month: 'Feb', collected: 3000, pending: 1398 },
        { month: 'Mar', collected: 2000, pending: 9800 },
        { month: 'Apr', collected: 2780, pending: 3908 },
        { month: 'May', collected: 1890, pending: 4800 },
        { month: 'Jun', collected: 2390, pending: 3800 },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Fees Tracking Module</h1>
                    <p className="text-gray-600 mt-2">Monitor outstanding fees and payment history.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center space-x-3 text-blue-600 mb-2">
                            <DollarSign className="w-6 h-6" />
                            <h3 className="font-semibold text-lg">Total Outstanding</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">${totalOutstanding.toLocaleString()}</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center space-x-3 text-red-600 mb-2">
                            <AlertCircle className="w-6 h-6" />
                            <h3 className="font-semibold text-lg">Students with Dues</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{studentsWithDues}</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center space-x-3 text-green-600 mb-2">
                            <CheckCircle className="w-6 h-6" />
                            <h3 className="font-semibold text-lg">Collection Rate</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">65%</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[400px]">
                        <h3 className="font-semibold text-lg mb-4">Fee Collection Status</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[400px]">
                        <h3 className="font-semibold text-lg mb-4">Collection Timeline</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={timelineData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="collected" stackId="a" fill="#82ca9d" name="Collected" />
                                <Bar dataKey="pending" stackId="a" fill="#ff7300" name="Pending" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="font-semibold text-lg">Outstanding Fee Details</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-900 font-medium">
                                <tr>
                                    <th className="p-4">Student ID</th>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Total Pending</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pendingData.length > 0 ? pendingData.map((student) => (
                                    <tr key={student.student_id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">{student.student_id}</td>
                                        <td className="p-4">{student.name}</td>
                                        <td className="p-4 text-red-600 font-medium">${student.total_pending.toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Overdue
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button className="text-blue-600 hover:text-blue-800 font-medium">
                                                Remind
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">
                                            No pending fees found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
