'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Cell
} from 'recharts';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface StudentPCA {
    id: string;
    name: string;
    risk_band: 'Low' | 'Medium' | 'High';
    risk_probability: number;
    x: number;
    y: number;
}

interface PCAData {
    components: number[][];
    students: StudentPCA[];
}

const COLORS = {
    Low: '#22c55e',    // Green-500
    Medium: '#eab308', // Yellow-500
    High: '#ef4444'    // Red-500
};

export default function PCAPage() {
    const [data, setData] = useState<PCAData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/explain/pca');
                setData(response.data);
            } catch (err) {
                console.error("Failed to fetch PCA data", err);
                setError("Failed to load PCA data. Ensure models are trained.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 flex-col">
                <div className="text-red-500 text-lg mb-4">{error}</div>
                <Link href="/dashboard" className="text-blue-600 hover:underline">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Student Risk Clusters (PCA)</h1>
                    <p className="text-gray-600 mt-2">
                        Visualizing student dropout risk using Principal Component Analysis (PCA).
                        Students closer together have similar risk profiles.
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="h-[600px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    type="number"
                                    dataKey="x"
                                    name="Component 1"
                                    label={{ value: 'Principal Component 1', position: 'bottom', offset: 0 }}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="y"
                                    name="Component 2"
                                    label={{ value: 'Principal Component 2', angle: -90, position: 'left' }}
                                />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload as StudentPCA;
                                            return (
                                                <div className="bg-white p-3 border border-gray-200 shadow-md rounded-lg">
                                                    <p className="font-semibold">{data.name}</p>
                                                    <p className="text-sm text-gray-600">ID: {data.id}</p>
                                                    <p className="text-sm">
                                                        Risk Band:
                                                        <span className={`ml-1 font-medium ${data.risk_band === 'High' ? 'text-red-600' :
                                                                data.risk_band === 'Medium' ? 'text-yellow-600' :
                                                                    'text-green-600'
                                                            }`}>
                                                            {data.risk_band}
                                                        </span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Probability: {(data.risk_probability * 100).toFixed(1)}%
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend layout="horizontal" verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: '20px' }} />
                                <Scatter name="Students" data={data?.students} fill="#8884d8">
                                    {data?.students.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[entry.risk_band]}
                                        />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                            <div className="font-semibold text-green-700">Low Risk</div>
                            <p className="text-sm text-green-600">Students with low probability of dropout. Consistent attendance and performance.</p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                            <div className="font-semibold text-yellow-700">Medium Risk</div>
                            <p className="text-sm text-yellow-600">Students showing early warning signs. May need monitoring.</p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                            <div className="font-semibold text-red-700">High Risk</div>
                            <p className="text-sm text-red-600">Students requiring immediate intervention. Poor attendance or grades.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
