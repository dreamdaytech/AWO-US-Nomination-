import re
import sys

def patch():
    path = "c:/Users/DreamDay Technology/Downloads/AWOL AMERICA AWARDS/AWO-US-Nomination-/src/components/AdminDashboard.tsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Normalize newlines
    content = content.replace('\r\n', '\n')

    # 1. Imports
    if "GeneralContentSettings" not in content[:1500]:
        content = content.replace(
            'import { Category, Nominee, Nomination, Message, SystemPhase, TimelineSettings, NomineeGroup, GroupingAuditLog, AdminUser, SecuritySettings } from "../types";',
            'import { Category, Nominee, Nomination, Message, SystemPhase, TimelineSettings, NomineeGroup, GroupingAuditLog, AdminUser, SecuritySettings, GeneralContentSettings } from "../types";'
        )

    # 2. Props Interface
    if "generalContent: GeneralContentSettings" not in content[:3000]:
        content = content.replace(
            '  onFetchUnusedCodes: () => Promise<string[]>;\n}',
            '  onFetchUnusedCodes: () => Promise<string[]>;\n  generalContent: GeneralContentSettings;\n  onUpdateGeneralContent: (settings: GeneralContentSettings) => Promise<void>;\n}'
        )

    # 3. Component Args
    if "generalContent," not in content[:4000]:
        content = content.replace(
            '  onFetchUnusedCodes\n}) => {',
            '  onFetchUnusedCodes,\n  generalContent,\n  onUpdateGeneralContent\n}) => {'
        )

    # 4. State hooks
    if "const [activeSettingsTab" in content and '"content"' not in content.split('activeSettingsTab')[1][:100]:
        content = content.replace(
            'const [activeSettingsTab, setActiveSettingsTab] = useState<"profile" | "administrators" | "security" | "danger">("profile");',
            'const [activeSettingsTab, setActiveSettingsTab] = useState<"profile" | "administrators" | "security" | "danger" | "content">("profile");'
        )

    # 5. Form State
    state_anchor = "  // Ballot Filters\n"
    if "const [gcContactEmail" not in content:
        state_vars = """
  // General Content Form States
  const [gcContactEmail, setGcContactEmail] = React.useState(generalContent?.contactEmail || "");
  const [gcContactWebsite, setGcContactWebsite] = React.useState(generalContent?.contactWebsite || "");
  const [gcContactWebsiteUrl, setGcContactWebsiteUrl] = React.useState(generalContent?.contactWebsiteUrl || "");
  const [gcContactPhone, setGcContactPhone] = React.useState(generalContent?.contactPhone || "");
  const [gcContactFormsUrl, setGcContactFormsUrl] = React.useState(generalContent?.contactFormsUrl || "");
  const [gcChairmanName, setGcChairmanName] = React.useState(generalContent?.chairmanName || "");
  const [gcChairmanTitle, setGcChairmanTitle] = React.useState(generalContent?.chairmanTitle || "");
  const [gcAwardsTitle, setGcAwardsTitle] = React.useState(generalContent?.awardsTitle || "");
  const [gcInvitationTitle, setGcInvitationTitle] = React.useState(generalContent?.invitationTitle || "");
  const [gcLetterBody, setGcLetterBody] = React.useState(generalContent?.letterBody || "");
  const [gcSaveStatus, setGcSaveStatus] = React.useState<"" | "saving" | "saved" | "error">("");

  React.useEffect(() => {
    if(generalContent) {
      setGcContactEmail(generalContent.contactEmail);
      setGcContactWebsite(generalContent.contactWebsite);
      setGcContactWebsiteUrl(generalContent.contactWebsiteUrl);
      setGcContactPhone(generalContent.contactPhone);
      setGcContactFormsUrl(generalContent.contactFormsUrl);
      setGcChairmanName(generalContent.chairmanName);
      setGcChairmanTitle(generalContent.chairmanTitle);
      setGcAwardsTitle(generalContent.awardsTitle);
      setGcInvitationTitle(generalContent.invitationTitle);
      setGcLetterBody(generalContent.letterBody);
    }
  }, [generalContent]);

"""
        content = content.replace(state_anchor, state_vars + state_anchor)

    # 6. Insert Button into Settings Tabs
    # We find the end of the SETTINGS SUB-TABS div.
    settings_btn = """                <button
                  onClick={() => setActiveSettingsTab("content")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSettingsTab === "content" ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white"}`}
                >
                  General Content
                </button>
              </div>"""
    
    if "General Content\n                </button>" not in content:
        content = re.sub(
            r'\{\s*loggedInAdmin\.role === "SUPER_ADMIN" && \(\s*<button\s*onClick=\{\(\) => setActiveSettingsTab\("danger"\)\}.*?Danger Zone\s*</button>\s*\)\s*\}\s*</div>',
            lambda m: m.group(0).replace('</div>', settings_btn),
            content,
            flags=re.DOTALL
        )

    # 7. Insert the Editor Panel
    panel = """
              {/* TAB: GENERAL CONTENT EDITOR */}
              {activeSettingsTab === "content" && (
                <div className="space-y-8 animate-fade-in" id="admin-subtab-content">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <FileText size={18} className="text-amber-400" />
                      <span>General Content Editor</span>
                    </h3>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">
                      Update all key public-facing text on the platform. Changes are saved directly to the database and reflected immediately across all pages.
                    </p>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setGcSaveStatus("saving");
                      try {
                        await onUpdateGeneralContent({
                          contactEmail: gcContactEmail,
                          contactWebsite: gcContactWebsite,
                          contactWebsiteUrl: gcContactWebsiteUrl,
                          contactPhone: gcContactPhone,
                          contactFormsUrl: gcContactFormsUrl,
                          chairmanName: gcChairmanName,
                          chairmanTitle: gcChairmanTitle,
                          awardsTitle: gcAwardsTitle,
                          invitationTitle: gcInvitationTitle,
                          letterBody: gcLetterBody,
                        });
                        setGcSaveStatus("saved");
                        setTimeout(() => setGcSaveStatus(""), 3000);
                      } catch (err) {
                        setGcSaveStatus("error");
                        console.error("Failed to save general content:", err);
                      }
                    }}
                    className="space-y-8"
                  >
                    {/* ─── SECTION: Awards Identity ─── */}
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-6 space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase block mb-1">Awards Identity</span>
                        <p className="text-xs text-white/40">The main title and names used throughout the platform, header, and invitation.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-white/70 mb-1.5">Awards Title</label>
                          <input
                            type="text"
                            value={gcAwardsTitle}
                            onChange={(e) => setGcAwardsTitle(e.target.value)}
                            placeholder="AWOL AMERICA 10th Annual Achievement Awards"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-white/70 mb-1.5">Invitation Section Title</label>
                          <input
                            type="text"
                            value={gcInvitationTitle}
                            onChange={(e) => setGcInvitationTitle(e.target.value)}
                            placeholder="Official Invitation & Bulletin"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* ─── SECTION: Chairman / Signatory ─── */}
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-6 space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase block mb-1">Chairman / Signatory</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-white/70 mb-1.5">Full Name</label>
                          <input
                            type="text"
                            value={gcChairmanName}
                            onChange={(e) => setGcChairmanName(e.target.value)}
                            placeholder="Mohamed Majid Kamara"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-white/70 mb-1.5">Title / Role</label>
                          <input
                            type="text"
                            value={gcChairmanTitle}
                            onChange={(e) => setGcChairmanTitle(e.target.value)}
                            placeholder="Chairman, AWOL AMERICA"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* ─── SECTION: Contact Details ─── */}
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-6 space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase block mb-1">Contact Details</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-white/70 mb-1.5">Email Address</label>
                          <input
                            type="email"
                            value={gcContactEmail}
                            onChange={(e) => setGcContactEmail(e.target.value)}
                            placeholder="awolamerica@hotmail.com"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-white/70 mb-1.5">Phone / Telephone</label>
                          <input
                            type="text"
                            value={gcContactPhone}
                            onChange={(e) => setGcContactPhone(e.target.value)}
                            placeholder="301-379-7049"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-white/70 mb-1.5">Website Display Text</label>
                          <input
                            type="text"
                            value={gcContactWebsite}
                            onChange={(e) => setGcContactWebsite(e.target.value)}
                            placeholder="www.awolamerica.org"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-white/70 mb-1.5">Website Full URL</label>
                          <input
                            type="url"
                            value={gcContactWebsiteUrl}
                            onChange={(e) => setGcContactWebsiteUrl(e.target.value)}
                            placeholder="https://www.awolamerica.org"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-white/70 mb-1.5">External Nomination Forms URL</label>
                          <input
                            type="url"
                            value={gcContactFormsUrl}
                            onChange={(e) => setGcContactFormsUrl(e.target.value)}
                            placeholder="https://forms.app/awol-america-awards-nomination"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* ─── SECTION: Invitation Letter Body ─── */}
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-6 space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase block mb-1">Invitation Letter Body</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {[
                            { tag: "{ceremonyDate}", label: "Ceremony Date" },
                            { tag: "{nominationStartDate}", label: "Nomination Start" },
                            { tag: "{nominationEndDate}", label: "Nomination End" },
                            { tag: "{votingDateRange}", label: "Voting Date Range" },
                          ].map(({ tag, label }) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => setGcLetterBody(prev => prev + ' ' + tag)}
                              className="text-[10px] px-2 py-1 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-lg hover:bg-amber-400/20 transition-colors cursor-pointer font-mono"
                            >
                              + {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        value={gcLetterBody}
                        onChange={(e) => setGcLetterBody(e.target.value)}
                        rows={16}
                        placeholder="Write the full invitation letter here..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all resize-y font-sans leading-relaxed"
                      />
                    </div>

                    {/* ─── Save Button ─── */}
                    <div className="flex items-center justify-between pt-2">
                      {gcSaveStatus === "saved" && (
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-2">
                          <CheckCircle size={14} /> All changes saved successfully!
                        </span>
                      )}
                      {gcSaveStatus === "error" && (
                        <span className="text-xs text-red-400 font-bold flex items-center gap-2">
                          <XCircle size={14} /> Save failed. Please try again.
                        </span>
                      )}
                      {gcSaveStatus !== "saved" && gcSaveStatus !== "error" && <div />}
                      <button
                        type="submit"
                        disabled={gcSaveStatus === "saving"}
                        className="bg-amber-400 hover:bg-amber-500 disabled:bg-amber-400/50 text-black font-extrabold px-8 py-3 rounded-xl text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-400/10"
                      >
                        {gcSaveStatus === "saving" ? (
                          <><RefreshCw size={16} className="animate-spin" /> Saving...</>
                        ) : (
                          <><CheckCircle size={16} /> Save General Content</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
"""
    
    if "TAB: GENERAL CONTENT EDITOR" not in content:
        # Insert right after the SECURITY & ACCESS block or DANGER ZONE block
        # The safest way is to insert before the end of the settings block
        # The settings block ends with:
        #             </div>
        #           )}
        # 
        #         </div>
        #       </div>
        # 
        #       {/* Custom Confirmation Modal */}
        
        # Danger zone ends like this:
        #               )}
        #             </div>
        #           )}
        
        content = content.replace('              )}\n            </div>\n          )}\n\n        </div>', panel + '\n            </div>\n          )}\n\n        </div>')

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    patch()
