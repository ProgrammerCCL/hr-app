const fs = require('fs');
const file = 'src/pages/EmployeeDashboard.tsx';
let txt = fs.readFileSync(file, 'utf8');

// Replace the return block entirely.
const startToken = '    return (\n        <div className="flex flex-col h-screen bg-transparent relative">';
const endToken = '    );\n};\n\nconst HistoryTab = ';

const startIndex = txt.indexOf(startToken);
const endIndex = txt.indexOf(endToken);

if (startIndex === -1 || endIndex === -1) {
    console.error('Tokens not found!', { startIndex, endIndex });
    process.exit(1);
}

const replacement = `    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 overflow-hidden relative">
            {/* Camera Modal */}
            {showCamera && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                    <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-white/10">
                        <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-gray-800/50">
                            <h3 className="font-bold flex items-center gap-2 text-gray-800 dark:text-white">
                                {attendanceType === 'check_in' && <><MapPin size={18} className="text-indigo-500" /> {t.checkInVerify}</>}
                                {attendanceType === 'check_out' && <><LogOut size={18} className="text-rose-500" /> {t.checkOutVerify}</>}
                                {attendanceType === 'site_in' && <><Briefcase size={18} className="text-orange-500" /> {t.siteArrival}</>}
                                {attendanceType === 'site_out' && <><Building size={18} className="text-blue-500" /> {t.siteDeparture}</>}
                            </h3>
                            <button onClick={() => setShowCamera(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="relative aspect-[3/4] bg-black">
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                            <canvas ref={canvasRef} className="hidden" />
                            <div className="absolute inset-0 border-[30px] border-black/20 pointer-events-none"></div>
                            <div className="absolute top-10 left-10 right-10 bottom-10 border-2 border-white/30 border-dashed rounded-2xl pointer-events-none"></div>
                        </div>
                        <div className="p-5 bg-white dark:bg-gray-900 space-y-4">
                            {/* GPS Label */}
                            <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl px-4 py-3 flex items-center gap-3 border border-gray-100 dark:border-white/5 shadow-inner">
                                <Crosshair size={18} className={livePosition ? 'text-emerald-500' : 'text-gray-400 animate-pulse'} />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">GPS Location</p>
                                    {livePosition ? (
                                        <a href={\`https://www.google.com/maps?q=\${livePosition.lat},\${livePosition.lng}\`} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-indigo-600 dark:text-cyan-400 hover:text-indigo-500 font-medium transition">
                                            {livePosition.lat.toFixed(5)}, {livePosition.lng.toFixed(5)}
                                        </a>
                                    ) : (
                                        <span className="text-sm text-gray-500 italic">Waiting for signal...</span>
                                    )}
                                </div>
                            </div>
                            
                            {(attendanceType === 'site_in' || attendanceType === 'check_out') && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                                        {attendanceType === 'site_in' ? 'Client / Site Name' : 'Locational Note'}
                                    </label>
                                    <input type="text" value={locationNote} onChange={(e) => setLocationNote(e.target.value)} placeholder={attendanceType === 'site_in' ? "e.g., Apple Inc." : "e.g., Head Office"} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all outline-none" autoFocus={attendanceType === 'site_in'} />
                                </div>
                            )}
                            
                            <div className="flex justify-center pt-2 pb-2">
                                <button onClick={capturePhoto} className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-gray-200 dark:border-gray-700 flex items-center justify-center active:scale-95 transition-all shadow-lg hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-500/50 group">
                                    <div className="w-14 h-14 rounded-full bg-white dark:bg-white border-2 border-gray-200 dark:border-gray-300 group-hover:scale-95 transition-transform"></div>
                                </button>
                            </div>
                            <p className="text-center text-gray-500 dark:text-gray-400 text-sm pb-1">
                                {attendanceType === 'site_in' ? t.enterSiteName : t.takeSelfie}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="px-6 pt-10 pb-5 bg-white dark:bg-[#1e293b] rounded-b-[2.5rem] shadow-sm border-b border-gray-200 dark:border-white/5 z-10 flex justify-between items-center relative">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] cursor-pointer shadow-md hover:shadow-lg transition-transform hover:scale-105" onClick={handleAvatarClick} title="Profile">
                        <img src={profile?.avatar_url || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${user?.email}\`} alt="Profile" className="w-full h-full rounded-full bg-white dark:bg-gray-800 border-2 border-white dark:border-[#1e293b] object-cover" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-0.5">{t.hello},</p>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-none tracking-tight">
                            {profile?.first_name || 'Team'} <span className="text-amber-500 inline-block animate-[wave_2s_ease-in-out_infinite] origin-bottom-right">👋</span>
                        </h1>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    {(['admin', 'hr', 'manager'].includes((profile?.role || '').toLowerCase())) && (
                        <button onClick={() => onNavigate('admin-dashboard')} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 transition-all shadow-sm active:scale-95" title="Admin Panel">
                            <Shield size={22} strokeWidth={2.5} />
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-5 pb-32 pt-6 scrollbar-hide">

                {/* HOME TAB */}
                {activeTab === 'home' && (
                    <div className="animate-fadeIn space-y-5">
                        {/* Status Card */}
                        <div className="bg-white dark:bg-[#1e293b] rounded-[2rem] p-6 shadow-sm border border-gray-200 dark:border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2"></div>
                            
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1.5">{t.currentStatus}</p>
                                    <div className="flex items-center gap-2.5">
                                        <div className={\`w-2.5 h-2.5 rounded-full \${isCheckedIn ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}\`}></div>
                                        <h2 className={\`text-xl font-bold tracking-tight \${isCheckedIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}\`}>
                                            {isCheckedIn ? t.working : t.notCheckedIn}
                                        </h2>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1.5">{t.today}</p>
                                    <p className="text-xl font-bold font-mono text-gray-900 dark:text-white tracking-widest leading-none bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex justify-center mb-8 relative z-10">
                                <button onClick={() => initiateAttendance(isCheckedIn ? 'check_out' : 'check_in')} className={\`relative w-44 h-44 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl border-4 active:scale-95 \${isCheckedIn ? 'bg-gradient-to-br from-rose-500 to-red-600 hover:shadow-2xl hover:shadow-red-500/30 border-rose-200 dark:border-rose-900 text-white' : 'bg-gradient-to-br from-indigo-500 to-blue-600 hover:shadow-2xl hover:shadow-indigo-500/30 border-indigo-200 dark:border-indigo-900 text-white'}\`}>
                                    <div className="absolute inset-2 rounded-full border border-white/30 border-dashed"></div>
                                    <div className="absolute inset-4 rounded-full border border-white/10"></div>
                                    <Camera size={38} className="mb-2" strokeWidth={2} />
                                    <span className="font-bold text-lg tracking-wider text-shadow-sm">{isCheckedIn ? t.checkOut : t.checkIn}</span>
                                    <div className="mt-2.5 flex items-center text-[10px] font-medium bg-black/20 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-white/90">
                                        <MapPin size={10} className="mr-1" /><span>{t.cameraVerification}</span>
                                    </div>
                                </button>
                            </div>

                            <div className="grid grid-cols-4 divide-x divide-gray-100 dark:divide-gray-800/50 border-t border-gray-100 dark:border-gray-800/50 pt-5 mt-2 relative z-10">
                                <div className="text-center px-1">
                                    <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">{t.inTime}</p>
                                    <p className="font-bold text-gray-900 dark:text-white">{todayLogs.find(l => l.type === 'check_in')?.timestamp ? new Date(todayLogs.find(l => l.type === 'check_in')!.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p>
                                </div>
                                <div className="text-center px-1">
                                    <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">{t.outTime}</p>
                                    <p className="font-bold text-gray-900 dark:text-white">{todayLogs.find(l => l.type === 'check_out')?.timestamp ? new Date(todayLogs.find(l => l.type === 'check_out')!.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p>
                                </div>
                                <div className="text-center px-1">
                                    <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">{t.workingHrs}</p>
                                    <p className="font-bold text-indigo-600 dark:text-indigo-400">{workingHours}</p>
                                </div>
                                <div className="text-center px-1">
                                    <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">ระยะทาง</p>
                                    <p className="font-bold text-gray-900 dark:text-white">{todayDistance > 0 ? todayDistance.toFixed(1) : '0'} <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">km</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-4 gap-3">
                            <button onClick={() => initiateAttendance('site_in')} className="bg-white dark:bg-[#1e293b] p-4 rounded-[1.5rem] shadow-sm border border-gray-200 dark:border-white/5 flex flex-col items-center justify-center gap-2.5 hover:bg-orange-50 dark:hover:bg-gray-800 transition-all group active:scale-95">
                                <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-500/20 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Briefcase size={22} strokeWidth={2.5} /></div>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 text-center leading-tight">เข้างาน<br/>ไซต์ลูกค้า</span>
                            </button>
                            <button onClick={() => initiateAttendance('site_out')} className="bg-white dark:bg-[#1e293b] p-4 rounded-[1.5rem] shadow-sm border border-gray-200 dark:border-white/5 flex flex-col items-center justify-center gap-2.5 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all group active:scale-95">
                                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Building size={22} strokeWidth={2.5} /></div>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 text-center leading-tight">ออกงาน<br/>ไซต์ลูกค้า</span>
                            </button>
                            <button onClick={() => setCurrentView('leave-request')} className="bg-white dark:bg-[#1e293b] p-4 rounded-[1.5rem] shadow-sm border border-gray-200 dark:border-white/5 flex flex-col items-center justify-center gap-2.5 hover:bg-purple-50 dark:hover:bg-gray-800 transition-all group active:scale-95 relative overflow-visible">
                                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/20 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform relative">
                                    <Coffee size={22} strokeWidth={2.5} />
                                    <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[11px] w-6 h-6 rounded-full flex items-center justify-center font-bold border-2 border-white dark:border-[#1e293b] shadow-sm">{leaveBalance.remaining}</div>
                                </div>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 text-center leading-tight">ลางาน<br/>{t.leave}</span>
                            </button>
                            <button onClick={() => alert('ดูสลิปเงินเดือนได้ในเมนู History หรือสอบถาม HR')} className="bg-white dark:bg-[#1e293b] p-4 rounded-[1.5rem] shadow-sm border border-gray-200 dark:border-white/5 flex flex-col items-center justify-center gap-2.5 hover:bg-emerald-50 dark:hover:bg-gray-800 transition-all group active:scale-95">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform"><FileText size={22} strokeWidth={2.5} /></div>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 text-center leading-tight">สลิป<br/>เงินเดือน</span>
                            </button>
                        </div>
                        
                        {profile?.work_shifts && (
                            <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-4 flex items-center justify-center gap-3 shadow-sm">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/30 text-indigo-500 flex items-center justify-center"><Clock size={16} strokeWidth={2.5} /></div>
                                <span className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">เวลาทำงาน: {profile.work_shifts.start_time?.slice(0, 5)} - {profile.work_shifts.end_time?.slice(0, 5)}</span>
                            </div>
                        )}

                        <div className="mt-8">
                            <div className="flex justify-between items-center mb-5 px-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{t.recentActivity}</h3>
                                <button onClick={() => setActiveTab('calendar')} className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-500/20">ดูทั้งหมด</button>
                            </div>
                            <div className="flex flex-col gap-3">
                                {todayLogs.length === 0 && (
                                    <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-8 text-center border border-gray-200 dark:border-white/5 shadow-sm">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-gray-700">
                                            <Calendar size={24} className="text-gray-400 dark:text-gray-500" strokeWidth={2} />
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 font-medium">{t.noActivityToday}</p>
                                    </div>
                                )}
                                {todayLogs.map((log, idx) => {
                                    const dist = getDistanceFromPrevious(todayLogs, idx);
                                    const isCheckInOut = log.type === 'check_in' || log.type === 'check_out';
                                    return (
                                        <div key={log.id} className="bg-white dark:bg-[#1e293b] rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={\`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 \${
                                                    log.type.includes('in') ? 'bg-indigo-50 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-rose-50 text-rose-500 dark:bg-rose-500/20 dark:text-rose-400'
                                                }\`}>
                                                    {isCheckInOut ? <Clock size={20} strokeWidth={2.5} /> : <Building size={20} strokeWidth={2.5} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-900 dark:text-white capitalize text-sm">{log.type.replace('_', ' ')}</h4>
                                                    <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5 truncate flex items-center gap-1.5">
                                                        <span className="font-mono bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded text-[11px] font-semibold">{new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                                        <span className="truncate">{log.location_name}</span>
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <div className={\`text-[11px] font-bold px-2 py-0.5 rounded tracking-wide uppercase \${log.status === 'ontime' ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20' : 'text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20'}\`}>{log.status === 'ontime' ? 'ตรงเวลา' : 'สาย'}</div>
                                                    {dist !== null && dist > 0.01 && (
                                                        <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-100 dark:text-cyan-400 dark:bg-cyan-500/10 dark:border-cyan-500/20 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                                                            <Route size={10} strokeWidth={2.5} /> {dist.toFixed(2)} km
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {/* GPS Coordinates */}
                                            {log.location_lat && log.location_lng && (
                                                <div className="mt-3 ml-16">
                                                    <a href={\`https://www.google.com/maps?q=\${log.location_lat},\${log.location_lng}\`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 rounded-lg text-xs font-mono text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition border border-gray-100 dark:border-gray-700 w-full" title="View on map">
                                                        <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                                                        <span className="truncate">{log.location_lat.toFixed(5)}, {log.location_lng.toFixed(5)}</span>
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
                    <div className="animate-fadeIn space-y-5 pt-2">
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[3px] mb-4 shadow-xl">
                                <img src={profile?.avatar_url || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${user?.email}\`} alt="Profile" className="w-full h-full rounded-full bg-white dark:bg-gray-900 border-4 border-white dark:border-[#1e293b]" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-loose mb-0.5">{profile?.first_name} {profile?.last_name}</h2>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">{profile?.position || 'Employee'}</p>
                            <div className="mt-3 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-[13px] font-bold border border-indigo-200 dark:border-indigo-500/20 shadow-sm">{profile?.department || 'General Department'}</div>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl flex items-center justify-between border border-gray-200 dark:border-white/5 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800/80 flex items-center justify-center border border-gray-100 dark:border-gray-700"><User size={22} className="text-gray-600 dark:text-gray-400" /></div>
                                    <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">{t.employeeId}</p><p className="form-medium text-gray-900 dark:text-white font-mono">{user?.id.slice(0, 8).toUpperCase()}</p></div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl flex items-center justify-between border border-gray-200 dark:border-white/5 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800/80 flex items-center justify-center border border-gray-100 dark:border-gray-700"><Briefcase size={22} className="text-gray-600 dark:text-gray-400" /></div>
                                    <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">{t.role}</p><p className="font-medium text-gray-900 dark:text-white capitalize">{profile?.role}</p></div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl flex items-center justify-between border border-gray-200 dark:border-white/5 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center border border-orange-100 dark:border-orange-500/20"><Coffee size={22} className="text-orange-500" /></div>
                                    <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">{t.leaveBalance}</p><p className="font-medium text-gray-900 dark:text-white"><span className="text-orange-500 font-bold">{leaveBalance.remaining}</span> / {leaveBalance.total} {t.daysRemaining}</p></div>
                                </div>
                            </div>
                            
                            <div className="pt-4 pb-2">
                                <button onClick={() => setShowChangePassword(true)} className="w-full p-4 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex items-center justify-center gap-2 font-bold shadow-sm">
                                    <Lock size={20} /> {t.changePassword}
                                </button>
                                <button onClick={() => signOut()} className="w-full mt-3 p-4 rounded-[1.5rem] bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2 font-bold shadow-sm">
                                    <LogOut size={20} /> ออกจากระบบ
                                </button>
                            </div>
                        </div>

                        {/* Change Password Modal */}
                        {showChangePassword && (
                            <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                                <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-200 dark:border-white/10 shadow-2xl animate-fadeIn">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white"><Lock size={22} className="text-indigo-500" /> เปลี่ยนรหัสผ่าน</h3>
                                        <button onClick={() => { setShowChangePassword(false); setPwForm({ newPassword: '', confirmPassword: '' }); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:text-white transition"><X size={18} /></button>
                                    </div>
                                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3.5 mb-5 shadow-inner">
                                        <p className="text-amber-800 dark:text-amber-300 text-[13px] font-medium flex items-center gap-2"><span>⚠️</span> รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">🔒 รหัสผ่านใหม่</label>
                                            <div className="relative">
                                                <input type={showNewPw ? 'text' : 'password'} value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} placeholder="อย่างน้อย 6 ตัวอักษร" className={\`w-full bg-gray-50 dark:bg-gray-800 border rounded-xl p-3.5 pr-12 text-gray-900 dark:text-white text-sm focus:ring-2 outline-none transition-shadow \${pwForm.newPassword && pwForm.newPassword.length < 6 ? 'border-rose-400 focus:ring-rose-200 dark:border-rose-500 dark:focus:ring-rose-900' : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-900'}\`} />
                                                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">{showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                            </div>
                                            {pwForm.newPassword && pwForm.newPassword.length < 6 && <p className="text-rose-500 dark:text-rose-400 text-xs font-medium mt-1.5 ml-1 flex items-center gap-1"><span>❌</span> ต้องมีอย่างน้อย 6 ตัวอักษร</p>}
                                        </div>
                                        <div>
                                            <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">🔒 ยืนยันรหัสผ่านใหม่</label>
                                            <div className="relative">
                                                <input type={showConfirmPw ? 'text' : 'password'} value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} placeholder="พิมพ์รหัสผ่านอีกครั้ง" className={\`w-full bg-gray-50 dark:bg-gray-800 border rounded-xl p-3.5 pr-12 text-gray-900 dark:text-white text-sm focus:ring-2 outline-none transition-shadow \${pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword ? 'border-rose-400 focus:ring-rose-200 dark:border-rose-500 dark:focus:ring-rose-900' : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-900'}\`} />
                                                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">{showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                            </div>
                                            {pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword && <p className="text-rose-500 dark:text-rose-400 text-xs font-medium mt-1.5 ml-1 flex items-center gap-1"><span>❌</span> รหัสผ่านไม่ตรงกัน</p>}
                                            {pwForm.confirmPassword && pwForm.confirmPassword === pwForm.newPassword && pwForm.newPassword.length >= 6 && <p className="text-emerald-500 dark:text-emerald-400 text-xs font-medium mt-1.5 ml-1 flex items-center gap-1"><span>✅</span> รหัสผ่านตรงกันพร้อมใช้งาน</p>}
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-6 mt-2">
                                        <button onClick={() => { setShowChangePassword(false); setPwForm({ newPassword: '', confirmPassword: '' }); }} className="flex-[0.8] py-3.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 font-bold transition">ยกเลิก</button>
                                        <button onClick={handleChangePassword} disabled={pwLoading || pwForm.newPassword.length < 6 || pwForm.newPassword !== pwForm.confirmPassword} className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none">
                                            <Lock size={18} /> {pwLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full bg-white dark:bg-[#1e293b] border-t border-gray-200 dark:border-white/5 rounded-t-[2rem] px-6 py-3 flex justify-between items-center z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.4)] pb-safe">
                <button onClick={() => { setActiveTab('home'); setCurrentView('dashboard'); }} className={\`flex flex-col items-center gap-1.5 w-16 transition-colors \${activeTab === 'home' && currentView === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}\`} title={t.home}>
                    <MapPin size={24} className={\`transition-transform \${activeTab === 'home' && currentView === 'dashboard' ? 'scale-110' : ''}\`} strokeWidth={activeTab === 'home' && currentView === 'dashboard' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold tracking-wide">{t.home}</span>
                </button>
                <button onClick={() => { setActiveTab('calendar'); setCurrentView('dashboard'); }} className={\`flex flex-col items-center gap-1.5 w-16 transition-colors \${activeTab === 'calendar' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}\`}>
                    <Calendar size={24} className={\`transition-transform \${activeTab === 'calendar' ? 'scale-110' : ''}\`} strokeWidth={activeTab === 'calendar' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold tracking-wide">{t.history}</span>
                </button>
                
                {/* Center Floating Action Button placeholder to keep spacing */}
                <div className="w-16 h-12 relative flex justify-center">
                   <button onClick={() => initiateAttendance(isCheckedIn ? 'check_out' : 'check_in')} className={\`absolute bottom-1 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transform transition-transform hover:scale-105 active:scale-95 border-4 border-gray-50 dark:border-[#0f172a] \${isCheckedIn ? 'bg-gradient-to-tr from-rose-500 to-red-600 shadow-rose-500/30' : 'bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-indigo-500/30'}\`}>
                       <Camera size={26} strokeWidth={2.5} />
                   </button>
                </div>
                
                <button onClick={() => setCurrentView('leave-request')} className={\`flex flex-col items-center gap-1.5 w-16 transition-colors \${currentView === 'leave-request' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}\`}>
                    <FileText size={24} className={\`transition-transform \${currentView === 'leave-request' ? 'scale-110' : ''}\`} strokeWidth={currentView === 'leave-request' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold tracking-wide">{t.requests}</span>
                </button>
                <button onClick={() => { setActiveTab('profile'); setCurrentView('dashboard'); }} className={\`flex flex-col items-center gap-1.5 w-16 transition-colors \${activeTab === 'profile' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}\`}>
                    <User size={24} className={\`transition-transform \${activeTab === 'profile' ? 'scale-110' : ''}\`} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold tracking-wide">{t.me}</span>
                </button>
            </nav>
        </div>
`;

txt = txt.substring(0, startIndex) + replacement + txt.substring(endIndex);

fs.writeFileSync(file, txt, 'utf8');
console.log('Update finished!');
