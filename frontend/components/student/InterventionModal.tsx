'use client';

import { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

interface InterventionModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId?: number | string;
    onSuccess: () => void;
}

export default function InterventionModal({ isOpen, onClose, studentId, onSuccess }: InterventionModalProps) {
    const [manualStudentId, setManualStudentId] = useState('');
    const [title, setTitle] = useState('');
    const [type, setType] = useState('Academic Support');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    console.log('InterventionModal Rendered. Open:', isOpen);
    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Fallback to direct 127.0.0.1 to avoid localhost resolution issues and proxy restart deps
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

            const finalStudentId = studentId || manualStudentId;

            if (!finalStudentId) {
                throw new Error('Student ID is missing');
            }

            console.log('Creating intervention for:', { studentId, title, type, status: 'Planned' });

            await axios.post(`${apiUrl}/interventions`, {
                student_id: finalStudentId,
                title,
                type,
                description,
                status: 'Planned',
                assigned_to: 'Counselor' // Default assignment
            });
            onSuccess();
            window.alert('Intervention Plan Created Successfully');
            onClose();
            // Reset form
            setTitle('');
            setDescription('');
            setType('Academic Support');
        } catch (err: any) {
            console.error('Error creating intervention:', err);
            // Enhanced error logging
            if (err.response) {
                console.error('Server Error Data:', err.response.data);
                console.error('Server Error Status:', err.response.status);
            } else if (err.request) {
                console.error('No response received:', err.request);
            } else {
                console.error('Request setup error:', err.message);
            }

            const errorMessage = err.response?.data?.error || err.message || 'Failed to create intervention plan';
            console.error('Final Error Message:', errorMessage);
            setError(errorMessage);
            // Also alert the user so they definitely know it failed
            window.alert(`Failed to create plan: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Create Intervention Plan</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
                            {error}
                        </div>
                    )}

                    {!studentId && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                            <input
                                type="text"
                                required
                                value={manualStudentId}
                                onChange={(e) => setManualStudentId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="STU..."
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Remedial Classes for Math"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Academic Support">Academic Support</option>
                            <option value="Counseling">Counseling</option>
                            <option value="Financial Aid">Financial Aid</option>
                            <option value="Mentorship">Mentorship</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Details about the intervention plan..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Plan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
