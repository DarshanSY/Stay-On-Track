'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';

export default function AlertsPage() {
    const [alerts, setAlerts] = useState([]);
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const res = await axios.get(`${API_BASE}/alerts`);
                setAlerts(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchAlerts();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'Risk': return <AlertTriangle className="w-5 h-5 text-red-500" />;
            case 'System': return <Info className="w-5 h-5 text-blue-500" />;
            default: return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="p-8 bg-gray-900 min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-6">System Alerts</h1>

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                {alerts.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No active alerts.</div>
                ) : (
                    <div className="divide-y divide-gray-700">
                        {alerts.map((alert) => (
                            <div key={alert.id} className="p-4 flex items-center gap-4 hover:bg-gray-700/50 transition-colors">
                                <div className={`p-2 rounded-full bg-gray-900 border border-gray-700`}>
                                    {getIcon(alert.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-white">{alert.message}</div>
                                    <div className="text-xs text-gray-400">{new Date(alert.timestamp).toLocaleString()}</div>
                                </div>
                                {!alert.is_read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
