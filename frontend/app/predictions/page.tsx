'use client';

import { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PredictionsPage() {
    const [formData, setFormData] = useState({
        attendance: '',
        cgpa: '',
        semester: ''
    });
    const [modelType, setModelType] = useState('catboost');
    const [activeTab, setActiveTab] = useState('result');
    const [result, setResult] = useState<any>(null);
    const [shapValues, setShapValues] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);
        setShapValues(null);

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
            const payload = {
                model_type: modelType,
                Attendance: parseFloat(formData.attendance),
                CGPA: parseFloat(formData.cgpa),
                'Current Semester': parseInt(formData.semester),
                Age: 21, Gender: 'Female', // Default for demo
                Credits_Completed: (parseInt(formData.semester) - 1) * 20,
                Fee_Delay_Indicator: 0,
                Family_Background_Score: 7,
                Learning_Disability_Flag: 0,
                LMS_Login_Count: 45,
                Assignment_Submission_Rate: 85
            };

            // Get Prediction
            const response = await axios.post(`${apiBase}/api/predict`, payload);
            setResult(response.data);

            // Get Explanation (if successful)
            try {
                const expRes = await axios.post(`${apiBase}/api/explain/shap`, payload);
                setShapValues(expRes.data.shap_values);
            } catch (expErr) {
                console.warn("SHAP failed", expErr);
            }

        } catch (err: any) {
            console.error('Prediction error:', err);
            setError(err.response?.data?.error || err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Advanced Dropout Prediction</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Form */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-100 h-fit">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Student Metrics</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Model Engine</label>
                            <select
                                data-testid="model-type"
                                value={modelType}
                                onChange={(e) => setModelType(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="catboost">CatBoost (Gradient Boosting)</option>
                                <option value="neural">Neural Network (TensorFlow)</option>
                                <option value="logistic">Logistic Regression</option>
                                <option value="ensemble">Ensemble (Weighted Avg)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Attendance (%)</label>
                            <input
                                data-testid="attendance"
                                type="number"
                                value={formData.attendance}
                                onChange={(e) => setFormData({ ...formData, attendance: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                required min="0" max="100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">CGPA (0-10)</label>
                            <input
                                data-testid="cgpa"
                                type="number"
                                value={formData.cgpa}
                                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                required step="0.1" min="0" max="10"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Semester</label>
                            <input
                                data-testid="semester"
                                type="number"
                                value={formData.semester}
                                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                required min="1" max="8"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all
                                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}`}
                        >
                            {loading ? 'Processing...' : 'Run Prediction'}
                        </button>
                    </form>
                </div>

                {/* Results Area */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100 min-h-[500px]">
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            className={`px-6 py-3 font-medium text-sm transition-colors relative
                                ${activeTab === 'result' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('result')}
                        >
                            Prediction Result
                            {activeTab === 'result' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
                        </button>
                        <button
                            className={`px-6 py-3 font-medium text-sm transition-colors relative
                                ${activeTab === 'explain' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('explain')}
                        >
                            Explainability (XAI)
                            {activeTab === 'explain' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
                        </button>
                    </div>

                    {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">{error}</div>}

                    {!result && !loading && !error && (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <span className="text-lg">Enter student metrics to see prediction</span>
                        </div>
                    )}

                    {result && activeTab === 'result' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="grid grid-cols-2 gap-4" data-testid="prediction-result">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="text-sm text-gray-500 mb-1">Risk Assessment</div>
                                    <div className={`text-2xl font-bold ${result.risk_label === 'High' ? 'text-red-500' :
                                        result.risk_label === 'Medium' ? 'text-yellow-500' : 'text-green-500'
                                        }`}>
                                        {result.risk_label} Level
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="text-sm text-gray-500 mb-1">Dropout Probability</div>
                                    <div className="text-2xl font-bold text-gray-800">
                                        {(result.probability * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <h3 className="font-semibold text-blue-800 mb-2">Model Used</h3>
                                <p className="text-sm text-blue-600">
                                    Prediction generated using <span className="font-bold uppercase">{result.model_used || modelType}</span> architecture.
                                    {result.model_used && result.model_used !== modelType && (
                                        <span className="block mt-1 text-xs text-amber-600 font-semibold">
                                            (Note: Requested '{modelType}' but system used '{result.model_used}')
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'explain' && (
                        <div className="animate-in fade-in duration-500 h-full">
                            {shapValues ? (
                                <div className="h-[400px]">
                                    <h3 className="text-sm font-medium text-gray-500 mb-4">SHAP Feature Importance (Impact on logic)</h3>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={shapValues.slice(0, 10)}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis dataKey="feature" type="category" width={150} />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#3b82f6" name="SHAP Value" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 mt-10">
                                    No explanation available. Generate a prediction first.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
