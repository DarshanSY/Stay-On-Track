'use client';

import Link from 'next/link';
import { Search, Filter, Trash2, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Student {
    id: number;
    student_id: string;
    name: string;
    risk_score: number;
    risk_category: string;
    current_semester: number;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // Dynamically determine API URL based on current hostname
                const getApiUrl = () => {
                    if (typeof window !== 'undefined') {
                        const hostname = window.location.hostname;
                        return `http://${hostname}:5000/api`;
                    }
                    return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';
                };
                const apiUrl = getApiUrl();
                const response = await axios.get(`${apiUrl}/students`);
                setStudents(response.data);
            } catch (error) {
                console.error('Error fetching students:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];

        // Validate file before upload
        console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File is too large. Maximum size is 10MB.');
            e.target.value = '';
            return;
        }

        // Check file extension
        if (!file.name.toLowerCase().endsWith('.csv')) {
            alert('Invalid file type. Please select a CSV file.');
            e.target.value = '';
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        console.log('Starting upload...');

        try {
            const getApiUrl = () => {
                if (typeof window !== 'undefined') {
                    const hostname = window.location.hostname;
                    return `http://${hostname}:5000/api`;
                }
                return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';
            };
            const apiUrl = getApiUrl();
            console.log('Uploading to:', `${apiUrl}/students/upload`);

            const response = await axios.post(`${apiUrl}/students/upload`, formData);

            console.log('Upload response:', response.data);

            // Refresh students list
            const studentsResponse = await axios.get(`${apiUrl}/students`);
            setStudents(studentsResponse.data);

            // Show success message with details
            const { message, processed, total_rows, warnings, total_errors } = response.data;
            let alertMessage = message || 'File uploaded successfully!';

            if (warnings && warnings.length > 0) {
                alertMessage += `\n\nWarnings:\n${warnings.join('\n')}`;
                if (total_errors > warnings.length) {
                    alertMessage += `\n... and ${total_errors - warnings.length} more error(s)`;
                }
            }

            alert(alertMessage);

        } catch (error: any) {
            console.error('Error uploading file:', error);
            console.error('Error response:', error.response?.data);

            // Show specific error message from backend
            const errorMessage = error.response?.data?.error || `Failed to upload file: ${error.message}`;
            alert(`Upload failed:\n${errorMessage}`);

        } finally {
            setUploading(false);
            // Reset input value to allow uploading same file again
            e.target.value = '';
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const getApiUrl = () => {
                if (typeof window !== 'undefined') {
                    const hostname = window.location.hostname;
                    return `http://${hostname}:5000/api`;
                }
                return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';
            };
            const apiUrl = getApiUrl();
            await axios.delete(`${apiUrl}/students/${id}`);
            setStudents(students.filter(student => student.id !== id));
        } catch (error) {
            console.error('Error deleting student:', error);
            alert('Failed to delete student');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                <div className="flex gap-2">
                    <label className={`px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {uploading ? 'Uploading...' : 'Upload CSV'}
                        <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                    </label>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-100">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading students...</div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Student ID</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Semester</th>
                                    <th className="px-6 py-4">Risk Band</th>
                                    <th className="px-6 py-4">Risk Score</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{student.student_id}</td>
                                        <td className="px-6 py-4 text-gray-600">{student.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{student.current_semester}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                    ${student.risk_category === 'Critical' ? 'bg-red-100 text-red-700' :
                                                    student.risk_category === 'High' ? 'bg-orange-100 text-orange-700' :
                                                        student.risk_category === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-green-100 text-green-700'}`}>
                                                {student.risk_category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{student.risk_score}%</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/dashboard/students/${student.student_id.replace('STU', '')}`} className="p-1 text-gray-400 hover:text-blue-600">
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <button type="button" onClick={() => handleDelete(student.id)}
                                                    className="p-1 text-gray-400 hover:text-red-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination mock */}
                <div className="p-4 border-t border-gray-100 flex justify-end">
                    <div className="text-gray-500 text-xs">Showing 1 to 7 of 7 entries</div>
                </div>
            </div>
        </div>
    );
}
