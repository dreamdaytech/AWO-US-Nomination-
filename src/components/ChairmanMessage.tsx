/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Mail, Phone, Globe, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { CONTACT_INFO } from "../data";
import { TimelineSettings } from "../types";
import { formatDateTime } from "../utils";

interface ChairmanMessageProps {
  timelineSettings?: TimelineSettings;
}

export const ChairmanMessage: React.FC<ChairmanMessageProps> = ({ timelineSettings }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white/5 text-white rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden mb-8" id="chairman-message-container">
      {/* Header section toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-white/5 transition-all focus:outline-none"
        id="toggle-chairman-letter-btn"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-amber-400">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="font-sans font-extrabold text-white text-base tracking-tight">
              Official Invitation & Bulletin
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Read the letter from AWOL AMERICA Chairman Mohamed Majid Kamara
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp size={18} className="text-white/40" /> : <ChevronDown size={18} className="text-white/40" />}
      </button>

      {/* Main Letter Body */}
      {isOpen && (
        <div className="border-t border-white/10 p-6 sm:p-8 bg-gradient-to-b from-white/[0.02] to-transparent font-sans leading-relaxed text-sm text-white/80">
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Letter Metadata */}
            <div className="flex flex-col sm:flex-row sm:justify-between border-b border-white/10 pb-4 mb-4 text-xs font-mono text-white/40">
              <span>Date: {timelineSettings ? formatDateTime(timelineSettings.announcementStart, "short") : "July 3, 2026"}</span>
              <span>Subject: AWOL AMERICA 10th Annual Achievement Awards</span>
            </div>

            <p className="font-semibold text-white">Dear Supporters, Patrons, and Community Members,</p>

            <p>
              We are pleased to announce the initiation of the nomination and voting process for the esteemed{" "}
              <strong className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400 font-bold">AWOL AMERICA 10th Annual Achievement Awards</strong> ceremony, scheduled for{" "}
              <span className="text-white font-medium underline decoration-amber-500/30">{timelineSettings ? formatDateTime(timelineSettings.ceremony) : "Saturday, September 5, 2026"}</span>.
            </p>

            <p>
              The AWOL AMERICA Achievement Awards have consistently recognized exceptional individuals, organizations, and initiatives that have made significant contributions to society, inspiring positive change within the community. This year, we look forward to honoring those whose extraordinary efforts have left a lasting impact on the world.
            </p>

            <p>
              Nominations may be submitted by fellow members, the public, or through self-nomination. Please share your rationale for the nomination and highlight the nominee's achievements, dedication, and commitment to fostering a better world.
            </p>

            <p>
              The nomination period will commence on{" "}
              <span className="text-white font-medium">{timelineSettings ? formatDateTime(timelineSettings.nominationStart) : "Friday, July 10, 2026"}</span> and will remain open until{" "}
              <span className="text-white font-medium">{timelineSettings ? formatDateTime(timelineSettings.nominationEnd) : "Thursday, July 30, 2026"}</span>. We encourage you to act promptly to honor those who have made a significant impact on our society. Following the nomination phase, the voting period will take place from{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400 font-bold">{timelineSettings ? `${formatDateTime(timelineSettings.votingStart)} to ${formatDateTime(timelineSettings.votingEnd)}` : "Friday, July 31 to Tuesday, August 25, 2026"}</span>.
            </p>

            <p>
              As we prepare for this momentous occasion, we extend our heartfelt gratitude to all our supporters and patrons, whose contributions make these awards possible. Join us on {timelineSettings ? formatDateTime(timelineSettings.ceremony) : "Saturday, September 5, 2026"}, as we celebrate the exceptional achievements of our nominees and commend their unwavering dedication to a better tomorrow.
            </p>

            <p>Thank you for your continued support. Together, let us embrace the spirit of positive change and recognize those who embody the core values of AWOL AMERICA.</p>

            {/* Signature Block */}
            <div className="pt-6 border-t border-white/10 mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="font-bold text-white text-base">{CONTACT_INFO.chairman}</p>
                <p className="text-xs text-amber-400 font-medium">{CONTACT_INFO.title}</p>
              </div>
              
              {/* Mini Stamp/Badge */}
              <div className="px-4 py-2 border border-white/10 bg-white/5 rounded-xl text-center">
                <span className="text-[10px] font-mono text-white/40 block tracking-wider">ESTABLISHED</span>
                <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400 tracking-widest uppercase">AWOL AMERICA</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
