import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatAIText } from '../utils/formatAIText';
import { getCache, setCache } from '../lib/cache';

interface AIAnalysis {
    id: string;
    disease_prediction: string;
    diet_recommendations: string;
    created_at: string;
}

const CACHE_KEY = 'ai_latest';

export function AIAnalysisPage() {
    const [latestAnalysis, setLatestAnalysis] = useState<AIAnalysis | null>(null);

    useEffect(() => {
        fetchLatestAnalysis();
    }, []);

    const fetchLatestAnalysis = async () => {
        // Try cache first
        const cached = getCache<AIAnalysis>(CACHE_KEY);
        if (cached) {
            setLatestAnalysis(cached);
        }

        // Always fetch fresh data in background
        const { data } = await supabase
            .from('ai_analyses')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (data) {
            setLatestAnalysis(data);
            setCache(CACHE_KEY, data);
        }
    };

    if (!latestAnalysis) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
                    <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Analysis Yet</h3>
                    <p className="text-gray-400">
                        Submit your health data to get AI-powered analysis and recommendations.
                    </p>
                </div>
            </div>
        );
    }

    // Format the AI text to remove stars and clean it up
    const formattedPrediction = formatAIText(latestAnalysis.disease_prediction);
    const formattedRecommendations = formatAIText(latestAnalysis.diet_recommendations);

    // Split into paragraphs for better display
    const predictionParagraphs = formattedPrediction.split('\n\n').filter(p => p.trim());
    const recommendationParagraphs = formattedRecommendations.split('\n\n').filter(p => p.trim());

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <TrendingUp className="w-7 h-7 text-blue-500" />
                        <h2 className="text-2xl font-bold text-white">Latest AI Health Analysis</h2>
                    </div>
                    <span className="text-sm text-gray-400">
                        {new Date(latestAnalysis.created_at).toLocaleString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        })}
                    </span>
                </div>

                {/* Disease Risk Prediction */}
                <div className="mb-6">
                    <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-blue-300 mb-4">Disease Risk Prediction</h3>
                        <div className="space-y-3">
                            {predictionParagraphs.map((paragraph, index) => (
                                <p key={index} className="text-blue-100 leading-relaxed">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Diet Recommendations */}
                <div>
                    <div className="bg-teal-900/30 border border-teal-700/50 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-teal-300 mb-4">
                            Diet Recommendations
                        </h3>
                        <div className="space-y-3">
                            {recommendationParagraphs.map((paragraph, index) => {
                                // Check if this looks like a section heading
                                const isHeading = paragraph.length < 50 &&
                                    (paragraph.includes(':') || paragraph.endsWith('Of') ||
                                        paragraph.match(/^[A-Z][^.]+$/));

                                if (isHeading) {
                                    return (
                                        <h4 key={index} className="text-teal-200 font-semibold mt-4 first:mt-0">
                                            {paragraph.replace(':', '')}
                                        </h4>
                                    );
                                }

                                return (
                                    <p key={index} className="text-teal-100 leading-relaxed">
                                        {paragraph}
                                    </p>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Info */}
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/50 rounded-xl p-6">
                <p className="text-gray-300 text-sm">
                    <strong className="text-white">Note:</strong> This analysis is generated by AI and should not replace professional medical advice.
                    Please consult with a healthcare provider for any health concerns.
                </p>
            </div>
        </div>
    );
}
