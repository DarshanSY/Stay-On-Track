'use client';

import { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TranscriptPage() {
    const [file, setFile] = useState<File | null>(null);
    const [studentId, setStudentId] = useState('');
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !studentId) {
            setError("Please provide both Student ID and a file.");
            return;
        }

        setUploading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('student_id', studentId);

        try {
            const response = await axios.post('http://localhost:5000/api/transcript/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setResult(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    // Convert GPA dictionary to array for chart
    const chartData = result?.extracted_data?.gpa
        ? Object.entries(result.extracted_data.gpa).map(([sem, gpa]) => ({ sem, gpa }))
        : [];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Transcript Processing</h1>
                    <p className="text-gray-600 mt-2">Upload student transcripts (PDF/CSV) to extract academic performance data.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Upload Form */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4">Upload Transcript</h2>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                                <input
                                    type="text"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g. STU001"
                                />
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                                <input
                                    type="file"
                                    accept=".csv,.pdf"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-600">
                                        {file ? file.name : "Click to upload PDF or CSV"}
                                    </span>
                                </label>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-700 rounded-md flex items-center text-sm">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                            >
                                {uploading ? 'Processing...' : 'Upload & Process'}
                            </button>
                        </form>
                    </div>

                    {/* Results View */}
                    <div className="space-y-6">
                        {result ? (
                            <>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-green-200 bg-green-50/10">
                                    <div className="flex items-center text-green-700 mb-4">
                                        <Check className="w-5 h-5 mr-2" />
                                        <h2 className="text-xl font-semibold">Extraction Successful</h2>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-gray-600">Backlogs Detected</span>
                                            <span className="font-semibold">{result.extracted_data.backlogs}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-1">Courses Processed</h4>
                                            <div className="text-sm text-gray-700">{chartData.length} semesters found</div>
                                        </div>
                                    </div>
                                </div>

                                {chartData.length > 0 && (
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-[300px]">
                                        <h3 className="font-semibold mb-4">GPA Trend</h3>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="sem" />
                                                <YAxis domain={[0, 10]} />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="gpa" stroke="#2563eb" strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center h-full text-gray-400">
                                <FileText className="w-12 h-12 mb-2" />
                                <p>Upload a transcript to view analysis</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
