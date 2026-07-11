/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Category, Nominee, Message, SystemPhase, TimelineSettings } from "../types";
import { CategoryIcon } from "./CategoryIcon";
import { Trophy, MessageSquare, Send, Calendar, MapPin, Sparkles, Plus, Share2, Twitter, Facebook, Linkedin, Copy, Check, BarChart2 } from "lucide-react";
import { formatDateTime } from "../utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ResultsSectionProps {
  categories: Category[];
  nominees: Nominee[];
  guestbookMessages: Message[];
  onAddMessage: (author: string, content: string) => void;
  currentPhase: SystemPhase;
  timelineSettings?: TimelineSettings;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({
  categories,
  nominees,
  guestbookMessages,
  onAddMessage,
  currentPhase,
  timelineSettings,
}) => {
  const [activeCategoryId, setActiveCategoryId] = useState<number>(1);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [msgError, setMsgError] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  const getNomineesForCategory = (catId: number) => {
    return nominees.filter((n) => n.categoryId === catId).sort((a, b) => b.votes - a.votes);
  };

  // Find leader/winner for a category
  const getLeaderForCategory = (catId: number) => {
    const catNominees = getNomineesForCategory(catId);
    if (catNominees.length === 0) return null;
    return catNominees.reduce((prev, current) => (prev.votes > current.votes ? prev : current));
  };

  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const activeNominees = activeCategory ? getNomineesForCategory(activeCategoryId) : [];
  const activeLeader = activeCategory ? getLeaderForCategory(activeCategoryId) : null;

  // Calculate total votes in current active category to get percentages
  const activeCategoryTotalVotes = activeNominees.reduce((sum, n) => sum + n.votes, 0);

  // Data for visual summary across all categories
  const categoryChartData = categories.map((c) => {
    const totalVotes = getNomineesForCategory(c.id).reduce((sum, n) => sum + n.votes, 0);
    return {
      name: c.name,
      shortName: `Cat 0${c.id}`,
      votes: totalVotes,
      id: c.id,
    };
  });

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsgError("");

    if (!author.trim()) {
      setMsgError("Please enter your name.");
      return;
    }
    if (!content.trim() || content.trim().length < 5) {
      setMsgError("Message must be at least 5 characters.");
      return;
    }

    onAddMessage(author.trim(), content.trim());
    setAuthor("");
    setContent("");
  };

  return (
    <div className="space-y-8" id="results-and-ceremony-panel">
      {/* Dynamic Phase Warning if not Results Phase */}
      {currentPhase !== SystemPhase.RESULTS && (
        <div 
          className="p-4.5 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl flex items-start gap-3 text-sm text-white/80 shadow-xl"
          id="results-notice"
        >
          <Sparkles className="text-amber-400 shrink-0 mt-0.5" size={18} />
          <div>
            <strong className="font-bold text-white block">Results Preview Notice</strong>
            The official results will be locked and hidden until the ceremony on{" "}
            <strong className="text-amber-400 font-bold">{timelineSettings ? formatDateTime(timelineSettings.ceremony) : "Saturday, September 5, 2026"}</strong>. 
            However, administrators can view the live standings here before the official announcement.
          </div>
        </div>
      )}

      {/* Ceremony Details Bulletin Card */}
      <div 
        className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-2xl p-6 sm:p-8 shadow-2xl"
        id="official-ceremony-card"
      >
        {/* Decorative Golden Ambient Aura */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-400 blur-3xl opacity-20 rounded-full"></div>

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3.5 max-w-xl">
            <span className="bg-white/5 text-amber-400 border border-white/10 text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full font-bold">
              AWOL AMERICA 10th Milestone Event
            </span>
            <h3 className="font-sans font-black text-white text-2xl sm:text-3xl leading-tight">
              The 10th Annual Achievement Awards Gala
            </h3>
            <p className="font-sans text-xs sm:text-sm text-white/70 leading-relaxed font-light">
              We look forward to honoring those whose extraordinary efforts have left a lasting impact on our society. Join us as we celebrate excellence, service, and positive change.
            </p>

            <div className="flex flex-col sm:flex-row gap-x-6 gap-y-2 text-xs font-mono text-white/80 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-amber-400" />
                {timelineSettings ? formatDateTime(timelineSettings.ceremony) : "Saturday, September 5, 2026"}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-amber-400" />
                Gala Hall & Live Stream Broadcast
              </span>
            </div>
          </div>

          <div className="shrink-0 p-4 bg-white/5 border border-white/10 text-amber-400 rounded-2xl flex flex-col items-center justify-center text-center w-full md:w-36 h-36 backdrop-blur-md">
            <Trophy size={38} className="mb-2 animate-bounce" />
            <span className="text-[10px] uppercase font-mono tracking-wider block opacity-75">Milestone</span>
            <span className="text-xl font-black block tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">10 YEARS</span>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6" id="results-visual-summary">
        <div>
          <h3 className="font-sans font-extrabold text-white text-lg tracking-tight flex items-center gap-2">
            <BarChart2 size={20} className="text-amber-400" />
            Administrative Overview: Vote Distribution
          </h3>
          <p className="text-xs text-white/60 mt-0.5">
            Total voting volume mapped across all categories to identify engagement trends.
          </p>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis 
                dataKey="shortName" 
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                contentStyle={{ backgroundColor: "#05070a", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px", color: "white" }}
                itemStyle={{ color: "#fbbf24", fontWeight: "bold" }}
                formatter={(value: number) => [`${value} Votes`, "Total"]}
                labelStyle={{ color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}
              />
              <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                {categoryChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.id === activeCategoryId ? "#fbbf24" : "rgba(255,255,255,0.2)"}
                    className="transition-all duration-300 cursor-pointer hover:opacity-80"
                    onClick={() => setActiveCategoryId(entry.id)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Live Voting Results Column */}
        <div className="lg:col-span-8 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6" id="results-analytics-card">
          <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="font-sans font-extrabold text-white text-lg tracking-tight">
                Live Ballot Breakdown & Leaders
              </h3>
              <p className="text-xs text-white/60 mt-0.5">
                Select a category to see live percentage tracking and current candidate standings.
              </p>
            </div>
            
            {/* Category Quick Select Dropdown */}
            <select
              value={activeCategoryId}
              onChange={(e) => setActiveCategoryId(parseInt(e.target.value) || 1)}
              className="bg-[#05070a] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold focus:border-amber-400 transition-all outline-none text-white"
              id="results-category-selector"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#05070a] text-white">
                  Cat 0{c.id}: {c.name}
                </option>
              ))}
            </select>
          </div>

          {activeCategory && (
            <div className="space-y-6" id={`results-category-view-${activeCategoryId}`}>
              {/* Leader Callout */}
              {activeLeader && (
                <div className="p-4 bg-amber-400/5 border border-amber-400/20 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-400 text-black rounded-lg">
                      <Trophy size={18} className="stroke-[2.5]" />
                    </div>
                    {activeLeader.avatarUrl ? (
                      <img src={activeLeader.avatarUrl} alt={activeLeader.name} className="w-10 h-10 rounded-full object-cover border border-amber-400/30 bg-black/40" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 text-lg font-bold border border-amber-400/30">
                        {activeLeader.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/75 font-bold block">Current Standing Leader</span>
                      <strong className="text-white text-sm font-extrabold">{activeLeader.name}</strong>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                    {activeLeader.votes} Votes
                  </span>
                </div>
              )}

              {/* Progress bars of nominees */}
              <div className="space-y-4">
                {activeNominees.length === 0 ? (
                  <div className="text-center py-10 bg-white/5 rounded-xl text-white/40 text-xs border border-dashed border-white/5">
                    No nominees found.
                  </div>
                ) : (
                  activeNominees.map((nom) => {
                    const pct = activeCategoryTotalVotes > 0 ? (nom.votes / activeCategoryTotalVotes) * 100 : 0;
                    const isWinner = activeLeader?.id === nom.id;

                    return (
                      <div key={nom.id} className="space-y-2" id={`results-item-${nom.id}`}>
                        <div className="flex justify-between items-end text-xs">
                          <div className="flex items-center gap-2">
                            {nom.avatarUrl ? (
                              <img src={nom.avatarUrl} alt={nom.name} className="w-6 h-6 rounded-full object-cover border border-white/10 bg-black/40" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-[10px] font-bold border border-white/10">
                                {nom.name.charAt(0)}
                              </div>
                            )}
                            <span className={`font-bold ${isWinner ? "text-amber-400" : "text-white/90"}`}>
                              {nom.name} {isWinner && "★"}
                            </span>
                          </div>
                          <span className="font-mono text-white/50">
                            <strong>{nom.votes}</strong> votes ({pct.toFixed(1)}%)
                          </span>
                        </div>

                        <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isWinner ? "bg-amber-500" : "bg-white/30"
                            }`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Congratulations Wall / Interactive Guestbook */}
        <div className="lg:col-span-4 space-y-6" id="results-guestbook-card">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
            <h4 className="font-sans font-bold text-white text-sm tracking-tight mb-3 flex items-center gap-2">
              <MessageSquare size={16} className="text-amber-400" />
              <span>Congratulations Wall</span>
            </h4>
            <p className="text-xs text-white/60 mb-4 leading-relaxed">
              Show your support for the nominees! Post a message of encouragement, appreciation, and celebration.
            </p>

            {/* Post Message Form */}
            <form onSubmit={handleMessageSubmit} className="space-y-3 mb-6" id="guestbook-form">
              {msgError && <p className="text-[10px] text-rose-400 font-bold">{msgError}</p>}
              <div>
                <input
                  type="text"
                  placeholder="Your Name (e.g. Samuel Koroma)"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs focus:bg-white/10 focus:border-amber-400 transition-all outline-none text-white placeholder-white/30"
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="Write congratulations..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs focus:bg-white/10 focus:border-amber-400 transition-all outline-none text-white placeholder-white/30"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-tr from-amber-400 to-amber-600 hover:brightness-110 text-black font-bold py-2 px-4 rounded-xl text-xs transition-colors duration-200 cursor-pointer"
                id="submit-guestbook-btn"
              >
                <Send size={11} />
                <span>Publish Congratulations</span>
              </button>
            </form>

            {/* Messages Feed */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1" id="guestbook-feed">
              {guestbookMessages.length === 0 ? (
                <p className="text-center py-6 text-white/40 text-xs italic">
                  Be the first to congratulate our outstanding achievers!
                </p>
              ) : (
                guestbookMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-white/80 space-y-1"
                    id={`guestbook-message-${msg.id}`}
                  >
                    <div className="flex justify-between text-[10px] text-white/40 font-mono">
                      <strong className="font-bold text-white">{msg.author}</strong>
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="leading-relaxed font-sans italic text-white/70">"{msg.content}"</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Social Media Sharing Panel */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl space-y-4 animate-fade-in" id="results-share-card">
            <h4 className="font-sans font-bold text-white text-sm tracking-tight flex items-center gap-2">
              <Share2 size={16} className="text-amber-400" />
              <span>Share Standings & Results</span>
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Celebrate our nominees and share the live standings with your community! Let your friends and colleagues know about the achievements.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const url = window.location.href;
                    const text = "Check out the live standings and results for the 10th Annual AWOL America Achievement Awards!";
                    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#1da1f2]/10 hover:bg-[#1da1f2]/20 border border-[#1da1f2]/20 text-[#1da1f2] font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  title="Share on X / Twitter"
                >
                  <Twitter size={14} />
                  <span>Share on X</span>
                </button>
                <button
                  onClick={() => {
                    const url = window.location.href;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#1877f2]/10 hover:bg-[#1877f2]/20 border border-[#1877f2]/20 text-[#1877f2] font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  title="Share on Facebook"
                >
                  <Facebook size={14} />
                  <span>Facebook</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const url = window.location.href;
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#0077b5]/10 hover:bg-[#0077b5]/20 border border-[#0077b5]/20 text-[#0077b5] font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  title="Share on LinkedIn"
                >
                  <Linkedin size={14} />
                  <span>LinkedIn</span>
                </button>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  title="Copy Page Link"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
