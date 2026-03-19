'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ShapValue {
    feature: string;
    value: number; // positive increases risk (red), negative decreases risk (green)
}

interface ShapValuesChartProps {
    data: ShapValue[];
}

export default function ShapValuesChart({ data }: ShapValuesChartProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Why this score?</h3>
                <p className="text-sm text-gray-500">Top factors contributing to the risk score (SHAP values)</p>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={data}
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        {/* 
                            For SHAP values, we want positive/negative differentiation.
                            Usually SHAP is centered on 0.
                            The image shows bars going left (Green) and right (Red).
                            Left = Reduces Risk? Right = Increases Risk?
                            The image labels: scale seems to be implicit.
                            "Attendance %" is huge green (left).
                            "Backlogs" is huge red (right).
                            "CGPA" is green.
                            "LMS Login" is green.
                            "Failed Courses" is red.
                            
                            So Green = Good (Negative SHAP for risk?), Red = Bad (Positive SHAP for risk?).
                         */}
                        <XAxis type="number" hide />
                        <YAxis
                            type="category"
                            dataKey="feature"
                            width={100}
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip />
                        <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#EF4444' : '#22C55E'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
