import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Activity,
    LogOut,
    LayoutDashboard,
    Stethoscope,
    History,
    Brain,
    Video,
    User,
    FileSearch,
    ClipboardList,
} from 'lucide-react';
import { DashboardPage } from './DashboardPage';
import { RecordHealthPage } from './RecordHealthPage';
import { HistoryPage } from './HistoryPage';
import { AIAnalysisPage } from './AIAnalysisPage';
import { ConsultationPage } from './ConsultationPage';
import { ProfilePage } from './ProfilePage';
import { ReportAnalysisPage } from './ReportAnalysisPage';
import { ReportResultsPage } from './ReportResultsPage';

type TabType = 'dashboard' | 'record' | 'history' | 'analysis' | 'consultation' | 'report' | 'report-results' | 'profile';

export function AppDashboard() {
    const { signOut } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');

    const tabs = [
        { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'record' as TabType, label: 'Record Health', icon: Stethoscope },
        { id: 'history' as TabType, label: 'History', icon: History },
        { id: 'analysis' as TabType, label: 'AI Analysis', icon: Brain },
        { id: 'consultation' as TabType, label: 'Consultation', icon: Video },
        { id: 'report' as TabType, label: 'Report Scan', icon: FileSearch },
        { id: 'report-results' as TabType, label: 'Report Results', icon: ClipboardList },
    ];

    const handleDataSubmitted = () => {
        // Switch to analysis tab after data submission
        setActiveTab('analysis');
    };

    const handleAnalysisComplete = () => {
        // Switch to report results tab after analysis finishes
        setActiveTab('report-results');
    };

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Navigation Bar */}
            <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">Health Monitor AI</h1>
                                <p className="text-xs text-gray-400">Remote Health Tracking</p>
                            </div>
                        </div>

                        {/* User Actions */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${activeTab === 'profile'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-slate-700'
                                    }`}
                            >
                                <User className="w-4 h-4" />
                                <span className="hidden sm:inline">Profile</span>
                            </button>
                            <button
                                onClick={() => signOut()}
                                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-slate-700 rounded-lg transition"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-1 overflow-x-auto pb-0 -mb-px">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${isActive
                                        ? 'border-blue-500 text-blue-400 bg-slate-700/50'
                                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-slate-700/30'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Content */}
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                {activeTab === 'dashboard' && <DashboardPage />}
                {activeTab === 'record' && <RecordHealthPage onDataSubmitted={handleDataSubmitted} />}
                {activeTab === 'history' && <HistoryPage />}
                {activeTab === 'analysis' && <AIAnalysisPage />}
                {activeTab === 'consultation' && <ConsultationPage />}
                {activeTab === 'report' && <ReportAnalysisPage onAnalysisComplete={handleAnalysisComplete} />}
                {activeTab === 'report-results' && <ReportResultsPage />}
                {activeTab === 'profile' && <ProfilePage />}
            </div>
        </div>
    );
}
