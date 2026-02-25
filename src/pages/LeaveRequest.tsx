
import { useState } from 'react';
import { ArrowLeft, Clock, Calendar, Check, X } from 'lucide-react';

const LeaveRequest = ({ onBack }: { onBack: () => void }) => {
    const [formData, setFormData] = useState({
        type: 'leave',
        startDate: '',
        endDate: '',
        reason: ''
    });

    return (
        <div className="flex flex-col h-screen bg-[#0f172a] text-white overflow-y-auto">
            {/* Header */}
            <header className="fixed top-0 w-full z-10 glass-panel border-b border-white/5 rounded-none px-4 py-4 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-90 transition">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold">Request Leave</h1>
                </div>
            </header>

            {/* Form Content */}
            <div className="pt-24 px-4 pb-12 flex-1">

                {/* Leave Type Selector */}
                <div className="mb-8">
                    <label className="text-sm text-gray-400 block mb-3 font-medium">TYPE OF REQUEST</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['Annual Leave', 'Sick Leave', 'Personal', 'Comp Off'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFormData({ ...formData, type })}
                                className={`
                  p-4 rounded-xl text-left transition-all border
                  ${formData.type === type
                                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                                        : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}
                `}
                            >
                                <span className="block font-medium">{type}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date Range */}
                <div className="mb-8">
                    <label className="text-sm text-gray-400 block mb-3 font-medium">DURATIONS</label>
                    <div className="glass-panel p-4 flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <span className="text-indigo-400 text-xs font-bold mb-1 block">START DATE</span>
                            <input
                                type="date"
                                className="w-full bg-transparent text-white font-mono text-lg focus:outline-none placeholder-gray-600"
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div className="w-[1px] h-12 bg-white/10"></div>
                        <div className="flex-1 text-right">
                            <span className="text-pink-400 text-xs font-bold mb-1 block">END DATE</span>
                            <input
                                type="date"
                                className="w-full bg-transparent text-white font-mono text-lg focus:outline-none text-right placeholder-gray-600"
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {['Today', 'Tomorrow', 'This Week'].map(tag => (
                            <button key={tag} className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400 hover:text-white transition whitespace-nowrap">
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reason */}
                <div className="mb-8">
                    <label className="text-sm text-gray-400 block mb-3 font-medium">REASON (OPTIONAL)</label>
                    <textarea
                        rows={4}
                        className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition resize-none"
                        placeholder="Write a brief note..."
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    />
                </div>

                {/* Quick Summary */}
                <div className="glass-panel bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/5 p-4 mb-4">
                    <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-gray-400">Total Days</span>
                        <span className="font-bold text-white">2.5 Days</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Remaining Balance</span>
                        <span className="font-bold text-emerald-400">12.5 Days</span>
                    </div>
                </div>

            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-0 w-full p-4 glass-panel border-t border-white/10 rounded-t-2xl rounded-b-none bg-[#0f172a]/95 backdrop-blur-xl z-20">
                <button
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold text-lg shadow-[0_4px_20px_rgba(79,70,229,0.4)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                >
                    <span>Submit Request</span>
                    <ArrowLeft size={18} className="rotate-180" />
                </button>
            </div>
        </div>
    );
};

export default LeaveRequest;
