/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Sparkles,
  Briefcase,
  Music,
  Video,
  GraduationCap,
  HeartHandshake,
  Mic2,
  Trophy,
  Users2,
  Globe2,
  Award,
  HelpCircle,
} from "lucide-react";

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = "", size = 24 }) => {
  const iconProps = { className, size };

  switch (name) {
    case "Sparkles":
      return <Sparkles {...iconProps} />;
    case "Briefcase":
      return <Briefcase {...iconProps} />;
    case "Music":
      return <Music {...iconProps} />;
    case "Video":
      return <Video {...iconProps} />;
    case "GraduationCap":
      return <GraduationCap {...iconProps} />;
    case "HeartHandshake":
      return <HeartHandshake {...iconProps} />;
    case "Mic2":
      return <Mic2 {...iconProps} />;
    case "Trophy":
      return <Trophy {...iconProps} />;
    case "Users2":
      return <Users2 {...iconProps} />;
    case "Globe2":
      return <Globe2 {...iconProps} />;
    case "Award":
      return <Award {...iconProps} />;
    default:
      return <HelpCircle {...iconProps} />;
  }
};
