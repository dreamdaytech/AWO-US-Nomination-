/**
 * dbService.ts — Supabase implementation
 * Replaces the Firebase Firestore version with equivalent Supabase calls.
 * All real-time listeners (previously onSnapshot) now use Supabase Realtime channels.
 */

import { supabase } from "./supabase";
import {
  Nomination,
  Nominee,
  Message,
  TimelineSettings,
  NomineeGroup,
  GroupingAuditLog,
  AdminUser,
  Category,
  SecuritySettings,
  VotingCode,
  UserVote,
  GeneralContentSettings,
} from "./types";

// ─── Helper: convert snake_case DB rows → camelCase app types ────────────────

export function toCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    iconName: row.icon_name,
    orderIndex: row.order_index,
  };
}

function toNomination(row: any): Nomination {
  return {
    id:               row.id,
    categoryId:       row.category_id,
    nomineeName:      row.nominee_name,
    nomineeContact:   row.nominee_contact ?? "",
    nomineeEmail:     row.nominee_email ?? "",
    nomineeFacebook:  row.nominee_facebook ?? "",
    nomineeTwitter:   row.nominee_twitter ?? "",
    nomineeLinkedIn:  row.nominee_linked_in ?? "",
    rationale:        row.rationale,
    nominatorName:    row.nominator_name,
    nominatorEmail:   row.nominator_email ?? "",
    submittedAt:      row.submitted_at,
    approved:         row.approved,
    declined:         row.declined ?? false,
    groupId:          row.group_id ?? undefined,
  };
}

function toNominee(row: any): Nominee {
  return {
    id:           row.id,
    categoryId:   row.category_id,
    name:         row.name,
    description:  row.description ?? "",
    avatarUrl:    row.avatar_url ?? "",
    votes:        row.votes ?? 0,
    organization: row.organization ?? "",
    listType:     row.list_type ?? undefined,
    achievements: Array.isArray(row.achievements) ? row.achievements : undefined,
  };
}

function toMessage(row: any): Message {
  return {
    id:        row.id,
    author:    row.author,
    content:   row.content,
    createdAt: row.created_at,
  };
}

function toAdminUser(row: any): AdminUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role || "ADMIN",
    createdAt: row.created_at,
  };
}

function toNomineeGroup(row: any): NomineeGroup {
  return {
    id:             row.id,
    categoryId:     row.category_id,
    name:           row.name,
    description:    row.description ?? "",
    nominationIds:  row.nomination_ids ?? [],
    approved:       row.approved,
  };
}

function toGroupingAuditLog(row: any): GroupingAuditLog {
  return {
    id:           row.id,
    adminEmail:   row.admin_email,
    action:       row.action as GroupingAuditLog["action"],
    groupId:      row.group_id ?? "",
    nominationId: row.nomination_id ?? undefined,
    timestamp:    row.timestamp,
  };
}

// ─── Unsubscribe helper ───────────────────────────────────────────────────────

type Unsubscribe = () => void;

