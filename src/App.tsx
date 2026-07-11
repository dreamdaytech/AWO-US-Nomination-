/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { TimelineWidget } from "./components/TimelineWidget";
import { ChairmanMessage } from "./components/ChairmanMessage";
import { CategoryCard } from "./components/CategoryCard";
import { NominationForm } from "./components/NominationForm";
import { VotingSection } from "./components/VotingSection";
import { ResultsSection } from "./components/ResultsSection";
import { AdminDashboard } from "./components/AdminDashboard";
import { CATEGORIES, INITIAL_NOMINEES, CONTACT_INFO } from "./data";
import { SystemPhase, Nomination, NominationInput, UserVote, Message, Nominee, TimelineSettings, NomineeGroup, GroupingAuditLog } from "./types";
import { parseLocalDateTime } from "./utils";
import { dbService } from "./dbService";
import { 
  Award, 
  Calendar, 
  FileText, 
  Vote, 
  Trophy, 
  Info, 
  AlertCircle, 
  ChevronRight, 
  Mail, 
  Phone, 
  Globe,
  Shield
} from "lucide-react";

export default function App() {
  // 1. STATE & PERSISTENCE
  
  const [simulatedDate, setSimulatedDate] = useState<Date>(parseLocalDateTime("2026-07-09T12:00:00"));

  const [activeTab, setActiveTab] = useState<string>("overview");

  // Admin login state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [adminLoginError, setAdminLoginError] = useState<string>("");
  const [dbAdminCreds, setDbAdminCreds] = useState<{email: string, password: string}>({ email: "admin@awol.com", password: "password123" });

  // Custom nominations submitted by users
  const [nominations, setNominations] = useState<Nomination[]>([]);

  // Dynamic Nominee pool. Seeded with INITIAL_NOMINEES.
  // When custom nominations are "approved", they are dynamically added as Nominees!
  const [nominees, setNominees] = useState<Nominee[]>(INITIAL_NOMINEES);

  // User's own cast votes
  const [userVotes, setUserVotes] = useState<UserVote[]>(() => {
    const saved = localStorage.getItem("awol_user_votes");
    return saved ? JSON.parse(saved) : [];
  });

  // Dynamic Event Schedule configurations
  const [timelineSettings, setTimelineSettings] = useState<TimelineSettings>({
    announcementStart: "2026-07-03T00:00:00",
    announcementEnd: "2026-07-09T23:59:59",
    nominationStart: "2026-07-10T00:00:00",
    nominationEnd: "2026-07-30T23:59:59",
    votingStart: "2026-07-31T00:00:00",
    votingEnd: "2026-08-25T23:59:59",
    ceremony: "2026-09-05T18:00:00",
  });

  // Guestbook Congratulations Messages
  const [guestbookMessages, setGuestbookMessages] = useState<Message[]>([]);

  const [selectedCategoryIdForForm, setSelectedCategoryIdForForm] = useState<number>(0);
  const [nomineeGroups, setNomineeGroups] = useState<NomineeGroup[]>([]);
  const [groupingAuditLogs, setGroupingAuditLogs] = useState<GroupingAuditLog[]>([]);

  // Setup Firestore listeners
  useEffect(() => {
    const unsubSettings = dbService.listenToSettings((settings) => {
      setTimelineSettings(settings);
    });
    
    const unsubAdminCreds = dbService.listenToAdminCredentials((creds) => {
      setDbAdminCreds(creds);
    });
    
    const unsubDate = dbService.listenToDate((dateStr) => {
      setSimulatedDate(parseLocalDateTime(dateStr));
    });

    const unsubNoms = dbService.listenToNominations((data) => {
      setNominations(data);
    });

    const unsubMessages = dbService.listenToMessages((data) => {
      setGuestbookMessages(data);
    });

    const unsubNominees = dbService.listenToNominees((data) => {
      // Merge with initial nominees if they aren't in DB yet
      // A more robust way is to seed DB with INITIAL_NOMINEES once,
      // but for now we'll combine static and dynamic
      const combined = [...INITIAL_NOMINEES];
      
      data.forEach(dbNominee => {
        const existingIdx = combined.findIndex(n => n.id === dbNominee.id);
        if (existingIdx >= 0) {
          combined[existingIdx] = { ...combined[existingIdx], ...dbNominee };
        } else {
          combined.push(dbNominee);
        }
      });
      setNominees(combined);
    });
    const unsubGroups = dbService.listenToNomineeGroups(setNomineeGroups);
    const unsubLogs = dbService.listenToGroupingAuditLogs(setGroupingAuditLogs);

    return () => {
      unsubSettings();
      unsubAdminCreds();
      unsubDate();
      unsubNoms();
      unsubMessages();
      unsubNominees();
      unsubGroups();
      unsubLogs();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("awol_user_votes", JSON.stringify(userVotes));
  }, [userVotes]);

  // 2. LIFECYCLE / PHASE RESOLUTION BASED ON SIMULATED DATE
  const getSystemPhase = (date: Date): { phase: SystemPhase; label: string } => {
    const time = date.getTime();
    
    const annStart = parseLocalDateTime(timelineSettings.announcementStart).getTime();
    const annEnd = parseLocalDateTime(timelineSettings.announcementEnd).getTime();
    const nomStart = parseLocalDateTime(timelineSettings.nominationStart).getTime();
    const nomEnd = parseLocalDateTime(timelineSettings.nominationEnd).getTime();
    const votingStart = parseLocalDateTime(timelineSettings.votingStart).getTime();
    const votingEnd = parseLocalDateTime(timelineSettings.votingEnd).getTime();
    const ceremony = parseLocalDateTime(timelineSettings.ceremony).getTime();

    if (time < annStart) {
      return { phase: SystemPhase.PRE_NOMINATION, label: "Scheduled" };
    } else if (time >= annStart && time <= annEnd) {
      return { phase: SystemPhase.PRE_NOMINATION, label: "Announcement & Prep" };
    } else if (time > annEnd && time < nomStart) {
      return { phase: SystemPhase.PRE_NOMINATION, label: "Awaiting Nominations" };
    } else if (time >= nomStart && time <= nomEnd) {
      return { phase: SystemPhase.NOMINATION, label: "Nomination Phase Active" };
    } else if (time > nomEnd && time < votingStart) {
      return { phase: SystemPhase.NOMINATION, label: "Nominations Closed - Reviewing" };
    } else if (time >= votingStart && time <= votingEnd) {
      return { phase: SystemPhase.VOTING, label: "Voting Period Active" };
    } else if (time > votingEnd && time < ceremony) {
      return { phase: SystemPhase.RESULTS, label: "Voting Closed - Live Results" };
    } else {
      return { phase: SystemPhase.RESULTS, label: "Results & Ceremony Mode" };
    }
  };

  const { phase, label: phaseLabel } = getSystemPhase(simulatedDate);

  // 3. ACTION HANDLERS

  // Submission of a custom sandbox nomination
  const handleSubmitNomination = async (input: NominationInput) => {
    const newNomination: Omit<Nomination, 'id'> = {
      ...input,
      submittedAt: new Date().toISOString(),
      approved: false, // Starts as unapproved, user can approve in the developer panel
    };
    await dbService.addNomination(newNomination);
  };

  // Toggle approval on custom nomination
  const handleToggleApproveNomination = async (nominationId: string) => {
    const nom = nominations.find(n => n.id === nominationId);
    if (nom) {
      await dbService.updateNomination(nominationId, { approved: !nom.approved, declined: false });
      // If approved, create/update nominee dynamically
      if (!nom.approved) {
        await dbService.setNominee({
          id: `custom-nom-${nom.id}`,
          categoryId: nom.categoryId,
          name: nom.nomineeName,
          description: nom.rationale,
          votes: 12,
          organization: nom.nominatorName
        });
      }
    }
  };

  // Cast a vote for a candidate in a category

  const handleDeclineNomination = async (nominationId: string) => {
    const nom = nominations.find(n => n.id === nominationId);
    if (nom) {
      await dbService.updateNomination(nominationId, { approved: false, declined: true });
    }
  };

  const handleCastVote = async (categoryId: number, nomineeId: string) => {
    // Record vote in user's browser ballot
    setUserVotes((prev) => {
      const filtered = prev.filter((v) => v.categoryId !== categoryId);
      return [...filtered, { categoryId, nomineeId }];
    });

    const nom = nominees.find(n => n.id === nomineeId);
    if (nom) {
      await dbService.incrementNomineeVotes(nom.id, 1);
    }
  };

  // Add guestbook congratulations message
  const handleAddMessage = async (author: string, content: string) => {
    await dbService.addMessage({
      author,
      content,
      createdAt: new Date().toISOString()
    });
  };

  const handleAddNominee = async (nominee: Nominee) => {
    try {
      await dbService.setNominee(nominee);
    } catch (e) {
      console.error("Error adding nominee:", e);
    }
  };

  const handleUpdateNominee = async (nomineeId: string, data: Partial<Nominee>) => {
    try {
      await dbService.updateNominee(nomineeId, data);
    } catch (e) {
      console.error("Error updating nominee:", e);
    }
  };

  const handleDeleteNominee = async (nomineeId: string) => {
    try {
      await dbService.deleteNominee(nomineeId);
    } catch (e) {
      console.error("Error deleting nominee:", e);
    }
  };

  const handleDeleteNomination = async (nominationId: string) => {
    await dbService.deleteNomination(nominationId);
  };

  const handleUpdateNomineeVotes = async (nomineeId: string, votes: number) => {
    const nom = nominees.find(n => n.id === nomineeId);
    if (nom) {
      const delta = votes - nom.votes;
      await dbService.incrementNomineeVotes(nom.id, delta);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    await dbService.deleteMessage(messageId);
  };

  const handleResetAllData = () => {
    localStorage.removeItem("awol_user_votes");
    window.location.reload();
  };

  const handleBulkSeedVotes = async () => {
    // Add 100-500 random votes to each nominee
    const promises = nominees.map(nom => {
      const added = Math.floor(Math.random() * 400) + 100;
      return dbService.setNominee({
        ...nom,
        votes: nom.votes + added
      });
    });
    await Promise.all(promises);
  };

  // Switch simulated date presets
  const handlePresetSelect = (preset: string) => {
    let dateStr = "2026-07-09T12:00:00";
    if (preset === "PRE_NOM") dateStr = "2026-07-09T12:00:00"; // Pre-Nomination
    if (preset === "NOM") dateStr = "2026-07-15T12:00:00";     // Nomination
    if (preset === "VOTE") dateStr = "2026-08-10T12:00:00";    // Voting
    if (preset === "RESULTS") dateStr = "2026-08-28T12:00:00"; // Results
    dbService.updateSimulatedDate(dateStr);
  };

  const handleUpdateSettings = async (settings: TimelineSettings) => {
    await dbService.updateSettings(settings);
  };

  const handleUpdateSimulatedDate = async (date: Date) => {
    await dbService.updateSimulatedDate(date.toISOString());
  };

  return (
    <div className="min-h-screen bg-[#05070a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] flex flex-col font-sans antialiased text-white relative overflow-hidden" id="main-application-root">
      
      {/* HEADER & BRANDING BRAND BANNER */}
      <Header isAdminLoggedIn={isAdminLoggedIn} 
        currentPhase={phase} 
        phaseLabel={phaseLabel} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        timelineSettings={timelineSettings}
        simulatedDate={simulatedDate}
      />

      {/* MAIN APPLICATION STAGE */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 flex-grow w-full relative z-10">
        {/* Horizontal awards countdown timeline */}
        <TimelineWidget currentPhase={phase} timelineSettings={timelineSettings} simulatedDate={simulatedDate} />

        {/* TAB 1: AWARD OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in" id="overview-tab-content">
            {/* Invitation Letter from the Chairman */}
            <ChairmanMessage timelineSettings={timelineSettings} />

            {/* Category Listing Section Intro */}
            <div className="space-y-2">
              <h2 className="font-sans font-black text-white text-xl tracking-tight uppercase">
                Official Award Categories
              </h2>
              <p className="text-xs text-white/60 max-w-2xl leading-relaxed">
                Click on any category card below to navigate directly to its nomination or voting section.
              </p>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="categories-cards-grid">
              {CATEGORIES.map((cat) => {
                const categoryNominees = nominees.filter((n) => n.categoryId === cat.id);
                return (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    currentPhase={phase}
                    nomineeCount={categoryNominees.length}
                    timelineSettings={timelineSettings}
                    simulatedDate={simulatedDate}
                    onSelect={(catId) => {
                      setSelectedCategoryIdForForm(catId);
                      if (phase === SystemPhase.VOTING) {
                        setActiveTab("vote");
                      } else {
                        setActiveTab("nominate");
                      }
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: NOMINATION PORTAL */}
        {activeTab === "nominate" && (
          <div className="animate-fade-in" id="nominate-tab-content">
            <NominationForm
              categories={CATEGORIES}
              selectedCategoryId={selectedCategoryIdForForm}
              onSubmitNomination={handleSubmitNomination}
              recentNominations={nominations}
              onToggleApprove={handleToggleApproveNomination}
              currentPhase={phase}
              timelineSettings={timelineSettings}
              simulatedDate={simulatedDate}
              onNavigateToVote={() => setActiveTab("vote")}
            />
          </div>
        )}

        {/* TAB 3: VOTING CENTER */}
        {activeTab === "vote" && (
          <div className="animate-fade-in" id="vote-tab-content">
            <VotingSection
              categories={CATEGORIES}
              nominees={nominees.filter(n => n.listType === "final" || (!n.listType && !n.id.startsWith("custom-nom-")))}
              nomineeGroups={nomineeGroups}
              userVotes={userVotes}
              onCastVote={handleCastVote}
              currentPhase={phase}
              timelineSettings={timelineSettings}
              simulatedDate={simulatedDate}
              onNavigateToResults={() => setActiveTab("results")}
              onNavigateToNominate={() => setActiveTab("nominate")}
              isAdminLoggedIn={isAdminLoggedIn}
            />
          </div>
        )}

        {/* TAB 4: RESULTS SECTION */}
        {activeTab === "results" && (
          <div className="animate-fade-in" id="results-tab-content">
            {(!isAdminLoggedIn && !timelineSettings?.resultsVisible) ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                  <Trophy size={32} className="text-white/40" />
                </div>
                <h2 className="text-2xl font-black text-white mb-3">Results Currently Hidden</h2>
                <p className="text-white/60 max-w-md font-light text-sm">
                  The Live Results & Gala page is not currently visible to the public. Please check back later.
                </p>
              </div>
            ) : (
            <ResultsSection
              categories={CATEGORIES}
              nominees={nominees.filter(n => n.listType === "final" || (!n.listType && !n.id.startsWith("custom-nom-")))}
              guestbookMessages={guestbookMessages}
              onAddMessage={handleAddMessage}
              currentPhase={phase}
              timelineSettings={timelineSettings}
            />
            )}
          </div>
        )}

        {/* TAB 5: ADMIN CONSOLE DASHBOARD */}
        {activeTab === "admin" && (
          <div className="animate-fade-in" id="admin-tab-content">
            {!isAdminLoggedIn ? (
              <div className="max-w-md mx-auto mt-12 bg-[#121212] border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex flex-col items-center mb-6 text-center">
                  <div className="w-12 h-12 bg-amber-400/10 rounded-full flex items-center justify-center mb-4">
                    <Shield className="text-amber-400" size={24} />
                  </div>
                  <h2 className="text-xl font-black text-white">Admin Authentication</h2>
                  <p className="text-xs text-white/50 mt-2">Enter your email and password to access the developer console.</p>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (adminEmail === dbAdminCreds.email && adminPassword === dbAdminCreds.password) {
                    setIsAdminLoggedIn(true);
                    setAdminLoginError("");
                  } else {
                    setAdminLoginError("Incorrect email or password. Please try again.");
                  }
                }} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:bg-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all outline-none text-white tracking-wide"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:bg-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all outline-none text-white tracking-widest"
                      required
                    />
                  </div>
                  {adminLoginError && (
                    <p className="text-xs text-rose-400 text-center font-bold">{adminLoginError}</p>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-amber-400 hover:bg-amber-500 text-black font-extrabold py-3 px-4 rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Authenticate
                  </button>
                </form>
              </div>
            ) : (
            <AdminDashboard
              categories={CATEGORIES}
              nominees={nominees}
              nominations={nominations}
              guestbookMessages={guestbookMessages}
              nomineeGroups={nomineeGroups}
              groupingAuditLogs={groupingAuditLogs}
              onCreateNomineeGroup={async (g) => { const docRef = await dbService.addNomineeGroup(g); return docRef.id; }}
              onUpdateNomineeGroup={async (id, data) => await dbService.updateNomineeGroup(id, data)}
              onDeleteNomineeGroup={async (id) => await dbService.deleteNomineeGroup(id)}
              onAddGroupingAuditLog={async (log) => await dbService.addGroupingAuditLog(log)}
              simulatedDate={simulatedDate}
              currentPhase={phase}
              phaseLabel={phaseLabel}
              timelineSettings={timelineSettings}
              onUpdateTimelineSettings={handleUpdateSettings}
              onSetSimulatedDate={handleUpdateSimulatedDate}
              onToggleApproveNomination={handleToggleApproveNomination}
              onDeclineNomination={handleDeclineNomination}
              onDeleteNomination={handleDeleteNomination}
              onUpdateNomineeVotes={handleUpdateNomineeVotes}
              onDeleteMessage={handleDeleteMessage}
              onResetAllData={handleResetAllData}
              onBulkSeedVotes={handleBulkSeedVotes}
              onAddNominee={handleAddNominee}
              onUpdateNominee={handleUpdateNominee}
              onDeleteNominee={handleDeleteNominee}
              adminCreds={dbAdminCreds}
              onUpdateAdminCreds={dbService.updateAdminCredentials}
            />
            )}
          </div>
        )}
      </main>

      {/* FOOTER & BRAND LEGAL CHANNELS */}
      <footer className="bg-black/40 text-white/40 text-xs py-8 px-4 sm:px-6 border-t border-white/10 mt-16 relative z-10 backdrop-blur-md" id="app-footer">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <p className="font-sans font-bold text-white tracking-widest text-[11px] uppercase">
              AWOL AMERICA
            </p>
            <p className="text-[10px] text-white/30 font-light">
              All Rights Reserved. © 2026 Association for the Well-Being of Sierra Leoneans (AWOL) America.
            </p>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-[10px] text-white/40 font-light">
              Designed with ❤️ by DreamDay Technology
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
