/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Shield, 
  Calendar, 
  FileText, 
  Vote, 
  Trophy, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  User, 
  Mail, 
  Trash2, 
  RefreshCw, 
  Sliders, 
  ChevronRight, 
  BarChart3,
  Flame,
  Plus,
  LayoutGrid,
  List
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Cell
} from "recharts";
import { Category, Nominee, Nomination, Message, SystemPhase, TimelineSettings } from "../types";
import { formatDateTime } from "../utils";
import { parseLocalDateTime } from "../utils";

// Custom high-contrast tooltip for Recharts matching Admin console theme
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#121212] border border-white/15 p-3 rounded-xl shadow-xl space-y-1 backdrop-blur-md">
        <p className="text-[11px] font-bold text-white font-sans">{payload[0].payload.fullName}</p>
        <p className="text-xs text-amber-400 font-mono font-black">
          {payload[0].value.toLocaleString()} votes
        </p>
      </div>
    );
  }
  return null;
};

interface AdminDashboardProps {
  categories: Category[];
  nominees: Nominee[];
  nominations: Nomination[];
  guestbookMessages: Message[];
  simulatedDate: Date;
  currentPhase: SystemPhase;
  phaseLabel: string;
  timelineSettings: TimelineSettings;
  onUpdateTimelineSettings: (settings: TimelineSettings) => void;
  onSetSimulatedDate: (date: Date) => void;
  onToggleApproveNomination: (id: string) => void;
  onDeleteNomination: (id: string) => void;
  onUpdateNomineeVotes: (id: string, votes: number) => void;
  onDeleteMessage: (id: string) => void;
  onResetAllData: () => void;
  onBulkSeedVotes: () => void;
  onAddNominee: (nominee: Nominee) => void;
  onUpdateNominee: (id: string, data: Partial<Nominee>) => void;
  onDeleteNominee: (id: string) => void;
  adminCreds: {email: string, password: string};
  onUpdateAdminCreds: (creds: {email: string, password: string}) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  categories,
  nominees,
  nominations,
  guestbookMessages,
  simulatedDate,
  currentPhase,
  phaseLabel,
  timelineSettings,
  onUpdateTimelineSettings,
  onSetSimulatedDate,
  onToggleApproveNomination,
  onDeleteNomination,
  onUpdateNomineeVotes,
  onDeleteMessage,
  onResetAllData,
  onBulkSeedVotes,
  onAddNominee,
  onUpdateNominee,
  onDeleteNominee,
  adminCreds,
  onUpdateAdminCreds
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"time" | "nominations" | "manage_nominees" | "ballots" | "guestbook" | "schedule" | "settings">("time");
  const [customDateStr, setCustomDateStr] = useState(simulatedDate.toISOString().split("T")[0]);
  const [selectedNominationId, setSelectedNominationId] = useState<string | null>(null);

  // Schedule manager form states
  const [formAnnouncementStart, setFormAnnouncementStart] = useState(timelineSettings.announcementStart.slice(0, 16));
  const [formAnnouncementEnd, setFormAnnouncementEnd] = useState(timelineSettings.announcementEnd.slice(0, 16));
  const [formNominationStart, setFormNominationStart] = useState(timelineSettings.nominationStart.slice(0, 16));
  const [formNominationEnd, setFormNominationEnd] = useState(timelineSettings.nominationEnd.slice(0, 16));
  const [formVotingStart, setFormVotingStart] = useState(timelineSettings.votingStart.slice(0, 16));
  const [formVotingEnd, setFormVotingEnd] = useState(timelineSettings.votingEnd.slice(0, 16));
  const [formCeremony, setFormCeremony] = useState(timelineSettings.ceremony.slice(0, 16));

  const [formAdminEmail, setFormAdminEmail] = useState(adminCreds.email);
  const [formAdminPassword, setFormAdminPassword] = useState(adminCreds.password);
  const [adminCredsSuccess, setAdminCredsSuccess] = useState("");

  const [newNomineeName, setNewNomineeName] = useState("");
  const [newNomineeCategory, setNewNomineeCategory] = useState(categories[0]?.id || 1);
  const [newNomineePicture, setNewNomineePicture] = useState("");
  const [newNomineeDesc, setNewNomineeDesc] = useState("");
  const [newNomineeSuccess, setNewNomineeSuccess] = useState("");
  const [editingNomineeId, setEditingNomineeId] = useState<string | null>(null);
  const [nomineeViewMode, setNomineeViewMode] = useState<"grid" | "list">("grid");

  const [successMessage, setSuccessMessage] = useState("");
  const [validationError, setValidationError] = useState("");
  const [nominationToDelete, setNominationToDelete] = useState<string | null>(null);

  // Nomination Desk Filters
  const [nominationSearch, setNominationSearch] = useState("");
  const [nominationStatusFilter, setNominationStatusFilter] = useState<"all" | "approved" | "pending">("all");
  const [nominationCategoryFilter, setNominationCategoryFilter] = useState<string>("all");
  const [nominationSortBy, setNominationSortBy] = useState<"date" | "name">("date");

  React.useEffect(() => {
    setFormAnnouncementStart(timelineSettings.announcementStart.slice(0, 16));
    setFormAnnouncementEnd(timelineSettings.announcementEnd.slice(0, 16));
    setFormNominationStart(timelineSettings.nominationStart.slice(0, 16));
    setFormNominationEnd(timelineSettings.nominationEnd.slice(0, 16));
    setFormVotingStart(timelineSettings.votingStart.slice(0, 16));
    setFormVotingEnd(timelineSettings.votingEnd.slice(0, 16));
    setFormCeremony(timelineSettings.ceremony.slice(0, 16));
  }, [timelineSettings]);

  // Stats calculation
  const totalCustomNominations = nominations.length;
  const approvedNominations = nominations.filter((n) => n.approved).length;
  const pendingNominations = nominations.filter((n) => !n.approved).length;

