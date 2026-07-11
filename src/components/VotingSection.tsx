/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Category, Nominee, UserVote, SystemPhase, TimelineSettings, NomineeGroup } from "../types";
import { CategoryIcon } from "./CategoryIcon";
import { Check, Vote, AlertTriangle, ShieldCheck, Lock, Award, Heart, Search, Filter, SlidersHorizontal, Share2, Twitter, Facebook } from "lucide-react";
import { formatDateTime, parseLocalDateTime } from "../utils";

interface VotingSectionProps {
  categories: Category[];
  nominees: Nominee[];
  userVotes: UserVote[];
  onCastVote: (categoryId: number, nomineeId: string) => void;
  currentPhase: SystemPhase;
  timelineSettings?: TimelineSettings;
  simulatedDate?: Date;
  onNavigateToResults?: () => void;
  onNavigateToNominate?: () => void;
  isAdminLoggedIn?: boolean;
  nomineeGroups?: NomineeGroup[];
}

export const VotingSection: React.FC<VotingSectionProps> = ({
  categories,
  nominees,
  userVotes,
  onCastVote,
  currentPhase,
  timelineSettings,
  simulatedDate,
  onNavigateToResults,
  onNavigateToNominate,
  nomineeGroups,
  isAdminLoggedIn,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all"); // "all", or a category ID
  const [statusFilter, setStatusFilter] = useState<"all" | "voted" | "pending">("all");
  const [selectedNominee, setSelectedNominee] = useState<Nominee | null>(null);
  const [justVotedId, setJustVotedId] = useState<string | null>(null);
  const [voteConfirmation, setVoteConfirmation] = useState<{ categoryId: number; nomineeId: string; nomineeName: string; categoryName: string } | null>(null);


  
  const approvedGroups = (nomineeGroups || []).filter(g => g.approved);
  const groupedNominationIds = new Set(approvedGroups.flatMap(g => g.nominationIds));
  
  // Exclude individual nominees that are part of an approved group
  const filteredGroupedNominees = nominees.filter(n => {
    if (n.id.startsWith('custom-nom-')) {
      const nomId = n.id.replace('custom-nom-', '');
      if (groupedNominationIds.has(nomId)) return false;
    }
    return true;
  });

  const allNominees = [
    ...filteredGroupedNominees,
    ...approvedGroups.map(g => ({
      id: g.id,
      categoryId: g.categoryId,
      name: g.name,
      description: g.description,
      votes: g.votes || 0,
      organization: `Supported by ${g.nominationIds.length} nominations`
    } as Nominee))
  ];


  // Group nominees by category
  const getNomineesForCategory = (catId: number) => {
    return allNominees.filter((n) => n.categoryId === catId);
  };


  const getVoteForCategory = (catId: number) => {
    return userVotes.find((uv) => uv.categoryId === catId);
  };

  const isVotedInCategory = (catId: number) => {
    return !!getVoteForCategory(catId);
  };

  // Filter nominees based on search query, category filter, and status filter
  const getFilteredNominees = () => {
    let list = [...nominees];

    // Category scope filtering
    if (categoryFilter !== "all") {
      const catId = parseInt(categoryFilter, 10);
      list = list.filter((n) => n.categoryId === catId);
    }

    // Search query query matching
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(
        (n) =>
          n.name.toLowerCase().includes(query) ||
          n.description.toLowerCase().includes(query) ||
          (n.organization && n.organization.toLowerCase().includes(query)) ||
          categories.find((c) => c.id === n.categoryId)?.name.toLowerCase().includes(query)
      );
    }

    // Voting status matching
    if (statusFilter === "voted") {
      list = list.filter((n) => {
        const vote = userVotes.find((uv) => uv.categoryId === n.categoryId);
        return vote && vote.nomineeId === n.id;
      });
    } else if (statusFilter === "pending") {
      list = list.filter((n) => {
        const hasVotedThisCategory = userVotes.some((uv) => uv.categoryId === n.categoryId);
        return !hasVotedThisCategory;
      });
    }

    return list;
  };

  const filteredNominees = getFilteredNominees();

  // Group filtered nominees by their categories for clean multi-category presentation
  const categoriesWithFilteredNominees = categories.map(cat => {
    return {
      category: cat,
      nomineesList: filteredNominees.filter(n => n.categoryId === cat.id)
    };
  }).filter(group => group.nomineesList.length > 0);

  const totalCategoriesCount = categories.length;
  const votedCount = userVotes.length;

  const defaultSettings = {
    announcementStart: "2026-07-03T00:00:00",
    announcementEnd: "2026-07-09T23:59:59",
    nominationStart: "2026-07-10T00:00:00",
    nominationEnd: "2026-07-30T23:59:59",
    votingStart: "2026-07-31T00:00:00",
    votingEnd: "2026-08-25T23:59:59",
    ceremony: "2026-09-05T18:00:00",
  };

  const settings = timelineSettings
    ? { ...defaultSettings, ...timelineSettings }
    : defaultSettings;

  const nowTime = simulatedDate ? simulatedDate.getTime() : new Date().getTime();
  const votingStart = parseLocalDateTime(settings.votingStart).getTime();
  const votingEnd = parseLocalDateTime(settings.votingEnd).getTime();

  const isBeforeVoting = nowTime < votingStart;
  const isAfterVoting = nowTime > votingEnd;
  const isVotingClosed = isAdminLoggedIn ? false : (isBeforeVoting || isAfterVoting || currentPhase === SystemPhase.RESULTS);

  return (
    <div className="space-y-8 animate-fade-in" id="voting-system-container">
      {(!isAdminLoggedIn && isBeforeVoting) ? (
        <div className="w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 sm:p-12 shadow-2xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-amber-400/10 rounded-full flex items-center justify-center border border-amber-400/20 mb-4">
            <Lock className="text-amber-400" size={32} />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Voting Period Has Not Started</h2>
          <div className="text-white/70 max-w-2xl mx-auto leading-relaxed space-y-4 text-sm">
            <p>Thank you for your interest in the AWOL AMERICA 10th Annual Achievement Awards.</p>
            <p>
              The final list of approved nominees is currently being prepared and reviewed by the AWOL AMERICA management team. The official <strong className="text-amber-400">Voting Center will open on {formatDateTime(settings.votingStart)}</strong>, when community members will be able to view the nominees and vote for their favorite candidates.
            </p>
            <p>
              If you would like to recognize an outstanding individual, organization, or initiative, you can still submit a nomination by visiting our Nomination Page:
            </p>
            <div className="pt-2 pb-4">
              <button
                onClick={onNavigateToNominate}
                className="bg-amber-400 hover:bg-amber-300 text-black px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-400/20"
              >
                Go to Nomination Page
              </button>
            </div>
            <p>
              Please check back on the voting opening date to participate in celebrating the achievements and contributions of our nominees.
            </p>
            <p className="font-medium text-white/90">
              Thank you for your continued support of AWOL AMERICA.
            </p>
          </div>
        </div>
      ) : (
        <>
          {isAdminLoggedIn && isBeforeVoting && (
            <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4 flex items-center justify-center gap-3 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
              <ShieldCheck size={18} />
              <p className="text-xs font-bold tracking-wide">
                <span className="uppercase mr-2 font-mono">Admin Testing Mode:</span>
                You are viewing the Voting Center before it is officially open to the public.
              </p>
            </div>
          )}

      {/* Search & Filter Header Container */}
      <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl z-10 relative">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          {/* Main Search Input */}
          <div className="relative w-full lg:w-96 shrink-0 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-amber-400 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search by nominee, organization, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all font-sans"
              id="nominee-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/40 hover:text-white text-[10px] uppercase font-bold tracking-wider cursor-pointer border-none bg-transparent"
              >
                Clear
              </button>
            )}
          </div>

          {/* Dropdowns Container */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Category Filter */}
            <div className="flex flex-col gap-1 w-full sm:w-56">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer w-full font-sans"
                id="voting-category-filter-select"
              >
                <option value="all" className="bg-[#18181b] text-white">All Categories</option>
                <option disabled className="bg-[#18181b] text-white/30">── Select Category ──</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id.toString()} className="bg-[#18181b] text-white">
                    Cat {cat.id}: {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-1 w-full sm:w-44">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer w-full font-sans"
                id="voting-status-filter-select"
              >
                <option value="all" className="bg-[#18181b]">All Nominees</option>
                <option value="voted" className="bg-[#18181b]">My Voted Nominees</option>
                <option value="pending" className="bg-[#18181b]">Pending My Vote</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl min-h-[500px]" id="voting-nominees-ballot">
        {filteredNominees.length === 0 ? (
          <div className="text-center py-24 bg-black/10 rounded-2xl border border-dashed border-white/10 text-white/40 text-xs space-y-3">
            <AlertTriangle className="mx-auto text-amber-400" size={32} />
            <p className="font-bold text-white text-sm">No Contenders Match Filters</p>
            <p className="max-w-xs mx-auto text-white/60">
              Try clearing your search query, or resetting the vote status filter.
            </p>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {categoriesWithFilteredNominees.map(({ category, nomineesList }) => {
              const catVote = getVoteForCategory(category.id);
              const allCatNominees = nominees.filter(n => n.categoryId === category.id);
              const nomineesWithVotes = allCatNominees.filter(n => n.votes > 0).length;
              const totalCatNominees = allCatNominees.length;
              const progressPercent = totalCatNominees > 0 ? (nomineesWithVotes / totalCatNominees) * 100 : 0;
              
              return (
                <div key={category.id} className="space-y-4">
                  {/* Sub-header for the category group */}
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-amber-400/10 text-amber-400 rounded-md">
                        <CategoryIcon name={category.iconName} size={13} />
                      </div>
                      <div className="flex-grow">
                        <span className="text-[9px] font-mono text-amber-400 font-bold block uppercase leading-none">
                          Cat {category.id.toString().padStart(2, "0")}
                        </span>
                        <span className="text-xs font-extrabold text-white leading-none">
                          {category.name}
                        </span>
                      </div>
                      {catVote && (
                        <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/15">
                          Vote Registered
                        </span>
                      )}
                    </div>
                    <div className="px-1">
                      <div className="flex justify-between items-center text-[9px] text-white/40 font-mono mb-1.5 uppercase tracking-wider">
                        <span>Unique Nominees Voted</span>
                        <span>{nomineesWithVotes} / {totalCatNominees}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-0.5 overflow-hidden">
                        <div className="bg-amber-400/50 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Nominees in this specific group */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pl-2">
                    {nomineesList.map((nom) => {
                      const isSelected = catVote?.nomineeId === nom.id;
                      return (
                        <div
                          key={nom.id}
                          onClick={() => {
                            setSelectedNominee(nom);
                          }}
                          className={`group/card relative border rounded-xl p-5 flex flex-col justify-between items-center text-center gap-4 transition-all ${
                            isVotingClosed ? "cursor-default" : "cursor-pointer"
                          } ${
                            justVotedId === nom.id
                              ? "bg-amber-400/10 border-amber-400 scale-[1.02] shadow-[0_0_30px_rgba(251,191,36,0.3)] z-10"
                              : isSelected
                              ? "bg-amber-400/5 border-amber-400/40 shadow-md"
                              : isVotingClosed
                              ? "bg-white/5 border-white/5 opacity-60"
                              : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
                          }`}
                          id={`nominee-ballot-item-${nom.id}`}
                        >
                          {/* Hover Tooltip */}
                          <div className="absolute left-1/2 -top-2 -translate-x-1/2 -translate-y-full w-[280px] bg-[#111318] border border-white/20 p-4 rounded-xl text-xs text-white/80 opacity-0 group-hover/card:opacity-100 pointer-events-none transition-opacity duration-300 z-50 shadow-2xl hidden sm:block">
                            <div className="font-bold text-amber-400 mb-1">{nom.name}</div>
                            <div className="line-clamp-4">{nom.description}</div>
                            <div className="mt-2 text-[9px] text-white/40 uppercase tracking-wider font-bold">Quick Preview</div>
                          </div>

                          <div className="flex flex-col items-center gap-3 w-full">
                            <div className="relative shrink-0 mb-2">
                              {nom.avatarUrl ? (
                                <img src={nom.avatarUrl} alt={nom.name} className="w-24 h-24 rounded-full object-cover border-4 border-white/10 bg-black/40 group-hover/card:border-amber-400/50 transition-all duration-300" />
                              ) : (
                                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-3xl font-bold border-4 border-white/10 group-hover/card:border-amber-400/50 transition-all duration-300">
                                  {nom.name.charAt(0)}
                                </div>
                              )}
                              <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                                isSelected
                                  ? justVotedId === nom.id
                                    ? "border-amber-400 bg-amber-400 text-black shadow-[0_0_25px_rgba(251,191,36,0.8)] scale-[1.3] animate-pulse"
                                    : "border-amber-400 bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.5)] scale-110"
                                  : isVotingClosed
                                  ? "border-[#111318] bg-white/5 opacity-0"
                                  : "border-[#111318] bg-white/10 group-hover/card:bg-white/20 opacity-0 group-hover/card:opacity-100"
                              }`}>
                                {isSelected && <Check size={16} className="stroke-[4] text-black" />}
                              </div>
                            </div>

                            <div className="w-full">
                              <h4 
                                className={`font-sans font-extrabold text-sm hover:underline cursor-pointer ${isSelected ? "text-amber-400 font-bold" : "text-white hover:text-amber-300"}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedNominee(nom);
                                }}
                                title="Click to view details"
                              >
                                {nom.name}
                              </h4>
                              {nom.organization && (
                                <span className="text-[10px] text-amber-400/80 font-mono block mt-1 mb-2">{nom.organization}</span>
                              )}
                              <p className="font-sans text-[11px] text-white/50 leading-relaxed line-clamp-2 group-hover/card:line-clamp-3 transition-all mt-2">
                                {nom.description}
                              </p>
                            </div>
                          </div>

                          {/* Button/Action on item */}
                          <div className="w-full mt-auto pt-4">
                            <button
                              disabled={isVotingClosed}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isVotingClosed) return;
                                setVoteConfirmation({
                                  categoryId: category.id,
                                  nomineeId: nom.id,
                                  nomineeName: nom.name,
                                  categoryName: category.name
                                });
                              }}
                              className={`w-full text-[11px] font-bold py-2.5 px-3 rounded-lg border transition-all ${
                                isVotingClosed
                                  ? isSelected
                                    ? "bg-amber-400/10 border-amber-400/30 text-amber-300"
                                    : "bg-white/5 text-white/30 border-white/5 cursor-not-allowed"
                                  : isSelected
                                  ? "bg-gradient-to-tr from-amber-400 to-amber-600 text-black border-none font-bold cursor-pointer"
                                  : "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 cursor-pointer"
                              }`}
                            >
                              {isVotingClosed ? (isSelected ? "My Vote" : "Closed") : (isSelected ? "Cast Active" : "Vote Nominee")}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Nominee Details Modal */}
      {selectedNominee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedNominee(null)}>
          <div className="bg-[#0f1115] border border-white/10 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer"
              onClick={() => setSelectedNominee(null)}
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="pr-6">
              <div className="flex items-center gap-4 mb-4">
                {selectedNominee.avatarUrl ? (
                  <img src={selectedNominee.avatarUrl} alt={selectedNominee.name} className="w-20 h-20 rounded-full object-cover border border-white/10 bg-black/40" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-2xl font-bold border border-white/10">
                    {selectedNominee.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-sans font-extrabold text-xl text-white mb-1">{selectedNominee.name}</h3>
                  {selectedNominee.organization && (
                    <p className="font-mono text-xs text-amber-400">{selectedNominee.organization}</p>
                  )}
                </div>
              </div>
              
              
              <div className="space-y-4 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h4 className="text-[10px] font-mono text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Background Information
                  </h4>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {selectedNominee.description}
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h4 className="text-[10px] font-mono text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    Specific Achievements
                  </h4>
                  <ul className="text-sm text-white/70 leading-relaxed space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                      Demonstrated exceptional performance and significant positive impact.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                      Clear dedication to advancing standards in their respective category.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                      Recognized by peers and the community for outstanding excellence during the 2025/2026 period.
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      const shareData = {
                        title: `Vote for ${selectedNominee.name}`,
                        text: `Check out ${selectedNominee.name}, a nominee for ${categories.find(c => c.id === selectedNominee.categoryId)?.name}!`,
                        url: window.location.href,
                      };
                      if (navigator.share) {
                        try {
                          await navigator.share(shareData);
                        } catch (err) {
                          console.error("Error sharing:", err);
                        }
                      } else {
                        const url = encodeURIComponent(window.location.href);
                        const text = encodeURIComponent(shareData.text);
                        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
                    title="Share via Native or Twitter"
                  >
                    <Share2 size={14} />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={() => {
                      const url = encodeURIComponent(window.location.href);
                      const text = encodeURIComponent(`Check out ${selectedNominee.name}, a nominee!`);
                      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
                    }}
                    className="flex items-center justify-center w-8 h-8 text-white/70 hover:text-white bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/40 rounded-lg transition-colors cursor-pointer"
                    title="Share on Twitter"
                  >
                    <Twitter size={14} />
                  </button>
                  <button
                    onClick={() => {
                      const url = encodeURIComponent(window.location.href);
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
                    }}
                    className="flex items-center justify-center w-8 h-8 text-white/70 hover:text-white bg-[#1877F2]/20 hover:bg-[#1877F2]/40 rounded-lg transition-colors cursor-pointer"
                    title="Share on Facebook"
                  >
                    <Facebook size={14} />
                  </button>
                </div>
                <button 
                  onClick={() => setSelectedNominee(null)}
                  className="px-5 py-2 text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer w-full sm:w-auto"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Vote Confirmation Modal */}
      {voteConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111318] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              <Vote className="text-black" size={28} />
            </div>
            
            <div className="mt-8 text-center space-y-4">
              <h3 className="text-xl font-black text-white">Confirm Your Vote</h3>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block mb-1">Category</span>
                  <p className="text-amber-400 font-bold text-sm">{voteConfirmation.categoryName}</p>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block mb-1">Nominee</span>
                  <p className="text-white font-bold">{voteConfirmation.nomineeName}</p>
                </div>
              </div>
              
              <p className="text-xs text-white/50 leading-relaxed">
                Are you sure you want to cast your vote for this nominee? You can change your vote later before the voting period ends.
              </p>
              
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  onClick={() => setVoteConfirmation(null)}
                  className="px-4 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 font-bold text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onCastVote(voteConfirmation.categoryId, voteConfirmation.nomineeId);
                    setJustVotedId(voteConfirmation.nomineeId);
                    setTimeout(() => setJustVotedId(null), 600);
                    setVoteConfirmation(null);
                  }}
                  className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Confirm Vote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
