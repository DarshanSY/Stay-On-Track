"use client";

import React, { useEffect, useState } from 'react';
import { Users, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface DashboardMetrics {
    total_students: number;
    risk_distribution: {
        Low: number;
        Medium: number;
        High: number;
        Critical: number;
    };
    avg_attendance: number;
    avg_cgpa: number;
}

export default function DashboardStats() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                // Determine API URL based on environment or default to localhost
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';
                const response = await axios.get(`${apiUrl}/dashboard/metrics`);
                setMetrics(response.data);
            } catch (error) {
                console.error('Error fetching dashboard metrics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    if (loading) {
        return <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
        </div>;
    }

    if (!metrics) {
        return <div>Error loading stats</div>; // Better error UI can be added
    }

    // Default values if keys are missing
    const criticalCount = metrics.risk_distribution?.Critical || 0;
    const highCount = metrics.risk_distribution?.High || 0;
    const mediumCount = metrics.risk_distribution?.Medium || 0;
    const lowCount = metrics.risk_distribution?.Low || 0;
    const atRiskCount = highCount + mediumCount;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Students */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Students</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-1">{metrics.total_students}</h3>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-lg">
                        <Users className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
                <p className="text-xs text-gray-400">Active enrollment</p>
            </div>

            {/* At Risk */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">At Risk</p>
                        <h3 className="text-3xl font-bold text-red-600 mt-1">{atRiskCount}</h3>
                    </div>
                    <div className="p-2 bg-red-50 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                </div>
                <p className="text-xs text-gray-400">High & Medium risk</p>
            </div>

            {/* Critical Attention */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Critical Attention</p>
                        <h3 className="text-3xl font-bold text-orange-500 mt-1">{criticalCount}</h3>
                    </div>
                    <div className="p-2 bg-orange-50 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                    </div>
                </div>
                <p className="text-xs text-gray-400">Immediate intervention needed</p>
            </div>

            {/* On Track */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">On Track</p>
                        <h3 className="text-3xl font-bold text-green-500 mt-1">{lowCount}</h3>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                </div>
                <p className="text-xs text-gray-400">Low risk students</p>
            </div>
        </div>
    );
}
