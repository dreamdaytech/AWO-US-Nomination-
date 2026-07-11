import re

with open('src/components/VotingSection.tsx', 'r') as f:
    content = f.read()

start_marker = "  return ("
end_marker = "      {/* Nominee Details Modal */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + '''  return (
    <div className="space-y-8 animate-fade-in" id="voting-system-container">
      {/* Search & Filter Header Container */}
      <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl z-10 relative">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          {/* Main Search Input */}
          <div className="relative w-full lg:w-96 shrink-0 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-amber-400 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search by nominee, organization, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-all font-sans"
              id="nominee-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/40 hover:text-white text-[10px] uppercase font-bold tracking-wider cursor-pointer border-none bg-transparent"
              >
                Clear
              </button>
            )}
          </div>

          {/* Dropdowns Container */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Category Filter */}
            <div className="flex flex-col gap-1 w-full sm:w-56">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer w-full font-sans"
                id="voting-category-filter-select"
              >
                <option value="all" className="bg-[#18181b] text-white">All Categories</option>
                <option disabled className="bg-[#18181b] text-white/30">── Select Category ──</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id.toString()} className="bg-[#18181b] text-white">
                    Cat {cat.id}: {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-1 w-full sm:w-44">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer w-full font-sans"
                id="voting-status-filter-select"
              >
                <option value="all" className="bg-[#18181b]">All Nominees</option>
                <option value="voted" className="bg-[#18181b]">My Voted Nominees</option>
                <option value="pending" className="bg-[#18181b]">Pending My Vote</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl min-h-[500px]" id="voting-nominees-ballot">
        {filteredNominees.length === 0 ? (
          <div className="text-center py-24 bg-black/10 rounded-2xl border border-dashed border-white/10 text-white/40 text-xs space-y-3">
            <AlertTriangle className="mx-auto text-amber-400" size={32} />
            <p className="font-bold text-white text-sm">No Contenders Match Filters</p>
            <p className="max-w-xs mx-auto text-white/60">
              Try clearing your search query, or resetting the vote status filter.
            </p>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {categoriesWithFilteredNominees.map(({ category, nomineesList }) => {
              const catVote = getVoteForCategory(category.id);
              const allCatNominees = nominees.filter(n => n.categoryId === category.id);
              const nomineesWithVotes = allCatNominees.filter(n => n.votes > 0).length;
              const totalCatNominees = allCatNominees.length;
              const progressPercent = totalCatNominees > 0 ? (nomineesWithVotes / totalCatNominees) * 100 : 0;
              
              return (
                <div key={category.id} className="space-y-4">
                  {/* Sub-header for the category group */}
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-amber-400/10 text-amber-400 rounded-md">
                        <CategoryIcon name={category.iconName} size={13} />
                      </div>
                      <div className="flex-grow">
                        <span className="text-[9px] font-mono text-amber-400 font-bold block uppercase leading-none">
                          Cat {category.id.toString().padStart(2, "0")}
                        </span>
                        <span className="text-xs font-extrabold text-white leading-none">
                          {category.name}
                        </span>
                      </div>
                      {catVote && (
                        <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/15">
                          Vote Registered
                        </span>
                      )}
                    </div>
                    <div className="px-1">
                      <div className="flex justify-between items-center text-[9px] text-white/40 font-mono mb-1.5 uppercase tracking-wider">
                        <span>Unique Nominees Voted</span>
                        <span>{nomineesWithVotes} / {totalCatNominees}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-0.5 overflow-hidden">
                        <div className="bg-amber-400/50 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Nominees in this specific group */}
                  <div className="space-y-3.5 pl-2">
                    {nomineesList.map((nom) => {
                      const isSelected = catVote?.nomineeId === nom.id;
                      return (
                        <div
                          key={nom.id}
                          onClick={() => {
                            if (isVotingClosed) return;
                            onCastVote(category.id, nom.id);
                          }}
                          className={`group/card relative border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
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

                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 w-4.5 h-4.5 rounded-full border shrink-0 flex items-center justify-center transition-all ${
                              isSelected
                                ? "border-amber-400 bg-amber-400 text-black"
                                : isVotingClosed
                                ? "border-white/10 bg-white/5"
                                : "border-white/20 bg-white/5 group-hover:border-amber-400"
                            }`}>
                              {isSelected && <Check size={10} className="stroke-[4] text-black" />}
                            </div>

                            <div className="shrink-0 mt-0.5">
                              {nom.avatarUrl ? (
                                <img src={nom.avatarUrl} alt={nom.name} className="w-8 h-8 rounded-full object-cover border border-white/10 bg-black/40" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-xs font-bold border border-white/10">
                                  {nom.name.charAt(0)}
                                </div>
                              )}
                            </div>

                            <div>
                              <h4 
                                className={`font-sans font-extrabold text-xs hover:underline cursor-pointer ${isSelected ? "text-amber-400 font-bold" : "text-white hover:text-amber-300"}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedNominee(nom);
                                }}
                                title="Click to view details"
                              >
                                {nom.name}
                              </h4>
                              {nom.organization && (
                                <span className="text-[9px] text-amber-400/80 font-mono block mt-0.5 mb-1">{nom.organization}</span>
                              )}
                              <p className="font-sans text-[11px] text-white/50 leading-relaxed line-clamp-1 group-hover/card:line-clamp-2 transition-all">
                                {nom.description}
                              </p>
                            </div>
                          </div>

                          {/* Button/Action on item */}
                          <button
                            disabled={isVotingClosed}
                            className={`w-full sm:w-auto text-[10px] font-bold py-1.5 px-3 rounded-lg border transition-all ${
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
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

''' + content[end_idx:]
    
    with open('src/components/VotingSection.tsx', 'w') as f:
        f.write(new_content)
    print("Replaced!")
else:
    print("Markers not found!")