  // Filter & Sort Nominations
  const filteredNominations = nominations
    .filter((nom) => {
      // Search
      const searchStr = nominationSearch.toLowerCase();
      const matchesSearch = 
        nom.nomineeName.toLowerCase().includes(searchStr);
      
      // Status
      const matchesStatus = 
        nominationStatusFilter === "all" ? true :
        nominationStatusFilter === "approved" ? nom.approved : !nom.approved;
        
      // Category
      const matchesCategory = 
        nominationCategoryFilter === "all" ? true :
        nom.categoryId.toString() === nominationCategoryFilter;
        
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      if (nominationSortBy === "date") {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      } else {
        return a.nomineeName.localeCompare(b.nomineeName);
      }
    });

  const totalVotesCast = nominees.reduce((sum, n) => sum + n.votes, 0);
  const totalCommentsCount = guestbookMessages.length;

  // Data for the category vote distribution bar chart
  const chartData = categories.map((cat) => {
    const categoryNominees = nominees.filter((n) => n.categoryId === cat.id);
    const totalCatVotes = categoryNominees.reduce((sum, n) => sum + n.votes, 0);
    return {
      name: cat.name.length > 20 ? `${cat.name.slice(0, 18)}...` : cat.name,
      fullName: cat.name,
      Votes: totalCatVotes,
    };
  });

  const handlePresetSelect = (preset: "PRE_NOM" | "NOM" | "VOTE" | "RESULTS") => {
    let dateObj = new Date();
    if (preset === "PRE_NOM") {
      const annStart = parseLocalDateTime(timelineSettings.announcementStart);
      dateObj = new Date(annStart.getTime() + 12 * 60 * 60 * 1000); // 12 hours after announcement start
    } else if (preset === "NOM") {
      const nomStart = parseLocalDateTime(timelineSettings.nominationStart);
      dateObj = new Date(nomStart.getTime() + 12 * 60 * 60 * 1000); // 12 hours after nomination start
    } else if (preset === "VOTE") {
      const voteStart = parseLocalDateTime(timelineSettings.votingStart);
      dateObj = new Date(voteStart.getTime() + 12 * 60 * 60 * 1000); // 12 hours after voting start
    } else if (preset === "RESULTS") {
      const voteEnd = parseLocalDateTime(timelineSettings.votingEnd);
      dateObj = new Date(voteEnd.getTime() + 12 * 60 * 60 * 1000); // 12 hours after voting closes
    }
    
    onSetSimulatedDate(dateObj);
    
    // Format custom date string as YYYY-MM-DD
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    setCustomDateStr(`${year}-${month}-${day}`);
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomDateStr(val);
    if (val) {
      const parsed = new Date(`${val}T12:00:00`);
      if (!isNaN(parsed.getTime())) {
        onSetSimulatedDate(parsed);
      }
    }
  };

