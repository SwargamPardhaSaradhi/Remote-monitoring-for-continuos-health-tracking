import { useState, useEffect } from 'react';
import {
    FileText,
    AlertTriangle,
    TrendingUp,
    Apple,
    ChevronDown,
    ChevronUp,
    Trash2,
    FileSearch,
} from 'lucide-react';
import { formatAIText } from '../utils/formatAIText';
import type { ReportAnalysisResult } from '../lib/analyzeReportImage';

const REPORT_STORAGE_KEY = 'report_scan_results';

interface StoredReport {
    results: ReportAnalysisResult;
    imagePreview: string;
    analyzedAt: string;
}

/** Save report results to localStorage */
export function saveReportToStorage(results: ReportAnalysisResult, imagePreview: string) {
    try {
        const stored: StoredReport = {
            results,
            imagePreview,
            analyzedAt: new Date().toISOString(),
        };
        localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(stored));
    } catch {
        // localStorage full — ignore
    }
}

/** Clear report results from localStorage */
export function clearReportStorage() {
    localStorage.removeItem(REPORT_STORAGE_KEY);
}

/** Read report results from localStorage */
function getStoredReport(): StoredReport | null {
    try {
        const raw = localStorage.getItem(REPORT_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function ReportResultsPage() {
    const [storedReport, setStoredReport] = useState<StoredReport | null>(null);
    const [showExtractedText, setShowExtractedText] = useState(false);

    // Read from localStorage on mount and whenever the tab is focused
    useEffect(() => {
        const load = () => setStoredReport(getStoredReport());
        load();

        // Also reload when window regains focus (in case another tab saved data)
        window.addEventListener('focus', load);
        return () => window.removeEventListener('focus', load);
    }, []);

    // Also poll localStorage for changes (catches saves from ReportAnalysisPage)
    useEffect(() => {
        const interval = setInterval(() => {
            const current = getStoredReport();
            if (current && (!storedReport || current.analyzedAt !== storedReport.analyzedAt)) {
                setStoredReport(current);
            }
        }, 500);
        return () => clearInterval(interval);
    }, [storedReport]);

    const handleClear = () => {
        clearReportStorage();
        setStoredReport(null);
    };

    if (!storedReport) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
                    <FileSearch className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Report Results</h3>
                    <p className="text-gray-400">
                        Go to the <strong>Report Scan</strong> tab to upload and analyze a medical report.
                        The results will appear here automatically.
                    </p>
                </div>
            </div>
        );
    }

    const { results, imagePreview, analyzedAt } = storedReport;

    const formattedDiseases = formatAIText(results.diseases);
    const formattedPrediction = formatAIText(results.prediction);
    const formattedDietPlan = formatAIText(results.dietPlan);
    const formattedExtractedText = formatAIText(results.extractedText);

    const diseaseParagraphs = formattedDiseases.split('\n\n').filter((p) => p.trim());
    const predictionParagraphs = formattedPrediction.split('\n\n').filter((p) => p.trim());
    const dietParagraphs = formattedDietPlan.split('\n\n').filter((p) => p.trim());

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Report Image Thumbnail */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <img
                            src={imagePreview}
                            alt="Analyzed report"
                            className="w-20 h-20 object-cover rounded-lg border border-slate-600"
                        />
                        <div>
                            <h2 className="text-xl font-bold text-white">Report Analysis Results</h2>
                            <p className="text-gray-400 text-sm mt-1">
                                Analyzed on {new Date(analyzedAt).toLocaleString('en-US', {
                                    month: '2-digit',
                                    day: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                })}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClear}
                        className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear</span>
                    </button>
                </div>
            </div>

            {/* Extracted Text (Collapsible) */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <button
                    onClick={() => setShowExtractedText(!showExtractedText)}
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-700/50 transition"
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-700 rounded-lg">
                            <FileText className="w-5 h-5 text-gray-300" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-semibold text-white">Extracted Text</h3>
                            <p className="text-gray-400 text-sm">Summarized data from your report image</p>
                        </div>
                    </div>
                    {showExtractedText ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </button>
                {showExtractedText && (
                    <div className="px-5 pb-5 border-t border-slate-700">
                        <div className="mt-4 p-4 bg-slate-900 rounded-lg max-h-80 overflow-y-auto">
                            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                                {formattedExtractedText}
                            </pre>
                        </div>
                    </div>
                )}
            </div>

            {/* Identified Diseases & Findings */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-5">
                    <div className="p-2 bg-red-900/50 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Identified Diseases & Findings</h3>
                </div>
                <div className="bg-red-900/20 border border-red-700/40 rounded-lg p-5">
                    <div className="space-y-3">
                        {diseaseParagraphs.map((paragraph, index) => {
                            const isHeading =
                                paragraph.length < 60 &&
                                (paragraph.includes(':') ||
                                    paragraph.match(/^[A-Z][^.]+$/));

                            if (isHeading) {
                                return (
                                    <h4 key={index} className="text-red-200 font-semibold mt-4 first:mt-0">
                                        {paragraph.replace(/:$/, '')}
                                    </h4>
                                );
                            }

                            return (
                                <p key={index} className="text-red-100/90 leading-relaxed">
                                    {paragraph}
                                </p>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Risk Prediction */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-5">
                    <div className="p-2 bg-amber-900/50 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-amber-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Risk Prediction</h3>
                </div>
                <div className="bg-amber-900/20 border border-amber-700/40 rounded-lg p-5">
                    <div className="space-y-3">
                        {predictionParagraphs.map((paragraph, index) => {
                            const isHeading =
                                paragraph.length < 60 &&
                                (paragraph.includes(':') ||
                                    paragraph.match(/^[A-Z][^.]+$/));

                            if (isHeading) {
                                return (
                                    <h4 key={index} className="text-amber-200 font-semibold mt-4 first:mt-0">
                                        {paragraph.replace(/:$/, '')}
                                    </h4>
                                );
                            }

                            return (
                                <p key={index} className="text-amber-100/90 leading-relaxed">
                                    {paragraph}
                                </p>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Diet Plan */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-5">
                    <div className="p-2 bg-emerald-900/50 rounded-lg">
                        <Apple className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Personalized Diet Plan</h3>
                </div>
                <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-lg p-5">
                    <div className="space-y-3">
                        {dietParagraphs.map((paragraph, index) => {
                            const isHeading =
                                paragraph.length < 60 &&
                                (paragraph.includes(':') ||
                                    paragraph.match(/^[A-Z][^.]+$/));

                            if (isHeading) {
                                return (
                                    <h4 key={index} className="text-emerald-200 font-semibold mt-4 first:mt-0">
                                        {paragraph.replace(/:$/, '')}
                                    </h4>
                                );
                            }

                            return (
                                <p key={index} className="text-emerald-100/90 leading-relaxed">
                                    {paragraph}
                                </p>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/50 rounded-xl p-6">
                <p className="text-gray-300 text-sm">
                    <strong className="text-white">⚠️ Disclaimer:</strong> This analysis is generated by AI based on the uploaded
                    report image. It is for informational purposes only and should not replace professional medical advice.
                    Always consult with a qualified healthcare provider for diagnosis and treatment.
                </p>
            </div>
        </div>
    );
}
