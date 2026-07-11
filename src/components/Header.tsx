/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Mail, Globe, Phone, Award, Clock, Menu, X, Info, FileText, Vote, Trophy, Shield } from "lucide-react";
import { CONTACT_INFO } from "../data";
import { SystemPhase, TimelineSettings } from "../types";
import { formatDateTime, parseLocalDateTime } from "../utils";

interface HeaderProps {
  currentPhase: SystemPhase;
  phaseLabel: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  timelineSettings?: TimelineSettings;
  simulatedDate?: Date;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentPhase, 
  phaseLabel, 
  activeTab, 
  setActiveTab,
  timelineSettings,
  simulatedDate
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  const nominationStart = parseLocalDateTime(settings.nominationStart).getTime();
  const nominationEnd = parseLocalDateTime(settings.nominationEnd).getTime();
  const votingStart = parseLocalDateTime(settings.votingStart).getTime();
  const votingEnd = parseLocalDateTime(settings.votingEnd).getTime();

  const isNominationActive = nowTime >= nominationStart && nowTime <= nominationEnd;
  const isVotingActive = nowTime >= votingStart && nowTime <= votingEnd;
  const isResultsActive = nowTime > votingEnd;

  const menuItems = [
    { id: "overview", label: "Overview", icon: Info },
    { id: "nominate", label: "Nomination Portal", icon: FileText, showPing: isNominationActive },
    { id: "vote", label: "Voting Center", icon: Vote, showPing: isVotingActive },
    { id: "results", label: "Live Results & Gala", icon: Trophy, showPing: isResultsActive },
    { id: "admin", label: "Admin Console", icon: Shield },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="relative bg-[#05070a]/80 backdrop-blur-md text-white border-b border-white/10 shadow-2xl overflow-hidden sticky top-0 z-50">
      {/* Decorative Golden Ambient Backglow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-1 bg-amber-500/20 blur-3xl opacity-60"></div>
      
      {/* Top Contact Micro-Bar - Hidden on mobile */}
      <div className="hidden md:block bg-white/5 border-b border-white/5 text-xs text-white/70 py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between items-center gap-2">
          {/* Official Contact Credentials */}
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-1">
            <a 
              href={`mailto:${CONTACT_INFO.email}`} 
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
              id="header-email-link"
            >
              <Mail size={12} className="text-amber-400" />
              <span>{CONTACT_INFO.email}</span>
            </a>
            <a 
              href={CONTACT_INFO.websiteUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
              id="header-website-link"
            >
              <Globe size={12} className="text-amber-400" />
              <span>{CONTACT_INFO.website}</span>
            </a>
            <a 
              href={`tel:${CONTACT_INFO.telephone}`} 
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
              id="header-phone-link"
            >
              <Phone size={12} className="text-amber-400" />
              <span>{CONTACT_INFO.telephone}</span>
            </a>
          </div>

          {/* Quick System Info badge */}
          <div className="flex items-center gap-2 bg-white/5 text-amber-400 border border-white/10 px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide font-mono">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400"></span>
            </span>
            SYSTEM ACTIVE: {phaseLabel}
          </div>
        </div>
      </div>

      {/* Main Premium Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 relative z-20">
        {/* Left Side: Branding / Logo */}
        <button 
          onClick={() => handleTabClick("overview")} 
          className="flex items-center gap-3 hover:opacity-90 transition-opacity text-left cursor-pointer bg-transparent border-none p-0 outline-none"
          id="navbar-logo-btn"
        >
          <div className="relative w-8 h-8 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-lg flex items-center justify-center font-black text-black text-sm shadow-md shadow-amber-500/10">
            A
            <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-white text-[7px] font-bold text-black border border-amber-500">
              ★
            </span>
          </div>
          <div>
            <span className="tracking-[0.25em] text-[10px] font-black text-amber-400 block leading-none">AWOL AMERICA</span>
            <span className="text-[11px] text-white/50 font-sans block mt-0.5 leading-none font-bold">10th Achievement Awards</span>
          </div>
        </button>

        {/* Center: Desktop Navigation Menu */}
        <nav className="hidden md:flex items-center gap-1.5 bg-white/5 border border-white/5 p-1 rounded-xl">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer border-none outline-none ${
                  isActive
                    ? "bg-gradient-to-tr from-amber-400 to-amber-600 text-black shadow-md font-extrabold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
                id={`navbar-item-${item.id}`}
              >
                <Icon size={14} className={isActive ? "text-black" : "text-amber-400"} />
                <span>{item.label}</span>
                {item.showPing && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-black" : "bg-amber-400"} inline-block animate-ping`}></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Side: Quick Action or Menu Toggle */}
        <div className="flex items-center gap-3">
          {/* Quick Info Badge for Mobile Only */}
          <div className="md:hidden flex items-center gap-1 bg-white/5 text-amber-400 border border-white/10 px-2.5 py-1 rounded-full text-[9px] font-bold font-mono">
            <span className="relative flex h-1 w-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1 w-1 bg-amber-400"></span>
            </span>
            {phaseLabel}
          </div>

          {/* Call to Action Button */}
          {(isVotingActive || isResultsActive) && (
            <button
              onClick={() => handleTabClick(isVotingActive ? "vote" : "results")}
              className="hidden sm:inline-flex text-xs font-bold bg-white/5 hover:bg-white/10 text-amber-300 hover:text-amber-400 border border-amber-400/30 hover:border-amber-400/50 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
              id="navbar-cta-btn"
            >
              {isVotingActive ? "Cast Votes" : "View Winners"}
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors cursor-pointer"
            id="mobile-menu-toggle-btn"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden border-t border-white/10 bg-[#05070a]/95 backdrop-blur-2xl px-4 py-6 space-y-6 relative z-10 animate-fade-in"
          id="mobile-navigation-drawer"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-white/40 tracking-wider uppercase block">Platform Menu</span>
            <div className="grid grid-cols-1 gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full text-left px-4 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-between cursor-pointer border-none outline-none ${
                      isActive
                        ? "bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-extrabold"
                        : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white border border-white/5"
                    }`}
                    id={`mobile-navbar-item-${item.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className={isActive ? "text-black" : "text-amber-400"} />
                      <span>{item.label}</span>
                    </div>
                    {item.showPing && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 space-y-3">
            <span className="text-[10px] font-bold text-white/40 tracking-wider uppercase block">Contact & Support</span>
            <div className="grid grid-cols-1 gap-2.5 text-xs text-white/70">
              <a href={`mailto:${CONTACT_INFO.email}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5">
                <Mail size={14} className="text-amber-400" />
                <span>{CONTACT_INFO.email}</span>
              </a>
              <a href={CONTACT_INFO.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5">
                <Globe size={14} className="text-amber-400" />
                <span>{CONTACT_INFO.website}</span>
              </a>
              <a href={`tel:${CONTACT_INFO.telephone}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5">
                <Phone size={14} className="text-amber-400" />
                <span>{CONTACT_INFO.telephone}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Magnificent Hero Content block - Styled conditional display */}
      {activeTab === "overview" ? (
        <div 
          className="max-w-7xl mx-auto px-4 py-12 sm:px-6 sm:py-16 flex flex-col items-center text-center relative z-10 border-t border-white/5 animate-fade-in"
          id="main-hero-block"
        >
          {/* Milestone Emblem */}
          <div 
            className="relative inline-flex items-center justify-center p-3 bg-white/5 border border-white/10 rounded-2xl mb-6 shadow-lg shadow-amber-500/5 animate-pulse"
            id="milestone-emblem"
          >
            <Award className="text-amber-400" size={36} />
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-[10px] font-black text-black">
              10
            </span>
          </div>

          {/* Title Group */}
          <div className="flex items-center gap-3 mb-2 justify-center">
            <div className="w-8 h-8 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-lg flex items-center justify-center font-bold text-black text-sm">A</div>
            <span className="tracking-[0.3em] text-xs font-bold text-amber-500/80 uppercase">AWOL AMERICA</span>
          </div>
          <h1 
            className="font-sans text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl leading-none"
            id="main-app-title"
          >
            10th Annual <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">Achievement Awards</span>
          </h1>
          
          {/* Description and Date */}
          <p className="mt-4 text-white/70 text-sm sm:text-base max-w-2xl font-light leading-relaxed">
            Celebrating exceptional individuals, organizations, and initiatives who make significant contributions to society and inspire positive change within the community.
          </p>

          {/* Highlighted Ceremony Date */}
          <div 
            className="mt-8 inline-flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl px-5 py-2.5 text-xs text-white/80 font-mono shadow-inner"
            id="ceremony-banner"
          >
            <Clock size={14} className="text-amber-400" />
            <span>Official Ceremony: <strong className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400 font-bold">{timelineSettings ? formatDateTime(timelineSettings.ceremony) : "Saturday, September 5, 2026"}</strong></span>
          </div>
        </div>
      ) : (
        /* Compact Page Header banner for secondary screens to reduce scrolling frustration */
        <div 
          className="max-w-7xl mx-auto px-4 py-8 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 animate-fade-in"
          id="compact-hero-banner"
        >
          <div className="text-center sm:text-left">
            <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold block mb-1">
              AWOL AMERICA PORTAL
            </span>
            <h2 className="text-2xl font-black text-white">
              {menuItems.find(item => item.id === activeTab)?.label || "Platform Portal"}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-white/60">
            <Clock size={12} className="text-amber-400" />
            <span>Ceremony Date: <span className="text-white font-bold font-sans">{timelineSettings ? formatDateTime(timelineSettings.ceremony, 'short') : "Sept 5, 2026"}</span></span>
          </div>
        </div>
      )}
    </header>
  );
};