  const handleCreateNominee = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNomineeId) {
      onUpdateNominee(editingNomineeId, {
        categoryId: newNomineeCategory,
        name: newNomineeName,
        description: newNomineeDesc || "Added by Admin",
        avatarUrl: newNomineePicture,
      });
      setNewNomineeSuccess("Nominee updated successfully!");
    } else {
      onAddNominee({
        id: crypto.randomUUID(),
        categoryId: newNomineeCategory,
        name: newNomineeName,
        description: newNomineeDesc || "Added by Admin",
        avatarUrl: newNomineePicture,
        votes: 0
      });
      setNewNomineeSuccess("Nominee created successfully!");
    }
    setNewNomineeName("");
    setNewNomineePicture("");
    setNewNomineeDesc("");
    setEditingNomineeId(null);
    setTimeout(() => setNewNomineeSuccess(""), 3000);
  };

  const handleAdminCredsSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAdminCreds({
      email: formAdminEmail,
      password: formAdminPassword
    });
    setAdminCredsSuccess("Admin credentials updated successfully!");
    setTimeout(() => setAdminCredsSuccess(""), 3000);
  };

  const handleScheduleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setSuccessMessage("");

    const annStartVal = new Date(formAnnouncementStart).getTime();
    const annEndVal = new Date(formAnnouncementEnd).getTime();
    const nomStartVal = new Date(formNominationStart).getTime();
    const nomEndVal = new Date(formNominationEnd).getTime();
    const votingStartVal = new Date(formVotingStart).getTime();
    const votingEndVal = new Date(formVotingEnd).getTime();
    const ceremonyVal = new Date(formCeremony).getTime();

    if (annEndVal <= annStartVal) {
      setValidationError("Announcement end date must be after announcement start date.");
      return;
    }
    if (nomStartVal < annEndVal) {
      setValidationError("Nomination start date must be after or equal to announcement end date.");
      return;
    }
    if (nomEndVal <= nomStartVal) {
      setValidationError("Nomination end date must be after nomination start date.");
      return;
    }
    if (votingStartVal < nomEndVal) {
      setValidationError("Voting start date must be after or equal to nomination end date.");
      return;
    }
    if (votingEndVal <= votingStartVal) {
      setValidationError("Voting end date must be after voting start date.");
      return;
    }
    if (ceremonyVal < votingEndVal) {
      setValidationError("Ceremony date must be after or equal to voting end date.");
      return;
    }

    onUpdateTimelineSettings({
      announcementStart: formAnnouncementStart.length === 16 ? formAnnouncementStart + ":00" : formAnnouncementStart,
      announcementEnd: formAnnouncementEnd.length === 16 ? formAnnouncementEnd + ":00" : formAnnouncementEnd,
      nominationStart: formNominationStart.length === 16 ? formNominationStart + ":00" : formNominationStart,
      nominationEnd: formNominationEnd.length === 16 ? formNominationEnd + ":00" : formNominationEnd,
      votingStart: formVotingStart.length === 16 ? formVotingStart + ":00" : formVotingStart,
      votingEnd: formVotingEnd.length === 16 ? formVotingEnd + ":00" : formVotingEnd,
      ceremony: formCeremony.length === 16 ? formCeremony + ":00" : formCeremony,
    });

    setSuccessMessage("Award timeline dates and schedules updated successfully!");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const selectedNomination = nominations.find((n) => n.id === selectedNominationId);

  return (
    <div className="space-y-8" id="admin-dashboard-container">
      {/* SECTION HEADING */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Shield size={28} />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold block mb-1">
              SYSTEM CONTROL CENTER
            </span>
            <h2 className="text-2xl font-black text-white">
              Administrator Platform Console
            </h2>
            <p className="text-xs text-white/60 mt-0.5 leading-relaxed max-w-xl">
              Monitor real-time ballot data, approve custom user nominations, moderate guestbook congratulations, and perform phase time-travel simulations.
            </p>
          </div>
        </div>
      </div>

      {/* METRICS HUD GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="admin-metrics-hud">
        {/* Metric 1 */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <span className="text-[10px] text-white/50 font-mono uppercase tracking-wider block">Simulated Date</span>
            <span className="text-lg font-black text-white block">
              {simulatedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full">
              <Clock size={10} />
              {phaseLabel}
            </span>
          </div>
          <div className="p-3 bg-white/5 border border-white/5 text-amber-400 rounded-xl">
            <Calendar size={20} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <span className="text-[10px] text-white/50 font-mono uppercase tracking-wider block">Custom Submissions</span>
            <span className="text-3xl font-black text-white block font-mono">
              {totalCustomNominations}
            </span>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-emerald-400 font-bold">{approvedNominations} Approved</span>
              <span className="text-white/30">•</span>
              <span className="text-amber-400 font-bold">{pendingNominations} Pending</span>
            </div>
          </div>
          <div className="p-3 bg-white/5 border border-white/5 text-amber-400 rounded-xl">
            <FileText size={20} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <span className="text-[10px] text-white/50 font-mono uppercase tracking-wider block">Total Ballot Votes</span>
            <span className="text-3xl font-black text-white block font-mono">
              {totalVotesCast.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full">
              <TrendingUp size={10} />
              Live Ledger Status
            </span>
          </div>
          <div className="p-3 bg-white/5 border border-white/5 text-amber-400 rounded-xl">
            <Vote size={20} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <span className="text-[10px] text-white/50 font-mono uppercase tracking-wider block">Congratulations Ledger</span>
            <span className="text-3xl font-black text-white block font-mono">
              {totalCommentsCount}
            </span>
            <span className="text-[10px] text-white/40 block leading-none">
              Published Guestbook Messages
            </span>
          </div>
          <div className="p-3 bg-white/5 border border-white/5 text-amber-400 rounded-xl">
            <MessageSquare size={20} />
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION & CONTROL AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side Tab Buttons */}
        <div className="lg:col-span-3 space-y-2 bg-white/5 border border-white/10 p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-white/40 tracking-wider uppercase px-2 block mb-2">Console Submenus</span>
          <button
            onClick={() => setActiveSubTab("time")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer border-none outline-none ${
              activeSubTab === "time"
                ? "bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-extrabold shadow-md"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Calendar size={14} className={activeSubTab === "time" ? "text-black" : "text-amber-400"} />
            <span>Time Travel Machine</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab("nominations")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer border-none outline-none ${
              activeSubTab === "nominations"
                ? "bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-extrabold shadow-md"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText size={14} className={activeSubTab === "nominations" ? "text-black" : "text-amber-400"} />
              <span>Nomination Desk</span>
            </div>
            {pendingNominations > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold font-mono ${activeSubTab === "nominations" ? "bg-black text-amber-400" : "bg-amber-400 text-black animate-pulse"}`}>
                {pendingNominations}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab("manage_nominees")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer border-none outline-none ${
              activeSubTab === "manage_nominees"
                ? "bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-extrabold shadow-md"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <User size={14} className={activeSubTab === "manage_nominees" ? "text-black" : "text-amber-400"} />
            <span>Manage Nominees</span>
          </button>

          <button
            onClick={() => setActiveSubTab("ballots")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer border-none outline-none ${
              activeSubTab === "ballots"
                ? "bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-extrabold shadow-md"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <BarChart3 size={14} className={activeSubTab === "ballots" ? "text-black" : "text-amber-400"} />
            <span>Ballot & Standings Desk</span>
          </button>

          <button
            onClick={() => setActiveSubTab("guestbook")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer border-none outline-none ${
              activeSubTab === "guestbook"
                ? "bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-extrabold shadow-md"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <MessageSquare size={14} className={activeSubTab === "guestbook" ? "text-black" : "text-amber-400"} />
            <span>Guestbook Moderation</span>
          </button>

          <button
            onClick={() => setActiveSubTab("schedule")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer border-none outline-none ${
              activeSubTab === "schedule"
                ? "bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-extrabold shadow-md"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
            id="admin-subtab-schedule-btn"
          >
            <Sliders size={14} className={activeSubTab === "schedule" ? "text-black" : "text-amber-400"} />
            <span>Event Schedule Settings</span>
          </button>

          <button
            onClick={() => setActiveSubTab("settings")}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer border-none outline-none ${
              activeSubTab === "settings"
                ? "bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-extrabold shadow-md"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
            id="admin-subtab-settings-btn"
          >
            <Shield size={14} className={activeSubTab === "settings" ? "text-black" : "text-amber-400"} />
            <span>Admin Settings</span>
          </button>
        </div>

        {/* Right Side Working Content */}
        <div className="lg:col-span-9 bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
          
          {/* TAB 1: TIME TRAVEL MACHINE */}
          {activeSubTab === "time" && (
            <div className="space-y-6" id="admin-subtab-time">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Calendar size={18} className="text-amber-400" />
                  <span>Time Machine Simulator</span>
                </h3>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Shift the simulated calendar forward or backward to test how the entire application dynamically responds. Different features open or close depending on the active phase.
                </p>
              </div>

              {/* Status Visual Indicator */}
              <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider block">Active Mode</span>
                  <span className="text-sm font-bold text-amber-400 block mt-0.5">{phaseLabel}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider block">Simulated Timestamp</span>
                  <span className="text-xs text-white font-mono block mt-0.5">{simulatedDate.toLocaleString()}</span>
                </div>
              </div>

              {/* Presets Grid */}
              <div className="space-y-3">
                <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider block">Phase Presets</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Preset 1 */}
                  <button
                    onClick={() => handlePresetSelect("PRE_NOM")}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      currentPhase === SystemPhase.PRE_NOMINATION
                        ? "bg-amber-400/10 border-amber-400 text-white"
                        : "bg-black/20 border-white/10 text-white/60 hover:border-white/20"
                    }`}
                  >
                    <span className="text-[9px] font-mono block text-white/40">PHASE 1</span>
                    <strong className="text-xs font-black block text-amber-400 mt-1">Pre-Nomination</strong>
                    <span className="text-[10px] text-white/50 block mt-0.5">{timelineSettings ? formatDateTime(timelineSettings.announcementStart, "short") : "July 9, 2026"}</span>
                  </button>

                  {/* Preset 2 */}
                  <button
                    onClick={() => handlePresetSelect("NOM")}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      currentPhase === SystemPhase.NOMINATION
                        ? "bg-amber-400/10 border-amber-400 text-white"
                        : "bg-black/20 border-white/10 text-white/60 hover:border-white/20"
                    }`}
                  >
                    <span className="text-[9px] font-mono block text-white/40">PHASE 2</span>
                    <strong className="text-xs font-black block text-amber-400 mt-1">Nomination Window</strong>
                    <span className="text-[10px] text-white/50 block mt-0.5">{timelineSettings ? formatDateTime(timelineSettings.nominationStart, "short") : "July 15, 2026"}</span>
                  </button>

                  {/* Preset 3 */}
                  <button
                    onClick={() => handlePresetSelect("VOTE")}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      currentPhase === SystemPhase.VOTING
                        ? "bg-amber-400/10 border-amber-400 text-white"
                        : "bg-black/20 border-white/10 text-white/60 hover:border-white/20"
                    }`}
                  >
                    <span className="text-[9px] font-mono block text-white/40">PHASE 3</span>
                    <strong className="text-xs font-black block text-amber-400 mt-1">Voting Period</strong>
                    <span className="text-[10px] text-white/50 block mt-0.5">{timelineSettings ? formatDateTime(timelineSettings.votingStart, "short") : "August 10, 2026"}</span>
                  </button>

                  {/* Preset 4 */}
                  <button
                    onClick={() => handlePresetSelect("RESULTS")}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      currentPhase === SystemPhase.RESULTS
                        ? "bg-amber-400/10 border-amber-400 text-white"
                        : "bg-black/20 border-white/10 text-white/60 hover:border-white/20"
                    }`}
                  >
                    <span className="text-[9px] font-mono block text-white/40">PHASE 4</span>
                    <strong className="text-xs font-black block text-amber-400 mt-1">Live Results & Gala</strong>
                    <span className="text-[10px] text-white/50 block mt-0.5">{timelineSettings ? formatDateTime(timelineSettings.votingEnd, "short") : "August 28, 2026"}</span>
                  </button>
                </div>
              </div>

              {/* Custom Manual Input */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <label className="text-[10px] text-white/50 font-bold uppercase tracking-wider block" htmlFor="custom-sim-date">
                  Or Pick Specific Date Manual Tweak
                </label>
                <div className="flex items-center gap-3 max-w-sm">
                  <input
                    type="date"
                    id="custom-sim-date"
                    value={customDateStr}
                    onChange={handleCustomDateChange}
                    className="flex-grow bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-white/40 font-mono">12:00:00 PM</span>
                </div>
              </div>

              {/* Phase explanations */}
              <div className="bg-amber-400/5 border border-amber-400/10 rounded-xl p-4 space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide block">Dynamic Phase Rules Checklist:</span>
                <ul className="text-[11px] text-white/70 space-y-1.5 list-disc pl-4">
                  <li><strong>Pre-Nomination (Before July 10)</strong>: Portal introduces categories, shows the Chairman's official announcement letter, but submissions are closed.</li>
                  <li><strong>Nomination Phase (July 10 – July 30)</strong>: Custom nomination forms are unlocked. Users can submit entries. Administrators can moderate and approve them from here.</li>
                  <li><strong>Voting Period (July 31 – August 25)</strong>: Approved nominations are automatically added alongside initial candidates into the live voting center ballot lists. Users can cast votes.</li>
                  <li><strong>Results Mode (After August 25)</strong>: Voting is closed, and live vote shares, gold badges, and final standings are calculated alongside guestbook congratulatory logs.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: NOMINATION DESK */}
          {activeSubTab === "nominations" && (
            <div className="space-y-6" id="admin-subtab-nominations">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <FileText size={18} className="text-amber-400" />
                    <span>Nomination Moderation Desk</span>
                  </h3>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">
                    Review and authorize user submissions. Approved nominations automatically become live contenders in the voting section.
                  </p>
                </div>
                
                <span className="bg-white/5 text-white/70 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono">
                  Total Submissions: {totalCustomNominations}
                </span>
              </div>

              {nominations.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Search</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search names..."
                        value={nominationSearch}
                        onChange={(e) => setNominationSearch(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all outline-none placeholder-white/30"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Status</label>
                    <select
                      value={nominationStatusFilter}
                      onChange={(e) => setNominationStatusFilter(e.target.value as any)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all outline-none appearance-none"
                    >
                      <option value="all">All Submissions</option>
                      <option value="pending">Pending Approval</option>
                      <option value="approved">Approved</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Category</label>
                    <select
                      value={nominationCategoryFilter}
                      onChange={(e) => setNominationCategoryFilter(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all outline-none appearance-none"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Sort</label>
                    <select
                      value={nominationSortBy}
                      onChange={(e) => setNominationSortBy(e.target.value as any)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all outline-none appearance-none"
                    >
                      <option value="date">Date (Newest)</option>
                      <option value="name">Name (A-Z)</option>
                    </select>
                  </div>
                </div>
              )}

              {nominations.length === 0 ? (
                <div className="text-center py-12 bg-black/20 border border-white/5 rounded-xl space-y-3">
                  <FileText className="mx-auto text-white/20" size={32} />
                  <p className="text-xs text-white/40 font-medium">No custom nominations have been submitted yet.</p>
                  <p className="text-[10px] text-white/30 max-w-xs mx-auto">
                    Go to the <strong>Nomination Portal</strong>, submit a sandbox entry, and it will show up here immediately for moderation.
                  </p>
                </div>
              ) : filteredNominations.length === 0 ? (
                <div className="text-center py-12 bg-black/20 border border-white/5 rounded-xl space-y-3">
                  <FileText className="mx-auto text-white/20" size={32} />
                  <p className="text-xs text-white/40 font-medium">No nominations match the current filters.</p>
                  <button 
                    onClick={() => { setNominationSearch(''); setNominationStatusFilter('all'); setNominationCategoryFilter('all'); setNominationSortBy('date'); }}
                    className="mt-2 text-xs text-amber-400 hover:text-amber-300"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Column: Submissions List */}
                  <div className="md:col-span-5 space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {filteredNominations.map((nom) => {
                      const catName = categories.find((c) => c.id === nom.categoryId)?.name || "Unknown";
                      const isSelected = selectedNominationId === nom.id;
                      return (
                        <div
                          key={nom.id}
                          onClick={() => setSelectedNominationId(nom.id)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all space-y-1.5 relative ${
                            isSelected 
                              ? "bg-amber-400/10 border-amber-400" 
                              : "bg-black/20 border-white/5 hover:border-white/10"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono text-white/40 block">
                              {new Date(nom.submittedAt).toLocaleDateString()}
                            </span>
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              nom.approved 
                                ? "bg-emerald-400/15 text-emerald-400 border border-emerald-400/20" 
                                : "bg-amber-400/15 text-amber-400 border border-amber-400/20"
                            }`}>
                              {nom.approved ? "Approved" : "Pending"}
                            </span>
                          </div>
                          
                          <strong className="text-xs text-white block truncate">{nom.nomineeName}</strong>
                          <span className="text-[10px] text-white/50 block truncate">{catName}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Column: Submission Detail Panel */}
                  <div className="md:col-span-7">
                    {selectedNomination ? (
                      <div className="bg-black/40 border border-white/5 rounded-xl p-5 space-y-5 animate-fade-in">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[9px] font-mono text-white/40 block">NOMINEE DESIGNATION</span>
                            <h4 className="text-base font-extrabold text-amber-400 mt-0.5">{selectedNomination.nomineeName}</h4>
                            <span className="text-xs text-white/70 block mt-1">
                              Category: <strong className="text-white font-semibold">
                                {categories.find((c) => c.id === selectedNomination.categoryId)?.name}
                              </strong>
                            </span>
                          </div>

                          <div className="flex gap-1">
                            <button
                              onClick={() => onToggleApproveNomination(selectedNomination.id)}
                              className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                                selectedNomination.approved
                                  ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/20"
                                  : "bg-amber-400/10 border-amber-400/20 text-amber-400 hover:bg-amber-400/20"
                              }`}
                              title={selectedNomination.approved ? "Disapprove Entry" : "Approve Entry"}
                            >
                              {selectedNomination.approved ? <CheckCircle size={15} /> : <XCircle size={15} />}
                            </button>
                            <button
                              onClick={() => {
                                setNominationToDelete(selectedNomination.id);
                              }}
                              className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 cursor-pointer transition-colors"
                              title="Delete Submission"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Rationale and text blocks */}
                        <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5 text-xs">
                          <div className="space-y-1">
                            <span className="text-[9px] text-white/40 uppercase font-mono tracking-wider">Rationale & Achievements</span>
                            <p className="text-white/80 leading-relaxed italic">
                              "{selectedNomination.rationale}"
                            </p>
                          </div>
                          
                          <div className="pt-3 border-t border-white/5 grid grid-cols-2 gap-4 text-[11px]">
                            <div>
                              <span className="text-[9px] text-white/40 uppercase font-mono block">Nominator</span>
                              <strong className="text-white block mt-0.5">{selectedNomination.nominatorName}</strong>
                              <span className="text-[10px] text-white/50 block font-mono">{selectedNomination.nominatorEmail}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-white/40 uppercase font-mono block">Contact Details</span>
                              <span className="text-white/80 block mt-0.5">{selectedNomination.nomineeContact || "No contact info"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Approved candidate note */}
                        {selectedNomination.approved ? (
                          <div className="bg-emerald-400/5 border border-emerald-400/10 text-emerald-400 rounded-xl p-3.5 text-[11px] flex items-center gap-2">
                            <CheckCircle size={14} />
                            <span>This nominee is <strong>authorized</strong> and will dynamically appear in the <strong>Voting Center</strong> during the voting period.</span>
                          </div>
                        ) : (
                          <div className="bg-amber-400/5 border border-amber-400/10 text-amber-400 rounded-xl p-3.5 text-[11px] flex items-center gap-2">
                            <Clock size={14} />
                            <span>This submission is <strong>pending authorization</strong>. Approve it to let users vote on this candidate.</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center p-8 border border-dashed border-white/10 rounded-xl bg-black/10">
                        <span className="text-xs text-white/30 font-medium">Select a nomination from the list to review details</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: MANAGE NOMINEES */}
          {activeSubTab === "manage_nominees" && (
            <div className="space-y-6 animate-fade-in" id="admin-subtab-manage-nominees">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <User size={18} className="text-amber-400" />
                  <span>{editingNomineeId ? "Edit Nominee" : "Create Nominee"}</span>
                </h3>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  {editingNomineeId ? "Update the details of the selected nominee." : "Add a new nominee to the live voting pool manually."}
                </p>
              </div>

              {newNomineeSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl flex items-center gap-2.5 animate-fade-in">
                  <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                  <span>{newNomineeSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateNominee} className="space-y-6 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-white block">
                      Award Category
                    </label>
                    <select
                      value={newNomineeCategory}
                      onChange={(e) => setNewNomineeCategory(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#121212]">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Name */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-white block">
                      Nominee Name
                    </label>
                    <input
                      type="text"
                      value={newNomineeName}
                      onChange={(e) => setNewNomineeName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all"
                      required
                    />
                  </div>

                  {/* Picture */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-white block">
                      Picture (Optional)
                    </label>
                    <div className="flex gap-4 items-center">
                      {newNomineePicture && (
                        <img src={newNomineePicture} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-white/10 bg-black/40 shrink-0" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement("canvas");
                                const MAX_WIDTH = 400;
                                const MAX_HEIGHT = 400;
                                let width = img.width;
                                let height = img.height;
                                
                                if (width > height) {
                                  if (width > MAX_WIDTH) {
                                    height = Math.round((height * MAX_WIDTH) / width);
                                    width = MAX_WIDTH;
                                  }
                                } else {
                                  if (height > MAX_HEIGHT) {
                                    width = Math.round((width * MAX_HEIGHT) / height);
                                    height = MAX_HEIGHT;
                                  }
                                }
                                
                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext("2d");
                                ctx?.drawImage(img, 0, 0, width, height);
                                setNewNomineePicture(canvas.toDataURL("image/webp", 0.8));
                              };
                              img.src = reader.result as string;
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all file:bg-amber-400 file:text-black file:border-0 file:px-3 file:py-1 file:rounded-lg file:mr-4 file:font-bold file:text-xs file:cursor-pointer hover:file:bg-amber-500"
                      />
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-white block">
                      Description / Organization (Optional)
                    </label>
                    <textarea
                      value={newNomineeDesc}
                      onChange={(e) => setNewNomineeDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex gap-3">
                  <button
                    type="submit"
                    className="bg-amber-400 hover:bg-amber-500 text-black px-5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-md shadow-amber-400/10 flex items-center gap-2"
                  >
                    {editingNomineeId ? <RefreshCw size={14} /> : <Plus size={14} />}
                    {editingNomineeId ? "Update Nominee" : "Add Nominee to Pool"}
                  </button>
                  {editingNomineeId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNomineeId(null);
                        setNewNomineeName("");
                        setNewNomineePicture("");
                        setNewNomineeDesc("");
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
              
              <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-sm font-bold text-white">Existing Nominees</h4>
                  <div className="flex bg-black/40 border border-white/10 rounded-lg p-1">
                    <button 
                      type="button"
                      onClick={() => setNomineeViewMode("grid")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${nomineeViewMode === "grid" ? "bg-white/10 text-white" : "text-white/50 hover:text-white"}`}
                    >
                      <LayoutGrid size={14} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNomineeViewMode("list")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${nomineeViewMode === "list" ? "bg-white/10 text-white" : "text-white/50 hover:text-white"}`}
                    >
                      <List size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-10">
                  {categories.filter(c => nominees.some(n => n.categoryId === c.id)).map(category => (
                    <div key={category.id} className="space-y-4">
                      <h5 className="text-[11px] font-extrabold text-amber-400 uppercase tracking-widest border-b border-white/10 pb-2">
                        {category.name}
                      </h5>
                      
                      {nomineeViewMode === "list" ? (
                        <div className="space-y-3">
                          {nominees.filter(n => n.categoryId === category.id).map((n) => (
                            <div key={n.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-white/20">
                              <div className="flex items-center gap-4">
                                {n.avatarUrl ? (
                                  <img src={n.avatarUrl} alt={n.name} className="w-12 h-12 rounded-full object-cover border border-white/10 bg-black/40" />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-lg font-bold border border-white/10">
                                    {n.name.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-bold text-white">{n.name}</p>
                                  <p className="text-[10px] text-white/50 truncate max-w-[300px] mt-0.5">{n.description}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingNomineeId(n.id);
                                    setNewNomineeName(n.name);
                                    setNewNomineeCategory(n.categoryId);
                                    setNewNomineePicture(n.avatarUrl || "");
                                    setNewNomineeDesc(n.description);
                                    const el = document.getElementById("admin-subtab-manage-nominees");
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
                                  title="Edit Nominee"
                                >
                                  <RefreshCw size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete ${n.name}?`)) {
                                      onDeleteNominee(n.id);
                                    }
                                  }}
                                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors border border-red-500/20 cursor-pointer"
                                  title="Delete Nominee"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {nominees.filter(n => n.categoryId === category.id).map((n) => (
                            <div key={n.id} className="bg-white/5 border border-white/10 p-5 rounded-xl flex flex-col gap-4 transition-all hover:border-white/20 relative group">
                              <div className="flex flex-col items-center gap-4 text-center">
                                {n.avatarUrl ? (
                                  <img src={n.avatarUrl} alt={n.name} className="w-24 h-24 rounded-full object-cover border border-white/10 bg-black/40 shrink-0" />
                                ) : (
                                  <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-3xl font-bold border border-white/10 shrink-0">
                                    {n.name.charAt(0)}
                                  </div>
                                )}
                                <div className="min-w-0 w-full">
                                  <p className="text-sm font-bold text-white truncate" title={n.name}>{n.name}</p>
                                  <p className="text-[10px] text-white/50 line-clamp-2 mt-1" title={n.description}>{n.description}</p>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-auto pt-4 border-t border-white/5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingNomineeId(n.id);
                                    setNewNomineeName(n.name);
                                    setNewNomineeCategory(n.categoryId);
                                    setNewNomineePicture(n.avatarUrl || "");
                                    setNewNomineeDesc(n.description);
                                    const el = document.getElementById("admin-subtab-manage-nominees");
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className="flex-1 flex justify-center p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
                                  title="Edit Nominee"
                                >
                                  <RefreshCw size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete ${n.name}?`)) {
                                      onDeleteNominee(n.id);
                                    }
                                  }}
                                  className="flex-1 flex justify-center p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors border border-red-500/20 cursor-pointer"
                                  title="Delete Nominee"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {nominees.length === 0 && (
                    <div className="text-center p-8 bg-white/5 border border-white/10 rounded-xl">
                      <User size={32} className="mx-auto text-white/20 mb-3" />
                      <p className="text-xs text-white/50 font-bold">No nominees added yet.</p>
                      <p className="text-[10px] text-white/40 mt-1">Use the form above to add contenders to the live voting pool.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BALLOT & STANDINGS DESK */}
          {activeSubTab === "ballots" && (
            <div className="space-y-6" id="admin-subtab-ballots">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <BarChart3 size={18} className="text-amber-400" />
                  <span>Ballot Ledger & Live Analytics</span>
                </h3>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Monitor the relative voter distribution and inject or clear manual votes to simulate real election trends across each of the 10th Annual award categories.
                </p>
              </div>

              {/* Category Votes Visual Distribution Chart */}
              <div className="bg-black/30 border border-white/5 rounded-xl p-5 space-y-4">
                <span className="text-[10px] text-white/40 uppercase font-mono tracking-wider font-bold block">
                  CATEGORY VOTE DISTRIBUTION LEDGER
                </span>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="rgba(255,255,255,0.4)" 
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="rgba(255,255,255,0.4)" 
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                      <Bar dataKey="Votes" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index % 2 === 0 ? "#f59e0b" : "#fbbf24"} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Categories list with vote counts and dynamic progress bars */}
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                {categories.map((cat) => {
                  const categoryNominees = nominees.filter((n) => n.categoryId === cat.id);
                  const totalCatVotes = categoryNominees.reduce((sum, n) => sum + n.votes, 0);

                  return (
                    <div key={cat.id} className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-4">
                      {/* Header with category info */}
                      <div className="flex justify-between items-center gap-3 border-b border-white/5 pb-2">
                        <div>
                          <span className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider block">CATEGORY {cat.id}</span>
                          <strong className="text-xs text-white block">{cat.name}</strong>
                        </div>
                        <span className="bg-white/5 text-white/80 border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-mono">
                          {totalCatVotes.toLocaleString()} total votes
                        </span>
                      </div>

                      {/* Nominees list */}
                      <div className="space-y-3">
                        {categoryNominees.length === 0 ? (
                          <p className="text-[10px] text-white/30 italic text-center py-2">No nominees present in this category.</p>
                        ) : (
                          categoryNominees.map((nom) => {
                            const percent = totalCatVotes > 0 ? (nom.votes / totalCatVotes) * 100 : 0;
                            return (
                              <div key={nom.id} className="space-y-1">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-white/80 font-medium">
                                    {nom.name}
                                    {nom.organization && (
                                      <span className="text-[10px] text-white/40 block font-light">{nom.organization}</span>
                                    )}
                                  </span>
                                  <div className="flex items-center gap-3">
                                    <span className="font-mono font-bold text-amber-400">{nom.votes} <span className="text-[10px] text-white/40">({percent.toFixed(1)}%)</span></span>
                                    
                                    {/* Action button to inject votes */}
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => onUpdateNomineeVotes(nom.id, nom.votes + 10)}
                                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white px-2 py-1 rounded text-[10px] cursor-pointer transition-colors"
                                        title="Add 10 Votes"
                                      >
                                        +10
                                      </button>
                                      <button
                                        onClick={() => onUpdateNomineeVotes(nom.id, nom.votes + 50)}
                                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white px-2 py-1 rounded text-[10px] cursor-pointer transition-colors"
                                        title="Add 50 Votes"
                                      >
                                        +50
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Custom HTML Progress bar */}
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden relative border border-white/5">
                                  <div 
                                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                                    style={{ width: `${percent}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: GUESTBOOK MODERATION */}
          {activeSubTab === "guestbook" && (
            <div className="space-y-6" id="admin-subtab-guestbook">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <MessageSquare size={18} className="text-amber-400" />
                    <span>Guestbook Congratulatory Ledger</span>
                  </h3>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">
                    Moderate congratulatory comments submitted to the live guestbook wall on the results tab to maintain platform decorum.
                  </p>
                </div>
                
                <span className="bg-white/5 text-white/70 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono">
                  Messages Count: {totalCommentsCount}
                </span>
              </div>

              {/* Messages Table/List */}
              {guestbookMessages.length === 0 ? (
                <div className="text-center py-12 bg-black/20 border border-white/5 rounded-xl space-y-2">
                  <MessageSquare className="mx-auto text-white/20" size={32} />
                  <p className="text-xs text-white/40">The congratulations registry is empty.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                  {guestbookMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className="bg-black/30 border border-white/5 p-4 rounded-xl flex justify-between items-start gap-4 hover:border-white/10 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong className="text-xs text-amber-400 font-bold">{msg.author}</strong>
                          <span className="text-[9px] text-white/40 font-mono">
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-white/80 italic leading-relaxed">
                          "{msg.content}"
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this guestbook post permanently?")) {
                            onDeleteMessage(msg.id);
                          }
                        }}
                        className="p-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-lg cursor-pointer transition-colors shrink-0"
                        title="Delete Message"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: EVENT SCHEDULE SETTINGS */}
          {activeSubTab === "schedule" && (
            <div className="space-y-6 animate-fade-in" id="admin-subtab-schedule">
              <div className="border-b border-white/5 pb-4">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Sliders size={18} className="text-amber-400" />
                  <span>Phase Dates & Schedule Manager</span>
                </h3>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Configure the official timeline for each phase of the awards. Specify precise start/end dates and times. The application automatically handles transition logic.
                </p>
              </div>

              {successMessage && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl flex items-center gap-2.5 animate-fade-in">
                  <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {validationError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2.5 animate-fade-in">
                  <XCircle size={16} className="text-rose-400 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <form onSubmit={handleScheduleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Announcement Start */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white block">
                      Announcement Phase Start
                    </label>
                    <input
                      type="datetime-local"
                      value={formAnnouncementStart}
                      onChange={(e) => setFormAnnouncementStart(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all font-mono"
                      required
                    />
                    <p className="text-[10px] text-white/40">
                      The official launch of the award event and start of the announcement period.
                    </p>
                  </div>

                  {/* Announcement End */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white block">
                      Announcement Phase End
                    </label>
                    <input
                      type="datetime-local"
                      value={formAnnouncementEnd}
                      onChange={(e) => setFormAnnouncementEnd(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all font-mono"
                      required
                    />
                    <p className="text-[10px] text-white/40">
                      The deadline of the announcement period before the nomination phase opens.
                    </p>
                  </div>

                  {/* Nomination Start */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white block">
                      Nomination Phase Start
                    </label>
                    <input
                      type="datetime-local"
                      value={formNominationStart}
                      onChange={(e) => setFormNominationStart(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all font-mono"
                      required
                    />
                    <p className="text-[10px] text-white/40">
                      The transition point when Pre-Nomination ends and Nomination active begins.
                    </p>
                  </div>

                  {/* Nomination End */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white block">
                      Nomination Phase End (Submissions Close)
                    </label>
                    <input
                      type="datetime-local"
                      value={formNominationEnd}
                      onChange={(e) => setFormNominationEnd(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all font-mono"
                      required
                    />
                    <p className="text-[10px] text-white/40">
                      The official deadline for submitting user nominations.
                    </p>
                  </div>

                  {/* Voting Start */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white block">
                      Voting Phase Start
                    </label>
                    <input
                      type="datetime-local"
                      value={formVotingStart}
                      onChange={(e) => setFormVotingStart(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all font-mono"
                      required
                    />
                    <p className="text-[10px] text-white/40">
                      When the public ballot box unlocks and live voting begins.
                    </p>
                  </div>

                  {/* Voting End */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white block">
                      Voting Phase End (Ballot Box Closes)
                    </label>
                    <input
                      type="datetime-local"
                      value={formVotingEnd}
                      onChange={(e) => setFormVotingEnd(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all font-mono"
                      required
                    />
                    <p className="text-[10px] text-white/40">
                      When voting closes and the live results mode starts.
                    </p>
                  </div>

                  {/* Awards Ceremony */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-white block">
                      Awards Ceremony Gala Event
                    </label>
                    <input
                      type="datetime-local"
                      value={formCeremony}
                      onChange={(e) => setFormCeremony(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all font-mono"
                      required
                    />
                    <p className="text-[10px] text-white/40">
                      The date and time of the official 10th Annual Achievement Awards Gala.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="bg-amber-400 hover:bg-amber-500 text-black px-5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-md shadow-amber-400/10"
                  >
                    Apply Schedule Settings
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Restore default phase and ceremony dates?")) {
                        setFormAnnouncementStart("2026-07-03T00:00");
                        setFormAnnouncementEnd("2026-07-09T23:59");
                        setFormNominationStart("2026-07-10T00:00");
                        setFormNominationEnd("2026-07-30T23:59");
                        setFormVotingStart("2026-07-31T00:00");
                        setFormVotingEnd("2026-08-25T23:59");
                        setFormCeremony("2026-09-05T18:00");
                        onUpdateTimelineSettings({
                          announcementStart: "2026-07-03T00:00:00",
                          announcementEnd: "2026-07-09T23:59:59",
                          nominationStart: "2026-07-10T00:00:00",
                          nominationEnd: "2026-07-30T23:59:59",
                          votingStart: "2026-07-31T00:00:00",
                          votingEnd: "2026-08-25T23:59:59",
                          ceremony: "2026-09-05T18:00:00",
                        });
                        setSuccessMessage("Schedule restored to original defaults.");
                        setTimeout(() => setSuccessMessage(""), 4000);
                      }
                    }}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    Restore Defaults
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSubTab === "settings" && (
            <div className="space-y-6 animate-fade-in" id="admin-subtab-settings">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Shield size={18} className="text-amber-400" />
                  <span>Admin Settings</span>
                </h3>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Update the master login credentials for the developer console.
                </p>
              </div>

              {adminCredsSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl flex items-center gap-2.5 animate-fade-in">
                  <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                  <span>{adminCredsSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAdminCredsSave} className="space-y-6">
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white block">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      value={formAdminEmail}
                      onChange={(e) => setFormAdminEmail(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white block">
                      Admin Password
                    </label>
                    <input
                      type="text"
                      value={formAdminPassword}
                      onChange={(e) => setFormAdminPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all font-mono tracking-widest"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex gap-3">
                  <button
                    type="submit"
                    className="bg-amber-400 hover:bg-amber-500 text-black px-5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-md shadow-amber-400/10 flex items-center gap-2"
                  >
                    <Shield size={14} />
                    Update Credentials
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

      {nominationToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111318] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Confirm Deletion</h3>
            <p className="text-white/70 text-sm mb-6 leading-relaxed">
              Are you sure you want to permanently delete this nomination? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setNominationToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteNomination(nominationToDelete);
                  if (selectedNominationId === nominationToDelete) {
                    setSelectedNominationId(null);
                  }
                  setNominationToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-400 rounded-lg transition-colors cursor-pointer border border-red-500"
              >
                Delete Nomination
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
