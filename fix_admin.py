with open("src/components/AdminDashboard.tsx", "r") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if i == 419 - 1:
        new_lines.append("""      {/* TABS NAVIGATION & CONTROL AREA */}
      <div className="flex flex-col gap-6 items-start">
        {/* Top Horizontal Tab Buttons */}
        <div className="w-full bg-white/5 border border-white/10 p-2.5 rounded-2xl overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-[10px] font-bold text-white/40 tracking-wider uppercase px-3 hidden md:block">Console Submenus</span>
            
            <button
              onClick={() => setActiveSubTab("time")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-none outline-none whitespace-nowrap ${
                activeSubTab === "time"
                  ? "bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-extrabold shadow-md"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Calendar size={14} className={activeSubTab === "time" ? "text-black" : "text-amber-400"} />
              <span>Time Travel</span>
            </button>
            
            <button
              onClick={() => setActiveSubTab("nominations")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-none outline-none whitespace-nowrap ${
                activeSubTab === "nominations"
                  ? "bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-extrabold shadow-md"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <FileText size={14} className={activeSubTab === "nominations" ? "text-black" : "text-amber-400"} />
              <span>Nomination Desk</span>
              {pendingNominations > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono ml-1 ${activeSubTab === "nominations" ? "bg-black text-amber-400" : "bg-amber-400 text-black animate-pulse"}`}>
                  {pendingNominations}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab("manage_nominees")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-none outline-none whitespace-nowrap ${
                activeSubTab === "manage_nominees"
                  ? "bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-extrabold shadow-md"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <User size={14} className={activeSubTab === "manage_nominees" ? "text-black" : "text-amber-400"} />
              <span>Manage Nominees</span>
            </button>

            <button
              onClick={() => setActiveSubTab("ballots")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-none outline-none whitespace-nowrap ${
                activeSubTab === "ballots"
                  ? "bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-extrabold shadow-md"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <BarChart3 size={14} className={activeSubTab === "ballots" ? "text-black" : "text-amber-400"} />
              <span>Ballots & Standings</span>
            </button>

            <button
              onClick={() => setActiveSubTab("guestbook")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-none outline-none whitespace-nowrap ${
                activeSubTab === "guestbook"
                  ? "bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-extrabold shadow-md"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <MessageSquare size={14} className={activeSubTab === "guestbook" ? "text-black" : "text-amber-400"} />
              <span>Guestbook</span>
            </button>

            <button
              onClick={() => setActiveSubTab("schedule")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-none outline-none whitespace-nowrap ${
                activeSubTab === "schedule"
                  ? "bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-extrabold shadow-md"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
              id="admin-subtab-schedule-btn"
            >
              <Sliders size={14} className={activeSubTab === "schedule" ? "text-black" : "text-amber-400"} />
              <span>Event Schedule</span>
            </button>
            
            <button
              onClick={() => setActiveSubTab("settings")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-none outline-none whitespace-nowrap ${
                activeSubTab === "settings"
                  ? "bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-extrabold shadow-md"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
              id="admin-subtab-settings-btn"
            >
              <Shield size={14} className={activeSubTab === "settings" ? "text-black" : "text-amber-400"} />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Working Content Area */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
""")
    elif i >= 419 and i < 519:
        pass
    else:
        new_lines.append(line)

with open("src/components/AdminDashboard.tsx", "w") as f:
    f.writelines(new_lines)

print("Replaced lines")
