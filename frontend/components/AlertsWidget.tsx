'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function AlertsWidget() {
    const [alerts, setAlerts] = useState([]);
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const res = await axios.get(`${API_BASE}/alerts`);
                setAlerts(res.data.slice(0, 5)); // Show top 5
            } catch (error) {
                console.error(error);
            }
        };
        fetchAlerts();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'Risk': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'System': return <Info className="w-4 h-4 text-blue-500" />;
            default: return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
            <h3 className="tex-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-gray-500" /> Recent Alerts
            </h3>
            <div className="space-y-4">
                {alerts.length === 0 ? (
                    <div className="text-sm text-gray-400">No active alerts.</div>
                ) : (
                    alerts.map((a, i) => (
                        <div key={i} className="flex gap-3 items-start pb-3 border-b border-gray-100 last:border-0">
                            <div className="mt-1 flex-shrink-0">{getIcon(a.type)}</div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">{a.message}</p>
                                <p className="text-xs text-gray-400">{new Date(a.timestamp).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
