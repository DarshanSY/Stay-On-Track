import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon?: React.ReactNode;
}

export default function StatCard({ title, value, change, changeType = 'neutral', icon }: StatCardProps) {
    const getChangeColor = () => {
        if (changeType === 'positive') return 'text-green-600';
        if (changeType === 'negative') return 'text-red-600';
        return 'text-gray-500';
    };

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    {icon || (
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    )}
                </div>
                <div className="ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                        <dd>
                            <div className="text-lg font-medium text-gray-900">{value}</div>
                        </dd>
                    </dl>
                </div>
            </div>
            {change && (
                <div className={`mt-2 flex items-center text-sm ${getChangeColor()}`}>
                    <span>{change}</span>
                    <span className="ml-2 text-gray-500">from last month</span>
                </div>
            )}
        </div>
    );
}
