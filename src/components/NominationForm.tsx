/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Category, NominationInput, Nomination, SystemPhase, TimelineSettings } from "../types";
import { CONTACT_INFO } from "../data";
import { PhoneCodeSelect } from "./PhoneCodeSelect";
import { Check, AlertCircle, Sparkles, Send, HelpCircle, Share2, Twitter, Facebook, Linkedin, Copy, Lock, Vote, Clock, MessageCircle } from "lucide-react";
import { formatDateTime, parseLocalDateTime } from "../utils";

interface NominationFormProps {
  categories: Category[];
  onSubmitNomination: (nomination: NominationInput) => void;
  recentNominations: Nomination[];
  onToggleApprove: (nominationId: string) => void;
  selectedCategoryId?: number;
  currentPhase?: SystemPhase;
  timelineSettings?: TimelineSettings;
  simulatedDate?: Date;
  onNavigateToVote?: () => void;
}

export const NominationForm: React.FC<NominationFormProps> = ({
  categories,
  onSubmitNomination,
  recentNominations,
  onToggleApprove,
  selectedCategoryId = 0,
  currentPhase = SystemPhase.NOMINATION,
  timelineSettings,
  simulatedDate,
  onNavigateToVote,
}) => {
  const [formData, setFormData] = useState<NominationInput>({
    categoryId: selectedCategoryId,
    nomineeName: "",
    nomineeContact: "",
    nomineeEmail: "",
    nomineeFacebook: "",
    nomineeTwitter: "",
    nomineeLinkedIn: "",
    rationale: "",
    nominatorName: "",
    nominatorEmail: "",
    nominatorPhone: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const [nomineeContactCode, setNomineeContactCode] = useState("+1");
  const [nominatorPhoneCode, setNominatorPhoneCode] = useState("+1");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "categoryId" ? parseInt(value) || 0 : value,
    }));
  };

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

  const isBeforeNomination = nowTime < nominationStart;
  const isAfterNomination = nowTime > nominationEnd;
  const isNominationClosed = isBeforeNomination || isAfterNomination || currentPhase === SystemPhase.VOTING || currentPhase === SystemPhase.RESULTS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBeforeNomination) {
      setError(`Nominations have not started yet. They are scheduled to open on ${formatDateTime(settings.nominationStart, 'datetime')}.`);
      return;
    }
    if (isNominationClosed) {
      setError("Nominations are currently closed. However, you can now vote for the approved nominees.");
      return;
    }
    setError(null);

    // Validation
    if (!formData.nomineeName.trim()) {
      setError("Please specify the nominee's name.");
      return;
    }
    if (formData.categoryId <= 0) {
      setError("Please select a valid category.");
      return;
    }
    if (formData.rationale.trim().length < 20) {
      setError("Please write a descriptive rationale (at least 20 characters) explaining why this nominee deserves the award.");
      return;
    }
    if (!formData.nominatorName.trim()) {
      setError("Please provide your name as the nominator.");
      return;
    }
    if (!formData.nominatorEmail.trim() && !formData.nominatorPhone?.trim()) {
      setError("Please provide either your email address or phone number.");
      return;
    }

    const finalData = { ...formData };
    if (finalData.nomineeContact.trim() && !finalData.nomineeContact.trim().startsWith("+")) {
      finalData.nomineeContact = `${nomineeContactCode} ${finalData.nomineeContact.trim()}`;
    }
    if (finalData.nominatorPhone && finalData.nominatorPhone.trim() && !finalData.nominatorPhone.trim().startsWith("+")) {
      finalData.nominatorPhone = `${nominatorPhoneCode} ${finalData.nominatorPhone.trim()}`;
    }

    onSubmitNomination(finalData);
    setSubmitted(true);

    // Reset form for next submission
    setFormData({
      categoryId: formData.categoryId, // Keep category for ease
      nomineeName: "",
      nomineeContact: "",
      nomineeEmail: "",
      nomineeFacebook: "",
      nomineeTwitter: "",
      nomineeLinkedIn: "",
      rationale: "",
      nominatorName: "",
      nominatorEmail: "",
      nominatorPhone: "",
    });
    setNomineeContactCode("+1");
    setNominatorPhoneCode("+1");
  };

  return (
    <div className="space-y-8" id="nomination-form-tab-container">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Interactive Sandbox Form */}
        <div className="lg:col-span-7 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl" id="nomination-form-box">
          <div className="mb-6">
            <h3 className="font-sans font-extrabold text-white text-lg tracking-tight">
              Submit a Nomination
            </h3>
            <p className="text-xs text-white/50 mt-1 leading-relaxed">
              Please submit an official nomination for the upcoming AWOL AMERICA awards. Nominations can be made by fellow members, the public, or through self-nomination. To propose a deserving candidate for any of the categories listed, kindly complete the nomination form below. In your submission, please explain your reasons for the nomination and highlight the nominee's achievements, dedication, and commitment to fostering a better world.
            </p>
          </div>

          {isBeforeNomination && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-400/20 rounded-xl text-blue-300 text-sm flex items-start gap-3 animate-fade-in" id="nomination-scheduled-banner">
              <Clock className="text-blue-400 shrink-0 mt-0.5" size={18} />
              <div>
                <strong className="font-bold text-blue-300 block mb-1">Nomination Period Scheduled</strong>
                The nomination phase has not started yet. It is scheduled to run from {formatDateTime(settings.nominationStart, 'datetime')} until {formatDateTime(settings.nominationEnd, 'datetime')}. Please check back once the phase begins!
              </div>
            </div>
          )}

          {!isBeforeNomination && isNominationClosed && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-400/20 rounded-xl text-amber-300 text-sm flex items-start gap-3 animate-fade-in" id="nomination-closed-banner">
              <Lock className="text-amber-400 shrink-0 mt-0.5" size={18} />
              <div>
                <strong className="font-bold text-amber-300 block mb-1">Nomination Period Closed</strong>
                The nomination phase has officially ended. You can no longer submit new nominee proposals. However, you can now browse categories and cast your votes for active candidates!
                {onNavigateToVote && (
                  <button
                    type="button"
                    onClick={onNavigateToVote}
                    className="mt-2.5 px-4 py-1.5 bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Vote size={12} />
                    <span>Go to Voting Center</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {submitted ? (
            <div className="mb-6 p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 flex flex-col items-center justify-center text-center animate-fade-in" id="nomination-success-msg">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                <Check className="text-emerald-400" size={32} />
              </div>
              
              <div className="space-y-4 max-w-lg mx-auto mb-8">
                <strong className="font-extrabold block text-white text-2xl tracking-tight mb-2">Nomination Submitted Successfully!</strong>
                
                <p className="text-white/80 text-sm leading-relaxed">
                  Thank you for submitting your nomination.
                </p>
                <p className="text-white/80 text-sm leading-relaxed">
                  Your nomination has been received and saved successfully. Before it becomes available for public voting, it will be reviewed and approved by the AWOL AMERICA management team.
                </p>
                <p className="text-white/80 text-sm leading-relaxed">
                  Once approved, the nomination will be published and made available for public voting during the official voting period.
                </p>
                <p className="text-white/80 text-sm leading-relaxed">
                  Thank you for helping us recognize individuals and organizations making a positive impact in our communities.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 w-full max-w-lg mb-6">
                <h4 className="text-base font-bold text-white mb-2">Promote the Awards</h4>
                <p className="text-sm text-white/60 mb-5 leading-relaxed">
                  Spread the word and invite your network to nominate their community heroes for the 10th Annual AWOL America Achievement Awards!
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => {
                      const url = window.location.href;
                      const text = "Nominate your community heroes for the 10th Annual AWOL America Achievement Awards!";
                      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
                    }}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-[#1da1f2]/10 hover:bg-[#1da1f2]/20 border border-[#1da1f2]/20 text-[#1da1f2] font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    <Twitter size={14} />
                    <span>Share on X</span>
                  </button>
                  <button
                    onClick={() => {
                      const url = window.location.href;
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
                    }}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-[#1877f2]/10 hover:bg-[#1877f2]/20 border border-[#1877f2]/20 text-[#1877f2] font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    <Facebook size={14} />
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => {
                      const url = window.location.href;
                      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
                    }}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-[#0077b5]/10 hover:bg-[#0077b5]/20 border border-[#0077b5]/20 text-[#0077b5] font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    <Linkedin size={14} />
                    <span>LinkedIn</span>
                  </button>
                  <button
                    onClick={() => {
                      const url = window.location.href;
                      const text = "Nominate your community heroes for the 10th Annual AWOL America Achievement Awards!";
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`, "_blank");
                    }}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link copied to clipboard!");
                    }}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    <Copy size={14} />
                    <span>Copy Link</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setError("");
                }}
                className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/10 transition-colors cursor-pointer"
              >
                Submit Another Nomination
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-start gap-3" id="nomination-error-msg">
                  <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={18} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" id="actual-nomination-form">
            {/* Category Select */}
            <div>
              <label htmlFor="categoryId" className="block text-xs font-bold text-white/75 uppercase tracking-wider mb-2">
                Award Category *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                disabled={isNominationClosed}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:bg-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all outline-none text-white disabled:opacity-50 disabled:cursor-not-allowed"
                required
              >
                <option value={0} disabled className="bg-[#05070a] text-white/50">
                  Select a category...
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#05070a] text-white">
                    Cat 0{cat.id}: {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Nominee Name and Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nomineeName" className="block text-xs font-bold text-white/75 uppercase tracking-wider mb-2">
                  Nominee Full Name *
                </label>
                <input
                  type="text"
                  id="nomineeName"
                  name="nomineeName"
                  value={formData.nomineeName}
                  onChange={handleInputChange}
                  disabled={isNominationClosed}
                  placeholder={isNominationClosed ? "Nominations closed" : "e.g. Samuel Sesay"}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:bg-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all outline-none text-white placeholder-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>
              <div>
                <label htmlFor="nomineeEmail" className="block text-xs font-bold text-white/75 uppercase tracking-wider mb-2">
                  Nominee Email (Optional)
                </label>
                <input
                  type="email"
                  id="nomineeEmail"
                  name="nomineeEmail"
                  value={formData.nomineeEmail}
                  onChange={handleInputChange}
                  disabled={isNominationClosed}
                  placeholder={isNominationClosed ? "Nominations closed" : "e.g. sam@example.com"}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:bg-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all outline-none text-white placeholder-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nomineeContact" className="block text-xs font-bold text-white/75 uppercase tracking-wider mb-2">
                  Nominee Contact (Phone)
                </label>
                <div className="flex bg-white/5 border border-white/10 rounded-xl focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400 transition-all overflow-visible">
                  <PhoneCodeSelect
                    value={nomineeContactCode}
                    onChange={setNomineeContactCode}
                    disabled={isNominationClosed}
                  />
                  <input
                    type="text"
                    id="nomineeContact"
                    name="nomineeContact"
                    value={formData.nomineeContact}
                    onChange={handleInputChange}
                    disabled={isNominationClosed}
                    placeholder={isNominationClosed ? "Nominations closed" : "e.g. 234 567 8900"}
                    className="w-full bg-transparent px-4 py-3 text-sm outline-none text-white placeholder-white/30 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="nomineeFacebook" className="block text-xs font-bold text-white/75 uppercase tracking-wider mb-2">
                  Nominee Facebook URL
                </label>
                <input
                  type="url"
                  id="nomineeFacebook"
                  name="nomineeFacebook"
                  value={formData.nomineeFacebook}
                  onChange={handleInputChange}
                  disabled={isNominationClosed}
                  placeholder={isNominationClosed ? "Nominations closed" : "https://facebook.com/..."}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:bg-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all outline-none text-white placeholder-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nomineeTwitter" className="block text-xs font-bold text-white/75 uppercase tracking-wider mb-2">
                  Nominee Twitter URL
                </label>
                <input
                  type="url"
                  id="nomineeTwitter"
                  name="nomineeTwitter"
                  value={formData.nomineeTwitter}
                  onChange={handleInputChange}
                  disabled={isNominationClosed}
                  placeholder={isNominationClosed ? "Nominations closed" : "https://twitter.com/..."}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:bg-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all outline-none text-white placeholder-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label htmlFor="nomineeLinkedIn" className="block text-xs font-bold text-white/75 uppercase tracking-wider mb-2">
                  Nominee LinkedIn URL
                </label>
                <input
                  type="url"
                  id="nomineeLinkedIn"
                  name="nomineeLinkedIn"
                  value={formData.nomineeLinkedIn}
                  onChange={handleInputChange}
                  disabled={isNominationClosed}
                  placeholder={isNominationClosed ? "Nominations closed" : "https://linkedin.com/in/..."}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:bg-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all outline-none text-white placeholder-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Nomination Rationale */}
            <div>
              <label htmlFor="rationale" className="block text-xs font-bold text-white/75 uppercase tracking-wider mb-2">
                Nominee's Accomplishments & Rationale *
              </label>
              <textarea
                id="rationale"
                name="rationale"
                value={formData.rationale}
                onChange={handleInputChange}
                disabled={isNominationClosed}
                rows={4}
                placeholder={isNominationClosed ? "Nominations closed" : "Share your detailed rationale here. Highlight the nominee's achievements, dedication, and commitment to fostering a better world..."}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:bg-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all outline-none text-white placeholder-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
              <span className="text-[10px] text-white/40 mt-1 block">
                At least 20 characters required. Focus on concrete impacts in their category.
              </span>
            </div>


            {/* Nominator Information */}
            <div className="space-y-4 pt-3 border-t border-white/10">
              {/* Full Name — full width */}
              <div>
                <label htmlFor="nominatorName" className="block text-xs font-bold text-white/75 uppercase tracking-wider mb-2">
                  Your Full Name (Nominator) *
                </label>
                <input
                  type="text"
                  id="nominatorName"
                  name="nominatorName"
                  value={formData.nominatorName}
                  onChange={handleInputChange}
                  disabled={isNominationClosed}
                  placeholder={isNominationClosed ? "Nominations closed" : "e.g. Alice Koroma"}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:bg-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all outline-none text-white placeholder-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>

              {/* Email + Phone — side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nominatorEmail" className="block text-xs font-bold text-white/75 uppercase tracking-wider mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="nominatorEmail"
                    name="nominatorEmail"
                    value={formData.nominatorEmail}
                    onChange={handleInputChange}
                    disabled={isNominationClosed}
                    placeholder={isNominationClosed ? "Nominations closed" : "e.g. alice@example.com"}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:bg-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all outline-none text-white placeholder-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label htmlFor="nominatorPhone" className="block text-xs font-bold text-white/75 uppercase tracking-wider mb-2">
                    Your Phone
                  </label>
                  <div className="flex bg-white/5 border border-white/10 rounded-xl focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400 transition-all overflow-visible">
                    <PhoneCodeSelect
                      value={nominatorPhoneCode}
                      onChange={setNominatorPhoneCode}
                      disabled={isNominationClosed}
                    />
                    <input
                      type="text"
                      id="nominatorPhone"
                      name="nominatorPhone"
                      value={formData.nominatorPhone}
                      onChange={handleInputChange}
                      disabled={isNominationClosed}
                      placeholder={isNominationClosed ? "Nominations closed" : "e.g. 234 567 8900"}
                      className="w-full bg-transparent px-4 py-3 text-sm outline-none text-white placeholder-white/30 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            {isNominationClosed ? (
              <button
                type="button"
                onClick={onNavigateToVote}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-tr from-amber-400 to-amber-600 hover:brightness-110 text-black font-bold py-3.5 px-6 rounded-xl text-sm transition-all duration-200 shadow-md cursor-pointer"
                id="submit-nomination-btn"
              >
                <Vote size={15} />
                <span>Nominations Closed — Go to Voting Center</span>
              </button>
            ) : (
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-tr from-amber-400 to-amber-600 hover:brightness-110 text-black font-bold py-3.5 px-6 rounded-xl text-sm transition-all duration-200 shadow-md cursor-pointer"
                id="submit-nomination-btn"
              >
                <Send size={15} />
                <span>Submit Nomination</span>
              </button>
            )}
          </form>
          </>
          )}
        </div>

        {/* Guidelines and instructions sidebar */}
        <div className="lg:col-span-5 space-y-6" id="nomination-guidelines-sidebar">
          {/* Timeline Details */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
            <h4 className="font-sans font-bold text-white text-sm tracking-tight mb-3">
              Nomination Deadlines
            </h4>
            <ul className="space-y-3.5 text-xs text-white/70">
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                <div>
                  <strong className="text-white block">Commences:</strong>
                  {timelineSettings ? formatDateTime(timelineSettings.nominationStart) : "Friday, July 10, 2026"}
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                <div>
                  <strong className="text-white block">Closes:</strong>
                  {timelineSettings ? formatDateTime(timelineSettings.nominationEnd) : "Thursday, July 30, 2026 (11:59 PM)"}
                </div>
              </li>
              <li className="p-3 bg-amber-400/10 border border-amber-400/20 text-amber-300 rounded-xl text-[11px] leading-relaxed">
                <strong>Strategic Notice:</strong> The deadline was carefully chosen to allow sufficient time for review and standard voting procedures to take place.
              </li>
            </ul>
          </div>

          {/* Tips for high-quality nominations */}
          <div className="bg-gradient-to-br from-amber-500/15 to-amber-600/5 text-white/80 rounded-2xl p-6 border border-amber-400/20 shadow-xl backdrop-blur-xl">
            <h4 className="font-sans font-bold text-white text-sm tracking-tight mb-3 flex items-center gap-2">
              <Sparkles size={15} className="text-amber-400" />
              <span>Writing a Great Proposal</span>
            </h4>
            <ul className="space-y-2.5 text-xs leading-relaxed">
              <li>
                <span className="text-amber-400 font-bold mr-1">1.</span> Highlight specific, concrete milestones achieved in 2025/2026.
              </li>
              <li>
                <span className="text-amber-400 font-bold mr-1">2.</span> Focus on their dedication to community building or social harmony.
              </li>
              <li>
                <span className="text-amber-400 font-bold mr-1">3.</span> Provide links or verify accomplishments when possible.
              </li>
            </ul>
          </div>

          {/* Social Media Sharing Panel */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl space-y-4" id="nomination-share-card">
            <h4 className="font-sans font-bold text-white text-sm tracking-tight flex items-center gap-2">
              <Share2 size={16} className="text-amber-400" />
              <span>Promote the Awards</span>
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Spread the word and invite your network to nominate their community heroes for the 10th Annual AWOL America Achievement Awards!
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const url = window.location.href;
                    const text = "Nominate your heroes for the 10th Annual AWOL America Achievement Awards! Submit your entries here:";
                    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#1da1f2]/10 hover:bg-[#1da1f2]/20 border border-[#1da1f2]/20 text-[#1da1f2] font-bold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer"
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
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#1877f2]/10 hover:bg-[#1877f2]/20 border border-[#1877f2]/20 text-[#1877f2] font-bold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  title="Share on Facebook"
                >
                  <Facebook size={14} />
                  <span>Facebook</span>
                </button>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={() => {
                    const url = window.location.href;
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
                  }}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-[#0077b5]/10 hover:bg-[#0077b5]/20 border border-[#0077b5]/20 text-[#0077b5] font-bold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  title="Share on LinkedIn"
                >
                  <Linkedin size={14} />
                  <span>LinkedIn</span>
                </button>

                <button
                  onClick={() => {
                    const url = window.location.href;
                    const text = "Nominate your heroes for the 10th Annual AWOL America Achievement Awards! Submit your entries here:";
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`, "_blank");
                  }}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] font-bold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  title="Share on WhatsApp"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp</span>
                </button>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer"
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
