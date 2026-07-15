import re

path = "c:/Users/DreamDay Technology/Downloads/AWOL AMERICA AWARDS/AWO-US-Nomination-/src/components/AdminDashboard.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update activeSettingsTab state type
content = content.replace(
    'const [activeSettingsTab, setActiveSettingsTab] = useState<"profile" | "administrators" | "security" | "danger">("profile");',
    'const [activeSettingsTab, setActiveSettingsTab] = useState<"profile" | "administrators" | "security" | "danger" | "content">("profile");'
)

# 2. Remove the top-level 'General Content' button
pattern = r'<button\s+onClick=\{\(\) => setActiveSubTab\("content"\)\}.*?id="admin-subtab-content-btn".*?</button>'
content = re.sub(pattern, '', content, flags=re.DOTALL)

# 3. Add the 'General Content' button to the settings sub-tabs
settings_btn = """                <button
                  onClick={() => setActiveSettingsTab("content")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSettingsTab === "content" ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white"}`}
                >
                  General Content
                </button>
              </div>"""

content = content.replace(
    '              </div>\n\n              {/* TAB: PROFILE */}',
    settings_btn + '\n\n              {/* TAB: PROFILE */}'
)

# 4. Change activeSubTab === "content" to activeSettingsTab === "content" around the editor panel
editor_pattern = r'\{/\* TAB: GENERAL CONTENT EDITOR \*/\}\s*\{activeSubTab === "content" && \('
editor_replacement = '{/* TAB: GENERAL CONTENT EDITOR */}\n          {activeSettingsTab === "content" && ('
content = re.sub(editor_pattern, editor_replacement, content)

# 5. The editor panel is currently completely outside of the settings tab. It needs to be moved inside the settings area!
# Wait, let's just move it into the settings area. The settings area ends with:
#               )}
#             </div>
#           )}
# 
#           {/* TAB: GENERAL CONTENT EDITOR */}
# Let's find this exact string.

move_pattern = r'(\s*)\{/\* TAB: GENERAL CONTENT EDITOR \*/\}[\s\S]*?(?=</div>\s*</div>\s*\{/\* Custom Confirmation Modal \*/\})'
match = re.search(move_pattern, content)
if match:
    editor_block = match.group(0)
    # Remove from original location
    content = content.replace(editor_block, '')
    
    # Insert it before the end of the SETTINGS tab
    settings_end = '              )}\n            </div>\n          )}\n'
    if settings_end in content:
        content = content.replace(settings_end, editor_block + '\n' + settings_end)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done")
