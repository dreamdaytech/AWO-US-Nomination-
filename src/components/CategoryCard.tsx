/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Category, SystemPhase, TimelineSettings } from "../types";
import { CategoryIcon } from "./CategoryIcon";
import { ChevronRight, ArrowRight } from "lucide-react";
import { parseLocalDateTime } from "../utils";

interface CategoryCardProps {
  category: Category;
  currentPhase: SystemPhase;
  onSelect: (categoryId: number) => void;
  nomineeCount?: number;
  timelineSettings?: TimelineSettings;
  simulatedDate?: Date;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  currentPhase,
  onSelect,
  nomineeCount = 3,
  timelineSettings,
  simulatedDate,
}) => {
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
  const nomStart = parseLocalDateTime(settings.nominationStart).getTime();
  const nomEnd = parseLocalDateTime(settings.nominationEnd).getTime();
  const votingStart = parseLocalDateTime(settings.votingStart).getTime();
  const votingEnd = parseLocalDateTime(settings.votingEnd).getTime();

  // Determine badge text and color based on phase
  const getPhaseStatus = () => {
    if (nowTime < nomStart) {
      return { text: "Awaiting Nominations", style: "bg-white/5 text-white/60 border-white/10" };
    } else if (nowTime >= nomStart && nowTime <= nomEnd) {
      return { text: "Nominations Open", style: "bg-amber-400/10 text-amber-400 border-amber-400/20 animate-pulse" };
    } else if (nowTime > nomEnd && nowTime < votingStart) {
      return { text: "Nominations Closed", style: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
    } else if (nowTime >= votingStart && nowTime <= votingEnd) {
      return { text: `VOTE: ${nomineeCount} Nominees`, style: "bg-amber-400/20 text-amber-300 border-amber-400/30 font-bold animate-pulse" };
    } else {
      return { text: "Winners Announced", style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
    }
  };

  const status = getPhaseStatus();

  return (
    <div
      onClick={() => onSelect(category.id)}
      className="group relative bg-white/5 border border-white/10 hover:border-amber-400/40 rounded-2xl p-5 shadow-xl hover:shadow-2xl hover:bg-white/10 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
      id={`category-card-${category.id}`}
    >
      {/* Absolute top decorative gradient border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>

      <div>
        {/* Card Header with Icon and Badge */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="p-3 bg-white/5 group-hover:bg-amber-400/10 border border-white/10 group-hover:border-amber-400/30 text-white group-hover:text-amber-400 rounded-xl transition-all duration-300">
            <CategoryIcon name={category.iconName} size={20} />
          </div>
          <span className={`text-[10px] font-mono font-medium uppercase tracking-wider px-2.5 py-1 rounded-full border ${status.style}`}>
            {status.text}
          </span>
        </div>

        {/* Category Number and Name */}
        <div className="mb-2">
          <span className="text-xs font-mono font-bold text-amber-400/80 tracking-wider">
            CATEGORY {category.id.toString().padStart(2, "0")}
          </span>
          <h3 className="font-sans font-extrabold text-white text-base tracking-tight leading-snug group-hover:text-amber-400 transition-colors duration-200 mt-0.5">
            {category.name}
          </h3>
        </div>

        {/* Description */}
        <p className="font-sans text-xs text-white/60 leading-relaxed">
          {category.description}
        </p>
      </div>

      {/* Footer trigger */}
      <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-white/70">
        <span className="group-hover:text-amber-400 transition-colors duration-200">
          {nowTime >= nomStart && nowTime <= nomEnd
            ? "Submit a Nomination"
            : nowTime >= votingStart && nowTime <= votingEnd
            ? "Cast Your Vote"
            : nowTime > votingEnd
            ? "View Winners"
            : "View Category Details"}
        </span>
        <ArrowRight
          size={14}
          className="text-white/40 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-200"
        />
      </div>
    </div>
  );
};
