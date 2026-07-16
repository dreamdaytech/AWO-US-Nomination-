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
import { INITIAL_NOMINEES, CONTACT_INFO } from "./data";
import { SystemPhase, Nomination, NominationInput, UserVote, Message, Nominee, TimelineSettings, NomineeGroup, GroupingAuditLog, AdminUser, Category, SecuritySettings, GeneralContentSettings } from "./types";
import { parseLocalDateTime } from "./utils";
import { supabase } from "./supabase";
import { dbService, toCategory } from "./dbService";
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

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has("nominee")) return "vote";
    }
    return localStorage.getItem("awol_active_tab") || "overview";
  });

  // Admin login state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem("awol_admin_auth") || !!sessionStorage.getItem("awol_admin_auth");
  });
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [adminLoginError, setAdminLoginError] = useState<string>("");
  const [loggedInAdmin, setLoggedInAdmin] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem("awol_admin_auth") || sessionStorage.getItem("awol_admin_auth");
    return saved ? JSON.parse(saved) : null;
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [dbAdmins, setDbAdmins] = useState<AdminUser[]>([]);

  // Custom nominations submitted by users
  const [nominations, setNominations] = useState<Nomination[]>([]);

  // Dynamic Nominee pool. Seeded with INITIAL_NOMINEES.
  // When custom nominations are "approved", they are dynamically added as Nominees!
  const [nominees, setNominees] = useState<Nominee[]>([]);

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

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({ requireAccessCode: false });
  const [activeAccessCode, setActiveAccessCode] = useState<string | null>(() => {
    return localStorage.getItem("awol_active_access_code");
  });

  // Guestbook Congratulations Messages
  const [guestbookMessages, setGuestbookMessages] = useState<Message[]>([]);

  const [selectedCategoryIdForForm, setSelectedCategoryIdForForm] = useState<number>(0);
  const [nomineeGroups, setNomineeGroups] = useState<NomineeGroup[]>([]);
  const [groupingAuditLogs, setGroupingAuditLogs] = useState<GroupingAuditLog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSystemReady, setIsSystemReady] = useState(false);

  const [generalContent, setGeneralContent] = useState<GeneralContentSettings>({
    contactEmail: CONTACT_INFO.email,
    contactWebsite: CONTACT_INFO.website,
    contactWebsiteUrl: CONTACT_INFO.websiteUrl,
    contactPhone: CONTACT_INFO.telephone,
    contactFormsUrl: CONTACT_INFO.formsAppUrl,
    chairmanName: CONTACT_INFO.chairman,
    chairmanTitle: CONTACT_INFO.title,
    awardsTitle: "AWOL AMERICA 10th Annual Achievement Awards",
    invitationTitle: "Official Invitation & Bulletin",
    letterBody: `We are pleased to announce the initiation of the nomination and voting process for the esteemed AWOL AMERICA 10th Annual Achievement Awards ceremony, scheduled for {ceremonyDate}.

The AWOL AMERICA Achievement Awards have consistently recognized exceptional individuals, organizations, and initiatives that have made significant contributions to society, inspiring positive change within the community. This year, we look forward to honoring those whose extraordinary efforts have left a lasting impact on the world.

Nominations may be submitted by fellow members, the public, or through self-nomination. Please share your rationale for the nomination and highlight the nominee's achievements, dedication, and commitment to fostering a better world.

The nomination period will commence on {nominationStartDate} and will remain open until {nominationEndDate}. We encourage you to act promptly to honor those who have made a significant impact on our society. Following the nomination phase, the voting period will take place from {votingDateRange}.

As we prepare for this momentous occasion, we extend our heartfelt gratitude to all our supporters and patrons, whose contributions make these awards possible. Join us on {ceremonyDate}, as we celebrate the exceptional achievements of our nominees and commend their unwavering dedication to a better tomorrow.

Thank you for your continued support. Together, let us embrace the spirit of positive change and recognize those who embody the core values of AWOL AMERICA.`
  });

  // CAPTCHA State
  const [pendingVote, setPendingVote] = useState<{ categoryId: number, nomineeId: string } | null>(null);
  const [captchaQuestion, setCaptchaQuestion] = useState<{ num1: number, num2: number }>({ num1: 0, num2: 0 });
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  // Payment State
  const [hasPaymentAccess, setHasPaymentAccess] = useState<boolean>(() => {
    return !!sessionStorage.getItem("awol_payment_access");
  });

  const generateCaptcha = () => {
    setCaptchaQuestion({
      num1: Math.floor(Math.random() * 10) + 1,
      num2: Math.floor(Math.random() * 10) + 1
    });
    setCaptchaAnswer("");
    setCaptchaError("");
  };

  // Handle Monime Payment Returns from URL parameters
  useEffect(() => {
    if (typeof window === "undefined") return;
    const searchParams = new URLSearchParams(window.location.search);
    
    if (searchParams.get("payment_success") === "true") {
      const mode = searchParams.get("payment_mode");
      
      if (mode === "one_time") {
        setHasPaymentAccess(true);
        sessionStorage.setItem("awol_payment_access", "true");
        alert("Payment successful! You can now cast your votes.");
      } else if (mode === "per_vote") {
        const categoryId = parseInt(searchParams.get("categoryId") || "0");
        const nomineeId = searchParams.get("nomineeId");
        if (categoryId && nomineeId) {
          // Since we now use a secure webhook, the backend Edge Function will increment the vote.
          // We only need to update the local UI state so the user sees their vote as counted immediately.
          setUserVotes((prev) => {
            const filtered = prev.filter((v) => v.categoryId !== categoryId);
            return [...filtered, { categoryId, nomineeId }];
          });
          alert("Payment successful! Your vote is securely recorded.");
        }
      }

      // Clean up the URL
      const newUrl = window.location.pathname + "?tab=vote";
      window.history.replaceState({}, document.title, newUrl);
    } else if (searchParams.get("payment_cancelled") === "true") {
      alert("Payment was cancelled.");
      const newUrl = window.location.pathname + "?tab=vote";
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  const handleInitiatePayment = async ({ mode, nomineeId, categoryId }: { mode: "one_time" | "per_vote", nomineeId?: string, categoryId?: number }) => {
    if (!securitySettings.paymentAmount) throw new Error("Payment amount not configured.");
    const { checkoutUrl } = await dbService.createMonimeCheckout({
      amount: securitySettings.paymentAmount,
      currency: securitySettings.paymentCurrency || "SLE",
      mode,
      nomineeId,
      categoryId
    });
    return checkoutUrl;
  };

  // Setup Firestore listeners
  useEffect(() => {
    let settingsReady = false;
    let dateReady = false;
    let categoriesReady = false;
    let secReady = false;
    const checkReady = () => {
      if (settingsReady && dateReady && categoriesReady && secReady) setIsSystemReady(true);
    };

    const unsubSettings = dbService.listenToSettings(
      (settings) => setTimelineSettings(settings),
      () => { settingsReady = true; checkReady(); }
    );
    
    const unsubSecurity = dbService.listenToSecuritySettings(
      (settings) => setSecuritySettings(settings),
      () => { secReady = true; checkReady(); }
    );
    
    const unsubAdmins = dbService.listenToAdmins((admins) => {
      setDbAdmins(admins);
    });
    
    const unsubGeneralContent = dbService.listenToGeneralContent((content) => {
      if (content) {
        setGeneralContent(content);
      }
    });
    
    const unsubDate = dbService.listenToDate(
      (dateStr) => setSimulatedDate(parseLocalDateTime(dateStr)),
      () => { dateReady = true; checkReady(); }
    );

    const unsubCategories = dbService.listenToCategories(
      (cats) => {
        // Sort categories by orderIndex so they always display in the custom arrangement
        const sortedCats = cats.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
        setCategories(sortedCats);
      },
      () => { categoriesReady = true; checkReady(); }
    );

    const unsubNoms = dbService.listenToNominations((data) => {
      setNominations(data);
    });

    const unsubMessages = dbService.listenToMessages((data) => {
      setGuestbookMessages(data);
    });

    const unsubNominees = dbService.listenToNominees((data) => {
      setNominees(data);
    });
    const unsubGroups = dbService.listenToNomineeGroups(setNomineeGroups);
    const unsubLogs = dbService.listenToGroupingAuditLogs(setGroupingAuditLogs);

    return () => {
      unsubSettings();
      unsubSecurity();
      unsubAdmins();
      unsubGeneralContent();
      unsubDate();
      unsubCategories();
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

  useEffect(() => {
    if (activeAccessCode) {
      localStorage.setItem("awol_active_access_code", activeAccessCode);
    } else {
      localStorage.removeItem("awol_active_access_code");
    }
  }, [activeAccessCode]);

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
    try {
      const nom = nominees.find(n => n.id === nomineeId);
      if (!nom) return;

      if (securitySettings.requireAccessCode) {
        if (!activeAccessCode) {
          alert("Session expired or missing access code.");
          return;
        }
        await dbService.castVoteWithCode(activeAccessCode, categoryId, nom.id);
      } else {
        if (securitySettings.enableCaptcha) {
          // Trigger CAPTCHA instead of direct vote
          setPendingVote({ categoryId, nomineeId });
          generateCaptcha();
          return; // Stop execution here until CAPTCHA is solved
        } else {
          // Direct open vote
          await dbService.incrementNomineeVotes(nom.id, 1);
        }
      }

      // Record vote in user's browser ballot
      setUserVotes((prev) => {
        const filtered = prev.filter((v) => v.categoryId !== categoryId);
        return [...filtered, { categoryId, nomineeId }];
      });
    } catch (e: any) {
      alert(e.message || "Failed to cast vote.");
    }
  };

  const handleCaptchaVerify = async () => {
    if (!pendingVote) return;
    
    if (parseInt(captchaAnswer) === (captchaQuestion.num1 + captchaQuestion.num2)) {
      try {
        const nom = nominees.find(n => n.id === pendingVote.nomineeId);
        if (nom) {
          await dbService.incrementNomineeVotes(nom.id, 1);
          // Record vote in user's browser ballot
          setUserVotes((prev) => {
            const filtered = prev.filter((v) => v.categoryId !== pendingVote.categoryId);
            return [...filtered, { categoryId: pendingVote.categoryId, nomineeId: pendingVote.nomineeId }];
          });
        }
        setPendingVote(null); // Success, close modal
      } catch (e: any) {
        alert(e.message || "Failed to cast vote.");
        generateCaptcha(); // Reset CAPTCHA on error
      }
    } else {
      setCaptchaError("Incorrect answer. Please try again.");
      generateCaptcha();
    }
  };

  const handleAccessCodeVerified = async (code: string) => {
    try {
      const restoredVotes = await dbService.fetchVotesForCode(code);
      setUserVotes(restoredVotes);
      setActiveAccessCode(code);
    } catch (e: any) {
      throw e; // Let the UI handle the error alert
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

  const handleLinkNominations = async (nominationIds: string[]) => {
    const groupId = crypto.randomUUID();
    await dbService.linkNominations(nominationIds, groupId);
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

  const handleResetAllData = async () => {
    localStorage.removeItem("awol_user_votes");
    const promises = nominees.map(nom => {
      return dbService.setNominee({
        ...nom,
        votes: 0
      });
    });
    await Promise.all(promises);
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

  // Category Handlers
  const handleCreateCategory = async (cat: Category) => {
    // Determine the max orderIndex and set this to max + 1
    const maxOrder = categories.reduce((max, c) => Math.max(max, c.orderIndex ?? 0), 0);
    const newCat = { ...cat, orderIndex: maxOrder + 1 };
    await dbService.setCategory(newCat);
    // Manually refresh to ensure UI updates instantly even if real-time replication is disabled
    supabase.from("categories").select("*").then(({ data }) => {
      if (data) {
        const cats = data.map(toCategory).sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
        setCategories(cats);
      }
    });
  };
  const handleUpdateCategory = async (cat: Category) => {
    await dbService.setCategory(cat);
    supabase.from("categories").select("*").then(({ data }) => {
      if (data) {
        const cats = data.map(toCategory).sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
        setCategories(cats);
      }
    });
  };
  const handleDeleteCategory = async (id: number) => {
    await dbService.deleteCategory(id);
    supabase.from("categories").select("*").then(({ data }) => {
      if (data) {
        const cats = data.map(toCategory).sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
        setCategories(cats);
      }
    });
  };
  const handleRearrangeCategories = async (cats: Category[]) => {
    // Optimistically update UI
    setCategories(cats);
    await dbService.rearrangeCategories(cats);
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

  if (!isSystemReady) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
         <div className="w-12 h-12 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin"></div>
      </div>
    );
  }

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
        generalContent={generalContent}
      />

      {/* MAIN APPLICATION STAGE */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 flex-grow w-full relative">
        {/* Horizontal awards countdown timeline */}
        <TimelineWidget currentPhase={phase} timelineSettings={timelineSettings} simulatedDate={simulatedDate} />

        {/* TAB 1: AWARD OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in" id="overview-tab-content">
            {/* Invitation Letter from the Chairman */}
            <ChairmanMessage timelineSettings={timelineSettings} generalContent={generalContent} />

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
              {categories.map((cat) => {
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
              categories={categories}
              selectedCategoryId={selectedCategoryIdForForm}
              onSubmitNomination={handleSubmitNomination}
              recentNominations={nominations}
              onToggleApprove={handleToggleApproveNomination}
              currentPhase={phase}
              timelineSettings={timelineSettings}
              simulatedDate={simulatedDate}
              generalContent={generalContent}
              onNavigateToVote={() => setActiveTab("vote")}
            />
          </div>
        )}

        {/* TAB 3: VOTING CENTER */}
        {activeTab === "vote" && (
          <div className="animate-fade-in" id="vote-tab-content">
            <VotingSection
              categories={categories}
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
              securitySettings={securitySettings}
              activeAccessCode={activeAccessCode}
              onAccessCodeVerified={handleAccessCodeVerified}
              onInitiatePayment={handleInitiatePayment}
              hasPaymentAccess={hasPaymentAccess}
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
              categories={categories}
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
                  const matchedAdmin = dbAdmins.find(a => a.email === adminEmail && a.password === adminPassword);
                  if (matchedAdmin) {
                    if (rememberMe) {
                      localStorage.setItem("awol_admin_auth", JSON.stringify(matchedAdmin));
                    } else {
                      sessionStorage.setItem("awol_admin_auth", JSON.stringify(matchedAdmin));
                    }
                    setIsAdminLoggedIn(true);
                    setLoggedInAdmin(matchedAdmin);
                    setAdminPassword("");
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
                  <div className="flex items-center gap-2 px-1">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-amber-400 bg-black/40 border border-white/20 rounded focus:ring-amber-400 focus:ring-offset-gray-900 cursor-pointer"
                    />
                    <label htmlFor="rememberMe" className="text-xs text-white/70 cursor-pointer">
                      Remember me
                    </label>
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
              categories={categories}
              onCreateCategory={handleCreateCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              onRearrangeCategories={handleRearrangeCategories}
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
              generalContent={generalContent}
              onUpdateGeneralContent={async (settings) => await dbService.updateGeneralContent(settings)}
              onSetSimulatedDate={handleUpdateSimulatedDate}
              onToggleApproveNomination={handleToggleApproveNomination}
              onDeclineNomination={handleDeclineNomination}
              onDeleteNomination={handleDeleteNomination}
              onLinkNominations={handleLinkNominations}
              onUpdateNomineeVotes={handleUpdateNomineeVotes}
              onDeleteMessage={handleDeleteMessage}
              onResetAllData={handleResetAllData}
              onBulkSeedVotes={handleBulkSeedVotes}
              onAddNominee={handleAddNominee}
              onUpdateNominee={handleUpdateNominee}
              onDeleteNominee={handleDeleteNominee}
              onLogout={() => {
                localStorage.removeItem("awol_admin_auth");
                sessionStorage.removeItem("awol_admin_auth");
                setIsAdminLoggedIn(false);
                setLoggedInAdmin(null);
              }}
              loggedInAdmin={loggedInAdmin}
              admins={dbAdmins}
              onAddAdmin={dbService.addAdmin}
              onUpdateAdmin={dbService.updateAdmin}
              onDeleteAdmin={dbService.deleteAdmin}
              securitySettings={securitySettings}
              onUpdateSecuritySettings={async (settings) => await dbService.updateSecuritySettings(settings)}
              onGenerateVotingCodes={async (qty) => await dbService.generateVotingCodes(qty)}
              onFetchCodeStats={async () => await dbService.fetchCodeStats()}
              onFetchUnusedCodes={async () => await dbService.fetchUnusedCodes()}
            />
            )}
          </div>
        )}
      </main>

      {/* FOOTER & BRAND LEGAL CHANNELS */}
      <footer className="bg-black/40 text-white/40 text-xs py-8 px-4 sm:px-6 border-t border-white/10 mt-16 relative z-10 backdrop-blur-md" id="app-footer">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 text-center md:text-left">
            <img 
              src="/logo.png" 
              alt="AWOL AMERICA Logo" 
              className="h-10 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity drop-shadow-sm" 
            />
            <div className="space-y-1">
              <p className="font-sans font-bold text-white tracking-widest text-[11px] uppercase">
                AWOL AMERICA
              </p>
              <p className="text-[10px] text-white/40 font-light">
                All Rights Reserved. © 2026 Association for the Well-Being of Sierra Leoneans (AWOL) America.
              </p>
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-[10px] text-white/40 font-light">
              Designed with ❤️ by DreamDay Technology
            </p>
          </div>
        </div>
      </footer>

      {/* CAPTCHA MODAL */}
      {pendingVote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center">
                  <Shield className="text-amber-400" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white leading-tight">Security Check</h3>
                  <p className="text-xs text-white/50 font-medium">Verify you are human</p>
                </div>
              </div>
              
              <div className="bg-black/40 border border-white/5 rounded-xl p-5 text-center mb-5">
                <p className="text-sm text-white/60 mb-2 font-medium">Please solve this simple math equation:</p>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-3xl font-black text-white">{captchaQuestion.num1}</span>
                  <span className="text-2xl text-amber-400 font-bold">+</span>
                  <span className="text-3xl font-black text-white">{captchaQuestion.num2}</span>
                  <span className="text-2xl text-amber-400 font-bold">=</span>
                  <input
                    type="number"
                    value={captchaAnswer}
                    onChange={(e) => {
                      setCaptchaAnswer(e.target.value);
                      setCaptchaError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCaptchaVerify();
                    }}
                    className="w-20 bg-white/5 border-2 border-white/10 rounded-xl px-3 py-2 text-2xl font-black text-center text-white focus:bg-white/10 focus:border-amber-400 focus:outline-none transition-all"
                    autoFocus
                  />
                </div>
                {captchaError && (
                  <p className="text-xs font-bold text-red-400 mt-3 animate-fade-in">{captchaError}</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setPendingVote(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCaptchaVerify}
                  disabled={!captchaAnswer}
                  className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:hover:bg-amber-400 text-black px-6 py-2.5 rounded-xl text-xs font-black transition-colors"
                >
                  Verify & Vote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
