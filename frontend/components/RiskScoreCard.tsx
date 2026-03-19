
interface RiskScoreCardProps {
    score: number; // 0-100
    lastUpdated: string;
}

export default function RiskScoreCard({ score, lastUpdated }: RiskScoreCardProps) {
    // Determine risk level and color
    let riskLevel = 'Low';
    let colorClass = 'text-green-600';
    let bgClass = 'bg-green-100';

    if (score > 30) {
        riskLevel = 'Medium';
        colorClass = 'text-yellow-600';
        bgClass = 'bg-yellow-100';
    }
    if (score > 70) {
        riskLevel = 'High';
        colorClass = 'text-red-600';
        bgClass = 'bg-red-100';
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Dropout Risk Score</h3>
                    <p className="text-sm text-gray-500">AI-predicted probability of dropout</p>
                </div>
                <div className="text-red-500">
                    {/* Warning Icon can go here if needed */}
                </div>
            </div>

            <div className="flex items-end gap-3 mb-6">
                <span className={`text-5xl font-bold ${colorClass}`}>{score}%</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${bgClass} ${colorClass}`}>
                    {riskLevel}
                </span>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                <div
                    className={`h-2.5 rounded-full ${score > 70 ? 'bg-red-500' : score > 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${score}%` }}
                ></div>
            </div>

            <p className="text-xs text-gray-400 mt-2">Last updated: {lastUpdated}</p>
        </div>
    );
}
