import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getCache, setCache } from '../lib/cache';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { Activity, Heart, Droplet, Thermometer } from 'lucide-react';

interface HealthMetric {
    id: string;
    heart_rate: number;
    systolic_bp: number;
    diastolic_bp: number;
    oxygen_saturation: number;
    body_temperature: number;
    created_at: string;
}

const CACHE_KEY = 'dashboard_metrics';

export function DashboardPage() {
    const [metrics, setMetrics] = useState<HealthMetric[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        // Try cache first
        const cached = getCache<HealthMetric[]>(CACHE_KEY);
        if (cached) {
            setMetrics(cached);
            setLoading(false);
        }

        // Always fetch fresh data in background
        const { data } = await supabase
            .from('health_metrics')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(20);

        if (data) {
            setMetrics(data);
            setCache(CACHE_KEY, data);
        }
        setLoading(false);
    };

    // Transform data for charts
    const chartData = metrics.map((metric) => ({
        date: new Date(metric.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        }),
        time: new Date(metric.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        }),
        heartRate: metric.heart_rate,
        systolic: metric.systolic_bp,
        diastolic: metric.diastolic_bp,
        oxygen: metric.oxygen_saturation,
        temperature: metric.body_temperature,
    }));

    // Calculate latest stats
    const latestMetric = metrics[metrics.length - 1];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-400">Loading dashboard...</div>
            </div>
        );
    }

    if (metrics.length === 0) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
                    <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Data Yet</h3>
                    <p className="text-gray-400">
                        Start recording your health metrics to see your dashboard and trends.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-700/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-red-300">Heart Rate</h3>
                        <Heart className="w-5 h-5 text-red-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{latestMetric?.heart_rate}</p>
                    <p className="text-xs text-red-200 mt-1">BPM</p>
                </div>

                <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-700/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-blue-300">Blood Pressure</h3>
                        <Activity className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">
                        {latestMetric?.systolic_bp}/{latestMetric?.diastolic_bp}
                    </p>
                    <p className="text-xs text-blue-200 mt-1">mmHg</p>
                </div>

                <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 border border-cyan-700/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-cyan-300">Oxygen (SpO₂)</h3>
                        <Droplet className="w-5 h-5 text-cyan-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{latestMetric?.oxygen_saturation}</p>
                    <p className="text-xs text-cyan-200 mt-1">%</p>
                </div>

                <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-700/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-orange-300">Temperature</h3>
                        <Thermometer className="w-5 h-5 text-orange-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{latestMetric?.body_temperature}</p>
                    <p className="text-xs text-orange-200 mt-1">°F</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Heart Rate Chart */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-400" />
                        Heart Rate Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorHeartRate" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #475569',
                                    borderRadius: '8px',
                                    color: '#fff',
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="heartRate"
                                stroke="#ef4444"
                                fillOpacity={1}
                                fill="url(#colorHeartRate)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Blood Pressure Chart */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-400" />
                        Blood Pressure Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #475569',
                                    borderRadius: '8px',
                                    color: '#fff',
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="systolic"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="diastolic"
                                stroke="#60a5fa"
                                strokeWidth={2}
                                dot={{ fill: '#60a5fa' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Oxygen Saturation Chart */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Droplet className="w-5 h-5 text-cyan-400" />
                        Oxygen Saturation Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorOxygen" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} domain={[90, 100]} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #475569',
                                    borderRadius: '8px',
                                    color: '#fff',
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="oxygen"
                                stroke="#06b6d4"
                                fillOpacity={1}
                                fill="url(#colorOxygen)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Temperature Chart */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Thermometer className="w-5 h-5 text-orange-400" />
                        Temperature Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                            <YAxis
                                stroke="#94a3b8"
                                style={{ fontSize: '12px' }}
                                domain={[97, 100]}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #475569',
                                    borderRadius: '8px',
                                    color: '#fff',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="temperature"
                                stroke="#f97316"
                                strokeWidth={2}
                                dot={{ fill: '#f97316' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
