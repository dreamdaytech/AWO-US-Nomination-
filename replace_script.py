import re

with open('src/components/VotingSection.tsx', 'r') as f:
    content = f.read()

start_marker = '      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">'
end_marker = '              {/* ALL CATEGORIES COMBINED / GROUPED VIEW */}'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + '''      <div className="w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl min-h-[500px]" id="voting-nominees-ballot">
        {filteredNominees.length === 0 ? (
          <div className="text-center py-24 bg-black/10 rounded-2xl border border-dashed border-white/10 text-white/40 text-xs space-y-3">
            <AlertTriangle className="mx-auto text-amber-400" size={32} />
            <p className="font-bold text-white text-sm">No Contenders Match Filters</p>
            <p className="max-w-xs mx-auto text-white/60">
              Try clearing your search query, selecting "All Categories Combined", or resetting the vote status filter.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-8 animate-fade-in">
''' + content[end_idx + len(end_marker):]
    
    # We also need to remove the `categoryFilter === "all" && (` which is just after the end marker
    new_content = new_content.replace('              {categoryFilter === "all" && (', '')
    
    # Also need to remove the matching `)}` at the end for the `categoryFilter === "all" && (` condition. Let's find it.
    
    with open('src/components/VotingSection.tsx', 'w') as f:
        f.write(new_content)
    print("Replaced!")
else:
    print("Markers not found!")
