/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Calendar, CheckCircle2, ChevronRight, Clock, Award } from "lucide-react";
import { SystemPhase, TimelineSettings } from "../types";
import { formatDateTime, parseLocalDateTime } from "../utils";

interface TimelineWidgetProps {
  currentPhase: SystemPhase;
  timelineSettings?: TimelineSettings;
  simulatedDate: Date;
}

export const TimelineWidget: React.FC<TimelineWidgetProps> = ({ currentPhase, timelineSettings, simulatedDate }) => {
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

  // Define helper to get day before nomination start
  const getPreNomEndRange = () => {
    try {
      const nomStart = parseLocalDateTime(settings.nominationStart);
      const dayBefore = new Date(nomStart.getTime() - 24 * 60 * 60 * 1000);
      return formatDateTime(dayBefore.toISOString(), 'short');
    } catch (e) {
      return "July 9";
    }
  };

  const nowTime = simulatedDate.getTime();

  const getStatus = (startStr: string, endStr?: string, fallbackStartStr?: string, fallbackEndStr?: string) => {
    let startD = parseLocalDateTime(startStr);
    if (isNaN(startD.getTime()) && fallbackStartStr) {
      startD = parseLocalDateTime(fallbackStartStr);
    }
    const start = startD.getTime();

    if (endStr) {
      let endD = parseLocalDateTime(endStr);
      if (isNaN(endD.getTime()) && fallbackEndStr) {
        endD = parseLocalDateTime(fallbackEndStr);
      }
      const end = endD.getTime();
      
      if (nowTime < start) return "pending";
      if (nowTime >= start && nowTime <= end) return "active";
      return "completed";
    } else {
      // Ceremony phase - let's treat its active duration as 24 hours
      const duration = 24 * 60 * 60 * 1000;
      const end = start + duration;
      if (nowTime < start) return "pending";
      if (nowTime >= start && nowTime <= end) return "active";
      return "completed";
    }
  };

  // Define phases with their statuses
  const phasesList = [
    {
      key: SystemPhase.PRE_NOMINATION,
      title: "Announcement",
      dateRange: timelineSettings
        ? `${formatDateTime(timelineSettings.announcementStart, 'short')} - ${formatDateTime(timelineSettings.announcementEnd, 'short')}`
        : `Friday, July 3 - ${getPreNomEndRange()}`,
      description: "Nomination guidelines released to public",
      status: getStatus(
        settings.announcementStart,
        settings.announcementEnd,
        defaultSettings.announcementStart,
        defaultSettings.announcementEnd
      ),
    },
    {
      key: SystemPhase.NOMINATION,
      title: "Nomination Phase",
      dateRange: timelineSettings 
        ? `${formatDateTime(timelineSettings.nominationStart, 'short')} - ${formatDateTime(timelineSettings.nominationEnd, 'short')}`
        : "July 10 - July 30, 2026",
      description: "Submit nominee rationale & achievements",
      status: getStatus(
        settings.nominationStart,
        settings.nominationEnd,
        defaultSettings.nominationStart,
        defaultSettings.nominationEnd
      ),
    },
    {
      key: SystemPhase.VOTING,
      title: "Voting Period",
      dateRange: timelineSettings
        ? `${formatDateTime(timelineSettings.votingStart, 'short')} - ${formatDateTime(timelineSettings.votingEnd, 'short')}`
        : "July 31 - Aug 25, 2026",
      description: "Vote for the top official nominees",
      status: getStatus(
        settings.votingStart,
        settings.votingEnd,
        defaultSettings.votingStart,
        defaultSettings.votingEnd
      ),
    },
    {
      key: SystemPhase.RESULTS,
      title: "Awards Ceremony",
      dateRange: timelineSettings
        ? formatDateTime(timelineSettings.ceremony)
        : "Saturday, Sept 5, 2026",
      description: "Honoring outstanding achievement",
      status: getStatus(
        settings.ceremony,
        undefined,
        defaultSettings.ceremony
      ),
    },
  ];

  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl mb-8" id="timeline-widget-container">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="text-amber-400" size={18} />
          <h2 className="font-sans font-bold text-white text-sm tracking-tight uppercase">
            Official Award Timeline
          </h2>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-xs font-mono text-white/50">Year 2026 Event Schedule</div>
          <div className="text-[10px] font-mono text-amber-400/80 mt-0.5">
            System Date: {formatDateTime(simulatedDate.toISOString(), "datetime")}
          </div>
        </div>
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
        {phasesList.map((phase, index) => {
          const isActive = phase.status === "active";
          const isCompleted = phase.status === "completed";
          const isPending = phase.status === "pending";

          return (
            <div
              key={phase.key}
              className={`relative flex flex-col p-4 rounded-xl border transition-all duration-300 ${
                isActive
                  ? "bg-amber-500/10 border-amber-400/40 shadow-lg shadow-amber-500/5 ring-1 ring-amber-400/20"
                  : isCompleted
                  ? "bg-white/5 border-white/10 opacity-60"
                  : "bg-white/[0.02] border-white/5"
              }`}
              id={`timeline-step-${index}`}
            >
              {/* Connector lines on desktop */}
              {index < phasesList.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10 text-white/20">
                  <ChevronRight size={16} />
                </div>
              )}

              {/* Header inside the Step */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                  Stage 0{index + 1}
                </span>

                {isActive ? (
                  <span className="flex items-center gap-1 bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400"></span>
                    </span>
                    Active
                  </span>
                ) : isCompleted ? (
                  <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-medium">
                    <CheckCircle2 size={10} /> Completed
                  </span>
                ) : (
                  <span className="bg-white/5 text-white/40 border border-white/5 px-2 py-0.5 rounded-full text-[10px] font-light">
                    Scheduled
                  </span>
                )}
              </div>

              {/* Stage details */}
              <h3 className={`font-sans font-bold text-sm tracking-tight ${isActive ? "text-amber-400" : "text-white/90"}`}>
                {phase.title}
              </h3>
              <p className={`font-mono text-xs font-semibold mt-0.5 ${isActive ? "text-amber-400/80" : "text-white/50"}`}>
                {phase.dateRange}
              </p>
              <p className="font-sans text-xs text-white/60 mt-2 leading-relaxed">
                {phase.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