function makeUnsubscribe(channel: ReturnType<typeof supabase.channel>): Unsubscribe {
  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── dbService ────────────────────────────────────────────────────────────────

export const dbService = {

  // ── LISTENERS (real-time) ────────────────────────────────────────────────

  listenToCategories: (callback: (categories: Category[]) => void, onReady?: () => void): Unsubscribe => {
    // Initial fetch
    (async () => {
      try {
        const { data, error } = await supabase.from("categories").select("*");
        if (data) callback(data.map(toCategory));
      } catch (e) {
        console.error("Error fetching categories:", e);
      } finally {
        if (onReady) onReady();
      }
    })();
    // Real-time subscription
    const channel = supabase
      .channel("public:categories")
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" },
        () => {
          supabase.from("categories").select("*").then(({ data }) => {
            if (data) callback(data.map(toCategory));
          });
        }
      )
      .subscribe();
    return makeUnsubscribe(channel);
  },

  listenToSettings: (callback: (settings: TimelineSettings) => void, onReady?: () => void): Unsubscribe => {
    // Initial fetch
    (async () => {
      try {
        const { data, error } = await supabase.from("settings").select("*").eq("key", "timeline").single();
        if (data) callback(data.value as TimelineSettings);
      } catch (e) {
        console.error("Error fetching timeline settings:", e);
      } finally {
        if (onReady) onReady();
      }
    })();
    // Real-time subscription
    const channel = supabase
      .channel("settings-timeline")
      .on("postgres_changes", { event: "*", schema: "public", table: "settings", filter: "key=eq.timeline" },
        (payload: any) => {
          const row = payload.new ?? payload.old;
          if (row?.value) callback(row.value as TimelineSettings);
        }
      )
      .subscribe();
    return makeUnsubscribe(channel);
  },

  listenToSecuritySettings: (callback: (settings: SecuritySettings) => void, onReady?: () => void): Unsubscribe => {
    (async () => {
      try {
        const { data, error } = await supabase.from("settings").select("*").eq("key", "security").single();
        if (data) callback(data.value as SecuritySettings);
        else callback({ requireAccessCode: false });
      } catch (e) {
        console.error("Error fetching security settings:", e);
        callback({ requireAccessCode: false });
      } finally {
        if (onReady) onReady();
      }
    })();
    const channel = supabase
      .channel("settings-security")
      .on("postgres_changes", { event: "*", schema: "public", table: "settings", filter: "key=eq.security" },
        (payload: any) => {
          const row = payload.new ?? payload.old;
          if (row?.value) callback(row.value as SecuritySettings);
        }
      )
      .subscribe();
    return makeUnsubscribe(channel);
  },

  listenToGeneralContent: (callback: (settings: GeneralContentSettings | null) => void, onReady?: () => void): Unsubscribe => {
    (async () => {
      try {
        const { data, error } = await supabase.from("settings").select("*").eq("key", "generalContent").single();
        if (data) callback(data.value as GeneralContentSettings);
        else callback(null);
      } catch (e) {
        console.error("Error fetching general content:", e);
        callback(null);
      } finally {
        if (onReady) onReady();
      }
    })();
    const channel = supabase
      .channel("settings-generalContent")
      .on("postgres_changes", { event: "*", schema: "public", table: "settings", filter: "key=eq.generalContent" },
        (payload: any) => {
          const row = payload.new ?? payload.old;
          if (row?.value) callback(row.value as GeneralContentSettings);
        }
      )
      .subscribe();
    return makeUnsubscribe(channel);
  },

  updateGeneralContent: async (settings: GeneralContentSettings) => {
    const { error } = await supabase
      .from("settings")
      .upsert({ key: "generalContent", value: settings }, { onConflict: "key" });
    if (error) throw error;
  },

  updateSecuritySettings: async (settings: SecuritySettings) => {
    const { error } = await supabase
      .from("settings")
      .upsert({ key: "security", value: settings }, { onConflict: "key" });
    if (error) throw error;
  },

  generateVotingCodes: async (quantity: number): Promise<void> => {
    const codes = [];
    for (let i = 0; i < quantity; i++) {
      const codeStr = Math.floor(100000 + Math.random() * 900000).toString();
      codes.push({ code: codeStr });
    }
    const { error } = await supabase.from("voting_codes").upsert(codes, { onConflict: "code", ignoreDuplicates: true });
    if (error) throw error;
  },

  fetchCodeStats: async (): Promise<{ total: number, used: number, unused: number }> => {
    const { count: total, error: err1 } = await supabase.from("voting_codes").select("*", { count: "exact", head: true });
    if (err1) throw err1;
    
    const { data: voteData, error: err2 } = await supabase.from("votes").select("code");
    if (err2) throw err2;
    
    const usedCodesSet = new Set(voteData?.map((v) => v.code) || []);
    const used = usedCodesSet.size;
    const unused = (total || 0) - used;
    return { total: total || 0, used, unused };
  },

  fetchUnusedCodes: async (): Promise<string[]> => {
    // To find unused codes, we get all codes, and all used codes, and subtract.
    // In production with millions of rows, we'd use an RPC or left join. 
    // But since Supabase REST doesn't do NOT IN easily without an RPC, we will do it here for now.
    const { data: allCodes, error: err1 } = await supabase.from("voting_codes").select("code");
    if (err1) throw err1;
    
    const { data: voteData, error: err2 } = await supabase.from("votes").select("code");
    if (err2) throw err2;

    const usedCodesSet = new Set(voteData?.map((v) => v.code) || []);
    return (allCodes || [])
      .filter((row) => !usedCodesSet.has(row.code))
      .map((row) => row.code);
  },

  fetchVotesForCode: async (code: string): Promise<UserVote[]> => {
    // 1. Check if code is valid
    const { data: codeData, error: codeErr } = await supabase.from("voting_codes").select("code").eq("code", code).single();
    if (codeErr || !codeData) throw new Error("Invalid access code");

    // 2. Fetch votes
    const { data, error } = await supabase.from("votes").select("*").eq("code", code);
    if (error) throw error;

    return (data || []).map((row: any) => ({
      categoryId: row.category_id,
      nomineeId: row.nominee_id,
    }));
  },

  castVoteWithCode: async (code: string, categoryId: number, nomineeId: string) => {
    const { error } = await supabase.rpc("cast_vote", {
      p_code: code,
      p_category_id: categoryId,
      p_nominee_id: nomineeId,
    });
    if (error) {
      if (error.message.includes("violates unique constraint")) {
        throw new Error("You have already voted in this category.");
      }
      throw error;
    }
  },

  listenToDate: (callback: (date: string) => void, onReady?: () => void): Unsubscribe => {
    // Initial fetch
    (async () => {
      try {
        const { data, error } = await supabase.from("settings").select("*").eq("key", "system").single();
        if (data?.value?.simulatedDate) callback(data.value.simulatedDate);
      } catch (e) {
        console.error("Error fetching simulated date:", e);
      } finally {
        if (onReady) onReady();
      }
    })();
    // Real-time subscription
    const channel = supabase
      .channel("settings-system")
      .on("postgres_changes", { event: "*", schema: "public", table: "settings", filter: "key=eq.system" },
        (payload: any) => {
          const row = payload.new ?? payload.old;
          if (row?.value?.simulatedDate) callback(row.value.simulatedDate);
        }
      )
      .subscribe();
    return makeUnsubscribe(channel);
  },

  listenToAdmins: (callback: (admins: AdminUser[]) => void): Unsubscribe => {
    supabase.from("admins").select("*").then(({ data }) => {
      callback((data ?? []).map(toAdminUser));
    });
    const channel = supabase
      .channel("admins-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "admins" }, async () => {
        const { data } = await supabase.from("admins").select("*");
        callback((data ?? []).map(toAdminUser));
      })
      .subscribe();
    return makeUnsubscribe(channel);
  },

  addAdmin: async (admin: Omit<AdminUser, "id" | "createdAt">): Promise<void> => {
    const { error } = await supabase.from("admins").insert({
      name: admin.name,
      email: admin.email,
      password: admin.password,
      role: admin.role,
    });
    if (error) throw error;
  },

  updateAdmin: async (id: string, updates: Partial<AdminUser>): Promise<void> => {
    const { error } = await supabase.from("admins").update(updates).eq("id", id);
    if (error) throw error;
  },

  deleteAdmin: async (id: string): Promise<void> => {
    const { error } = await supabase.from("admins").delete().eq("id", id);
    if (error) throw error;
  },

  listenToNominations: (callback: (nominations: Nomination[]) => void): Unsubscribe => {
    // Initial fetch
    supabase.from("nominations").select("*").then(({ data }) => {
      callback((data ?? []).map(toNomination));
    });
    // Real-time
    const channel = supabase
      .channel("nominations-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "nominations" }, async () => {
        const { data } = await supabase.from("nominations").select("*");
        callback((data ?? []).map(toNomination));
      })
      .subscribe();
    return makeUnsubscribe(channel);
  },

  listenToMessages: (callback: (messages: Message[]) => void): Unsubscribe => {
    // Initial fetch (ordered newest first)
    supabase.from("messages").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      callback((data ?? []).map(toMessage));
    });
    // Real-time
    const channel = supabase
      .channel("messages-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, async () => {
        const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
        callback((data ?? []).map(toMessage));
      })
      .subscribe();
    return makeUnsubscribe(channel);
  },

  listenToNominees: (callback: (nominees: Nominee[]) => void): Unsubscribe => {
    // Initial fetch
    supabase.from("nominees").select("*").then(({ data }) => {
      callback((data ?? []).map(toNominee));
    });
    // Real-time
    const channel = supabase
      .channel("nominees-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "nominees" }, async () => {
        const { data } = await supabase.from("nominees").select("*");
        callback((data ?? []).map(toNominee));
      })
      .subscribe();
    return makeUnsubscribe(channel);
  },

  listenToNomineeGroups: (callback: (groups: NomineeGroup[]) => void): Unsubscribe => {
    // Initial fetch
    supabase.from("nominee_groups").select("*").then(({ data }) => {
      callback((data ?? []).map(toNomineeGroup));
    });
    // Real-time
    const channel = supabase
      .channel("nominee-groups-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "nominee_groups" }, async () => {
        const { data } = await supabase.from("nominee_groups").select("*");
        callback((data ?? []).map(toNomineeGroup));
      })
      .subscribe();
    return makeUnsubscribe(channel);
  },

  listenToGroupingAuditLogs: (callback: (logs: GroupingAuditLog[]) => void): Unsubscribe => {
    // Initial fetch (ordered newest first)
    supabase.from("grouping_audit_logs").select("*").order("timestamp", { ascending: false }).then(({ data }) => {
      callback((data ?? []).map(toGroupingAuditLog));
    });
    // Real-time
    const channel = supabase
      .channel("audit-logs-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "grouping_audit_logs" }, async () => {
        const { data } = await supabase.from("grouping_audit_logs").select("*").order("timestamp", { ascending: false });
        callback((data ?? []).map(toGroupingAuditLog));
      })
      .subscribe();
    return makeUnsubscribe(channel);
  },

  // ── MUTATIONS ────────────────────────────────────────────────────────────

  // Categories
  setCategory: async (category: Category) => {
    // Upsert behavior
    if (category.id) {
      // Check if it exists. We might be creating a new one if id is 0 or unassigned.
      // But typically we let postgres auto-generate the ID for new rows.
      // If we pass an ID that doesn't exist, upsert works but might violate serial sequence.
      // It's safer to separate insert and update if id is 0.
      if (category.id === 0) {
        const { data, error } = await supabase.from("categories").insert({
          name: category.name,
          description: category.description,
          icon_name: category.iconName,
          order_index: category.orderIndex ?? 0,
        });
        if (error) throw error;
        return data;
      }
    }
    const { data, error } = await supabase.from("categories").upsert({
      id: category.id,
      name: category.name,
      description: category.description,
      icon_name: category.iconName,
      order_index: category.orderIndex ?? 0,
    });
    if (error) throw error;
    return data;
  },

  rearrangeCategories: async (categories: Category[]) => {
    const payload = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      icon_name: cat.iconName,
      order_index: cat.orderIndex ?? 0,
    }));
    const { error } = await supabase.from("categories").upsert(payload);
    if (error) throw error;
  },
  
  deleteCategory: async (id: number) => {
    return supabase.from("categories").delete().eq("id", id);
  },

  updateSettings: async (settings: TimelineSettings) => {
    const { error } = await supabase
      .from("settings")
      .upsert({ key: "timeline", value: settings }, { onConflict: "key" });
    if (error) throw error;
  },

  updateSimulatedDate: async (date: string) => {
    const { error } = await supabase
      .from("settings")
      .upsert({ key: "system", value: { simulatedDate: date } }, { onConflict: "key" });
    if (error) throw error;
  },

  updateAdminCredentials: async (creds: { email: string; password: string }) => {
    const { error } = await supabase
      .from("settings")
      .upsert({ key: "adminCredentials", value: creds }, { onConflict: "key" });
    if (error) throw error;
  },

  addNomination: async (nom: Omit<Nomination, "id">) => {
    const { data, error } = await supabase.from("nominations").insert({
      category_id:      nom.categoryId,
      nominee_name:     nom.nomineeName,
      nominee_contact:  nom.nomineeContact,
      nominee_email:    nom.nomineeEmail,
      nominee_facebook: nom.nomineeFacebook,
      nominee_twitter:  nom.nomineeTwitter,
      nominee_linked_in: nom.nomineeLinkedIn,
      rationale:        nom.rationale,
      nominator_name:   nom.nominatorName,
      nominator_email:  nom.nominatorEmail,
      submitted_at:     nom.submittedAt,
      approved:         nom.approved,
      declined:         nom.declined ?? false,
    }).select().single();
    if (error) throw error;
    return data;
  },

  updateNomination: async (id: string, data: Partial<Nomination>) => {
    const patch: any = {};
    if (data.approved   !== undefined) patch.approved  = data.approved;
    if (data.declined   !== undefined) patch.declined  = data.declined;
    if (data.groupId    !== undefined) patch.group_id  = data.groupId;
    const { error } = await supabase.from("nominations").update(patch).eq("id", id);
    if (error) throw error;
  },

  deleteNomination: async (id: string) => {
    const { error } = await supabase.from("nominations").delete().eq("id", id);
    if (error) throw error;
  },

  setNominee: async (nominee: Nominee) => {
    const { error } = await supabase.from("nominees").upsert({
      id:           nominee.id,
      category_id:  nominee.categoryId,
      name:         nominee.name,
      description:  nominee.description ?? "",
      avatar_url:   nominee.avatarUrl ?? "",
      votes:        nominee.votes ?? 0,
      organization: nominee.organization ?? "",
      list_type:    nominee.listType ?? null,
      achievements: nominee.achievements ?? [],
    }, { onConflict: "id" });
    if (error) throw error;
  },

  updateNominee: async (id: string, data: Partial<Nominee>) => {
    const patch: any = {};
    if (data.categoryId  !== undefined) patch.category_id  = data.categoryId;
    if (data.name        !== undefined) patch.name         = data.name;
    if (data.description !== undefined) patch.description  = data.description;
    if (data.avatarUrl   !== undefined) patch.avatar_url   = data.avatarUrl;
    if (data.votes       !== undefined) patch.votes        = data.votes;
    if (data.organization !== undefined) patch.organization = data.organization;
    if (data.listType    !== undefined) patch.list_type    = data.listType;
    if (data.achievements!== undefined) patch.achievements = data.achievements;
    const { error } = await supabase.from("nominees").update(patch).eq("id", id);
    if (error) throw error;
  },

  deleteNominee: async (id: string) => {
    const { error } = await supabase.from("nominees").delete().eq("id", id);
    if (error) throw error;
  },

  updateNomineeVotes: async (id: string, votes: number) => {
    const { error } = await supabase.from("nominees").update({ votes }).eq("id", id);
    if (error) throw error;
  },

  incrementNomineeVotes: async (id: string, amount: number) => {
    // Uses the atomic PostgreSQL RPC function to avoid race conditions
    const { error } = await supabase.rpc("increment_nominee_votes", {
      p_id: id,
      p_amount: amount,
    });
    if (error) throw error;
  },

  addNomineeGroup: async (group: Omit<NomineeGroup, "id">) => {
    const { data, error } = await supabase.from("nominee_groups").insert({
      category_id:    group.categoryId,
      name:           group.name,
      description:    group.description,
      nomination_ids: group.nominationIds,
      approved:       group.approved,
      votes:          (group as any).votes ?? 0,
    }).select().single();
    if (error) throw error;
    return data; // { id: string, ... }
  },

  updateNomineeGroup: async (id: string, data: Partial<NomineeGroup>) => {
    const patch: any = {};
    if (data.name           !== undefined) patch.name           = data.name;
    if (data.description    !== undefined) patch.description    = data.description;
    if (data.nominationIds  !== undefined) patch.nomination_ids = data.nominationIds;
    if (data.approved       !== undefined) patch.approved       = data.approved;
    if ((data as any).votes !== undefined) patch.votes          = (data as any).votes;
    const { error } = await supabase.from("nominee_groups").update(patch).eq("id", id);
    if (error) throw error;
  },

  deleteNomineeGroup: async (id: string) => {
    const { error } = await supabase.from("nominee_groups").delete().eq("id", id);
    if (error) throw error;
  },

  addGroupingAuditLog: async (log: Omit<GroupingAuditLog, "id">) => {
    const { error } = await supabase.from("grouping_audit_logs").insert({
      admin_email:   log.adminEmail,
      action:        log.action,
      group_id:      log.groupId,
      nomination_id: log.nominationId ?? null,
      timestamp:     log.timestamp,
    });
    if (error) throw error;
  },

  addMessage: async (msg: Omit<Message, "id">) => {
    const { error } = await supabase.from("messages").insert({
      author:     msg.author,
      content:    msg.content,
      created_at: msg.createdAt,
    });
    if (error) throw error;
  },

  deleteMessage: async (id: string) => {
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) throw error;
  },

  /**
   * createMonimeCheckout
   * Calls the Supabase Edge Function `create-monime-checkout` which securely
   * contacts the Monime API using server-side secrets.
   *
   * @param amount - Amount in SLE (e.g. 5 = 5 SLE)
   * @param currency - Currency code, defaults to "SLE"
   * @param mode - "one_time" (unlock all votes) or "per_vote" (pay per vote)
   * @param nomineeId - (per_vote only) the nominee being voted for
   * @param categoryId - (per_vote only) the category of the vote
   * @returns checkoutUrl to redirect the user to
   */
  createMonimeCheckout: async ({
    amount,
    currency = "SLE",
    mode,
    nomineeId,
    categoryId,
  }: {
    amount: number;
    currency?: string;
    mode: "one_time" | "per_vote";
    nomineeId?: string;
    categoryId?: number;
  }): Promise<{ checkoutUrl: string; sessionId: string }> => {
    const { data, error } = await supabase.functions.invoke("create-monime-checkout", {
      body: { amount, currency, mode, nomineeId, categoryId },
    });
    if (error) throw new Error(error.message || "Failed to create checkout session.");
    if (data?.error) throw new Error(data.error);
    return { checkoutUrl: data.checkoutUrl, sessionId: data.sessionId };
  },
};
