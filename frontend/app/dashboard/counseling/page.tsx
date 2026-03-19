'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle, FileText } from 'lucide-react';

export default function CounselingPage() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            fetchRecommendations(selectedStudent);
        }
    }, [selectedStudent]);

    const fetchStudents = async () => {
        try {
            const res = await axios.get(`${API_BASE}/students`);
            // Filter high risk for priority
            const sorted = res.data.sort((a, b) => b.risk_score - a.risk_score);
            setStudents(sorted);
            if (sorted.length > 0) setSelectedStudent(sorted[0].student_id);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchRecommendations = async (studentId) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/intervention/generate?student_id=${studentId}`);
            setRecommendations(res.data.recommendations);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const handleExport = () => {
        window.print();
    };

    const studentInfo = students.find(s => s.student_id === selectedStudent);

    return (
        <div className="p-8 bg-gray-900 min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                Counseling & Intervention
            </h1>

            <div className="flex gap-8 items-start">
                <div className="w-1/3 bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-bold mb-4">At-Risk Students (Priority)</h2>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                        {students.map(s => (
                            <button
                                key={s.student_id}
                                onClick={() => setSelectedStudent(s.student_id)}
                                className={`w-full text-left p-3 rounded-lg flex justify-between items-center transition-colors
                                    ${selectedStudent === s.student_id ? 'bg-blue-600/20 border-blue-500' : 'bg-gray-700 hover:bg-gray-600'} border border-transparent`}
                            >
                                <div>
                                    <div className="font-semibold">{s.name}</div>
                                    <div className="text-xs text-gray-400">CGPA: {s.cgpa} | Att: {s.attendance_percentage}%</div>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-bold
                                    ${s.risk_category === 'Critical' ? 'bg-red-500/20 text-red-500' :
                                        s.risk_category === 'High' ? 'bg-orange-500/20 text-orange-500' :
                                            'bg-green-500/20 text-green-500'}`}>
                                    {s.risk_score}%
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 bg-gray-800 p-6 rounded-xl border border-gray-700">
                    {studentInfo && (
                        <>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">{studentInfo.name}</h2>
                                    <div className="flex gap-4 text-sm text-gray-400">
                                        <span>ID: <span className="text-white">{studentInfo.student_id}</span></span>
                                        <span>Sem: <span className="text-white">{studentInfo.current_semester}</span></span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <FileText className="w-4 h-4" />
                                    Export Plan
                                </button>
                            </div>

                            <div className="mb-6 grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-700/50 rounded-lg">
                                    <div className="text-sm text-gray-400">Risk Level</div>
                                    <div className={`text-xl font-bold ${studentInfo.risk_category === 'Critical' ? 'text-red-500' :
                                            studentInfo.risk_category === 'High' ? 'text-orange-500' : 'text-green-500'
                                        }`}>
                                        {studentInfo.risk_category} ({studentInfo.risk_score}%)
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-700/50 rounded-lg">
                                    <div className="text-sm text-gray-400">LMS Activity</div>
                                    <div className="text-xl font-bold text-blue-400">
                                        {studentInfo.lms_login_count || 0} Logins
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold mb-4 text-blue-300">Recommended Interventions</h3>

                            {loading ? (
                                <div>Loading recommendations...</div>
                            ) : (
                                <div className="space-y-4">
                                    {recommendations.map((rec, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 bg-gray-700/30 rounded-lg border border-gray-700">
                                            <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                                            <div>
                                                <p className="text-white font-medium">{rec}</p>
                                                <p className="text-sm text-gray-400 mt-1">Suggested based on current metrics.</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t border-gray-700">
                                <h3 className="text-lg font-semibold mb-4 text-gray-300">Documentation</h3>
                                <textarea
                                    className="w-full h-32 bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="Counselor notes..."
                                ></textarea>
                                <button className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm">
                                    Save Notes
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
