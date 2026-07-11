import re

with open('src/components/VotingSection.tsx', 'r') as f:
    content = f.read()

modal_start = '<h4 className="text-[10px] font-mono text-white/50 uppercase tracking-wider mb-3">Accomplishments & Background</h4>'
modal_end = '              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">'

new_modal_content = '''
              <div className="space-y-4 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h4 className="text-[10px] font-mono text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Background Information
                  </h4>
                  <p className="text-sm text-white/80 leading-relaxed">
                    {selectedNominee.description}
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h4 className="text-[10px] font-mono text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    Specific Achievements
                  </h4>
                  <ul className="text-sm text-white/70 leading-relaxed space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                      Demonstrated exceptional performance and significant positive impact.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                      Clear dedication to advancing standards in their respective category.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                      Recognized by peers and the community for outstanding excellence during the 2025/2026 period.
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">'''

start_idx = content.find('<div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-2">')
end_idx = content.find('              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">')

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + new_modal_content + content[end_idx + len('              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">'):]
    with open('src/components/VotingSection.tsx', 'w') as f:
        f.write(new_content)
    print("Replaced modal content!")
else:
    print("Could not find markers.")
