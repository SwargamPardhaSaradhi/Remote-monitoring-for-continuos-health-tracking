import { User, Mail, Calendar, Activity, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getCache, setCache } from '../lib/cache';

interface ProfileStats {
    totalRecords: number;
    totalAnalyses: number;
    memberSince: string;
}

const CACHE_KEY = 'profile_stats';

export function ProfilePage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<ProfileStats>({
        totalRecords: 0,
        totalAnalyses: 0,
        memberSince: '',
    });

    useEffect(() => {
        fetchUserStats();
    }, []);

    const fetchUserStats = async () => {
        // Try cache first
        const cached = getCache<ProfileStats>(CACHE_KEY);
        if (cached) {
            setStats(cached);
        }

        // Always fetch fresh data in background
        const { count: recordCount } = await supabase
            .from('health_metrics')
            .select('*', { count: 'exact', head: true });

        const { count: analysisCount } = await supabase
            .from('ai_analyses')
            .select('*', { count: 'exact', head: true });

        const freshStats: ProfileStats = {
            totalRecords: recordCount || 0,
            totalAnalyses: analysisCount || 0,
            memberSince: user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                })
                : 'N/A',
        };

        setStats(freshStats);
        setCache(CACHE_KEY, freshStats);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
                <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                        <User className="w-12 h-12" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold mb-2">My Profile</h2>
                        <div className="flex items-center space-x-2 text-blue-100">
                            <Mail className="w-4 h-4" />
                            <span>{user?.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-400 text-sm font-medium">Health Records</h3>
                        <Activity className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.totalRecords}</p>
                    <p className="text-xs text-gray-500 mt-1">Total measurements</p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-400 text-sm font-medium">AI Analyses</h3>
                        <Settings className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.totalAnalyses}</p>
                    <p className="text-xs text-gray-500 mt-1">AI insights received</p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-400 text-sm font-medium">Member Since</h3>
                        <Calendar className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-xl font-bold text-white">{stats.memberSince}</p>
                    <p className="text-xs text-gray-500 mt-1">Account created</p>
                </div>
            </div>

            {/* Account Information */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Account Information</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-slate-700">
                        <div>
                            <p className="text-sm text-gray-400">Email Address</p>
                            <p className="text-white font-medium">{user?.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-slate-700">
                        <div>
                            <p className="text-sm text-gray-400">User ID</p>
                            <p className="text-white font-mono text-sm">{user?.id}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <div>
                            <p className="text-sm text-gray-400">Account Status</p>
                            <p className="text-green-400 font-medium">Active</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Privacy & Security */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Privacy & Security</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 px-4 bg-slate-700/50 rounded-lg">
                        <span className="text-gray-300">Two-Factor Authentication</span>
                        <span className="text-sm text-gray-500">Coming Soon</span>
                    </div>
                    <div className="flex items-center justify-between py-3 px-4 bg-slate-700/50 rounded-lg">
                        <span className="text-gray-300">Data Encryption</span>
                        <span className="text-green-400 text-sm font-medium">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between py-3 px-4 bg-slate-700/50 rounded-lg">
                        <span className="text-gray-300">Privacy Mode</span>
                        <span className="text-green-400 text-sm font-medium">Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
