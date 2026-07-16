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
  List,
  AlertCircle,
  Eye,
  EyeOff,
  Key,
  Lock
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
import { Category, Nominee, Nomination, Message, SystemPhase, TimelineSettings, NomineeGroup, GroupingAuditLog, AdminUser, SecuritySettings, GeneralContentSettings } from "../types";
import { AdminGroupsTab } from "./AdminGroupsTab";
import { Users, Search, Filter, ArrowUpDown, ChevronDown, X, ArrowUp, ArrowDown, Download } from "lucide-react";

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
  onCreateCategory: (cat: Category) => void;
  onUpdateCategory: (cat: Category) => void;
  onDeleteCategory: (id: number) => void;
  onRearrangeCategories?: (categories: Category[]) => Promise<void>;
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
  onDeclineNomination: (id: string) => void;
  onDeleteNomination: (id: string) => void;
  onLinkNominations?: (ids: string[]) => void;
  onUpdateNomineeVotes: (id: string, votes: number) => void;
  onDeleteMessage: (id: string) => void;
  onResetAllData: () => void;
  onBulkSeedVotes: () => void;
  onAddNominee: (nominee: Nominee) => void;
  onUpdateNominee: (id: string, data: Partial<Nominee>) => void;
  onDeleteNominee: (id: string) => void;
  onLogout: () => void;
  loggedInAdmin: AdminUser;
  admins: AdminUser[];
  onAddAdmin: (admin: Omit<AdminUser, "id" | "createdAt">) => Promise<void>;
  onUpdateAdmin: (id: string, admin: Partial<AdminUser>) => Promise<void>;
  onDeleteAdmin: (id: string) => Promise<void>;
  nomineeGroups: NomineeGroup[];
  groupingAuditLogs: GroupingAuditLog[];
  onCreateNomineeGroup: (group: Omit<NomineeGroup, "id">) => Promise<string>;
  onUpdateNomineeGroup: (id: string, data: Partial<NomineeGroup>) => Promise<void>;
  onDeleteNomineeGroup: (id: string) => Promise<void>;
  onAddGroupingAuditLog: (log: Omit<GroupingAuditLog, "id">) => Promise<void>;
  securitySettings: SecuritySettings;
  onUpdateSecuritySettings: (settings: SecuritySettings) => void;
  onGenerateVotingCodes: (quantity: number) => Promise<void>;
  onFetchCodeStats: () => Promise<{total: number, used: number, unused: number}>;
  onFetchUnusedCodes: () => Promise<string[]>;
  generalContent: GeneralContentSettings;
  onUpdateGeneralContent: (settings: GeneralContentSettings) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onRearrangeCategories,
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
  onDeclineNomination,
  onDeleteNomination,
  onLinkNominations,
  onUpdateNomineeVotes,
  onDeleteMessage,
  onResetAllData,
  onBulkSeedVotes,
  onAddNominee,
  onUpdateNominee,
  onDeleteNominee,
  onLogout,
  loggedInAdmin,
  admins,
  onAddAdmin,
  onUpdateAdmin,
  onDeleteAdmin,
  nomineeGroups,
  groupingAuditLogs,
  onCreateNomineeGroup,
  onUpdateNomineeGroup,
  onDeleteNomineeGroup,
  onAddGroupingAuditLog,
  securitySettings,
  onUpdateSecuritySettings,
  onGenerateVotingCodes,
  onFetchCodeStats,
  onFetchUnusedCodes,
  generalContent,
  onUpdateGeneralContent
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"time" | "nominations" | "groups" | "manage_nominees" | "ballots" | "guestbook" | "schedule" | "settings" | "administrators" | "categories" | "security">("time");
  const [activeSettingsTab, setActiveSettingsTab] = useState<"profile" | "administrators" | "security" | "danger" | "content">("profile");
  const [manageNomineesTab, setManageNomineesTab] = useState<"all" | "manual" | "approved" | "categories">("all");
  const [manageNomineesSearch, setManageNomineesSearch] = useState("");
  
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "has_nominees" | "empty">("all");
  const [categorySortBy, setCategorySortBy] = useState<"custom" | "id_asc" | "id_desc" | "name_asc" | "name_desc">("custom");
  const [categoryView, setCategoryView] = useState<"grid" | "list">("grid");
  const [manageNomineesCategoryFilter, setManageNomineesCategoryFilter] = useState<string>("all");
  const [manageNomineesSortBy, setManageNomineesSortBy] = useState<"category" | "name" | "votes-desc" | "votes-asc">("category");
  const [customDateStr, setCustomDateStr] = useState(simulatedDate.toISOString().split("T")[0]);
  const [selectedNominationId, setSelectedNominationId] = useState<string | null>(null);
  const [selectedForLinking, setSelectedForLinking] = useState<Set<string>>(new Set());

  // Schedule manager form states
  const [formAnnouncementStart, setFormAnnouncementStart] = useState(timelineSettings.announcementStart.slice(0, 16));
  const [formAnnouncementEnd, setFormAnnouncementEnd] = useState(timelineSettings.announcementEnd.slice(0, 16));
  const [formNominationStart, setFormNominationStart] = useState(timelineSettings.nominationStart.slice(0, 16));
  const [formNominationEnd, setFormNominationEnd] = useState(timelineSettings.nominationEnd.slice(0, 16));
  const [formVotingStart, setFormVotingStart] = useState(timelineSettings.votingStart.slice(0, 16));
  const [formVotingEnd, setFormVotingEnd] = useState(timelineSettings.votingEnd.slice(0, 16));
  const [formCeremony, setFormCeremony] = useState(timelineSettings.ceremony.slice(0, 16));
  const [formResultsVisible, setFormResultsVisible] = useState(!!timelineSettings.resultsVisible);

  // Administrators Management States
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [formAdminName, setFormAdminName] = useState("");
  const [formAdminEmail, setFormAdminEmail] = useState("");
  const [formAdminPassword, setFormAdminPassword] = useState("");
  const [formAdminRole, setFormAdminRole] = useState<"SUPER_ADMIN" | "ADMIN">("ADMIN");
  const [adminActionError, setAdminActionError] = useState("");
  const [adminActionSuccess, setAdminActionSuccess] = useState("");

  // Custom Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDanger?: boolean;
    isAlertOnly?: boolean;
    confirmText: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    onConfirm: () => {},
  });

  // Profile Edit States
  const [profileName, setProfileName] = useState(loggedInAdmin.name);
  const [profilePassword, setProfilePassword] = useState(loggedInAdmin.password || "");
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [showAddAdminPassword, setShowAddAdminPassword] = useState(false);
  const [showEditAdminPassword, setShowEditAdminPassword] = useState(false);

  const [newNomineeName, setNewNomineeName] = useState("");
  const [newNomineeCategory, setNewNomineeCategory] = useState(categories[0]?.id || 1);
  const [newNomineePicture, setNewNomineePicture] = useState("");
  const [newNomineeDesc, setNewNomineeDesc] = useState("");
  const [newNomineeAchievements, setNewNomineeAchievements] = useState<string[]>([]);
  const [newNomineeListType, setNewNomineeListType] = useState<"final" | "approved">("final");
  const [newNomineeSuccess, setNewNomineeSuccess] = useState("");
  const [editingNomineeId, setEditingNomineeId] = useState<string | null>(null);
  const [isNomineeModalOpen, setIsNomineeModalOpen] = useState(false);
  const [nomineeViewMode, setNomineeViewMode] = useState<"grid" | "list">("grid");

  const [successMessage, setSuccessMessage] = useState("");
  const [validationError, setValidationError] = useState("");
  const [nominationToDelete, setNominationToDelete] = useState<string | null>(null);
  const [nomineeToDelete, setNomineeToDelete] = useState<Nominee | null>(null);


  // General Content Form States
  const [gcContactEmail, setGcContactEmail] = React.useState(generalContent?.contactEmail || "");
  const [gcContactWebsite, setGcContactWebsite] = React.useState(generalContent?.contactWebsite || "");
  const [gcContactWebsiteUrl, setGcContactWebsiteUrl] = React.useState(generalContent?.contactWebsiteUrl || "");
  const [gcContactPhone, setGcContactPhone] = React.useState(generalContent?.contactPhone || "");
  const [gcContactFormsUrl, setGcContactFormsUrl] = React.useState(generalContent?.contactFormsUrl || "");
  const [gcChairmanName, setGcChairmanName] = React.useState(generalContent?.chairmanName || "");
  const [gcChairmanTitle, setGcChairmanTitle] = React.useState(generalContent?.chairmanTitle || "");
  const [gcAwardsTitle, setGcAwardsTitle] = React.useState(generalContent?.awardsTitle || "");
  const [gcInvitationTitle, setGcInvitationTitle] = React.useState(generalContent?.invitationTitle || "");
  const [gcLetterBody, setGcLetterBody] = React.useState(generalContent?.letterBody || "");
  const [gcSaveStatus, setGcSaveStatus] = React.useState<"" | "saving" | "saved" | "error">("");

  React.useEffect(() => {
    if(generalContent) {
      setGcContactEmail(generalContent.contactEmail);
      setGcContactWebsite(generalContent.contactWebsite);
      setGcContactWebsiteUrl(generalContent.contactWebsiteUrl);
      setGcContactPhone(generalContent.contactPhone);
      setGcContactFormsUrl(generalContent.contactFormsUrl);
      setGcChairmanName(generalContent.chairmanName);
      setGcChairmanTitle(generalContent.chairmanTitle);
      setGcAwardsTitle(generalContent.awardsTitle);
      setGcInvitationTitle(generalContent.invitationTitle);
      setGcLetterBody(generalContent.letterBody);
    }
  }, [generalContent]);

  // Ballot Filters
  const [ballotSearch, setBallotSearch] = useState("");
  const [ballotCategoryFilter, setBallotCategoryFilter] = useState("all");

  const [codeStats, setCodeStats] = useState<{ total: number, used: number, unused: number } | null>(null);
  const [generateQty, setGenerateQty] = useState("100");
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(false);
  const [isExportingCodes, setIsExportingCodes] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);

  React.useEffect(() => {
    if (activeSubTab === "security" && securitySettings?.requireAccessCode) {
      onFetchCodeStats().then(setCodeStats).catch(console.error);
    }
  }, [activeSubTab, securitySettings?.requireAccessCode, onFetchCodeStats]);
  const [ballotSortBy, setBallotSortBy] = useState<"category" | "votes-desc" | "votes-asc" | "name">("category");

  // Nomination Desk Filters
  const [nominationSearch, setNominationSearch] = useState("");
  const [nominationStatusFilter, setNominationStatusFilter] = useState<"all" | "approved" | "pending" | "declined">("all");
  const [nominationCategoryFilter, setNominationCategoryFilter] = useState<string>("all");
  const [nominationSortBy, setNominationSortBy] = useState<"date" | "name">("date");

  // Category Management State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [catFormName, setCatFormName] = useState("");
  const [catFormDesc, setCatFormDesc] = useState("");
  const [catFormIcon, setCatFormIcon] = useState("Award");

  const openNewCategoryModal = () => {
    setEditingCategory(null);
    setCatFormName("");
    setCatFormDesc("");
    setCatFormIcon("Award");
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategory(cat);
    setCatFormName(cat.name);
    setCatFormDesc(cat.description);
    setCatFormIcon(cat.iconName);
    setIsCategoryModalOpen(true);
  };

  const saveCategory = async () => {
    if (!catFormName.trim() || !catFormDesc.trim() || !catFormIcon.trim()) {
      setConfirmModal({
        isOpen: true,
        title: "Validation Error",
        message: "All fields are required to save a category.",
        isDanger: true,
        isAlertOnly: true,
        confirmText: "OK",
        onConfirm: () => {}
      });
      return;
    }
    const cat: Category = {
      id: editingCategory ? editingCategory.id : 0,
      name: catFormName,
      description: catFormDesc,
      iconName: catFormIcon
    };
    try {
      if (editingCategory) {
        await onUpdateCategory(cat);
      } else {
        await onCreateCategory(cat);
      }
      setIsCategoryModalOpen(false);
    } catch (e: any) {
      console.error(e);
      setConfirmModal({
        isOpen: true,
        title: "Database Error",
        message: `Error saving category:\n\n${e.message || e}`,
        isDanger: true,
        isAlertOnly: true,
        confirmText: "OK",
        onConfirm: () => {}
      });
    }
  };

  const attemptDeleteCategory = (id: number) => {
    const hasNominees = nominees.some((n) => n.categoryId === id);
    if (hasNominees) {
      setConfirmModal({
        isOpen: true,
        title: "Action Blocked",
        message: "Cannot delete this category because there are active nominees in it. Please delete or move the nominees first.",
        isDanger: true,
        isAlertOnly: true,
        confirmText: "OK",
        onConfirm: () => {}
      });
      return;
    }
    const catName = categories.find(c => c.id === id)?.name || "Unknown";
    setConfirmModal({
      isOpen: true,
      title: "Delete Category",
      message: `Are you sure you want to delete the "${catName}" category?\n\nThis action cannot be undone.`,
      isDanger: true,
      confirmText: "Delete",
      onConfirm: async () => {
        onDeleteCategory(id);
      }
    });
  };

  const moveCategory = async (index: number, direction: 'up' | 'down') => {
    if (!onRearrangeCategories) return;
    if (categorySortBy !== "custom") return;

    const newCats = [...displayedCategories];
    if (direction === 'up' && index > 0) {
      const temp = newCats[index];
      newCats[index] = newCats[index - 1];
      newCats[index - 1] = temp;
    } else if (direction === 'down' && index < newCats.length - 1) {
      const temp = newCats[index];
      newCats[index] = newCats[index + 1];
      newCats[index + 1] = temp;
    } else {
      return;
    }

    newCats.forEach((cat, i) => {
      cat.orderIndex = i;
    });

    await onRearrangeCategories(newCats);
  };

  React.useEffect(() => {
    setFormAnnouncementStart(timelineSettings.announcementStart.slice(0, 16));
    setFormAnnouncementEnd(timelineSettings.announcementEnd.slice(0, 16));
    setFormNominationStart(timelineSettings.nominationStart.slice(0, 16));
    setFormNominationEnd(timelineSettings.nominationEnd.slice(0, 16));
    setFormVotingStart(timelineSettings.votingStart.slice(0, 16));
    setFormVotingEnd(timelineSettings.votingEnd.slice(0, 16));
    setFormCeremony(timelineSettings.ceremony.slice(0, 16));
    setFormResultsVisible(!!timelineSettings.resultsVisible);
  }, [timelineSettings]);

  // Stats calculation
  const totalCustomNominations = nominations.length;
  const approvedNominations = nominations.filter((n) => n.approved).length;
  const pendingNominations = nominations.filter((n) => !n.approved).length;

  // Filter & Sort Nominations
  const displayedNominees = nominees.filter(n => manageNomineesTab === "all" ? true : manageNomineesTab === "manual" ? (n.listType === "final" || (!n.listType && !n.id.startsWith("custom-nom-"))) : (n.listType === "approved" || (!n.listType && n.id.startsWith("custom-nom-"))));

  let displayedCategories = [...categories];
  if (categorySearch.trim()) {
    const q = categorySearch.toLowerCase();
    displayedCategories = displayedCategories.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.description.toLowerCase().includes(q)
    );
  }
  if (categoryFilter === "has_nominees") {
    displayedCategories = displayedCategories.filter(c => nominees.some(n => n.categoryId === c.id));
  } else if (categoryFilter === "empty") {
    displayedCategories = displayedCategories.filter(c => !nominees.some(n => n.categoryId === c.id));
  }
  if (categorySortBy === "name_asc") displayedCategories.sort((a,b) => a.name.localeCompare(b.name));
  else if (categorySortBy === "name_desc") displayedCategories.sort((a,b) => b.name.localeCompare(a.name));
  else if (categorySortBy === "id_asc") displayedCategories.sort((a,b) => a.id - b.id);
  else if (categorySortBy === "id_desc") displayedCategories.sort((a,b) => b.id - a.id);
  else if (categorySortBy === "custom") displayedCategories.sort((a,b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  const filteredNominations = nominations
    .filter((nom) => {
      // Search
      const searchStr = nominationSearch.toLowerCase();
      const matchesSearch = 
        nom.nomineeName.toLowerCase().includes(searchStr);
      
      // Status
      const matchesStatus = 
        nominationStatusFilter === "all" ? true :
        nominationStatusFilter === "approved" ? nom.approved : nominationStatusFilter === "declined" ? nom.declined : !nom.approved && !nom.declined;
        
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

  const handleAutoGenerateAchievements = () => {
    if (!newNomineeDesc) return;
    const sentences = newNomineeDesc.split(/(?<=\.)\s+/).filter(s => s.length > 10).map(s => s.trim());
    let generated = sentences.slice(0, 3);
    if (generated.length === 0) {
      generated = ["Demonstrated exceptional performance and significant positive impact."];
    }
    setNewNomineeAchievements(generated);
  };

  const handleCreateNominee = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedAchievements = newNomineeAchievements.filter(a => a.trim().length > 0);

    if (editingNomineeId) {
      onUpdateNominee(editingNomineeId, {
        categoryId: newNomineeCategory,
        name: newNomineeName,
        description: newNomineeDesc || "Added by Admin",
        avatarUrl: newNomineePicture,
        listType: newNomineeListType,
        achievements: cleanedAchievements,
      });
      setNewNomineeSuccess("Nominee updated successfully!");
    } else {
      onAddNominee({
        id: crypto.randomUUID(),
        categoryId: newNomineeCategory,
        name: newNomineeName,
        description: newNomineeDesc || "Added by Admin",
        avatarUrl: newNomineePicture,
        listType: newNomineeListType,
        votes: 0,
        achievements: cleanedAchievements,
      });
      setNewNomineeSuccess("Nominee created successfully!");
    }
    setNewNomineeName("");
    setNewNomineePicture("");
    setNewNomineeDesc("");
    setNewNomineeAchievements([]);
    setEditingNomineeId(null);
    setNewNomineeListType("final");
    setTimeout(() => setNewNomineeSuccess(""), 3000);
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
      resultsVisible: formResultsVisible,
    });

    setSuccessMessage("Award timeline dates and schedules updated successfully!");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const selectedNomination = nominations.find((n) => n.id === selectedNominationId);

  const [groupingModalOpen, setGroupingModalOpen] = useState(false);
  const [selectedForGrouping, setSelectedForGrouping] = useState<Set<string>>(new Set());
  const getDuplicates = (selected: Nomination | undefined, all: Nomination[], groups: NomineeGroup[]) => {
    if (!selected) return [];
    // Filter out nominations already in the current group
    return all.filter(n => 
      n.id !== selected.id && 
      n.categoryId === selected.categoryId &&
      (
        (selected.groupId && n.groupId === selected.groupId) ||
        (!selected.groupId && !n.groupId && 
          (n.nomineeName.toLowerCase() === selected.nomineeName.toLowerCase() || 
           n.nomineeName.toLowerCase().includes(selected.nomineeName.toLowerCase()) || 
           selected.nomineeName.toLowerCase().includes(n.nomineeName.toLowerCase()))
        )
      )
    );
  };
  const similarNominations = getDuplicates(selectedNomination, nominations, nomineeGroups);


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
        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 mt-4 md:mt-0">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/50 font-mono tracking-wider uppercase">Logged in as</span>
            <span className="text-sm font-bold text-emerald-400">{loggedInAdmin.name}</span>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl border border-red-500/20 transition-colors"
          >
            Log Out
          </button>
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
          {activeSubTab === "nominations" && !groupingModalOpen && (
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
                      <option value="declined">Declined</option>
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
                    Go to the <strong>Nomination Portal</strong>, submit an entry, and it will show up here immediately for moderation.
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
                    {selectedForLinking.size >= 2 && (
                      <div className="mb-4">
                        <button
                          onClick={() => {
                            if (onLinkNominations) {
                              onLinkNominations(Array.from(selectedForLinking));
                              setSelectedForLinking(new Set());
                            }
                          }}
                          className="w-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <Users size={14} />
                          Link {selectedForLinking.size} Selected Nominations
                        </button>
                      </div>
                    )}
                    {filteredNominations.map((nom) => {
                      const catName = categories.find((c) => c.id === nom.categoryId)?.name || "Unknown";
                      const isSelected = selectedNominationId === nom.id;
                      
                      const firstSelectedId = Array.from(selectedForLinking)[0];
                      const activeLinkCategoryId = firstSelectedId ? nominations.find(n => n.id === firstSelectedId)?.categoryId : null;
                      const isDisabled = activeLinkCategoryId ? activeLinkCategoryId !== nom.categoryId : false;

                      return (
                        <div
                          key={nom.id}
                          onClick={() => setSelectedNominationId(nom.id)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all space-y-1.5 relative ${
                            isSelected 
                              ? "bg-amber-400/10 border-amber-400" 
                              : "bg-black/20 border-white/5 hover:border-white/10"
                          } ${isDisabled ? "opacity-50" : ""}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                disabled={isDisabled}
                                checked={selectedForLinking.has(nom.id)}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  if (isDisabled) return;
                                  const newSet = new Set(selectedForLinking);
                                  if (e.target.checked) newSet.add(nom.id);
                                  else newSet.delete(nom.id);
                                  setSelectedForLinking(newSet);
                                }}
                                className="w-3.5 h-3.5 text-amber-400 bg-black/40 border border-white/20 rounded focus:ring-amber-400 cursor-pointer disabled:cursor-not-allowed"
                              />
                              <span className="text-[10px] font-mono text-white/40 block">
                                {new Date(nom.submittedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              nom.approved 
                                ? "bg-emerald-400/15 text-emerald-400 border border-emerald-400/20" 
                                : nom.declined ? "bg-red-400/15 text-red-400 border border-red-400/20"
                                : "bg-amber-400/15 text-amber-400 border border-amber-400/20"
                            }`}>
                              {nom.approved ? "Approved" : nom.declined ? "Declined" : "Pending"}
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
                            {!selectedNomination.approved && (
                              <button
                                onClick={() => onToggleApproveNomination(selectedNomination.id)}
                                className="p-2 rounded-lg border cursor-pointer transition-colors bg-emerald-400/10 border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/20"
                                title="Approve Entry"
                              >
                                <CheckCircle size={15} />
                              </button>
                            )}
                            {selectedNomination.approved && (
                              <button
                                onClick={() => onToggleApproveNomination(selectedNomination.id)}
                                className="p-2 rounded-lg border cursor-pointer transition-colors bg-amber-400/10 border-amber-400/20 text-amber-400 hover:bg-amber-400/20"
                                title="Revoke Approval (Move to Pending)"
                              >
                                <XCircle size={15} />
                              </button>
                            )}
                            {!selectedNomination.declined && !selectedNomination.approved && (
                              <button
                                onClick={() => onDeclineNomination(selectedNomination.id)}
                                className="p-2 rounded-lg border cursor-pointer transition-colors bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20"
                                title="Decline Entry"
                              >
                                <XCircle size={15} />
                              </button>
                            )}
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

                        {similarNominations.length > 0 && (
                          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={16} />
                            <div>
                              <strong className="text-amber-400 text-sm block">
                                {similarNominations.length} similar nomination(s) found!
                              </strong>
                              <p className="text-xs text-amber-400/80 mt-1">
                                These nominations appear to be for the same person or are linked as a group.
                              </p>
                            </div>
                          </div>
                        )}

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


                        {/* Similar Nominations UI */}
                        {similarNominations.length > 0 && (
                          <div className="bg-blue-400/5 border border-blue-400/10 text-blue-400 rounded-xl p-3.5 text-[11px] space-y-2 mt-4">
                            <div className="flex items-center gap-2 font-bold">
                              <Users size={14} />
                              <span>{similarNominations.length} similar nomination(s) found!</span>
                            </div>
                            <p className="text-white/70">
                              These might be duplicates. You can group them to consolidate votes during public voting.
                            </p>
                            <button onClick={() => { setGroupingModalOpen(true); setSelectedForGrouping(new Set(similarNominations.map(s => s.id))); }} className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors font-bold cursor-pointer">
                              Review and Group
                            </button>
                          </div>
                        )}
                        
                        

                        {/* Approved candidate note */}
                        {selectedNomination.approved ? (
                          <div className="bg-emerald-400/5 border border-emerald-400/10 text-emerald-400 rounded-xl p-3.5 text-[11px] flex items-center gap-2">
                            <CheckCircle size={14} />
                            <span>This nominee is <strong>authorized</strong> and will dynamically appear in the <strong>Voting Center</strong> during the voting period.</span>
                          </div>
                        ) : selectedNomination.declined ? (
                          <div className="bg-orange-400/5 border border-orange-400/10 text-orange-400 rounded-xl p-3.5 text-[11px] flex items-center gap-2">
                            <XCircle size={14} />
                            <span>This submission is <strong>declined</strong>. It will not appear in the voting center.</span>
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

          {activeSubTab === "nominations" && groupingModalOpen && selectedNomination && (
            <div className="space-y-6 animate-fade-in" id="admin-subtab-create-group">
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <button 
                  onClick={() => setGroupingModalOpen(false)} 
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                >
                  <ChevronRight className="rotate-180" size={18} />
                </button>
                <div>
                  <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Users className="text-amber-400"/> Create Nominee Group
                  </h3>
                  <p className="text-xs text-white/60 mt-1">
                    Select the nominations you want to group together. They will be displayed as a single entry during voting.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="space-y-4">
                   <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wide">Primary (Current Selection)</h4>
                   <div className="bg-amber-400/5 border border-amber-400/30 rounded-xl p-5 text-sm space-y-3">
                     <div className="flex justify-between items-start">
                       <span className="text-[11px] font-mono text-white/50">{new Date(selectedNomination.submittedAt).toLocaleDateString()}</span>
                       <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${selectedNomination.approved ? "bg-emerald-400/15 text-emerald-400 border border-emerald-400/20" : selectedNomination.declined ? "bg-red-400/15 text-red-400 border border-red-400/20" : "bg-amber-400/15 text-amber-400 border border-amber-400/20"}`}>
                         {selectedNomination.approved ? 'Approved' : selectedNomination.declined ? 'Declined' : 'Pending'}
                       </span>
                     </div>
                     <div className="text-white text-xl font-bold">{selectedNomination.nomineeName}</div>
                     <div className="text-white/80 italic bg-black/40 p-4 rounded-lg leading-relaxed">"{selectedNomination.rationale}"</div>
                     <div className="pt-2 border-t border-white/10 text-xs text-white/60 flex flex-col gap-1">
                       <span><strong>Nominator:</strong> {selectedNomination.nominatorName}</span>
                       <span className="font-mono">{selectedNomination.nominatorEmail}</span>
                     </div>
                   </div>
                   
                   <div className="flex flex-col gap-3 mt-4">
                     <button 
                       onClick={async () => {
                          const allIds = [selectedNomination.id, ...Array.from(selectedForGrouping)];
                          const groupId = await onCreateNomineeGroup({
                            categoryId: selectedNomination.categoryId,
                            name: selectedNomination.nomineeName,
                            description: selectedNomination.rationale,
                            nominationIds: allIds,
                            approved: true
                          });
                          await onAddGroupingAuditLog({ adminEmail: loggedInAdmin.email, action: "CREATE", groupId, timestamp: new Date().toISOString() });
                          await onAddGroupingAuditLog({ adminEmail: loggedInAdmin.email, action: "APPROVE_GROUP", groupId, timestamp: new Date().toISOString() });
                          setGroupingModalOpen(false);
                          setActiveSubTab("groups");
                       }}
                       className="w-full py-4 bg-gradient-to-r from-emerald-400 to-emerald-600 text-black font-extrabold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer">
                       Create & Approve Group ({selectedForGrouping.size + 1} Nominations)
                     </button>
                     <button 
                       onClick={async () => {
                          const allIds = [selectedNomination.id, ...Array.from(selectedForGrouping)];
                          const groupId = await onCreateNomineeGroup({
                            categoryId: selectedNomination.categoryId,
                            name: selectedNomination.nomineeName,
                            description: selectedNomination.rationale,
                            nominationIds: allIds,
                            approved: false
                          });
                          await onAddGroupingAuditLog({ adminEmail: loggedInAdmin.email, action: "CREATE", groupId, timestamp: new Date().toISOString() });
                          setGroupingModalOpen(false);
                          setActiveSubTab("groups");
                       }}
                       className="w-full py-3 bg-white/5 border border-white/10 text-white font-bold text-sm rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                       Create Group (Pending)
                     </button>
                   </div>
                 </div>
                 
                 <div className="space-y-4">
                   <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wide">Matching Nominations ({similarNominations.length})</h4>
                   <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                     
                     {similarNominations.map(sim => {
                       const isSelected = selectedForGrouping.has(sim.id);
                       return (
                       <div key={sim.id} onClick={() => {
                           const newSet = new Set(selectedForGrouping);
                           if (newSet.has(sim.id)) newSet.delete(sim.id);
                           else newSet.add(sim.id);
                           setSelectedForGrouping(newSet);
                       }} className={`border rounded-xl p-5 space-y-3 relative overflow-hidden transition-all cursor-pointer ${isSelected ? "bg-blue-500/10 border-blue-500/50" : "bg-white/5 border-white/10 opacity-50 hover:opacity-80"}`}>
                         <div className={`absolute top-0 left-0 w-1 h-full ${isSelected ? "bg-blue-500" : "bg-white/20"}`}></div>
                         <div className="flex justify-between items-start">
                           <div className="flex items-center gap-2">
                             <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "bg-blue-500 border-blue-500" : "border-white/30"}`}>
                               {isSelected && <CheckCircle size={10} className="text-white" />}
                             </div>
                             <span className="text-[11px] font-mono text-white/50">{new Date(sim.submittedAt).toLocaleDateString()}</span>
                           </div>
                           <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${sim.approved ? "bg-emerald-400/15 text-emerald-400 border border-emerald-400/20" : sim.declined ? "bg-red-400/15 text-red-400 border border-red-400/20" : "bg-amber-400/15 text-amber-400 border border-amber-400/20"}`}>
                             {sim.approved ? 'Approved' : sim.declined ? 'Declined' : 'Pending'}
                           </span>
                         </div>
                         <div className="text-white text-lg font-bold">{sim.nomineeName}</div>
                         <div className="text-white/70 italic bg-black/40 p-3 rounded-lg text-xs leading-relaxed">"{sim.rationale}"</div>
                         <div className="pt-2 border-t border-white/10 text-[11px] text-white/60 flex flex-col gap-1">
                           <span><strong>Nominator:</strong> {sim.nominatorName}</span>
                           <span className="font-mono">{sim.nominatorEmail}</span>
                         </div>
                       </div>
                     )})}

                   </div>
                 </div>
              </div>
            </div>
          )}


          {activeSubTab === "groups" && (
            <AdminGroupsTab
              groups={nomineeGroups}
              nominations={nominations}
              categories={categories}
              logs={groupingAuditLogs}
              onApprove={async (id, approved) => {
                await onUpdateNomineeGroup(id, { approved });
                await onAddGroupingAuditLog({ adminEmail: loggedInAdmin.email, action: approved ? "APPROVE_GROUP" : "REJECT_GROUP", groupId: id, timestamp: new Date().toISOString() });
              }}
              onDelete={async (id) => {
                setConfirmModal({
                  isOpen: true,
                  title: "Delete Group",
                  message: "Are you sure you want to delete this group permanently? This cannot be undone.",
                  isDanger: true,
                  confirmText: "Delete Group",
                  onConfirm: async () => {
                    await onDeleteNomineeGroup(id);
                    await onAddGroupingAuditLog({ adminEmail: loggedInAdmin.email, action: "REMOVE", groupId: id, timestamp: new Date().toISOString() });
                  }
                });
              }}
              onRemoveNomination={async (groupId, nominationId, currentIds) => {
                const newIds = currentIds.filter(id => id !== nominationId);
                if (newIds.length === 0) {
                  await onDeleteNomineeGroup(groupId);
                  await onAddGroupingAuditLog({ adminEmail: loggedInAdmin.email, action: "REMOVE", groupId, timestamp: new Date().toISOString() });
                } else {
                  await onUpdateNomineeGroup(groupId, { nominationIds: newIds });
                  await onAddGroupingAuditLog({ adminEmail: loggedInAdmin.email, action: "REMOVE", groupId, nominationId, timestamp: new Date().toISOString() });
                }
              }}
            />
          )}
          {activeSubTab === "manage_nominees" && (
            <div className="space-y-6 animate-fade-in" id="admin-subtab-manage-nominees">
              {manageNomineesTab !== "approved" && (
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <User size={18} className="text-amber-400" />
                      <span>Nominees Pool</span>
                    </h3>
                    <p className="text-xs text-white/60 mt-1">Manage the list of nominees available for voting.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingNomineeId(null);
                      setNewNomineeName("");
                      setNewNomineePicture("");
                      setNewNomineeDesc("");
                      setNewNomineeListType("final");
                      setIsNomineeModalOpen(true);
                    }}
                    className="bg-amber-400 hover:bg-amber-500 text-black px-4 py-2 rounded-xl font-bold text-xs transition-colors flex items-center gap-2"
                  >
                    <Plus size={14} /> Create Nominee
                  </button>
                </div>
              )}

              
              <div className="mt-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2 sm:pb-0 sm:border-0">
                    <button 
                      onClick={() => setManageNomineesTab("all")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${manageNomineesTab === "all" ? "bg-amber-400 text-black" : "text-white/50 hover:bg-white/10 hover:text-white"}`}
                    >All Nominees</button>
                    <button 
                      onClick={() => setManageNomineesTab("manual")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${manageNomineesTab === "manual" ? "bg-amber-400 text-black" : "text-white/50 hover:bg-white/10 hover:text-white"}`}
                    >Final List</button>
                    <button 
                      onClick={() => setManageNomineesTab("approved")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${manageNomineesTab === "approved" ? "bg-amber-400 text-black" : "text-white/50 hover:bg-white/10 hover:text-white"}`}
                    >Approved Nominations</button>
                    <button 
                      onClick={() => setManageNomineesTab("categories")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${manageNomineesTab === "categories" ? "bg-amber-400 text-black" : "text-white/50 hover:bg-white/10 hover:text-white"}`}
                    ><List size={12}/> Categories</button>
                  </div>
                  <div className="flex bg-black/40 border border-white/10 rounded-lg p-1 shrink-0">
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

                {manageNomineesTab === "categories" ? (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <List className="text-amber-400" size={24} />
                          Category Management
                        </h3>
                        <p className="text-white/60 text-sm mt-1">Add, edit, or remove award categories.</p>
                      </div>
                      <button
                        onClick={openNewCategoryModal}
                        className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-extrabold rounded-lg flex items-center gap-2 hover:scale-105 transition-transform"
                      >
                        <Plus size={18} />
                        New Category
                      </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 mb-6">
                      <div className="flex-1 relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                          type="text"
                          placeholder="Search categories..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all outline-none"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <div className="flex bg-black/40 border border-white/10 rounded-xl p-1">
                          <button
                            onClick={() => setCategoryView("grid")}
                            className={`p-1.5 rounded-lg transition-colors ${categoryView === "grid" ? "bg-amber-400 text-black" : "text-white/40 hover:text-white"}`}
                          >
                            <LayoutGrid size={14} />
                          </button>
                          <button
                            onClick={() => setCategoryView("list")}
                            className={`p-1.5 rounded-lg transition-colors ${categoryView === "list" ? "bg-amber-400 text-black" : "text-white/40 hover:text-white"}`}
                          >
                            <List size={14} />
                          </button>
                        </div>
                        <div className="relative flex-1 min-w-[140px]">
                          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                          <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value as any)}
                            className="w-full pl-9 pr-8 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white appearance-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all outline-none"
                          >
                            <option value="all">All Categories</option>
                            <option value="has_nominees">Has Nominees</option>
                            <option value="empty">Empty Categories</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                        </div>
                        <div className="relative flex-1 min-w-[160px]">
                          <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                          <select
                            value={categorySortBy}
                            onChange={(e) => setCategorySortBy(e.target.value as any)}
                            className="w-full pl-9 pr-8 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white appearance-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all outline-none"
                          >
                            <option value="custom">Custom Order</option>
                            <option value="id_asc">Oldest First</option>
                            <option value="id_desc">Newest First</option>
                            <option value="name_asc">Name (A-Z)</option>
                            <option value="name_desc">Name (Z-A)</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className={categoryView === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
                      {displayedCategories.map((cat, index) => (
                        <div key={cat.id} className={`bg-white/5 border border-white/10 rounded-xl p-5 hover:border-amber-400/30 transition-all group/cat ${categoryView === "list" ? "flex items-center justify-between" : "flex flex-col justify-between"}`}>
                          <div className={`flex gap-3 ${categoryView === "list" ? "items-center flex-1" : "flex-col space-y-3"}`}>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-amber-400/10 text-amber-400 rounded-lg shrink-0">
                                <Trophy size={18} />
                              </div>
                              <h4 className={`font-bold text-white ${categoryView === "list" ? "text-base min-w-[200px]" : "text-lg"}`}>{cat.name}</h4>
                            </div>
                            <p className={`text-white/70 text-sm leading-relaxed ${categoryView === "list" ? "line-clamp-1 flex-1 px-4" : "line-clamp-3"}`}>{cat.description}</p>
                            <div className={`text-[10px] text-white/40 font-mono shrink-0 ${categoryView === "list" ? "w-[120px]" : ""}`}>
                              Icon: {cat.iconName} | ID: {cat.id}
                            </div>
                          </div>
                          <div className={`${categoryView === "list" ? "flex items-center gap-2 shrink-0 ml-4 border-l border-white/10 pl-4" : "mt-4 pt-4 border-t border-white/10 flex gap-2"}`}>
                            {categorySortBy === "custom" && categoryFilter === "all" && categorySearch === "" && (
                              <div className="flex flex-col bg-black/40 rounded-lg overflow-hidden shrink-0">
                                <button onClick={() => moveCategory(index, 'up')} disabled={index === 0} className="p-1 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-white/60 hover:text-white transition-colors">
                                  <ArrowUp size={12} />
                                </button>
                                <button onClick={() => moveCategory(index, 'down')} disabled={index === displayedCategories.length - 1} className="p-1 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-white/60 hover:text-white transition-colors">
                                  <ArrowDown size={12} />
                                </button>
                              </div>
                            )}
                            <button
                              onClick={() => openEditCategoryModal(cat)}
                              className={`py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold rounded flex justify-center items-center gap-2 transition-colors cursor-pointer ${categoryView === "list" ? "px-4" : "flex-1"}`}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => attemptDeleteCategory(cat.id)}
                              className={`py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded flex justify-center items-center gap-2 transition-colors cursor-pointer ${categoryView === "list" ? "px-4" : "flex-1"}`}
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                      {displayedCategories.length === 0 && (
                        <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-xl bg-black/10">
                          <AlertCircle className="mx-auto text-white/20 mb-3" size={32} />
                          <p className="text-white/50 text-sm">No categories match your search/filter.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Manage Nominees Filters & Controls */}
                <div className="flex flex-col md:flex-row gap-3 mb-6">
                  <div className="flex-1 relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search by nominee name or description..."
                      value={manageNomineesSearch}
                      onChange={(e) => setManageNomineesSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all outline-none"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="relative flex-1 min-w-[140px]">
                      <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <select
                        value={manageNomineesCategoryFilter}
                        onChange={(e) => setManageNomineesCategoryFilter(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white appearance-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all outline-none"
                      >
                        <option value="all">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.id.toString()}>{c.name}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                    </div>
                    <div className="relative flex-1 min-w-[160px]">
                      <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <select
                        value={manageNomineesSortBy}
                        onChange={(e) => setManageNomineesSortBy(e.target.value as any)}
                        className="w-full pl-9 pr-8 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white appearance-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all outline-none"
                      >
                        <option value="category">Group by Category</option>
                        <option value="votes-desc">Highest Votes</option>
                        <option value="votes-asc">Lowest Votes</option>
                        <option value="name">Name (A-Z)</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-10">
                  {(() => {
                    let filtered = displayedNominees;

                    if (manageNomineesSearch.trim()) {
                      const q = manageNomineesSearch.toLowerCase();
                      filtered = filtered.filter(n => 
                        n.name.toLowerCase().includes(q) || 
                        (n.description && n.description.toLowerCase().includes(q))
                      );
                    }

                    if (manageNomineesCategoryFilter !== "all") {
                      const catId = parseInt(manageNomineesCategoryFilter, 10);
                      filtered = filtered.filter(n => n.categoryId === catId);
                    }

                    const renderNomineeGridList = (renderNominees: typeof nominees) => {
                      if (nomineeViewMode === "list") {
                        return (
                          <div className="space-y-3">
                            {renderNominees.map((n) => (
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
                                      setNewNomineeAchievements(n.achievements || []);
                                      setNewNomineeListType(n.listType || (!n.id.startsWith("custom-nom-") ? "final" : "approved"));
                                      setIsNomineeModalOpen(true);
                                    }}
                                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
                                    title="Edit Nominee"
                                  >
                                    <RefreshCw size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setNomineeToDelete(n)}
                                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors border border-red-500/20 cursor-pointer"
                                    title="Delete Nominee"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      } else {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {renderNominees.map((n) => (
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
                                      setNewNomineeAchievements(n.achievements || []);
                                      setNewNomineeListType(n.listType || (!n.id.startsWith("custom-nom-") ? "final" : "approved"));
                                      setIsNomineeModalOpen(true);
                                    }}
                                    className="flex-1 flex justify-center p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
                                    title="Edit Nominee"
                                  >
                                    <RefreshCw size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setNomineeToDelete(n)}
                                    className="flex-1 flex justify-center p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors border border-red-500/20 cursor-pointer"
                                    title="Delete Nominee"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }
                    };

                    if (manageNomineesSortBy === "category") {
                      const displayCategories = manageNomineesCategoryFilter === "all" ? categories : categories.filter(c => c.id === parseInt(manageNomineesCategoryFilter, 10));
                      return displayCategories.map((cat) => {
                        const categoryNominees = filtered.filter((n) => n.categoryId === cat.id).sort((a,b) => b.votes - a.votes);
                        if (categoryNominees.length === 0 && manageNomineesSearch.trim() !== "") return null;
                        if (categoryNominees.length === 0) return null;

                        return (
                          <div key={cat.id} className="space-y-4">
                            <h5 className="text-[11px] font-extrabold text-amber-400 uppercase tracking-widest border-b border-white/10 pb-2">
                              {cat.name}
                            </h5>
                            {renderNomineeGridList(categoryNominees)}
                          </div>
                        );
                      });
                    } else {
                      let sorted = [...filtered];
                      if (manageNomineesSortBy === "votes-desc") sorted.sort((a,b) => b.votes - a.votes);
                      if (manageNomineesSortBy === "votes-asc") sorted.sort((a,b) => a.votes - b.votes);
                      if (manageNomineesSortBy === "name") sorted.sort((a,b) => a.name.localeCompare(b.name));

                      return (
                        <div className="space-y-4">
                          <h5 className="text-[11px] font-extrabold text-amber-400 uppercase tracking-widest border-b border-white/10 pb-2">
                            All Filtered Nominees
                          </h5>
                          {renderNomineeGridList(sorted)}
                        </div>
                      );
                    }
                  })()}
                  
                  {(() => {
                    let filtered = displayedNominees;
                    if (manageNomineesSearch.trim()) {
                      const q = manageNomineesSearch.toLowerCase();
                      filtered = filtered.filter(n => 
                        n.name.toLowerCase().includes(q) || 
                        (n.description && n.description.toLowerCase().includes(q))
                      );
                    }
                    if (manageNomineesCategoryFilter !== "all") {
                      const catId = parseInt(manageNomineesCategoryFilter, 10);
                      filtered = filtered.filter(n => n.categoryId === catId);
                    }
                    return filtered.length === 0 ? (
                    <div className="text-center p-8 bg-white/5 border border-white/10 rounded-xl">
                      <User size={32} className="mx-auto text-white/20 mb-3" />
                      <p className="text-xs text-white/50 font-bold">No nominees match the current filter.</p>
                      <p className="text-[10px] text-white/40 mt-1">Try selecting a different tab or filter.</p>
                    </div>
                    ) : null;
                  })()}
                </div>
              </>
            )}
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

              {/* Ballot Filters & Controls */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search by nominee name or organization..."
                    value={ballotSearch}
                    onChange={(e) => setBallotSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="relative flex-1 min-w-[140px]">
                    <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <select
                      value={ballotCategoryFilter}
                      onChange={(e) => setBallotCategoryFilter(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white appearance-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all outline-none"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(c => <option key={c.id} value={c.id.toString()}>{c.name}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                  </div>
                  <div className="relative flex-1 min-w-[160px]">
                    <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <select
                      value={ballotSortBy}
                      onChange={(e) => setBallotSortBy(e.target.value as any)}
                      className="w-full pl-9 pr-8 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white appearance-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all outline-none"
                    >
                      <option value="category">Group by Category</option>
                      <option value="votes-desc">Highest Votes</option>
                      <option value="votes-asc">Lowest Votes</option>
                      <option value="name">Name (A-Z)</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Categories / Flat list with vote counts and dynamic progress bars */}
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                {(() => {
                  let filtered = nominees;
                  if (ballotSearch.trim()) {
                    const q = ballotSearch.toLowerCase();
                    filtered = filtered.filter(n => n.name.toLowerCase().includes(q) || (n.organization && n.organization.toLowerCase().includes(q)));
                  }
                  if (ballotCategoryFilter !== "all") {
                    const catId = parseInt(ballotCategoryFilter, 10);
                    filtered = filtered.filter(n => n.categoryId === catId);
                  }

                  if (ballotSortBy === "category") {
                    const displayCategories = ballotCategoryFilter === "all" ? categories : categories.filter(c => c.id === parseInt(ballotCategoryFilter, 10));
                    return displayCategories.map((cat) => {
                      const categoryNominees = filtered.filter((n) => n.categoryId === cat.id).sort((a,b) => b.votes - a.votes);
                      if (categoryNominees.length === 0 && ballotSearch.trim() !== "") return null;
                      
                      const totalCatVotes = nominees.filter((n) => n.categoryId === cat.id).reduce((sum, n) => sum + n.votes, 0);
                      
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
                    });
                  } else {
                    let sorted = [...filtered];
                    if (ballotSortBy === "votes-desc") sorted.sort((a,b) => b.votes - a.votes);
                    if (ballotSortBy === "votes-asc") sorted.sort((a,b) => a.votes - b.votes);
                    if (ballotSortBy === "name") sorted.sort((a,b) => a.name.localeCompare(b.name));
                    
                    return (
                      <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-4">
                        <div className="flex justify-between items-center gap-3 border-b border-white/5 pb-2">
                          <strong className="text-xs text-white block">All Filtered Nominees</strong>
                          <span className="bg-white/5 text-white/80 border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-mono">
                            {sorted.length} nominees
                          </span>
                        </div>
                        <div className="space-y-4">
                          {sorted.length === 0 ? (
                             <p className="text-[10px] text-white/30 italic text-center py-2">No nominees match the current filters.</p>
                          ) : (
                            sorted.map((nom) => {
                               const cat = categories.find(c => c.id === nom.categoryId);
                               const totalCatVotes = nominees.filter((n) => n.categoryId === nom.categoryId).reduce((sum, n) => sum + n.votes, 0);
                               const percent = totalCatVotes > 0 ? (nom.votes / totalCatVotes) * 100 : 0;
                               return (
                                  <div key={nom.id} className="space-y-1.5 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start text-xs">
                                      <div>
                                        <span className="text-white/80 font-medium">
                                          {nom.name}
                                          {nom.organization && (
                                            <span className="text-[10px] text-white/40 block font-light">{nom.organization}</span>
                                          )}
                                        </span>
                                        {cat && <span className="text-[9px] text-amber-400 font-mono block mt-1 uppercase">Category {cat.id}: {cat.name}</span>}
                                      </div>
                                      <div className="flex flex-col items-end gap-1.5">
                                        <span className="font-mono font-bold text-amber-400">{nom.votes.toLocaleString()} <span className="text-[10px] text-white/40">({percent.toFixed(1)}%)</span></span>
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
                  }
                })()}
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
                          setConfirmModal({
                            isOpen: true,
                            title: "Delete Guestbook Post",
                            message: "Are you sure you want to delete this guestbook post permanently? This cannot be undone.",
                            isDanger: true,
                            confirmText: "Delete Post",
                            onConfirm: async () => {
                              await onDeleteMessage(msg.id);
                            }
                          });
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


                <div className="pt-4 border-t border-white/5 space-y-2">
                  <label className="text-xs font-bold text-white block">
                    Live Results & Gala Page Visibility
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formResultsVisible}
                      onChange={(e) => setFormResultsVisible(e.target.checked)}
                      className="w-4 h-4 text-amber-400 bg-white/5 border-white/20 rounded focus:ring-amber-400 focus:ring-offset-gray-900"
                    />
                    <span className="text-sm text-white/80">Make "Live Results & Gala" public for all users</span>
                  </label>
                  <p className="text-[10px] text-white/40 pl-7">
                    When unchecked, only administrators can see the Live Results & Gala page.
                  </p>
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
                      setConfirmModal({
                        isOpen: true,
                        title: "Restore Default Dates",
                        message: "Are you sure you want to restore the default phase and ceremony dates?",
                        isDanger: false,
                        confirmText: "Restore Defaults",
                        onConfirm: () => {
                          setFormAnnouncementStart("2026-07-03T00:00");
                          setFormAnnouncementEnd("2026-07-09T23:59");
                          setFormNominationStart("2026-07-10T00:00");
                          setFormNominationEnd("2026-07-30T23:59");
                          setFormVotingStart("2026-07-31T00:00");
                          setFormVotingEnd("2026-08-25T23:59");
                          setFormCeremony("2026-09-05T18:00");
                          setFormResultsVisible(false);
                          onUpdateTimelineSettings({
                            announcementStart: "2026-07-03T00:00:00",
                            announcementEnd: "2026-07-09T23:59:59",
                            nominationStart: "2026-07-10T00:00:00",
                            nominationEnd: "2026-07-30T23:59:59",
                            votingStart: "2026-07-31T00:00:00",
                            votingEnd: "2026-08-25T23:59:59",
                            ceremony: "2026-09-05T18:00:00",
                            resultsVisible: false,
                          });
                          setSuccessMessage("Schedule restored to original defaults.");
                          setTimeout(() => setSuccessMessage(""), 4000);
                        }
                      });
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
                  <span>System Settings & Configuration</span>
                </h3>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Manage your profile, system state, voting security, and global administrator permissions.
                </p>
              </div>

              {/* SETTINGS SUB-TABS */}
              <div className="flex flex-wrap gap-2 pb-4 border-b border-white/10">
                <button
                  onClick={() => setActiveSettingsTab("profile")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSettingsTab === "profile" ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white"}`}
                >
                  My Profile
                </button>
                {loggedInAdmin.role === "SUPER_ADMIN" && (
                  <button
                    onClick={() => setActiveSettingsTab("administrators")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSettingsTab === "administrators" ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white"}`}
                  >
                    Administrators
                  </button>
                )}
                <button
                  onClick={() => setActiveSettingsTab("security")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSettingsTab === "security" ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white"}`}
                >
                  Security & Voting Access
                </button>
                {loggedInAdmin.role === "SUPER_ADMIN" && (
                  <button
                    onClick={() => setActiveSettingsTab("danger")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSettingsTab === "danger" ? "bg-red-500/10 text-red-400" : "text-red-400/50 hover:bg-red-500/5 hover:text-red-400"}`}
                  >
                    Danger Zone
                  </button>
                )}
                <button
                  onClick={() => setActiveSettingsTab("content")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSettingsTab === "content" ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white"}`}
                >
                  General Content
                </button>
              </div>

              {adminActionError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-xl flex items-center gap-2.5 animate-fade-in">
                  <XCircle size={16} className="text-red-400 shrink-0" />
                  <span>{adminActionError}</span>
                </div>
              )}
              {adminActionSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl flex items-center gap-2.5 animate-fade-in">
                  <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                  <span>{adminActionSuccess}</span>
                </div>
              )}

              {/* MY PROFILE SECTION */}
              {activeSettingsTab === "profile" && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-2xl animate-fade-in">
                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <User size={16} className="text-amber-400" />
                  My Profile
                </h4>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await onUpdateAdmin(loggedInAdmin.id, {
                      name: profileName,
                      password: profilePassword,
                    });
                    setAdminActionSuccess("Profile updated successfully!");
                    setTimeout(() => setAdminActionSuccess(""), 3000);
                  } catch (e: any) {
                    setAdminActionError(e.message || "Failed to update profile");
                    setTimeout(() => setAdminActionError(""), 4000);
                  }
                }} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white block">Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white block">Email (Read Only)</label>
                    <input
                      type="email"
                      value={loggedInAdmin.email}
                      readOnly
                      className="w-full bg-white/5 border border-transparent rounded-xl px-4 py-2.5 text-xs text-white/50 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white block">Password</label>
                    <div className="relative">
                      <input
                        type={showProfilePassword ? "text" : "password"}
                        value={profilePassword}
                        onChange={(e) => setProfilePassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowProfilePassword(!showProfilePassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                      >
                        {showProfilePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-amber-400 hover:bg-amber-500 text-black px-5 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-md shadow-amber-400/10"
                  >
                    Save Profile Changes
                  </button>
                </form>
              </div>
              )}

              {/* SUPER ADMIN RESTRICTED AREA: Administrators */}
              {loggedInAdmin.role === "SUPER_ADMIN" && activeSettingsTab === "administrators" && (
                <div className="animate-fade-in">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-6">
                      <Users size={18} className="text-amber-400" />
                      <span>Administrators Management</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Administrators List */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-white mb-4">Current Administrators</h4>
                        <div className="space-y-3">
                          {admins.map((admin) => (
                            <div key={admin.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-white">{admin.name}</p>
                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${admin.role === 'SUPER_ADMIN' ? 'bg-amber-400/20 text-amber-400' : 'bg-white/10 text-white/60'}`}>
                                      {admin.role}
                                    </span>
                                  </div>
                                  <p className="text-xs text-white/60">{admin.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {admin.id === loggedInAdmin.id && (
                                    <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                                      You
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingAdminId(admin.id);
                                    setFormAdminName(admin.name);
                                    setFormAdminEmail(admin.email);
                                    setFormAdminPassword(admin.password || "");
                                    setFormAdminRole(admin.role);
                                    setAdminModalOpen(true);
                                  }}
                                  className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-bold rounded-lg transition-colors text-center"
                                >
                                  Edit User
                                </button>
                                {admin.id !== loggedInAdmin.id && (
                                  <button
                                    onClick={() => {
                                      setConfirmModal({
                                        isOpen: true,
                                        title: "Delete Administrator",
                                        message: `DANGER: Are you absolutely sure you want to permanently delete administrator "${admin.name}" (${admin.email})?\n\nThis action cannot be undone and they will immediately lose access to the developer console.`,
                                        isDanger: true,
                                        confirmText: "Delete Administrator",
                                        onConfirm: async () => {
                                          try {
                                            await onDeleteAdmin(admin.id);
                                            setAdminActionSuccess(`Administrator ${admin.name} deleted.`);
                                            setTimeout(() => setAdminActionSuccess(""), 3000);
                                          } catch (e: any) {
                                            setAdminActionError(e.message || "Failed to delete administrator");
                                            setTimeout(() => setAdminActionError(""), 4000);
                                          }
                                        }
                                      });
                                    }}
                                    className="flex-1 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-lg transition-colors text-center"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Add New Administrator */}
                      <div className="bg-black/20 border border-white/5 rounded-2xl p-6 h-fit">
                        <h4 className="text-sm font-bold text-white mb-4">Add New Administrator</h4>
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          if (!formAdminName || !formAdminEmail || !formAdminPassword) return;
                          try {
                            await onAddAdmin({
                              name: formAdminName,
                              email: formAdminEmail,
                              password: formAdminPassword,
                              role: formAdminRole
                            });
                            setFormAdminName("");
                            setFormAdminEmail("");
                            setFormAdminPassword("");
                            setFormAdminRole("ADMIN");
                            setAdminActionSuccess("Administrator added successfully!");
                            setTimeout(() => setAdminActionSuccess(""), 3000);
                          } catch (e: any) {
                            setAdminActionError(e.message || "Failed to add administrator");
                            setTimeout(() => setAdminActionError(""), 4000);
                          }
                        }} className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-white block">Name</label>
                            <input
                              type="text"
                              value={formAdminName}
                              onChange={(e) => setFormAdminName(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all"
                              required
                              placeholder="E.g., Jane Doe"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-white block">Email Address</label>
                            <input
                              type="email"
                              value={formAdminEmail}
                              onChange={(e) => setFormAdminEmail(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all"
                              required
                              placeholder="jane@awol.com"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-white block">Password</label>
                              <div className="relative">
                                <input
                                  type={showAddAdminPassword ? "text" : "password"}
                                  value={formAdminPassword}
                                  onChange={(e) => setFormAdminPassword(e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all"
                                  required
                                  placeholder="Secure password"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowAddAdminPassword(!showAddAdminPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                                >
                                  {showAddAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-white block">Role</label>
                              <select
                                value={formAdminRole}
                                onChange={(e) => setFormAdminRole(e.target.value as "ADMIN" | "SUPER_ADMIN")}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all"
                              >
                                <option value="ADMIN">Administrator</option>
                                <option value="SUPER_ADMIN">Super Admin</option>
                              </select>
                            </div>
                          </div>
                          <button
                            type="submit"
                            className="w-full bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-colors flex justify-center items-center gap-2 mt-4"
                          >
                            <Plus size={14} />
                            Add Administrator
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DANGER ZONE */}
              {loggedInAdmin.role === "SUPER_ADMIN" && activeSettingsTab === "danger" && (
                <div className="animate-fade-in">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-6">
                      <Shield size={18} className="text-amber-400" />
                      <span>Danger Zone</span>
                    </h3>
                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 max-w-2xl">
                      <h4 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                        <Trash2 size={16} />
                        Hard Reset
                      </h4>
                      <p className="text-xs text-white/60 mb-6">
                        Hard reset actions for testing purposes. These actions cannot be undone and will permanently clear local state and local storage.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: "Reset All Database Votes",
                              message: "WARNING: This will perform a HARD RESET of all your live database votes.\n\nThis will completely clear all current votes for all nominees back to 0, and clear your local device cache.\n\nAre you absolutely sure you want to proceed?",
                              isDanger: true,
                              confirmText: "Reset All Votes",
                              onConfirm: async () => {
                                await onResetAllData();
                                setAdminActionSuccess("All votes in the database have been reset to 0 and local cache cleared.");
                                setTimeout(() => setAdminActionSuccess(""), 5000);
                              }
                            });
                          }}
                          className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl font-bold text-xs transition-colors flex justify-center items-center gap-2 cursor-pointer"
                        >
                          <Trash2 size={14} />
                          Reset All Votes
                        </button>
                        
                        <button
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: "Bulk Seed Random Votes",
                              message: "WARNING: This will randomly generate and insert bulk votes into the live database for every single nominee.\n\nThis is meant for testing purposes and will skew the live leaderboard.\n\nAre you absolutely sure you want to seed random votes?",
                              isDanger: true,
                              confirmText: "Seed Random Votes",
                              onConfirm: () => {
                                onBulkSeedVotes();
                                setAdminActionSuccess("Testing votes have been seeded randomly into the database!");
                                setTimeout(() => setAdminActionSuccess(""), 5000);
                              }
                            });
                          }}
                          className="w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 px-4 py-3 rounded-xl font-bold text-xs transition-colors flex justify-center items-center gap-2 cursor-pointer"
                        >
                          <TrendingUp size={14} />
                          Bulk Seed Random Votes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECURITY & ACCESS */}
              {activeSettingsTab === "security" && (
                <div className="animate-fade-in">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6" id="admin-subtab-security">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Key size={18} className="text-amber-400" />
                      <span>Security & Voting Access</span>
                    </h3>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed mb-6">
                      Manage the Code-as-an-Account voting system. Generate access codes for the voters, enable/disable code requirements, and monitor usage.
                    </p>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-bold text-white mb-1">Require Access Code</h4>
                          <p className="text-xs text-white/60">If enabled, voters will need to enter a 6-digit access code to unlock the voting center.</p>
                        </div>
                        <button
                          onClick={() => {
                            const willBeOn = !(securitySettings?.requireAccessCode);
                            onUpdateSecuritySettings({ 
                              requireAccessCode: willBeOn,
                              // Automatically disable Captcha if Access Codes are turned ON
                              enableCaptcha: willBeOn ? false : securitySettings?.enableCaptcha
                            });
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${securitySettings?.requireAccessCode ? 'bg-amber-400' : 'bg-white/20'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings?.requireAccessCode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      <div className={`flex justify-between items-center pt-4 border-t border-white/5 ${securitySettings?.requireAccessCode ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div>
                          <h4 className="text-sm font-bold text-white mb-1">Enable Bot Protection (Math CAPTCHA)</h4>
                          <p className="text-xs text-white/60">Provides a basic layer of protection by requiring a simple math test before voting. Only available when Access Codes are OFF.</p>
                        </div>
                        <button
                          disabled={securitySettings?.requireAccessCode}
                          onClick={() => onUpdateSecuritySettings({ 
                            requireAccessCode: false,
                            enableCaptcha: !(securitySettings?.enableCaptcha) 
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${securitySettings?.enableCaptcha ? 'bg-amber-400' : 'bg-white/20'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings?.enableCaptcha ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>

                    {/* ── MONIME PAYMENT GATE ─────────────────────────────── */}
                    <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-mono">Monime Payment Integration</span>
                        <span className="text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full font-bold">NEW</span>
                      </div>
                      {/* Enable Payment Toggle */}
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-bold text-white mb-1">Require Payment to Vote</h4>
                          <p className="text-xs text-white/60">If enabled, visitors must complete a Monime payment before casting their votes.</p>
                        </div>
                        <button
                          onClick={() => {
                            const willBeOn = !securitySettings?.requirePayment;
                            onUpdateSecuritySettings({
                              ...securitySettings,
                              requirePayment: willBeOn,
                              // Default mode and amount if turning on for the first time
                              paymentMode: securitySettings?.paymentMode || "one_time",
                              paymentAmount: securitySettings?.paymentAmount || 5,
                              paymentCurrency: securitySettings?.paymentCurrency || "SLE",
                            });
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${securitySettings?.requirePayment ? 'bg-amber-400' : 'bg-white/20'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings?.requirePayment ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>

                      {/* Payment Configuration — only shown when payment is enabled */}
                      {securitySettings?.requirePayment && (
                        <div className="pt-4 border-t border-white/5 space-y-4 animate-fade-in">

                          {/* Payment Mode */}
                          <div>
                            <h4 className="text-sm font-bold text-white mb-2">Payment Mode</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* One-Time */}
                              <button
                                onClick={() => onUpdateSecuritySettings({ ...securitySettings, paymentMode: "one_time" })}
                                className={`flex flex-col items-start gap-1 p-4 rounded-xl border transition-all text-left ${
                                  securitySettings?.paymentMode === "one_time" || !securitySettings?.paymentMode
                                    ? "bg-amber-400/10 border-amber-400/40 text-amber-400"
                                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                }`}
                              >
                                <span className="text-xs font-black uppercase tracking-wider">One-Time Unlock</span>
                                <span className="text-[11px] leading-relaxed opacity-80">
                                  Voter pays once to unlock the entire voting center for all categories.
                                </span>
                              </button>
                              {/* Per-Vote */}
                              <button
                                onClick={() => onUpdateSecuritySettings({ ...securitySettings, paymentMode: "per_vote" })}
                                className={`flex flex-col items-start gap-1 p-4 rounded-xl border transition-all text-left ${
                                  securitySettings?.paymentMode === "per_vote"
                                    ? "bg-amber-400/10 border-amber-400/40 text-amber-400"
                                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                                }`}
                              >
                                <span className="text-xs font-black uppercase tracking-wider">Per-Vote Payment</span>
                                <span className="text-[11px] leading-relaxed opacity-80">
                                  Voter pays separately for each individual vote they cast.
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Amount & Currency */}
                          <div>
                            <h4 className="text-sm font-bold text-white mb-2">
                              Payment Amount
                              <span className="text-white/40 font-normal text-xs ml-2">
                                ({securitySettings?.paymentMode === "per_vote" ? "per vote" : "one-time unlock"})
                              </span>
                            </h4>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center bg-black/40 border border-white/10 rounded-xl overflow-hidden focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400/20 transition-all">
                                <span className="px-3 text-xs font-bold text-amber-400 border-r border-white/10 py-2.5 bg-white/5 whitespace-nowrap">
                                  {securitySettings?.paymentCurrency || "SLE"}
                                </span>
                                <input
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={securitySettings?.paymentAmount ?? 5}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val) && val > 0) {
                                      onUpdateSecuritySettings({ ...securitySettings, paymentAmount: val });
                                    }
                                  }}
                                  className="bg-transparent px-3 py-2.5 text-sm text-white font-mono font-bold w-28 focus:outline-none"
                                />
                              </div>
                              <p className="text-xs text-white/40 leading-relaxed">
                                Amount in SLE charged to each voter
                                {securitySettings?.paymentMode === "per_vote" ? " per vote" : " to unlock all categories"}.
                              </p>
                            </div>
                          </div>

                          {/* Info note */}
                          <div className="flex items-start gap-2.5 bg-amber-400/5 border border-amber-400/20 rounded-xl p-4">
                            <AlertCircle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                            <p className="text-[11px] text-amber-300/80 leading-relaxed">
                              Payments are processed securely via <strong className="text-amber-400">Monime</strong>. Ensure your{" "}
                              <code className="bg-white/10 px-1 py-0.5 rounded text-[10px]">MONIME_API_KEY</code> and{" "}
                              <code className="bg-white/10 px-1 py-0.5 rounded text-[10px]">MONIME_SPACE_ID</code> secrets are set in
                              your Supabase Edge Function environment.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* ── END MONIME PAYMENT GATE ─────────────────────────── */}

                    {securitySettings?.requireAccessCode && (
                      <div className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <p className="text-xs text-white/60 uppercase tracking-widest font-bold">Total Codes</p>
                            <p className="text-3xl font-black text-white mt-2">
                              {codeStats ? (codeStats.total || 0).toLocaleString() : "-"}
                            </p>
                          </div>
                          <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-4">
                            <p className="text-xs text-amber-400/80 uppercase tracking-widest font-bold">Used Codes</p>
                            <p className="text-3xl font-black text-amber-400 mt-2">
                              {codeStats ? (codeStats.used || 0).toLocaleString() : "-"}
                            </p>
                          </div>
                          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                            <p className="text-xs text-green-400/80 uppercase tracking-widest font-bold">Unused Codes</p>
                            <p className="text-3xl font-black text-green-400 mt-2">
                              {codeStats ? (codeStats.unused || 0).toLocaleString() : "-"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max="5000"
                              value={generateQty}
                              onChange={(e) => setGenerateQty(e.target.value)}
                              disabled={isGeneratingCodes}
                              className="w-24 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all"
                            />
                            <button
                              disabled={isGeneratingCodes}
                              onClick={async () => {
                                const qty = parseInt(generateQty);
                                if (qty && !isNaN(qty) && qty > 0) {
                                  setIsGeneratingCodes(true);
                                  try {
                                    await onGenerateVotingCodes(qty);
                                    const stats = await onFetchCodeStats();
                                    setCodeStats(stats);
                                    setConfirmModal({
                                      isOpen: true,
                                      title: "Codes Generated",
                                      message: `Successfully generated ${qty} new access codes.`,
                                      isAlertOnly: true,
                                      confirmText: "OK",
                                      onConfirm: () => {}
                                    });
                                    setGenerateQty("100");
                                  } catch(e: any) {
                                    setConfirmModal({
                                      isOpen: true,
                                      title: "Generation Failed",
                                      message: "Failed to generate codes: " + e.message,
                                      isAlertOnly: true,
                                      isDanger: true,
                                      confirmText: "OK",
                                      onConfirm: () => {}
                                    });
                                  } finally {
                                    setIsGeneratingCodes(false);
                                  }
                                  }
                                }}
                                className="bg-amber-400 hover:bg-amber-500 text-black px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
                              >
                                {isGeneratingCodes ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Plus size={16} />
                                    Generate Codes
                                  </>
                                )}
                              </button>
                            </div>
                            <button
                              onClick={async () => {
                                setIsExportingPDF(true);
                                try {
                                  const codes = await onFetchUnusedCodes();
                                  if (codes.length === 0) {
                                    setConfirmModal({
                                      isOpen: true,
                                      title: "No Codes Available",
                                      message: "There are no unused codes available to export.",
                                      isAlertOnly: true,
                                      confirmText: "OK",
                                      onConfirm: () => {}
                                    });
                                    setIsExportingPDF(false);
                                    return;
                                  }
                                  
                                  // Generate HTML for printing
                                  const printWindow = window.open('', '_blank');
                                  if (!printWindow) {
                                    throw new Error("Popup blocked. Please allow popups to print/export PDF.");
                                  }
                                  
                                  let tableRows = codes.map((c, i) => `<tr><td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${i + 1}</td><td style="padding: 8px; border: 1px solid #ddd; font-family: monospace; text-align: center;">${c}</td></tr>`).join("");
                                  
                                  printWindow.document.write(`
                                    <html>
                                      <head>
                                        <title>Unused Voting Access Codes</title>
                                        <style>
                                          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                                          h1 { text-align: center; color: #111; }
                                          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                          th { padding: 10px; background: #f4f4f4; border: 1px solid #ddd; }
                                          @media print {
                                            button { display: none; }
                                          }
                                        </style>
                                      </head>
                                      <body>
                                        <h1>Unused Voting Access Codes</h1>
                                        <p style="text-align: center;">Generated on: ${new Date().toLocaleDateString()}</p>
                                        <table>
                                          <thead>
                                            <tr>
                                              <th style="width: 50px;">#</th>
                                              <th>Access Code</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            ${tableRows}
                                          </tbody>
                                        </table>
                                        <div style="text-align: center; margin-top: 20px;">
                                          <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Print / Save as PDF</button>
                                        </div>
                                        <script>
                                          // Auto prompt print dialog once loaded
                                          window.onload = function() { window.print(); }
                                        </script>
                                      </body>
                                    </html>
                                  `);
                                  printWindow.document.close();
                                  
                                } catch (e: any) {
                                  setConfirmModal({
                                    isOpen: true,
                                    title: "Export Error",
                                    message: e.message || "Failed to generate PDF.",
                                    isAlertOnly: true,
                                    isDanger: true,
                                    confirmText: "OK",
                                    onConfirm: () => {}
                                  });
                                } finally {
                                  setIsExportingPDF(false);
                                }
                              }}
                              disabled={isExportingPDF}
                              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                              {isExportingPDF ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                  Exporting...
                                </>
                              ) : (
                                <>
                                  <Download size={16} />
                                  Export Unused Codes (PDF)
                                </>
                              )}
                            </button>
                            <button
                              onClick={async () => {
                                setIsRefreshingStats(true);
                                await onFetchCodeStats();
                                setTimeout(() => setIsRefreshingStats(false), 500);
                              }}
                              disabled={isRefreshingStats}
                              className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-xl transition-colors disabled:opacity-50"
                              title="Refresh Stats"
                            >
                              <RefreshCw size={20} className={isRefreshingStats ? "animate-spin" : ""} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
              )}

          {/* TAB: GENERAL CONTENT EDITOR */}
          {activeSettingsTab === "content" && (
            <div className="space-y-8 animate-fade-in" id="admin-subtab-content">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <FileText size={18} className="text-amber-400" />
                  <span>General Content Editor</span>
                </h3>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  Update all key public-facing text on the platform. Changes are saved directly to the database and reflected immediately across all pages.
                </p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setGcSaveStatus("saving");
                  try {
                    await onUpdateGeneralContent({
                      contactEmail: gcContactEmail,
                      contactWebsite: gcContactWebsite,
                      contactWebsiteUrl: gcContactWebsiteUrl,
                      contactPhone: gcContactPhone,
                      contactFormsUrl: gcContactFormsUrl,
                      chairmanName: gcChairmanName,
                      chairmanTitle: gcChairmanTitle,
                      awardsTitle: gcAwardsTitle,
                      invitationTitle: gcInvitationTitle,
                      letterBody: gcLetterBody,
                    });
                    setGcSaveStatus("saved");
                    setTimeout(() => setGcSaveStatus(""), 3000);
                  } catch (err) {
                    setGcSaveStatus("error");
                    console.error("Failed to save general content:", err);
                  }
                }}
                className="space-y-8"
              >
                {/* ─── SECTION: Awards Identity ─── */}
                <div className="bg-black/30 border border-white/10 rounded-2xl p-6 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase block mb-1">Awards Identity</span>
                    <p className="text-xs text-white/40">The main title and names used throughout the platform, header, and invitation.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1.5">Awards Title</label>
                      <input
                        type="text"
                        value={gcAwardsTitle}
                        onChange={(e) => setGcAwardsTitle(e.target.value)}
                        placeholder="AWOL AMERICA 10th Annual Achievement Awards"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1.5">Invitation Section Title</label>
                      <input
                        type="text"
                        value={gcInvitationTitle}
                        onChange={(e) => setGcInvitationTitle(e.target.value)}
                        placeholder="Official Invitation & Bulletin"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* ─── SECTION: Chairman / Signatory ─── */}
                <div className="bg-black/30 border border-white/10 rounded-2xl p-6 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase block mb-1">Chairman / Signatory</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={gcChairmanName}
                        onChange={(e) => setGcChairmanName(e.target.value)}
                        placeholder="Mohamed Majid Kamara"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1.5">Title / Role</label>
                      <input
                        type="text"
                        value={gcChairmanTitle}
                        onChange={(e) => setGcChairmanTitle(e.target.value)}
                        placeholder="Chairman, AWOL AMERICA"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* ─── SECTION: Contact Details ─── */}
                <div className="bg-black/30 border border-white/10 rounded-2xl p-6 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase block mb-1">Contact Details</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={gcContactEmail}
                        onChange={(e) => setGcContactEmail(e.target.value)}
                        placeholder="awolamerica@hotmail.com"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1.5">Phone / Telephone</label>
                      <input
                        type="text"
                        value={gcContactPhone}
                        onChange={(e) => setGcContactPhone(e.target.value)}
                        placeholder="301-379-7049"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1.5">Website Display Text</label>
                      <input
                        type="text"
                        value={gcContactWebsite}
                        onChange={(e) => setGcContactWebsite(e.target.value)}
                        placeholder="www.awolamerica.org"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-1.5">Website Full URL</label>
                      <input
                        type="url"
                        value={gcContactWebsiteUrl}
                        onChange={(e) => setGcContactWebsiteUrl(e.target.value)}
                        placeholder="https://www.awolamerica.org"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-white/70 mb-1.5">External Nomination Forms URL</label>
                      <input
                        type="url"
                        value={gcContactFormsUrl}
                        onChange={(e) => setGcContactFormsUrl(e.target.value)}
                        placeholder="https://forms.app/awol-america-awards-nomination"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* ─── SECTION: Invitation Letter Body ─── */}
                <div className="bg-black/30 border border-white/10 rounded-2xl p-6 space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase block mb-1">Invitation Letter Body</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        { tag: "{ceremonyDate}", label: "Ceremony Date" },
                        { tag: "{nominationStartDate}", label: "Nomination Start" },
                        { tag: "{nominationEndDate}", label: "Nomination End" },
                        { tag: "{votingDateRange}", label: "Voting Date Range" },
                      ].map(({ tag, label }) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setGcLetterBody(prev => prev + ' ' + tag)}
                          className="text-[10px] px-2 py-1 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-lg hover:bg-amber-400/20 transition-colors cursor-pointer font-mono"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={gcLetterBody}
                    onChange={(e) => setGcLetterBody(e.target.value)}
                    rows={16}
                    placeholder="Write the full invitation letter here..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all resize-y font-sans leading-relaxed"
                  />
                </div>

                {/* ─── Save Button ─── */}
                <div className="flex items-center justify-between pt-2">
                  {gcSaveStatus === "saved" && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-2">
                      <CheckCircle size={14} /> All changes saved successfully!
                    </span>
                  )}
                  {gcSaveStatus === "error" && (
                    <span className="text-xs text-red-400 font-bold flex items-center gap-2">
                      <XCircle size={14} /> Save failed. Please try again.
                    </span>
                  )}
                  {gcSaveStatus !== "saved" && gcSaveStatus !== "error" && <div />}
                  <button
                    type="submit"
                    disabled={gcSaveStatus === "saving"}
                    className="bg-amber-400 hover:bg-amber-500 disabled:bg-amber-400/50 text-black font-extrabold px-8 py-3 rounded-xl text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-400/10"
                  >
                    {gcSaveStatus === "saving" ? (
                      <><RefreshCw size={16} className="animate-spin" /> Saving...</>
                    ) : (
                      <><CheckCircle size={16} /> Save General Content</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
            </div>
          )}
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
              <h3 className={`text-base font-extrabold flex items-center gap-2 ${confirmModal.isDanger ? 'text-red-400' : 'text-amber-400'}`}>
                {confirmModal.isDanger ? <Shield size={18} /> : <AlertCircle size={18} />}
                <span>{confirmModal.title}</span>
              </h3>
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed mb-6">
                {confirmModal.message}
              </div>
              <div className="flex gap-3">
                {!confirmModal.isAlertOnly && (
                  <button
                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={async () => {
                    await confirmModal.onConfirm();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  }}
                  className={`flex-1 px-5 py-2.5 rounded-xl font-bold text-xs transition-colors flex justify-center items-center gap-2 ${
                    confirmModal.isDanger 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-amber-400 hover:bg-amber-500 text-black'
                  }`}
                >
                  {confirmModal.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Modal */}
      {adminModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <RefreshCw size={18} className="text-amber-400" />
                <span>Edit Administrator</span>
              </h3>
              <button
                onClick={() => {
                  setAdminModalOpen(false);
                  setEditingAdminId(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!editingAdminId) return;
                try {
                  await onUpdateAdmin(editingAdminId, {
                    name: formAdminName,
                    email: formAdminEmail,
                    password: formAdminPassword,
                    role: formAdminRole
                  });
                  setAdminModalOpen(false);
                  setEditingAdminId(null);
                  setAdminActionSuccess("Administrator updated successfully!");
                  setTimeout(() => setAdminActionSuccess(""), 3000);
                } catch (e: any) {
                  setAdminActionError(e.message || "Failed to update administrator");
                  setTimeout(() => setAdminActionError(""), 4000);
                  setAdminModalOpen(false);
                }
              }} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white block">Name</label>
                  <input
                    type="text"
                    value={formAdminName}
                    onChange={(e) => setFormAdminName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white block">Email</label>
                  <input
                    type="email"
                    value={formAdminEmail}
                    onChange={(e) => setFormAdminEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white block">Password</label>
                  <div className="relative">
                    <input
                      type={showEditAdminPassword ? "text" : "password"}
                      value={formAdminPassword}
                      onChange={(e) => setFormAdminPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditAdminPassword(!showEditAdminPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      {showEditAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white block">Role</label>
                  <select
                    value={formAdminRole}
                    onChange={(e) => setFormAdminRole(e.target.value as "ADMIN" | "SUPER_ADMIN")}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all"
                  >
                    <option value="ADMIN">Administrator</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
                
                <div className="pt-4 mt-2 border-t border-white/5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminModalOpen(false);
                      setEditingAdminId(null);
                    }}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-400 hover:bg-amber-500 text-black px-5 py-2.5 rounded-xl font-bold text-xs transition-colors flex justify-center items-center gap-2"
                  >
                    <RefreshCw size={14} />
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-lg p-6 flex flex-col gap-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <List className="text-amber-400" />
              {editingCategory ? "Edit Category" : "New Category"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1.5 uppercase tracking-wider">Category Name</label>
                <input
                  type="text"
                  value={catFormName}
                  onChange={(e) => setCatFormName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all font-sans"
                  placeholder="e.g. New Artist of the Year"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 mb-1.5 uppercase tracking-wider">Description</label>
                <textarea
                  value={catFormDesc}
                  onChange={(e) => setCatFormDesc(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all font-sans min-h-[100px] resize-y"
                  placeholder="Describe the criteria for this category..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 mb-1.5 uppercase tracking-wider">Icon Name (Lucide React)</label>
                <input
                  type="text"
                  value={catFormIcon}
                  onChange={(e) => setCatFormIcon(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all font-sans"
                  placeholder="e.g. Trophy, Star, Music, Heart"
                />
                <p className="text-[10px] text-white/40 mt-1">Must be a valid Lucide React icon name (e.g. Trophy, Music, Award).</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-white/70 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveCategory}
                className="px-6 py-2.5 rounded-xl font-bold bg-amber-400 text-black hover:bg-amber-500 transition-colors shadow-[0_0_15px_rgba(251,191,36,0.3)]"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nominee Modal */}
      {isNomineeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                {editingNomineeId ? <RefreshCw size={18} className="text-amber-400" /> : <Plus size={18} className="text-amber-400" />}
                <span>{editingNomineeId ? "Edit Nominee" : "Create Nominee"}</span>
              </h3>
              <button
                onClick={() => {
                  setIsNomineeModalOpen(false);
                  setEditingNomineeId(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {newNomineeSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl flex items-center gap-2.5 mb-6 animate-fade-in">
                  <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                  <span>{newNomineeSuccess}</span>
                </div>
              )}

              <form onSubmit={(e) => {
                handleCreateNominee(e);
                if (editingNomineeId) {
                  setIsNomineeModalOpen(false);
                }
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Target List */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-white block">
                      Add to List
                    </label>
                    <select
                      value={newNomineeListType}
                      onChange={(e) => setNewNomineeListType(e.target.value as "final" | "approved")}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                    >
                      <option value="final">Final List (Voting Center)</option>
                      <option value="approved">Approved Nominations</option>
                    </select>
                  </div>
                  
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

                  {/* Specific Achievements */}
                  <div className="space-y-3 md:col-span-2 pt-2 border-t border-white/5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-white block">
                        Specific Achievements
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoGenerateAchievements}
                        disabled={!newNomineeDesc}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
                          !newNomineeDesc ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 cursor-pointer'
                        }`}
                      >
                        ✨ Auto-Generate from Description
                      </button>
                    </div>
                    {newNomineeAchievements.map((ach, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={ach}
                          onChange={(e) => {
                            const newArr = [...newNomineeAchievements];
                            newArr[idx] = e.target.value;
                            setNewNomineeAchievements(newArr);
                          }}
                          placeholder={`Achievement ${idx + 1}`}
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newArr = newNomineeAchievements.filter((_, i) => i !== idx);
                            setNewNomineeAchievements(newArr);
                          }}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {newNomineeAchievements.length < 5 && (
                      <button
                        type="button"
                        onClick={() => setNewNomineeAchievements([...newNomineeAchievements, ""])}
                        className="text-[10px] text-white/50 hover:text-white flex items-center gap-1 mt-1 transition-colors cursor-pointer"
                      >
                        <Plus size={12} /> Add Achievement
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNomineeModalOpen(false);
                      setEditingNomineeId(null);
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-400 hover:bg-amber-500 text-black px-5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-md shadow-amber-400/10 flex items-center gap-2"
                  >
                    {editingNomineeId ? <RefreshCw size={14} /> : <Plus size={14} />}
                    {editingNomineeId ? "Update Nominee" : "Add Nominee"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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

      {nomineeToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111318] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Confirm Deletion</h3>
            <p className="text-white/70 text-sm mb-6 leading-relaxed">
              Are you sure you want to permanently delete <strong>{nomineeToDelete.name}</strong> from the nominees list? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setNomineeToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteNominee(nomineeToDelete.id);
                  setNomineeToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-400 rounded-lg transition-colors cursor-pointer border border-red-500"
              >
                Delete Nominee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
