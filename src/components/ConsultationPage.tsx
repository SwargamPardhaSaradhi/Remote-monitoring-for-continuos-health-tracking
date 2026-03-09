import { Video, Calendar, Clock, User } from 'lucide-react';

export function ConsultationPage() {
    const doctors = [
        {
            id: 1,
            name: 'Dr. Sarah Smith',
            specialty: 'General Practitioner',
            availability: 'Next slot: Today, 3:00 AM',
            status: 'Available' as const,
        },
        {
            id: 2,
            name: 'Dr. James Wilson',
            specialty: 'Cardiologist',
            availability: 'Next slot: Tomorrow, 10:00 AM',
            status: 'Busy' as const,
        },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
                <div className="flex items-center space-x-3 mb-3">
                    <Video className="w-8 h-8" />
                    <h2 className="text-3xl font-bold">Live Doctor Consultation</h2>
                </div>
                <p className="text-purple-100 text-lg">
                    Connect with healthcare professionals instantly through video calls for immediate
                    medical guidance without hospital visits.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Schedule Appointment */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center space-x-2 mb-6">
                        <Calendar className="w-6 h-6 text-purple-400" />
                        <h3 className="text-xl font-bold text-white">Schedule Appointment</h3>
                    </div>

                    <div className="space-y-4">
                        {doctors.map((doctor) => (
                            <div
                                key={doctor.id}
                                className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-purple-500 transition"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-semibold text-white flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            {doctor.name}
                                        </h4>
                                        <p className="text-sm text-gray-400">{doctor.specialty}</p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${doctor.status === 'Available'
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                                : 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                                            }`}
                                    >
                                        {doctor.status}
                                    </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-300 mb-3">
                                    <Clock className="w-4 h-4 mr-2" />
                                    {doctor.availability}
                                </div>
                                <button
                                    className={`w-full py-2 rounded-lg font-medium transition ${doctor.status === 'Available'
                                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                            : 'bg-slate-600 text-gray-400 cursor-not-allowed'
                                        }`}
                                    disabled={doctor.status !== 'Available'}
                                >
                                    Book Appointment
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Join Waiting Room */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center space-x-2 mb-6">
                        <Video className="w-6 h-6 text-blue-400" />
                        <h3 className="text-xl font-bold text-white">Join Waiting Room</h3>
                    </div>

                    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-8 text-center mb-6">
                        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Video className="w-10 h-10 text-blue-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-2">
                            Need immediate attention?
                        </h4>
                        <p className="text-gray-400 mb-6">
                            Enter the virtual waiting room to see the next available doctor.
                        </p>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105">
                            Join Queue
                        </button>
                    </div>

                    <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                        <p className="text-sm text-purple-200">
                            <strong>Average wait time:</strong> 5-10 minutes
                        </p>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-teal-900/30 border border-teal-700/50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-2">How it works</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>Choose a doctor from the schedule or join the waiting room</li>
                    <li>Connect via secure video call from your browser</li>
                    <li>Discuss your health concerns and get expert guidance</li>
                    <li>Receive prescriptions and follow-up recommendations</li>
                </ol>
            </div>
        </div>
    );
}
