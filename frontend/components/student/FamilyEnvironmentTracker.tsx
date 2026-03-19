'use client';

import { useState } from 'react';
import axios from 'axios';
import { Home, Save, Check } from 'lucide-react';

interface FamilyEnvironmentTrackerProps {
    studentId: string; // The ID to use for API calls (likely database ID or student_id)
    initialScore?: number;
    initialNotes?: string;
    backendId: number; // For the database ID if needed, but route uses ID from path? 
    // Wait, route is /students/<int:id>. So we need the database ID.
    // The student object has 'id'.
}

export default function FamilyEnvironmentTracker({ studentId, initialScore = 5, initialNotes = '', backendId }: FamilyEnvironmentTrackerProps) {
    const [score, setScore] = useState(initialScore);
    const [notes, setNotes] = useState(initialNotes || '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            await axios.put(`http://localhost:5000/api/students/${backendId}`, {
                environment_score: score,
                family_environment_notes: notes
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Failed to save environment details", error);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4 text-purple-700">
                <Home className="w-5 h-5" />
                <h3 className="font-semibold text-lg">Family & Home Environment</h3>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Environment Support Score (1-10)
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={score}
                            onChange={(e) => setScore(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className={`text-lg font-bold min-w-[2rem] text-center ${score < 4 ? 'text-red-500' : score < 7 ? 'text-yellow-500' : 'text-green-500'
                            }`}>
                            {score}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        1 = High Conflict/Unstable, 10 = Highly Supportive
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Counselor Notes
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
                        placeholder="Document observations about family dynamics, financial stability, or study environment..."
                    />
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center justify-center w-full py-2 px-4 rounded-lg font-medium transition-colors ${saved
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                >
                    {saving ? (
                        <span className="flex items-center gap-2"><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Saving...</span>
                    ) : saved ? (
                        <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Saved Successfully</span>
                    ) : (
                        <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</span>
                    )}
                </button>
            </div>
        </div>
    );
}
