import { readFileSync, writeFileSync } from 'fs';
const file = 'src/pages/EmployeeDashboard.tsx';
let txt = readFileSync(file, 'utf8');

const startToken = `    return (
        <div className="flex flex-col h-screen bg-transparent relative">`;
const startTokenCRLF = `    return (\r
        <div className="flex flex-col h-screen bg-transparent relative">`;
const endToken = `    );
};

const HistoryTab = `;
const endTokenCRLF = `    );\r
};\r
\r
const HistoryTab = `;

let startIndex = txt.indexOf(startToken);
if (startIndex === -1) startIndex = txt.indexOf(startTokenCRLF);

let endIndex = txt.indexOf(endToken);
if (endIndex === -1) endIndex = txt.indexOf(endTokenCRLF);

if (startIndex === -1 || endIndex === -1) {
    console.error('Tokens not found!', { startIndex, endIndex });
    process.exit(1);
}

const replacement = `    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 overflow-hidden relative selection:bg-indigo-500/30">
            {/* Camera Modal */}
            {showCamera && (
                <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700/50 animate-fadeIn">
                        <div className="p-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800">
                            <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                                {attendanceType === 'check_in' && <><MapPin size={18} className="text-indigo-500" /> {t.checkInVerify}</>}
                                {attendanceType === 'check_out' && <><LogOut size={18} className="text-rose-500" /> {t.checkOutVerify}</>}
                                {attendanceType === 'site_in' && <><Briefcase size={18} className="text-orange-500" /> {t.siteArrival}</>}
                                {attendanceType === 'site_out' && <><Building size={18} className="text-blue-500" /> {t.siteDeparture}</>}
                            </h3>
                            <button onClick={() => setShowCamera(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="relative aspect-[3/4] bg-black">
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                            <canvas ref={canvasRef} className="hidden" />
                            <div className="absolute inset-0 border-[30px] border-black/20 pointer-events-none"></div>
                            <div className="absolute top-10 left-10 right-10 bottom-10 border-2 border-white/30 border-dashed rounded-2xl pointer-events-none"></div>
                        </div>
                        <div className="p-5 bg-white dark:bg-slate-800 space-y-4">
                            {/* GPS Label */}
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-3 flex items-center gap-3 border border-slate-100 dark:border-slate-700/50">
                                <Crosshair size={18} className={livePosition ? 'text-emerald-500' : 'text-slate-400 animate-pulse'} />
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5 font-medium">GPS Location</p>
                                    {livePosition ? (
                                        <a href={\`https://www.google.com/maps?q=\${livePosition.lat},\${livePosition.lng}\`} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-indigo-600 dark:text-cyan-400 hover:underline font-semibold transition">
                                            {livePosition.lat.toFixed(5)}, {livePosition.lng.toFixed(5)}
                                        </a>
                                    ) : (
                                        <span className="text-sm text-slate-400 italic">Waiting...</span>
                                    )}
                                </div>
                            </div>
                            
                            {(attendanceType === 'site_in' || attendanceType === 'check_out') && (
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                                        {attendanceType === 'site_in' ? 'Client / Site Name' : 'Locational Note'}
                                    </label>
                                    <input type="text" value={locationNote} onChange={(e) => setLocationNote(e.target.value)} placeholder={attendanceType === 'site_in' ? "e.g., Apple Inc." : "e.g., Head Office"} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900/30 transition-all outline-none" autoFocus={attendanceType === 'site_in'} />
                                </div>
                            )}
                            
                            <div className="flex justify-center pt-2 pb-1 text-center flex-col items-center">
                                <button onClick={capturePhoto} className="w-20 h-20 rounded-full bg-white dark:bg-slate-800 border-[3px] border-slate-200 dark:border-slate-600 flex items-center justify-center active:scale-95 transition-all shadow-md hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500 group mb-3">
                                    <div className="w-[56px] h-[56px] rounded-full bg-slate-900 dark:bg-white group-hover:scale-95 transition-transform"></div>
                                </button>
                                <p className="text-slate-500 dark:text-slate-400 text-[13px] font-medium">
                                    {attendanceType === 'site_in' ? t.enterSiteName : t.takeSelfie}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="px-5 pt-12 pb-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-b-[2rem] shadow-sm border-b border-slate-200/50 dark:border-slate-700/50 z-10 flex justify-between items-center relative gap-2">
                <div className="flex items-center gap-4">
                    <div className="w-[3.5rem] h-[3.5rem] rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[3px] cursor-pointer shadow-md hover:shadow-lg transition-all hover:scale-105 shrink-0" onClick={handleAvatarClick} title="Profile">
                        <img src={profile?.avatar_url || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${user?.email}\`} alt="Profile" className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 object-cover" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-0.5 capitalize">{profile?.position || 'Employee'}</p>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none tracking-tight truncate">
                            {profile?.first_name || 'Team'} <span className="text-amber-500 inline-block">👋</span>
                        </h1>
                    </div>
                </div>
                <div className="flex gap-2 items-center shrink-0">
                    {(['admin', 'hr', 'manager'].includes((profile?.role || '').toLowerCase())) && (
                        <button onClick={() => onNavigate('admin-dashboard')} className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 transition-all active:scale-95 shadow-sm border border-indigo-100 dark:border-indigo-500/20" title="Admin Panel">
                            <Shield size={18} strokeWidth={2.5} />
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-5 pb-36 pt-6 scrollbar-hide">

                {/* HOME TAB */}
                {activeTab === 'home' && (
                    <div className="animate-fadeIn space-y-6">
                        {/* Status Card */}
                        <div className="bg-white dark:bg-slate-800/80 rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/50 relative overflow-hidden backdrop-blur-md">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div>
                                    <p className="text-slate-500 dark:text-slate-400 text-[13px] font-bold tracking-wide uppercase mb-1.5">{t.currentStatus}</p>
                                    <div className="flex items-center gap-2.5">
                                        <div className={\`w-3 h-3 rounded-full shadow-sm \${isCheckedIn ? 'bg-emerald-500 shadow-emerald-500/30 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}\`}></div>
                                        <h2 className={\`text-2xl font-black tracking-tight \${isCheckedIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'}\`}>
                                            {isCheckedIn ? t.working : t.notCheckedIn}
                                        </h2>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-500 dark:text-slate-400 text-[13px] font-bold tracking-wide uppercase mb-1.5">{t.today}</p>
                                    <p className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100 tracking-wider leading-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-[1rem] shadow-inner">
                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex justify-center mb-8 relative z-10">
                                <button onClick={() => initiateAttendance(isCheckedIn ? 'check_out' : 'check_in')} className={\`relative w-44 h-44 rounded-full flex flex-col items-center justify-center transition-all duration-300 border-[6px] active:scale-95 \${isCheckedIn ? 'bg-gradient-to-br from-rose-500 to-red-600 hover:shadow-[0_20px_40px_-15px_rgba(225,29,72,0.5)] border-rose-100 dark:border-slate-900/50 text-white' : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.5)] border-indigo-100 dark:border-slate-900/50 text-white'}\`}>
                                    <div className="absolute inset-2 rounded-full border-[1.5px] border-white/30 border-dashed"></div>
                                    <Camera size={42} className="mb-2.5 drop-shadow-md" strokeWidth={2} />
                                    <span className="font-extrabold text-xl tracking-widest drop-shadow-sm">{isCheckedIn ? t.checkOut : t.checkIn}</span>
                                    <div className="mt-2.5 flex items-center text-[10px] font-bold bg-black/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white tracking-wide border border-white/10">
                                        <MapPin size={10} className="mr-1.5" /><span>{t.cameraVerification}</span>
                                    </div>
                                </button>
                            </div>

                            <div className="grid grid-cols-4 divide-x divide-slate-100 dark:divide-slate-700/50 border-t border-slate-100 dark:border-slate-700/50 pt-5 mt-2 relative z-10 bg-slate-50/50 dark:bg-slate-900/30 -mx-6 -mb-6 px-6 pb-6 rounded-b-[2.5rem]">
                                <div className="text-center px-1">
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest">{t.inTime}</p>
                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{todayLogs.find(l => l.type === 'check_in')?.timestamp ? new Date(todayLogs.find(l => l.type === 'check_in')!.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p>
                                </div>
                                <div className="text-center px-1">
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest">{t.outTime}</p>
                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{todayLogs.find(l => l.type === 'check_out')?.timestamp ? new Date(todayLogs.find(l => l.type === 'check_out')!.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p>
                                </div>
                                <div className="text-center px-1">
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest">{t.workingHrs}</p>
                                    <p className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{workingHours}</p>
                                </div>
                                <div className="text-center px-1">
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest">ระยะทาง</p>
                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{todayDistance > 0 ? todayDistance.toFixed(1) : '0'} <span className="text-[10px] text-slate-500 font-semibold">km</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-4 gap-3">
                            <button onClick={() => initiateAttendance('site_in')} className="bg-white dark:bg-slate-800 p-4 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center gap-3 hover:bg-orange-50 dark:hover:bg-slate-700/50 transition-all group active:scale-95">
                                <div className="w-14 h-14 rounded-[1.2rem] bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-105 transition-transform border border-orange-100 dark:border-orange-500/20 shadow-sm"><Briefcase size={24} strokeWidth={2.5} /></div>
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight tracking-wide">เข้างาน<br/>ไซต์</span>
                            </button>
                            <button onClick={() => initiateAttendance('site_out')} className="bg-white dark:bg-slate-800 p-4 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center gap-3 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-all group active:scale-95">
                                <div className="w-14 h-14 rounded-[1.2rem] bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform border border-blue-100 dark:border-blue-500/20 shadow-sm"><Building size={24} strokeWidth={2.5} /></div>
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight tracking-wide">ออกงาน<br/>ไซต์</span>
                            </button>
                            <button onClick={() => setCurrentView('leave-request')} className="bg-white dark:bg-slate-800 p-4 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center gap-3 hover:bg-purple-50 dark:hover:bg-slate-700/50 transition-all group active:scale-95 relative overflow-visible">
                                <div className="w-14 h-14 rounded-[1.2rem] bg-purple-50 dark:bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-105 transition-transform border border-purple-100 dark:border-purple-500/20 shadow-sm relative">
                                    <Coffee size={24} strokeWidth={2.5} />
                                    <div className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[11px] min-w-[24px] h-[24px] px-1 rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-slate-800 shadow-md">{leaveBalance.remaining}</div>
                                </div>
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight tracking-wide">ลางาน<br/>{t.leave}</span>
                            </button>
                            <button onClick={() => alert('ดูสลิปเงินเดือนได้ในเมนู History หรือสอบถาม HR')} className="bg-white dark:bg-slate-800 p-4 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center gap-3 hover:bg-emerald-50 dark:hover:bg-slate-700/50 transition-all group active:scale-95">
                                <div className="w-14 h-14 rounded-[1.2rem] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-100 dark:border-emerald-500/20 shadow-sm"><FileText size={24} strokeWidth={2.5} /></div>
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight tracking-wide">สลิป<br/>เงินเดือน</span>
                            </button>
                        </div>
                        
                        {profile?.work_shifts && (
                            <div className="bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-100/50 dark:border-indigo-500/20 rounded-[1.5rem] p-4 flex items-center justify-center gap-3 shadow-sm">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/30 text-indigo-500 flex items-center justify-center"><Clock size={16} strokeWidth={2.5} /></div>
                                <span className="text-sm font-bold text-indigo-800 dark:text-indigo-300 tracking-wide">พนักงานรอบเวลา: {profile.work_shifts.start_time?.slice(0, 5)} - {profile.work_shifts.end_time?.slice(0, 5)}</span>
                            </div>
                        )}

                        <div className="mt-8 pt-2">
                            <div className="flex justify-between items-center mb-5 px-2">
                                <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{t.recentActivity}</h3>
                                <button onClick={() => setActiveTab('calendar')} className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 px-4 py-2 rounded-full transition-colors active:scale-95">ดูทั้งหมด</button>
                            </div>
                            <div className="flex flex-col gap-3">
                                {todayLogs.length === 0 && (
                                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 text-center border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
                                            <Calendar size={24} className="text-slate-400 dark:text-slate-500" strokeWidth={2.5} />
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 font-semibold tracking-wide">{t.noActivityToday}</p>
                                    </div>
                                )}
                                {todayLogs.map((log, idx) => {
                                    const dist = getDistanceFromPrevious(todayLogs, idx);
                                    const isCheckInOut = log.type === 'check_in' || log.type === 'check_out';
                                    return (
                                        <div key={log.id} className="bg-white dark:bg-slate-800 rounded-[1.5rem] p-4.5 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={\`w-12 h-12 rounded-[1rem] flex items-center justify-center flex-shrink-0 \${
                                                    log.type.includes('in') ? 'bg-indigo-50/50 text-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20' : 'bg-rose-50/50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20'
                                                }\`}>
                                                    {isCheckInOut ? <Clock size={20} strokeWidth={2.5} /> : <Building size={20} strokeWidth={2.5} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 capitalize text-sm mb-1">{log.type.replace('_', ' ')}</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 font-medium tracking-wide">
                                                        <span className="font-mono bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-md text-[11px] font-bold shadow-sm">{new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                                        <span className="truncate">{log.location_name}</span>
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <div className={\`text-[10px] font-extrabold px-2.5 py-1 rounded-md tracking-widest uppercase \${log.status === 'ontime' ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20' : 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20'}\`}>{log.status === 'ontime' ? 'ON TIME' : 'LATE'}</div>
                                                    {dist !== null && dist > 0.01 && (
                                                        <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 dark:text-cyan-400 dark:bg-cyan-500/10 dark:border-cyan-500/20 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
                                                            <Route size={10} strokeWidth={2.5} /> {dist.toFixed(2)} km
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {/* GPS Coordinates */}
                                            {log.location_lat && log.location_lng && (
                                                <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-700/30 flex ml-[4rem]">
                                                    <a href={\`https://www.google.com/maps?q=\${log.location_lat},\${log.location_lng}\`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 rounded-xl text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors border border-slate-200/50 dark:border-slate-700 w-full font-medium" title="View on map">
                                                        <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                                                        <span className="truncate">{log.location_lat.toFixed(6)}, {log.location_lng.toFixed(6)}</span>
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* HISTORY TAB */}
                {activeTab === 'calendar' && <HistoryTab userId={user?.id} />}

                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                    <div className="animate-fadeIn space-y-6 pt-4">
                        <div className="flex flex-col items-center mb-10">
                            <div className="w-[120px] h-[120px] rounded-[2.5rem] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[3px] mb-5 shadow-xl rotate-[5deg] hover:rotate-0 transition-transform duration-300">
                                <img src={profile?.avatar_url || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${user?.email}\`} alt="Profile" className="w-full h-full rounded-[2.3rem] bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-800 object-cover -rotate-[5deg]" />
                            </div>
                            <h2 className="text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-1">{profile?.first_name} {profile?.last_name}</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-bold tracking-wide">{profile?.position || 'Employee'}</p>
                            <div className="mt-4 px-5 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-extrabold shadow-sm border border-slate-200 dark:border-slate-700">{profile?.department || 'General Department'}</div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-slate-800 p-5 rounded-[1.5rem] flex items-center justify-between border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-[1rem] bg-slate-50 dark:bg-slate-900/80 flex items-center justify-center border border-slate-200/50 dark:border-slate-700"><User size={20} className="text-slate-500 dark:text-slate-400" strokeWidth={2.5} /></div>
                                    <div><p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.employeeId}</p><p className="form-bold text-slate-800 dark:text-slate-100 font-mono text-[15px]">{user?.id.slice(0, 8).toUpperCase()}</p></div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-5 rounded-[1.5rem] flex items-center justify-between border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-[1rem] bg-slate-50 dark:bg-slate-900/80 flex items-center justify-center border border-slate-200/50 dark:border-slate-700"><Briefcase size={20} className="text-slate-500 dark:text-slate-400" strokeWidth={2.5} /></div>
                                    <div><p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.role}</p><p className="font-bold text-slate-800 dark:text-slate-100 capitalize text-[15px]">{profile?.role}</p></div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-5 rounded-[1.5rem] flex items-center justify-between border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-[1rem] bg-orange-50/50 dark:bg-orange-500/10 flex items-center justify-center border border-orange-100/50 dark:border-orange-500/20"><Coffee size={20} className="text-orange-500" strokeWidth={2.5} /></div>
                                    <div><p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.leaveBalance}</p><p className="font-bold text-slate-800 dark:text-slate-100 text-[15px]"><span className="text-orange-500">{leaveBalance.remaining}</span> / {leaveBalance.total} {t.daysRemaining}</p></div>
                                </div>
                            </div>
                            
                            <div className="pt-6 pb-2 space-y-3">
                                <button onClick={() => setShowChangePassword(true)} className="w-full p-4.5 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2.5 font-bold shadow-sm active:scale-95">
                                    <Lock size={20} strokeWidth={2.5} /> {t.changePassword}
                                </button>
                                <button onClick={() => signOut()} className="w-full p-4.5 rounded-[1.5rem] bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2.5 font-bold shadow-sm active:scale-95">
                                    <LogOut size={20} strokeWidth={2.5} /> ออกจากระบบ
                                </button>
                            </div>
                        </div>

                        {/* Change Password Modal */}
                        {showChangePassword && (
                            <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
                                <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-[2.5rem] p-7 border border-slate-200 dark:border-slate-700/50 shadow-2xl animate-fadeIn">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold flex items-center gap-2.5 text-slate-900 dark:text-white"><Lock size={22} className="text-indigo-500" strokeWidth={2.5} /> เปลี่ยนรหัสผ่าน</h3>
                                        <button onClick={() => { setShowChangePassword(false); setPwForm({ newPassword: '', confirmPassword: '' }); }} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition"><X size={18} strokeWidth={2.5} /></button>
                                    </div>
                                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 mb-6 shadow-sm">
                                        <p className="text-amber-800 dark:text-amber-300 text-[13px] font-bold flex items-center gap-2"><span>⚠️</span> รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-2">🔒 รหัสผ่านใหม่</label>
                                            <div className="relative">
                                                <input type={showNewPw ? 'text' : 'password'} value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} placeholder="อย่างน้อย 6 ตัวอักษร" className={\`w-full bg-slate-50 dark:bg-slate-900 border \${pwForm.newPassword && pwForm.newPassword.length < 6 ? 'border-rose-300 focus:ring-rose-200 dark:border-rose-500 dark:focus:ring-rose-900' : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-900/30'} rounded-2xl p-4 pr-12 text-slate-900 dark:text-white text-sm focus:ring-2 outline-none transition-shadow font-medium\`} />
                                                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">{showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                            </div>
                                            {pwForm.newPassword && pwForm.newPassword.length < 6 && <p className="text-rose-500 dark:text-rose-400 text-[12px] font-bold mt-2 ml-1 flex items-center gap-1.5"><span>❌</span> ต้องมีอย่างน้อย 6 ตัว ({pwForm.newPassword.length}/6)</p>}
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-2">🔒 ยืนยันรหัสผ่านใหม่</label>
                                            <div className="relative">
                                                <input type={showConfirmPw ? 'text' : 'password'} value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} placeholder="พิมพ์รหัสผ่านอีกครั้ง" className={\`w-full bg-slate-50 dark:bg-slate-900 border \${pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword ? 'border-rose-300 focus:ring-rose-200 dark:border-rose-500 dark:focus:ring-rose-900' : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-900/30'} rounded-2xl p-4 pr-12 text-slate-900 dark:text-white text-sm focus:ring-2 outline-none transition-shadow font-medium\`} />
                                                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">{showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                            </div>
                                            {pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword && <p className="text-rose-500 dark:text-rose-400 text-[12px] font-bold mt-2 ml-1 flex items-center gap-1.5"><span>❌</span> รหัสผ่านไม่ตรงกัน</p>}
                                            {pwForm.confirmPassword && pwForm.confirmPassword === pwForm.newPassword && pwForm.newPassword.length >= 6 && <p className="text-emerald-500 dark:text-emerald-400 text-[12px] font-bold mt-2 ml-1 flex items-center gap-1.5"><span>✅</span> รหัสผ่านตรงกัน</p>}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-8">
                                        <button onClick={() => { setShowChangePassword(false); setPwForm({ newPassword: '', confirmPassword: '' }); }} className="flex-[0.8] py-4 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 font-extrabold transition">ยกเลิก</button>
                                        <button onClick={handleChangePassword} disabled={pwLoading || pwForm.newPassword.length < 6 || pwForm.newPassword !== pwForm.confirmPassword} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-extrabold active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none hover:shadow-lg disabled:active:scale-100">
                                            <Lock size={18} strokeWidth={2.5} /> {pwLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 rounded-t-[2.5rem] px-6 py-4 flex justify-between items-center z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_-5px_30px_rgba(0,0,0,0.3)] pb-safe">
                <button onClick={() => { setActiveTab('home'); setCurrentView('dashboard'); }} className={\`flex flex-col items-center gap-1.5 w-16 transition-colors \${activeTab === 'home' && currentView === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}\`} title={t.home}>
                    <MapPin size={24} className={\`transition-transform \${activeTab === 'home' && currentView === 'dashboard' ? 'scale-110' : ''}\`} strokeWidth={activeTab === 'home' && currentView === 'dashboard' ? 3 : 2} />
                    <span className="text-[10px] font-extrabold tracking-wide">{t.home}</span>
                </button>
                <button onClick={() => { setActiveTab('calendar'); setCurrentView('dashboard'); }} className={\`flex flex-col items-center gap-1.5 w-16 transition-colors \${activeTab === 'calendar' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}\`}>
                    <Calendar size={24} className={\`transition-transform \${activeTab === 'calendar' ? 'scale-110' : ''}\`} strokeWidth={activeTab === 'calendar' ? 3 : 2} />
                    <span className="text-[10px] font-extrabold tracking-wide">{t.history}</span>
                </button>
                
                {/* Center Floating Action Button setup */}
                <div className="w-[4.5rem] h-12 relative flex justify-center">
                   <button onClick={() => initiateAttendance(isCheckedIn ? 'check_out' : 'check_in')} className={\`absolute bottom-2 w-[4.5rem] h-[4.5rem] rounded-[1.8rem] flex items-center justify-center text-white shadow-[0_10px_20px_rgba(0,0,0,0.1)] transform transition-transform hover:scale-105 active:scale-95 border-[4px] border-white dark:border-slate-900 \${isCheckedIn ? 'bg-gradient-to-tr from-rose-500 to-red-600' : 'bg-gradient-to-tr from-indigo-500 to-purple-600'}\`}>
                       <Camera size={28} strokeWidth={2.5} className="drop-shadow-sm" />
                   </button>
                </div>
                
                <button onClick={() => setCurrentView('leave-request')} className={\`flex flex-col items-center gap-1.5 w-16 transition-colors \${currentView === 'leave-request' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}\`}>
                    <FileText size={24} className={\`transition-transform \${currentView === 'leave-request' ? 'scale-110' : ''}\`} strokeWidth={currentView === 'leave-request' ? 3 : 2} />
                    <span className="text-[10px] font-extrabold tracking-wide">{t.requests}</span>
                </button>
                <button onClick={() => { setActiveTab('profile'); setCurrentView('dashboard'); }} className={\`flex flex-col items-center gap-1.5 w-16 transition-colors \${activeTab === 'profile' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}\`}>
                    <User size={24} className={\`transition-transform \${activeTab === 'profile' ? 'scale-110' : ''}\`} strokeWidth={activeTab === 'profile' ? 3 : 2} />
                    <span className="text-[10px] font-extrabold tracking-wide">{t.me}</span>
                </button>
            </nav>
        </div>
`;

txt = txt.substring(0, startIndex) + replacement + txt.substring(endIndex);

writeFileSync(file, txt, 'utf8');
console.log('Update finished!');
