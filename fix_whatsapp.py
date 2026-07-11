import re

with open('src/components/NominationForm.tsx', 'r') as f:
    content = f.read()

# Replace import
content = content.replace('import { Check, AlertCircle, Sparkles, Send, HelpCircle, Share2, Twitter, Facebook, Linkedin, Copy, Lock, Vote, Clock } from "lucide-react";', 
                          'import { Check, AlertCircle, Sparkles, Send, HelpCircle, Share2, Twitter, Facebook, Linkedin, Copy, Lock, Vote, Clock, MessageCircle } from "lucide-react";')

target1 = '''                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const url = window.location.href;
                      const text = "Nominate your community heroes for the 10th Annual AWOL America Achievement Awards!";
                      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
                    }}
                    className="flex items-center justify-center gap-2 bg-[#1da1f2]/10 hover:bg-[#1da1f2]/20 border border-[#1da1f2]/20 text-[#1da1f2] font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    <Twitter size={14} />
                    <span>Share on X</span>
                  </button>
                  <button
                    onClick={() => {
                      const url = window.location.href;
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
                    }}
                    className="flex items-center justify-center gap-2 bg-[#1877f2]/10 hover:bg-[#1877f2]/20 border border-[#1877f2]/20 text-[#1877f2] font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    <Facebook size={14} />
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => {
                      const url = window.location.href;
                      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
                    }}
                    className="flex items-center justify-center gap-2 bg-[#0077b5]/10 hover:bg-[#0077b5]/20 border border-[#0077b5]/20 text-[#0077b5] font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    <Linkedin size={14} />
                    <span>LinkedIn</span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link copied to clipboard!");
                    }}
                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    <Copy size={14} />
                    <span>Copy Link</span>
                  </button>
                </div>'''

replacement1 = '''                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => {
                      const url = window.location.href;
                      const text = "Nominate your community heroes for the 10th Annual AWOL America Achievement Awards!";
                      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
                    }}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-[#1da1f2]/10 hover:bg-[#1da1f2]/20 border border-[#1da1f2]/20 text-[#1da1f2] font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    <Twitter size={14} />
                    <span>Share on X</span>
                  </button>
                  <button
                    onClick={() => {
                      const url = window.location.href;
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
                    }}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-[#1877f2]/10 hover:bg-[#1877f2]/20 border border-[#1877f2]/20 text-[#1877f2] font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    <Facebook size={14} />
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => {
                      const url = window.location.href;
                      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
                    }}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-[#0077b5]/10 hover:bg-[#0077b5]/20 border border-[#0077b5]/20 text-[#0077b5] font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    <Linkedin size={14} />
                    <span>LinkedIn</span>
                  </button>
                  <button
                    onClick={() => {
                      const url = window.location.href;
                      const text = "Nominate your community heroes for the 10th Annual AWOL America Achievement Awards!";
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`, "_blank");
                    }}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link copied to clipboard!");
                    }}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    <Copy size={14} />
                    <span>Copy Link</span>
                  </button>
                </div>'''

target2 = '''              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const url = window.location.href;
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#0077b5]/10 hover:bg-[#0077b5]/20 border border-[#0077b5]/20 text-[#0077b5] font-bold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  title="Share on LinkedIn"
                >
                  <Linkedin size={14} />
                  <span>LinkedIn</span>
                </button>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  title="Copy Page Link"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                </button>
              </div>'''

replacement2 = '''              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={() => {
                    const url = window.location.href;
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
                  }}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-[#0077b5]/10 hover:bg-[#0077b5]/20 border border-[#0077b5]/20 text-[#0077b5] font-bold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  title="Share on LinkedIn"
                >
                  <Linkedin size={14} />
                  <span>LinkedIn</span>
                </button>

                <button
                  onClick={() => {
                    const url = window.location.href;
                    const text = "Nominate your heroes for the 10th Annual AWOL America Achievement Awards! Submit your entries here:";
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`, "_blank");
                  }}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] font-bold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  title="Share on WhatsApp"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp</span>
                </button>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                  title="Copy Page Link"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                </button>
              </div>'''

if target1 in content:
    content = content.replace(target1, replacement1)
else:
    print("Could not find target1!")

if target2 in content:
    content = content.replace(target2, replacement2)
else:
    print("Could not find target2!")

with open('src/components/NominationForm.tsx', 'w') as f:
    f.write(content)
print("Updated successfully!")
