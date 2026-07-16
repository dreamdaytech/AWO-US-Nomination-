/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum SystemPhase {
  PRE_NOMINATION = "PRE_NOMINATION", // Before July 10, 2026
  NOMINATION = "NOMINATION",         // July 10 - July 30, 2026
  VOTING = "VOTING",                 // July 31 - August 25, 2026
  RESULTS = "RESULTS"                // After August 25, 2026
}

export interface Category {
  id: number;
  name: string;
  description: string;
  iconName: string;
  orderIndex?: number;
}

export interface Nominee {
  id: string;
  categoryId: number;
  name: string;
  description: string;
  avatarUrl?: string;
  votes: number;
  organization?: string;
  listType?: "final" | "approved";
  achievements?: string[];
}

export interface NominationInput {
  categoryId: number;
  nomineeName: string;
  nomineeContact: string;
  nomineeEmail?: string;
  nomineeFacebook?: string;
  nomineeTwitter?: string;
  nomineeLinkedIn?: string;
  rationale: string;
  nominatorName: string;
  nominatorEmail: string;
  nominatorPhone?: string;
}

export interface Nomination extends NominationInput {
  id: string;
  submittedAt: string;
  approved: boolean;
  declined?: boolean;
  votes?: number; // Approved for the voting pool
  groupId?: string;
}

export interface NomineeGroup {
  id: string;
  categoryId: number;
  name: string;
  description: string;
  nominationIds: string[];
  approved: boolean;
}

export interface GroupingAuditLog {
  id: string;
  adminEmail: string;
  action: "CREATE" | "ADD" | "REMOVE" | "APPROVE_GROUP" | "REJECT_GROUP";
  groupId: string;
  nominationId?: string;
  timestamp: string;
}

export interface UserVote {
  categoryId: number;
  nomineeId: string;
}

export interface TimelineSettings {
  announcementStart: string;
  announcementEnd: string;
  nominationStart: string;
  nominationEnd: string;
  votingStart: string;
  votingEnd: string;
  ceremony: string;
  resultsVisible?: boolean;
}

export interface SecuritySettings {
  requireAccessCode: boolean;
  enableCaptcha?: boolean;
  requirePayment?: boolean;
  paymentMode?: "one_time" | "per_vote"; // one_time = pay once to unlock all votes; per_vote = pay for each individual vote
  paymentAmount?: number; // Amount in the smallest currency unit (e.g., cents for SLE leones)
  paymentCurrency?: string; // e.g., "SLE"
}

export interface PaymentSession {
  id: string;
  checkoutUrl: string;
  nomineeId?: string;   // Set for per_vote mode
  categoryId?: number;  // Set for per_vote mode
  mode: "one_time" | "per_vote";
  status: "pending" | "paid" | "cancelled";
  createdAt: string;
}

export interface VotingCode {
  id: number;
  code: string;
  createdAt: string;
}

export interface Message {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "SUPER_ADMIN" | "ADMIN";
  createdAt: string;
}

export interface GeneralContentSettings {
  contactEmail: string;
  contactWebsite: string;
  contactWebsiteUrl: string;
  contactPhone: string;
  contactFormsUrl: string;
  chairmanName: string;
  chairmanTitle: string;
  awardsTitle: string;
  invitationTitle: string;
  letterBody: string;
}
