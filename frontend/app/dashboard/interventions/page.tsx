'use client';

import { Plus, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import InterventionModal from '@/components/student/InterventionModal';

interface Intervention {
    id: number;
    studentName: string; // Ideally this would come from a join, but let's assume flat data for now or fetch
    student_id: string;
    type: string;
    title: string;
    date: string;
    assignedTo: string;
    status: 'Planned' | 'In Progress' | 'Resolved';
}

function InterventionCard({ data, onDelete }: { data: any, onDelete: (id: number) => void }) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full 
                    ${data.type === 'Academic' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {data.type}
                </span>
                <button onClick={() => onDelete(data.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
            {/* Display ID if name not available? Or fetch name? For simplicity showing ID */}
            <h4 className="font-semibold text-gray-900 mb-1">{data.student_id}</h4>
            <div className="text-sm text-blue-600 font-medium mb-4">{data.title}</div>

            <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3">
                <div className="flex items-center gap-1">
                    📅 {data.date ? new Date(data.date).toLocaleDateString() : 'N/A'}
                </div>
                <div className="flex items-center gap-1">
                    👤 {data.assigned_to || 'Unassigned'}
                </div>
            </div>
        </div>
    );
}

export default function InterventionsPage() {
    const [interventions, setInterventions] = useState<{ planned: any[], inProgress: any[], resolved: any[] }>({
        planned: [],
        inProgress: [],
        resolved: []
    });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchInterventions = async () => {
        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';
            const response = await axios.get(`${apiUrl}/interventions`);
            setInterventions(response.data);
        } catch (error) {
            console.error('Error fetching interventions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';
            await axios.delete(`${apiUrl}/interventions/${id}`);
            fetchInterventions();
        } catch (error) {
            console.error('Failed to delete intervention:', error);
            alert('Failed to delete intervention');
        }
    };

    useEffect(() => {
        fetchInterventions();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Interventions</h1>
                    <p className="text-gray-500">Manage counseling and support plans</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchInterventions} className="p-2 text-gray-500 hover:text-blue-600" title="Refresh">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] text-white rounded-lg font-medium hover:bg-gray-800">
                        <Plus className="w-5 h-5" />
                        New Plan
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                {/* Planned Column */}
                <div className="bg-gray-50 rounded-xl p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="font-semibold text-gray-700">Planned</h3>
                        <span className="bg-white px-2 py-1 rounded-full text-xs font-bold text-gray-500 shadow-sm">{interventions.planned.length}</span>
                    </div>
                    <div className="space-y-3 overflow-y-auto flex-1">
                        {interventions.planned.map(item => (
                            <InterventionCard key={item.id} data={item} onDelete={handleDelete} />
                        ))}
                        {interventions.planned.length === 0 && !loading && (
                            <div className="text-center text-gray-400 text-sm py-10">No items</div>
                        )}
                    </div>
                </div>

                {/* In Progress Column */}
                <div className="bg-gray-50 rounded-xl p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="font-semibold text-gray-700">In Progress</h3>
                        <span className="bg-white px-2 py-1 rounded-full text-xs font-bold text-gray-500 shadow-sm">{interventions.inProgress.length}</span>
                    </div>
                    <div className="space-y-3 overflow-y-auto flex-1">
                        {interventions.inProgress.map(item => (
                            <InterventionCard key={item.id} data={item} onDelete={handleDelete} />
                        ))}
                        {interventions.inProgress.length === 0 && !loading && (
                            <div className="text-center text-gray-400 text-sm py-10">No items in progress</div>
                        )}
                    </div>
                </div>

                {/* Resolved Column */}
                <div className="bg-gray-50 rounded-xl p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="font-semibold text-gray-700">Resolved</h3>
                        <span className="bg-white px-2 py-1 rounded-full text-xs font-bold text-gray-500 shadow-sm">{interventions.resolved.length}</span>
                    </div>
                    <div className="space-y-3 overflow-y-auto flex-1">
                        {interventions.resolved.map(item => (
                            <InterventionCard key={item.id} data={item} onDelete={handleDelete} />
                        ))}
                        {interventions.resolved.length === 0 && !loading && (
                            <div className="text-center text-gray-400 text-sm py-10">No resolved items</div>
                        )}
                    </div>
                </div>
            </div>

            <InterventionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    fetchInterventions();
                    setIsModalOpen(false);
                }}
            />
        </div >
    );
}
