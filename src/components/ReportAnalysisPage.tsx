import { useState, useRef } from 'react';
import { Upload, FileImage, Loader2, X, Sparkles } from 'lucide-react';
import { analyzeReportImage } from '../lib/analyzeReportImage';
import { saveReportToStorage } from './ReportResultsPage';

interface ReportAnalysisPageProps {
    onAnalysisComplete: () => void;
}

export function ReportAnalysisPage({ onAnalysisComplete }: ReportAnalysisPageProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [imageMimeType, setImageMimeType] = useState<string>('');
    const [analyzing, setAnalyzing] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        setError(null);

        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            setError('Please upload a valid image file (JPG, PNG, or WebP)');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('Image size should be less than 10MB');
            return;
        }

        setImageMimeType(file.type);

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setImagePreview(dataUrl);
            // Extract base64 data (remove the data:mime;base64, prefix)
            const base64Data = dataUrl.split(',')[1];
            setImageBase64(base64Data);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => {
        setDragActive(false);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const clearImage = () => {
        setImagePreview(null);
        setImageBase64(null);
        setImageMimeType('');
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleAnalyze = async () => {
        if (!imageBase64 || !imageMimeType) {
            setError('Please upload an image first');
            return;
        }

        setAnalyzing(true);
        setError(null);

        try {
            const results = await analyzeReportImage(imageBase64, imageMimeType);
            // Save results to localStorage
            saveReportToStorage(results, imagePreview!);
            // Switch to results tab
            onAnalysisComplete();
        } catch (err) {
            console.error('Analysis failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to analyze the report. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/20">
                    <FileImage className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Medical Report Scanner</h2>
                <p className="text-gray-400">
                    Upload an image of your medical report and let AI analyze it for diseases, predictions, and diet recommendations.
                </p>
            </div>

            {/* Upload Area */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
                {!imagePreview ? (
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${dragActive
                            ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
                            : 'border-slate-600 hover:border-blue-500/50 hover:bg-slate-700/50'
                            }`}
                    >
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-all ${dragActive ? 'bg-blue-500/20' : 'bg-slate-700'
                            }`}>
                            <Upload className={`w-8 h-8 transition-colors ${dragActive ? 'text-blue-400' : 'text-gray-400'
                                }`} />
                        </div>
                        <p className="text-white font-semibold text-lg mb-2">
                            {dragActive ? 'Drop your report here' : 'Upload Medical Report'}
                        </p>
                        <p className="text-gray-400 text-sm mb-4">
                            Drag and drop an image, or click to browse
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                            <span className="px-2 py-1 bg-slate-700 rounded">JPG</span>
                            <span className="px-2 py-1 bg-slate-700 rounded">PNG</span>
                            <span className="px-2 py-1 bg-slate-700 rounded">WebP</span>
                            <span className="text-gray-600">•</span>
                            <span>Max 10MB</span>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileInput}
                            className="hidden"
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">Report Preview</h3>
                            <button
                                onClick={clearImage}
                                disabled={analyzing}
                                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition disabled:opacity-50"
                            >
                                <X className="w-4 h-4" />
                                <span>Remove</span>
                            </button>
                        </div>
                        <div className="relative rounded-xl overflow-hidden border border-slate-600 bg-slate-900">
                            <img
                                src={imagePreview}
                                alt="Medical report preview"
                                className="w-full max-h-[500px] object-contain"
                            />
                            {analyzing && (
                                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
                                    <div className="relative">
                                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                                        <Sparkles className="w-5 h-5 text-purple-400 absolute -top-1 -right-1 animate-pulse" />
                                    </div>
                                    <p className="text-white font-semibold mt-4 text-lg">Analyzing Report...</p>
                                    <p className="text-gray-400 text-sm mt-1">AI is extracting and analyzing your medical data</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Analyze Button */}
                {imagePreview && (
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/20"
                    >
                        {analyzing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Analyzing with AI...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                <span>Analyze Report</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Info Note */}
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/50 rounded-xl p-5">
                <p className="text-gray-300 text-sm">
                    <strong className="text-white">Supported Reports:</strong> Blood tests, CBC, Lipid Profile,
                    Thyroid Panel, Liver Function Tests, Kidney Function Tests, Urine Analysis, and more.
                </p>
                <p className="text-gray-400 text-xs mt-2">
                    ⚠️ This AI analysis is for informational purposes only and should not replace professional medical advice.
                </p>
            </div>
        </div>
    );
}
