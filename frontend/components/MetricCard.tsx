
interface MetricCardProps {
    label: string;
    value: string | number;
    subValue?: string;
    icon?: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
}

export default function MetricCard({ label, value, subValue, icon: Icon, trend }: MetricCardProps) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
            {Icon && (
                <div className="p-3 bg-blue-50 rounded-full mb-4 text-blue-600">
                    <Icon className="w-6 h-6" />
                </div>
            )}
            <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">{label}</div>
            {subValue && <div className="text-xs text-gray-400 mt-2">{subValue}</div>}
        </div>
    );
}
