import re

path = "c:/Users/DreamDay Technology/Downloads/AWOL AMERICA AWARDS/AWO-US-Nomination-/src/components/AdminDashboard.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Expand the activeSettingsTab type definition
type_def_old = 'const [activeSettingsTab, setActiveSettingsTab] = useState<"profile" | "administrators" | "security" | "danger">("profile");'
type_def_new = 'const [activeSettingsTab, setActiveSettingsTab] = useState<"profile" | "administrators" | "security" | "danger" | "content">("profile");'
content = content.replace(type_def_old, type_def_new)

# 2. Add the button to the Settings inner tabs (insert before the closing div of SETTINGS SUB-TABS)
settings_tab_btn = """                {loggedInAdmin.role === "SUPER_ADMIN" && (
                  <button
                    onClick={() => setActiveSettingsTab("danger")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSettingsTab === "danger" ? "bg-red-500/10 text-red-400" : "text-red-400/50 hover:bg-red-500/5 hover:text-red-400"}`}
                  >
                    Danger Zone
                  </button>
                )}
                <button
                  onClick={() => setActiveSettingsTab("content")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSettingsTab === "content" ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white"}`}
                >
                  General Content
                </button>
              </div>"""

content = re.sub(r'\{\s*loggedInAdmin\.role === "SUPER_ADMIN" && \(\s*<button\s*onClick=\{\(\) => setActiveSettingsTab\("danger"\)\}.*?Danger Zone\s*</button>\s*\)\s*\}\s*</div>', settings_tab_btn, content, flags=re.DOTALL)


# 3. Change the render condition of the panel from activeSubTab === "content" to activeSettingsTab === "content"
content = content.replace('{activeSubTab === "content" && (', '{activeSettingsTab === "content" && (')

# 4. Remove the original "General Content" main tab button
content = re.sub(r'<button\s*onClick=\{\(\) => setActiveSubTab\("content"\)\}.*?id="admin-subtab-content-btn".*?</button>', '', content, flags=re.DOTALL)

# 5. Move the whole TAB: GENERAL CONTENT EDITOR panel INSIDE the activeSubTab === "settings" area
# The settings area ends at:
#               {/* TAB: DANGER ZONE */}
#               {activeSettingsTab === "danger" && loggedInAdmin.role === "SUPER_ADMIN" && (
#                 ...
#                 </div>
#               )}
#             </div>
#           )}
# 
#           {/* TAB: GENERAL CONTENT EDITOR */}

# I will find the editor block and move it.
pattern_panel = r'(\s*\{/\* TAB: GENERAL CONTENT EDITOR \*/\}[\s\S]*?(?=\s*</div>\s*</div>\s*\{/\* Custom Confirmation Modal \*/\}))'
match = re.search(pattern_panel, content)

if match:
    panel_text = match.group(1)
    # Delete panel from current location
    content = content.replace(panel_text, '')
    
    # Re-insert panel immediately before the end of the settings wrapper
    # The settings wrapper ends with:
    #             </div>
    #           )}
    # 
    #         </div>
    #       </div>
    #       {/* Custom Confirmation Modal */}
    
    # We want it after the Danger Zone tab finishes, right before the closing `</div>)}` of settings
    # Search for the end of the settings section:
    #             </div>
    #           )}
    
    # Let's just find `</div>\n          )}` which closes `activeSubTab === "settings" && (`
    # Actually, a safer anchor is:
    #               )}
    #             </div>
    #           )}
    
    content = re.sub(r'(\s*)\}\)\s*</div>\s*\)\}\s*</div>\s*\)\}', r'\1})\n              </div>\n            )}\n' + panel_text + r'\n            </div>\n          )}', content)
    # Wait, the exact string for the end of settings might be tricky to regex reliably without false positives.
    # Let's do it simply by using string replacement on a very unique snippet from the end of the Danger Zone block.
    
    danger_zone_end = '                </div>\n              )}\n            </div>\n          )}'
    if danger_zone_end in content:
         content = content.replace(danger_zone_end, '                </div>\n              )}\n' + panel_text + '\n            </div>\n          )}')

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done moving")
