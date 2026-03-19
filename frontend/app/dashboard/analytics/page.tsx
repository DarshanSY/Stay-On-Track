'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AnalyticsPage() {
    const [analyticsData, setAnalyticsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';
                const response = await axios.get(`${apiUrl}/analytics`);
                setAnalyticsData(response.data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return <div className="p-8 text-center">Loading analytics...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 text-lg mb-1">Dropout Risk vs Academic Performance</h3>
                <p className="text-sm text-gray-500 mb-6">Correlation between semester progression, dropout risk, and CGPA</p>

                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={analyticsData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="semester" />

                            {/* YAxis for Risk % */}
                            <YAxis yAxisId="left" orientation="left" stroke="#ef4444" domain={[0, 100]} />

                            {/* YAxis for CGPA */}
                            <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" domain={[0, 10]} />

                            <Tooltip />
                            <Legend />

                            <Bar yAxisId="right" dataKey="cgpa" name="Avg CGPA" fill="#3b82f6" />
                            <Bar yAxisId="left" dataKey="risk" name="Dropout Risk %" fill="#ef4444" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
