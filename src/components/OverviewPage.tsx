import { Activity, TrendingUp, Shield, LogIn, UserPlus } from 'lucide-react';

interface OverviewPageProps {
    onLoginClick?: () => void;
    onSignupClick?: () => void;
}

export function OverviewPage({ onLoginClick, onSignupClick }: OverviewPageProps) {
    return (
        <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16 pt-8">
                <h1 className="text-5xl font-bold text-white mb-4">
                    Your Personal AI
                    <span className="block text-blue-400 mt-2">Health Assistant</span>
                </h1>
                <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
                    Track your vitals, analyze trends with advanced AI, and get personalized insights to live
                    a healthier active life.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={onSignupClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                    >
                        <UserPlus className="w-5 h-5" />
                        Get Started Now
                    </button>
                    <button
                        onClick={onLoginClick}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                    >
                        <LogIn className="w-5 h-5" />
                        Login
                    </button>
                </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-all">
                    <div className="bg-red-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                        <Activity className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Real-time Tracking</h3>
                    <p className="text-gray-400">
                        Monitor heart rate, blood pressure, and oxygen levels with ease.
                    </p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-all">
                    <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">AI Analysis</h3>
                    <p className="text-gray-400">
                        Get instant feedback and disease risk predictions powered by Gemini AI.
                    </p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-all">
                    <div className="bg-green-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                        <Shield className="w-6 h-6 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Secure History</h3>
                    <p className="text-gray-400">
                        Your health data is encrypted and securely stored for your review.
                    </p>
                </div>
            </div>

            {/* Additional Info */}
            <div className="mt-12 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-8">
                <div className="flex items-center justify-center gap-12">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-white">24/7</div>
                        <div className="text-gray-400">Monitoring</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-white">AI</div>
                        <div className="text-gray-400">Powered</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-white">100%</div>
                        <div className="text-gray-400">Secure</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
