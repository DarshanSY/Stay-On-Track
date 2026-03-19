'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

const COLORS = {
    Critical: '#ef4444',
    High: '#f97316',
    Medium: '#eab308', // Changed Medium to Yellow/Amber for better distinction if High is Orange
    Low: '#22c55e'
};

export default function DashboardCharts() {
    const [chartData, setChartData] = useState<{ name: string, value: number, fill: string }[]>([]);
    const [pieData, setPieData] = useState<{ name: string, value: number, color: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';
                const response = await axios.get(`${apiUrl}/dashboard/metrics`);
                const riskDist = response.data.risk_distribution;

                // Prepare Bar Data
                // Filter out zero values or keep them? Keeping them is better for structure.
                const bar = [
                    { name: 'Critical', value: riskDist.Critical || 0, fill: COLORS.Critical },
                    { name: 'High', value: riskDist.High || 0, fill: COLORS.High },
                    { name: 'Medium', value: riskDist.Medium || 0, fill: COLORS.Medium },
                    { name: 'Low', value: riskDist.Low || 0, fill: COLORS.Low },
                ];
                setChartData(bar);

                // Prepare Pie Data
                const pie = [
                    { name: 'Critical', value: riskDist.Critical || 0, color: COLORS.Critical },
                    { name: 'High', value: riskDist.High || 0, color: COLORS.High },
                    { name: 'Medium', value: riskDist.Medium || 0, color: COLORS.Medium },
                    { name: 'Low', value: riskDist.Low || 0, color: COLORS.Low },
                ].filter(item => item.value > 0); // Only show segments with data

                setPieData(pie);

            } catch (error) {
                console.error("Error loading chart data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[300px] animate-pulse"></div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[300px] animate-pulse"></div>
        </div>;
    }
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Distribution Bar Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg text-gray-900 mb-6">Risk Distribution</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} barSize={60}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Risk Overview Donut Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg text-gray-900 mb-6">Risk Overview</h3>
                <div className="h-[300px] w-full flex flex-col items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div className="flex items-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-sm text-gray-500">Critical</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <span className="text-sm text-gray-500">High</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span className="text-sm text-gray-500">Medium</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm text-gray-500">Low</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
