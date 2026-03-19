'use client';

import RiskScoreCard from '@/components/student/RiskScoreCard';
import AcademicMetrics from '@/components/student/AcademicMetrics';
import ShapValuesChart from '@/components/student/ShapValuesChart';
import AcademicTrendChart from '@/components/student/AcademicTrendChart';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';

import InterventionModal from '@/components/student/InterventionModal';
import FamilyEnvironmentTracker from '@/components/student/FamilyEnvironmentTracker';
import FeesOverview from '@/components/student/FeesOverview';

export default function StudentDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    // We need the student_id string for the modal, dependent on how we get the student data.
    // Assuming student object has student_id.
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                // Determine API URL based on environment or default to localhost
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';
                const response = await axios.get(`${apiUrl}/students/${id}`);
                setStudent(response.data);
            } catch (error) {
                console.error('Error fetching student details:', error);
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchStudent();
        }
    }, [id]);

    const handleDownloadReport = () => {
        if (!student) return;

        const reportContent = `
STUDENT ACADEMIC REPORT
-----------------------
Name: ${student.name}
Student ID: ${student.student_id}
Current Semester: ${student.current_semester}
Risk Level: ${student.risk_category || 'N/A'}
Risk Score: ${student.risk_score || 'N/A'}

ACADEMIC METRICS
----------------
CGPA: ${student.cgpa}
Attendance: ${student.attendance_percentage}%
LMS Engagement Score: ${student.lms_activity_score || 'N/A'}

NOTES
-----
Generated on: ${new Date().toLocaleDateString()}
        `.trim();

        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Student_Report_${student.student_id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div className="p-8 text-center">Loading student details...</div>;
    }

    if (!student) {
        return <div className="p-8 text-center text-red-500">Student not found</div>;
    }

    // Mock complex data that isn't in backend yet
    const shapValues = [
        { feature: 'Attendance %', value: -0.4 },
        { feature: 'Backlogs', value: 0.5 },
        { feature: 'CGPA', value: -0.3 },
        { feature: 'LMS Login (30d)', value: -0.25 },
        { feature: 'Failed Courses', value: 0.1 },
    ];

    const academicTrend = [
        { semester: 'Sem 1', sgpa: student.cgpa }, // Placeholder
        { semester: 'Sem 2', sgpa: student.cgpa },
        { semester: 'Sem 3', sgpa: student.cgpa },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/students" className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
                        <p className="text-gray-500 mt-1">
                            {student.student_id} • {student.current_semester ? `Sem ${student.current_semester}` : 'N/A'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleDownloadReport}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                        Download Report
                    </button>
                    <button
                        onClick={() => {
                            console.log('Opening Modal...');
                            // window.alert('Opening Modal...'); // Uncomment if console is not visible
                            setIsInterventionModalOpen(true);
                        }}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        Create Intervention Plan
                    </button>
                </div>
            </div>

            {/* Top Row: Risk Score & Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RiskScoreCard
                    score={student.risk_score}
                    riskLevel={student.risk_category || 'Low'}
                    lastUpdated={new Date().toLocaleDateString()}
                />
                <AcademicMetrics
                    cgpa={student.cgpa}
                    attendance={student.attendance_percentage}
                    lmsLogins={student.lms_activity_score || 0}
                />
            </div>

            {/* Bottom Row: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ShapValuesChart data={shapValues} />
                <AcademicTrendChart data={academicTrend} />
            </div>

            {/* Family & Environment Tracking */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FamilyEnvironmentTracker
                    studentId={student.student_id}
                    initialScore={student.environment_score}
                    initialNotes={student.family_environment_notes}
                    backendId={student.id}
                />
                <FeesOverview studentId={student.student_id} />
            </div>

            {/* Intervention Modal */}
            <InterventionModal
                isOpen={isInterventionModalOpen}
                onClose={() => setIsInterventionModalOpen(false)}
                studentId={student.student_id}
                onSuccess={() => {
                    // Optional: refresh data or show toast
                    console.log('Intervention created');
                }}
            />
        </div>
    );
}
