'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface FeeRecord {
    id: number;
    semester: number;
    total_fees: number;
    fees_paid: number;
    pending_amount: number;
    status: string;
    payment_date: string | null;
}

interface FeesOverviewProps {
    studentId: string;
}

export default function FeesOverview({ studentId }: FeesOverviewProps) {
    const [feesData, setFeesData] = useState<{ total_pending: number; history: FeeRecord[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFees = async () => {
            try {
                // Assuming the backend is running on localhost:5000, consistent with other components
                const response = await axios.get(`http://localhost:5000/api/fees/${studentId}`);
                setFeesData(response.data);
            } catch (err) {
                console.error("Failed to fetch fees data", err);
                setError("Could not load fee information.");
            } finally {
                setLoading(false);
            }
        };

        if (studentId) {
            fetchFees();
        }
    }, [studentId]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col items-center justify-center text-red-500 gap-2">
                <AlertCircle className="w-6 h-6" />
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    if (!feesData) return null;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-6 text-purple-700">
                <DollarSign className="w-5 h-5" />
                <h3 className="font-semibold text-lg">Fees Overview</h3>
            </div>

            <div className="mb-6 bg-purple-50 p-4 rounded-lg border border-purple-100 flex justify-between items-center">
                <div>
                    <p className="text-sm text-purple-800 font-medium">Total Pending Dues</p>
                    <p className="text-xs text-purple-600 mt-1">Across all semesters</p>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                    {formatCurrency(feesData.total_pending)}
                </div>
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                {feesData.history.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No fee records found.</p>
                ) : (
                    feesData.history.map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                                <p className="font-medium text-gray-900">Semester {record.semester}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Total: {formatCurrency(record.total_fees)}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className={`flex items-center justify-end gap-1.5 text-sm font-semibold mb-0.5
                                    ${record.status === 'PAID' ? 'text-green-600' :
                                        record.status === 'PARTIAL' ? 'text-yellow-600' : 'text-red-500'}`}>
                                    {record.status === 'PAID' && <CheckCircle className="w-3.5 h-3.5" />}
                                    {record.status === 'PARTIAL' && <Clock className="w-3.5 h-3.5" />}
                                    {record.status === 'PENDING' && <AlertCircle className="w-3.5 h-3.5" />}
                                    {record.status}
                                </div>
                                {record.pending_amount > 0 && (
                                    <p className="text-xs text-red-500 font-medium">
                                        Due: {formatCurrency(record.pending_amount)}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
