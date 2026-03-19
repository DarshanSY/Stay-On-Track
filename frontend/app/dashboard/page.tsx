import React from 'react';
import DashboardStats from '@/components/DashboardStats';
import DashboardCharts from '@/components/DashboardCharts';
import AlertsWidget from '@/components/AlertsWidget';
import LMSHeatmap from '@/components/LMSHeatmap';

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="p-8 space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</div>
                </div>

                <DashboardStats />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <DashboardCharts />
                    </div>
                    <div className="space-y-8">
                        <AlertsWidget />
                        <LMSHeatmap />
                    </div>
                </div>
            </div>
        </div>
    );
}
