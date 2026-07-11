import re

with open('src/components/NominationForm.tsx', 'r') as f:
    content = f.read()

target = '''          {submitted ? (
            <div className="mb-6 p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm flex flex-col items-center justify-center text-center gap-4 animate-fade-in" id="nomination-success-msg">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <Check className="text-emerald-400" size={28} />
              </div>
              <div>
                <strong className="font-bold block text-white text-lg mb-1">Nomination Received Successfully!</strong>
                <p className="text-white/70 text-xs max-w-sm mx-auto leading-relaxed mt-2">
                  Your nomination has been saved. To let public users vote on it, it must be approved by the management.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setError("");
                }}
                className="mt-4 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/10 transition-colors cursor-pointer"
              >
                Submit Another Nomination
              </button>
            </div>
          ) : ('''

replacement = '''          {submitted ? (
            <div className="mb-6 p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 flex flex-col items-center justify-center text-center animate-fade-in" id="nomination-success-msg">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                <Check className="text-emerald-400" size={32} />
              </div>
              
              <div className="space-y-4 max-w-lg mx-auto mb-8">
                <strong className="font-extrabold block text-white text-2xl tracking-tight mb-2">Nomination Submitted Successfully!</strong>
                
                <p className="text-white/80 text-sm leading-relaxed">
                  Thank you for submitting your nomination.
                </p>
                <p className="text-white/80 text-sm leading-relaxed">
                  Your nomination has been received and saved successfully. Before it becomes available for public voting, it will be reviewed and approved by the AWOL AMERICA management team.
                </p>
                <p className="text-white/80 text-sm leading-relaxed">
                  Once approved, the nomination will be published and made available for public voting during the official voting period.
                </p>
                <p className="text-white/80 text-sm leading-relaxed">
                  Thank you for helping us recognize individuals and organizations making a positive impact in our communities.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 w-full max-w-lg mb-6">
                <h4 className="text-base font-bold text-white mb-2">Promote the Awards</h4>
                <p className="text-sm text-white/60 mb-5 leading-relaxed">
                  Spread the word and invite your network to nominate their community heroes for the 10th Annual AWOL America Achievement Awards!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setError("");
                }}
                className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/10 transition-colors cursor-pointer"
              >
                Submit Another Nomination
              </button>
            </div>
          ) : ('''

if target in content:
    content = content.replace(target, replacement)
    with open('src/components/NominationForm.tsx', 'w') as f:
        f.write(content)
    print("Updated successfully!")
else:
    print("Could not find target!")
