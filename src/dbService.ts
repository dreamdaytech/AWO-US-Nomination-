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
} from "./types";

// ─── Helper: convert snake_case DB rows → camelCase app types ────────────────

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

  listenToSettings: (callback: (settings: TimelineSettings) => void): Unsubscribe => {
    // Initial fetch
    supabase.from("settings").select("*").eq("key", "timeline").single().then(({ data }) => {
      if (data) callback(data.value as TimelineSettings);
    });
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

  listenToDate: (callback: (date: string) => void): Unsubscribe => {
    // Initial fetch
    supabase.from("settings").select("*").eq("key", "system").single().then(({ data }) => {
      if (data?.value?.simulatedDate) callback(data.value.simulatedDate);
    });
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
};
