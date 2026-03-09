import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getCache, setCache } from '../lib/cache';

interface HealthMetric {
    id: string;
    heart_rate: number;
    systolic_bp: number;
    diastolic_bp: number;
    oxygen_saturation: number;
    body_temperature: number;
    created_at: string;
}

const CACHE_KEY = 'history_metrics';

export function HistoryPage() {
    const [metrics, setMetrics] = useState<HealthMetric[]>([]);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        // Try cache first
        const cached = getCache<HealthMetric[]>(CACHE_KEY);
        if (cached) {
            setMetrics(cached);
        }

        // Always fetch fresh data in background
        const { data } = await supabase
            .from('health_metrics')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (data) {
            setMetrics(data);
            setCache(CACHE_KEY, data);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-white">Health History</h2>
                </div>

                {metrics.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-400">No health records yet. Start tracking your vitals!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                                        Date & Time
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                                        Heart Rate
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                                        Blood Pressure
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                                        Oxygen (SpO₂)
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                                        Temperature
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {metrics.map((metric) => (
                                    <tr key={metric.id} className="hover:bg-slate-700/30 transition">
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {new Date(metric.created_at).toLocaleString('en-US', {
                                                month: '2-digit',
                                                day: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true,
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="font-semibold text-white">{metric.heart_rate}</span>
                                            <span className="text-gray-400 ml-1">BPM</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="font-semibold text-white">
                                                {metric.systolic_bp}/{metric.diastolic_bp}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="font-semibold text-white">{metric.oxygen_saturation}</span>
                                            <span className="text-gray-400 ml-1">%</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="font-semibold text-white">{metric.body_temperature}</span>
                                            <span className="text-gray-400 ml-1">°F</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
