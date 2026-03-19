'use client';

import { AlertTriangle, CheckCircle } from 'lucide-react';

interface RiskScoreCardProps {
    score: number;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    lastUpdated: string;
}

export default function RiskScoreCard({ score, riskLevel, lastUpdated }: RiskScoreCardProps) {
    const getColor = (level: string) => {
        switch (level) {
            case 'Low': return 'text-green-600';
            case 'Medium': return 'text-yellow-600';
            case 'High': return 'text-orange-600';
            case 'Critical': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getBgColor = (level: string) => {
        switch (level) {
            case 'Low': return 'bg-green-100';
            case 'Medium': return 'bg-yellow-100';
            case 'High': return 'bg-orange-100';
            case 'Critical': return 'bg-red-100';
            default: return 'bg-gray-100';
        }
    };

    const getBadgeColor = (level: string) => {
        switch (level) {
            case 'Low': return 'bg-red-500 text-white'; // Based on design showing Red for 9.2% Low? Wait, usually Low is Green. 
                // In the image: "9.2% Low". The "Low" badge is RED. 
                // "Dropout Risk Score" text has a warning icon nicely. 
                // Actually, 9.2% Low being red is weird. 
                // But looking at the image: "9.2%" is Red and "Low" badge is Red. 
                // Ah, maybe because it's "Dropout Risk"? So *any* risk is bad?
                // Or maybe 9.2% is considered Low but the color coding is just red for the card?
                // Let's look closely at the image.
                // "Dropout Risk Score" title.
                // "9.2%" in Red. "Low" badge in Red.
                // There is a red bar on the left of the card.
                // This suggests the "Risk Score" card is *always* red themed or maybe relies on the score?
                // "9.2%" is arguably low risk if the scale goes to 100%.
                // But usually Low Risk = Green.
                // Maybe the user wants it to look exactly like the image regardless of logic?
                // The image shows "9.2% Low" in Red. 
                // However, usually UI logic dictates colors.
                // I'll stick to the image colors for now but keep logic flexible.
                // For now I'll hardcode red style to match the "Risk Score" theme or maybe it's just the style of that specific card?
                // Let's implement generic logic but default to the Red style seen in the image for this specific student example.

                // Wait, if 9.2% is Low, why is it red?
                // Maybe risk *of dropout*? 
                // If I have 9% chance of dropout, that's not great? Or is it? 
                // Usually <10% is low.
                // I will strictly follow the image for the visual structure.

                return 'bg-red-500 text-white';
        }
        return 'bg-gray-100 text-gray-800';
    };

    // The image has a specific left border red accent.

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
            {/* Red accent line on the left */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-xl"></div>

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Dropout Risk Score</h3>
                    <p className="text-sm text-gray-500">AI-predicted probability of dropout</p>
                </div>
                <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>

            <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl font-bold text-red-500">{score}%</span>
                <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
                    {riskLevel}
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                <div
                    className="bg-gray-800 h-2 rounded-full"
                    style={{ width: `${score}%` }}
                ></div>
            </div>

            <div className="text-xs text-gray-400">
                Last updated: {lastUpdated}
            </div>
        </div>
    );
}
