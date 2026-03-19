'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function TrendsPage() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);
    const [gpaData, setGpaData] = useState([]);
    const [lmsData, setLmsData] = useState([]);
    const [loading, setLoading] = useState(false);

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            fetchTrends(selectedStudent);
        }
    }, [selectedStudent]);

    const fetchStudents = async () => {
        try {
            const res = await axios.get(`${API_BASE}/students`);
            setStudents(res.data);
            if (res.data.length > 0) setSelectedStudent(res.data[0].student_id);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchTrends = async (studentId) => {
        setLoading(true);
        try {
            const [attRes, gpaRes, lmsRes] = await Promise.all([
                axios.get(`${API_BASE}/temporal/attendance/${studentId}`),
                axios.get(`${API_BASE}/temporal/gpa/${studentId}`),
                axios.get(`${API_BASE}/temporal/lms/${studentId}`)
            ]);
            setAttendanceData(attRes.data);
            setGpaData(gpaRes.data);
            setLmsData(lmsRes.data);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <div className="p-8 bg-gray-900 min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Student Trends
            </h1>

            <div className="mb-8">
                <label className="block text-sm font-medium text-gray-400 mb-2">Select Student</label>
                <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white rounded-md p-2 w-64"
                >
                    {students.map(s => (
                        <option key={s.student_id} value={s.student_id}>{s.name} ({s.student_id})</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="text-blue-400">Loading trends...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Attendance Chart */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">Attendance Trend</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={attendanceData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="month" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" domain={[0, 100]} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="Attendance %" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* GPA Chart */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">GPA Trend</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={gpaData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="semester" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" domain={[0, 10]} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} name="CGPA" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* LMS Chart */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">LMS Activity</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={lmsData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="month" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="login_count" stroke="#8b5cf6" name="Logins" />
                                    <Line type="monotone" dataKey="assignments" stroke="#f59e0b" name="Assignments" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
