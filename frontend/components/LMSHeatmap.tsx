'use client';

import { Activity } from 'lucide-react';
import React from 'react';

// Mock data generator for heatmap
const generateHeatmapData = () => {
    return Array.from({ length: 50 }, () => Math.floor(Math.random() * 4));
};

export default function LMSHeatmap() {
    const data = generateHeatmapData();

    const getColor = (level) => {
        switch (level) {
            case 0: return 'bg-gray-100';
            case 1: return 'bg-green-200';
            case 2: return 'bg-green-400';
            case 3: return 'bg-green-600';
            default: return 'bg-gray-100';
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
            <h3 className="tex-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-500" /> LMS Activity Insights
            </h3>

            <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-500">Student login & submission intensity (Last 30 Days)</p>

                <div className="flex flex-wrap gap-1">
                    {data.map((level, i) => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-sm ${getColor(level)} transition-all hover:scale-110`}
                            title={`Activity Level: ${level}`}
                        ></div>
                    ))}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                        <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                        <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
                    </div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
}
