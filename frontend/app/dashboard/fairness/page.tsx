'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function FairnessPage() {
    const [report, setReport] = useState(null);
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await axios.get(`${API_BASE}/model/fairness_report`);
                setReport(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchReport();
    }, []);

    if (!report) return <div className="p-8 text-white">Loading fairness report...</div>;

    // Transform data for charts
    const genderData = report.gender_parity ? Object.keys(report.gender_parity).map(key => ({
        name: key,
        RiskRate: report.gender_parity[key]
    })) : [];

    const bgData = report.background_parity ? Object.keys(report.background_parity).map(key => ({
        name: key || 'Unknown',
        RiskRate: report.background_parity[key]
    })) : [];

    return (
        <div className="p-8 bg-gray-900 min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-2">Model Fairness Report</h1>
            <p className="text-gray-400 mb-8">Analysis of model bias across demographic groups.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-bold mb-4">Gender Parity</h2>
                    <p className="text-sm text-gray-400 mb-4">Predicted Dropout Rate by Gender. Significant differences may indicate bias.</p>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={genderData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip cursor={{ fill: '#374151' }} contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                                <Bar dataKey="RiskRate" fill="#3b82f6" name="Avg Risk Prob" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-bold mb-4">Socio-Economic Parity</h2>
                    <p className="text-sm text-gray-400 mb-4">Predicted Risk by Background Score (Low/Mid/High).</p>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={bgData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip cursor={{ fill: '#374151' }} contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                                <Bar dataKey="RiskRate" fill="#10b981" name="Avg Risk Prob" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Notes</h2>
                <div className="text-gray-300">
                    {report.notes || "No notes available."}
                </div>
            </div>
        </div>
    );
}
