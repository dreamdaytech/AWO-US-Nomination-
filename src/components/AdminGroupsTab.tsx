import React, { useState } from "react";
import { Users, Plus, CheckCircle, XCircle, Trash2, Edit } from "lucide-react";
import { NomineeGroup, Nomination, Category, GroupingAuditLog } from "../types";

export const AdminGroupsTab = ({ 
  groups, 
  nominations, 
  categories, 
  onApprove, 
  onDelete, 
  logs,
  onRemoveNomination
}: { 
  groups: NomineeGroup[], 
  nominations: Nomination[], 
  categories: Category[],
  onApprove: (id: string, approved: boolean) => void,
  onDelete: (id: string) => void,
  logs: GroupingAuditLog[],
  onRemoveNomination?: (groupId: string, nominationId: string, currentIds: string[]) => void
}) => {
  return (
    <div className="space-y-6 animate-fade-in" id="admin-subtab-groups">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Users size={18} className="text-amber-400" />
            <span>Nominee Groups</span>
          </h3>
          <p className="text-xs text-white/60 mt-1 leading-relaxed">
            Manage groups of duplicate nominations. Grouped nominations display as a single nominee during public voting.
          </p>
        </div>
      </div>
      
      {groups.length === 0 ? (
        <div className="text-center py-12 bg-black/20 border border-white/5 rounded-xl space-y-3">
          <Users className="mx-auto text-white/20" size={32} />
          <p className="text-xs text-white/40 font-medium">No nominee groups created yet.</p>
          <p className="text-[10px] text-white/30 max-w-xs mx-auto">
            You can create groups from the Nominations tab when you find duplicate entries.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {groups.map(group => {
             const catName = categories.find((c) => c.id === group.categoryId)?.name || "Unknown";
             return (
              <div key={group.id} className="bg-black/40 border border-white/5 rounded-xl p-5 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[9px] font-mono text-white/40 block">GROUP: {catName}</span>
                    <h4 className="text-base font-extrabold text-white mt-0.5">{group.name}</h4>
                    <p className="text-[10px] text-white/60 mt-1">{group.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onApprove(group.id, !group.approved)}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        group.approved
                          ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/20"
                          : "bg-amber-400/10 border-amber-400/20 text-amber-400 hover:bg-amber-400/20"
                      }`}
                      title={group.approved ? "Disapprove Group" : "Approve Group"}
                    >
                      {group.approved ? <CheckCircle size={15} /> : <XCircle size={15} />}
                    </button>
                    <button
                      onClick={() => onDelete(group.id)}
                      className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 cursor-pointer transition-colors"
                      title="Delete Group"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-3">
                  <h5 className="text-[10px] font-bold text-white/70 mb-2 font-mono">LINKED NOMINATIONS ({group.nominationIds.length})</h5>
                  <div className="space-y-1">
                    {group.nominationIds.map(nid => {
                       const nom = nominations.find(n => n.id === nid);
                       return (
                         <div key={nid} className="text-[11px] text-white/50 flex justify-between items-center bg-black/20 px-2 py-1.5 rounded">
                           <span>{nom?.nomineeName || 'Unknown'} (Nominated by: {nom?.nominatorName || 'Unknown'})</span>
                           <span className="text-[9px] font-mono">{nom?.approved ? 'Approved' : 'Pending'}</span>
                           {onRemoveNomination && (
                             <button 
                               onClick={() => onRemoveNomination(group.id, nid, group.nominationIds)}
                               className="ml-2 text-red-400 hover:text-red-300 p-1"
                               title="Remove from group"
                             >
                               <XCircle size={12} />
                             </button>
                           )}
                         </div>
                       );
                    })}
                  </div>
                </div>
                
                <div className="flex gap-2 text-[10px] items-center">
                  <span className={`px-2 py-0.5 rounded font-bold ${group.approved ? 'bg-emerald-400/20 text-emerald-400' : 'bg-amber-400/20 text-amber-400'}`}>
                    {group.approved ? 'GROUP APPROVED FOR VOTING' : 'GROUP PENDING'}
                  </span>
                </div>
              </div>
             );
          })}
        </div>
      )}
      
      {logs.length > 0 && (
        <div className="mt-8">
           <h3 className="text-sm font-bold text-white/80 mb-3 font-mono">Audit Trail</h3>
           <div className="bg-black/40 border border-white/5 rounded-xl p-4 max-h-[200px] overflow-y-auto space-y-2">
             {logs.map(log => (
                <div key={log.id} className="text-[10px] flex gap-3 text-white/50 font-mono">
                  <span className="text-amber-400/70">{new Date(log.timestamp).toLocaleString()}</span>
                  <span className="text-white/80">{log.adminEmail}</span>
                  <span>{log.action}</span>
                  <span className="text-white/40">Group: {log.groupId.slice(0,6)}...</span>
                  {log.nominationId && <span className="text-white/40">Nomination: {log.nominationId.slice(0,6)}...</span>}
                </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};
