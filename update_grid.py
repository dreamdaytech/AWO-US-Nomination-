import re

with open('src/components/VotingSection.tsx', 'r') as f:
    content = f.read()

start_marker = '{/* Nominees in this specific group */}'
end_marker = '                  </div>\n                </div>\n              );\n            })}\n          </div>\n        )}\n      </div>'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + '''{/* Nominees in this specific group */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pl-2">
                    {nomineesList.map((nom) => {
                      const isSelected = catVote?.nomineeId === nom.id;
                      return (
                        <div
                          key={nom.id}
                          onClick={() => {
                            if (isVotingClosed) return;
                            onCastVote(category.id, nom.id);
                          }}
                          className={`group/card relative border rounded-xl p-5 flex flex-col justify-between items-center text-center gap-4 transition-all ${
                            isVotingClosed ? "cursor-default" : "cursor-pointer"
                          } ${
                            isSelected
                              ? "bg-amber-400/5 border-amber-400/40 shadow-md"
                              : isVotingClosed
                              ? "bg-white/5 border-white/5 opacity-60"
                              : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
                          }`}
                          id={`nominee-ballot-item-${nom.id}`}
                        >
                          {/* Hover Tooltip */}
                          <div className="absolute left-1/2 -top-2 -translate-x-1/2 -translate-y-full w-[280px] bg-[#111318] border border-white/20 p-4 rounded-xl text-xs text-white/80 opacity-0 group-hover/card:opacity-100 pointer-events-none transition-opacity duration-300 z-50 shadow-2xl hidden sm:block">
                            <div className="font-bold text-amber-400 mb-1">{nom.name}</div>
                            <div className="line-clamp-4">{nom.description}</div>
                            <div className="mt-2 text-[9px] text-white/40 uppercase tracking-wider font-bold">Quick Preview</div>
                          </div>

                          <div className="flex flex-col items-center gap-3 w-full">
                            <div className="relative shrink-0 mb-2">
                              {nom.avatarUrl ? (
                                <img src={nom.avatarUrl} alt={nom.name} className="w-24 h-24 rounded-full object-cover border-4 border-white/10 bg-black/40 group-hover/card:border-amber-400/50 transition-all duration-300" />
                              ) : (
                                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-3xl font-bold border-4 border-white/10 group-hover/card:border-amber-400/50 transition-all duration-300">
                                  {nom.name.charAt(0)}
                                </div>
                              )}
                              <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                                isSelected
                                  ? "border-amber-400 bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.5)] scale-110"
                                  : isVotingClosed
                                  ? "border-[#111318] bg-white/5 opacity-0"
                                  : "border-[#111318] bg-white/10 group-hover/card:bg-white/20 opacity-0 group-hover/card:opacity-100"
                              }`}>
                                {isSelected && <Check size={16} className="stroke-[4] text-black" />}
                              </div>
                            </div>

                            <div className="w-full">
                              <h4 
                                className={`font-sans font-extrabold text-sm hover:underline cursor-pointer ${isSelected ? "text-amber-400 font-bold" : "text-white hover:text-amber-300"}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedNominee(nom);
                                }}
                                title="Click to view details"
                              >
                                {nom.name}
                              </h4>
                              {nom.organization && (
                                <span className="text-[10px] text-amber-400/80 font-mono block mt-1 mb-2">{nom.organization}</span>
                              )}
                              <p className="font-sans text-[11px] text-white/50 leading-relaxed line-clamp-2 group-hover/card:line-clamp-3 transition-all mt-2">
                                {nom.description}
                              </p>
                            </div>
                          </div>

                          {/* Button/Action on item */}
                          <div className="w-full mt-auto pt-4">
                            <button
                              disabled={isVotingClosed}
                              className={`w-full text-[11px] font-bold py-2.5 px-3 rounded-lg border transition-all ${
                                isVotingClosed
                                  ? isSelected
                                    ? "bg-amber-400/10 border-amber-400/30 text-amber-300"
                                    : "bg-white/5 text-white/30 border-white/5 cursor-not-allowed"
                                  : isSelected
                                  ? "bg-gradient-to-tr from-amber-400 to-amber-600 text-black border-none font-bold cursor-pointer"
                                  : "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 cursor-pointer"
                              }`}
                            >
                              {isVotingClosed ? (isSelected ? "My Vote" : "Closed") : (isSelected ? "Cast Active" : "Vote Nominee")}
                            </button>
                          </div>
                        </div>
                      );
                    })}
''' + content[end_idx:]

    with open('src/components/VotingSection.tsx', 'w') as f:
        f.write(new_content)
    print("Replaced!")
else:
    print("Markers not found!")
