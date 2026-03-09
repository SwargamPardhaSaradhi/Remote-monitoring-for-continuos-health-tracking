import { useState } from 'react';
import { Heart, Droplet, Thermometer, TrendingUp, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { invalidateCache } from '../lib/cache';

interface RecordHealthPageProps {
    onDataSubmitted: () => void;
}

export function RecordHealthPage({ onDataSubmitted }: RecordHealthPageProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    const [formData, setFormData] = useState({
        heartRate: '',
        systolic: '',
        diastolic: '',
        oxygenSaturation: '',
        bodyTemperature: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: metricData, error: metricError } = await supabase
                .from('health_metrics')
                .insert([
                    {
                        user_id: user?.id,
                        heart_rate: parseInt(formData.heartRate),
                        systolic_bp: parseInt(formData.systolic),
                        diastolic_bp: parseInt(formData.diastolic),
                        oxygen_saturation: parseInt(formData.oxygenSaturation),
                        body_temperature: parseFloat(formData.bodyTemperature),
                    },
                ])
                .select()
                .single();

            if (metricError) throw metricError;

            setAnalyzing(true);

            const { data: previousMetrics } = await supabase
                .from('health_metrics')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            // Use client-side AI analysis
            const { analyzeHealthData } = await import('../lib/aiAnalysis');
            const analysis = await analyzeHealthData(
                metricData,
                previousMetrics || []
            );

            await supabase.from('ai_analyses').insert([
                {
                    user_id: user?.id,
                    health_metric_id: metricData.id,
                    disease_prediction: analysis.diseasePrediction,
                    diet_recommendations: analysis.dietRecommendations,
                },
            ]);

            // Invalidate all related caches so pages will fetch fresh data
            invalidateCache(
                'dashboard_metrics',
                'history_metrics',
                'ai_latest',
                'profile_stats'
            );

            setFormData({
                heartRate: '',
                systolic: '',
                diastolic: '',
                oxygenSaturation: '',
                bodyTemperature: '',
            });

            onDataSubmitted();
            alert('Health data submitted and analyzed successfully!');
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to submit health data. Please try again.');
        } finally {
            setLoading(false);
            setAnalyzing(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Record Health Data</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <div className="flex items-center space-x-2">
                                <Heart className="w-4 h-4 text-red-500" />
                                <span>Heart Rate (BPM)</span>
                            </div>
                        </label>
                        <input
                            type="number"
                            value={formData.heartRate}
                            onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                            required
                            min="40"
                            max="200"
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="72"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Systolic
                            </label>
                            <input
                                type="number"
                                value={formData.systolic}
                                onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
                                required
                                min="70"
                                max="200"
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="120"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Diastolic
                            </label>
                            <input
                                type="number"
                                value={formData.diastolic}
                                onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
                                required
                                min="40"
                                max="130"
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="80"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <div className="flex items-center space-x-2">
                                <Droplet className="w-4 h-4 text-blue-500" />
                                <span>Oxygen Saturation (%)</span>
                            </div>
                        </label>
                        <input
                            type="number"
                            value={formData.oxygenSaturation}
                            onChange={(e) =>
                                setFormData({ ...formData, oxygenSaturation: e.target.value })
                            }
                            required
                            min="70"
                            max="100"
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="98"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <div className="flex items-center space-x-2">
                                <Thermometer className="w-4 h-4 text-orange-500" />
                                <span>Body Temperature (°F)</span>
                            </div>
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.bodyTemperature}
                            onChange={(e) =>
                                setFormData({ ...formData, bodyTemperature: e.target.value })
                            }
                            required
                            min="95"
                            max="105"
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="98.6"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || analyzing}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
                    >
                        {analyzing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Analyzing with AI...</span>
                            </>
                        ) : loading ? (
                            <span>Submitting...</span>
                        ) : (
                            <>
                                <TrendingUp className="w-5 h-5" />
                                <span>Submit & Analyze</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
