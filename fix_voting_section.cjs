const fs = require('fs');

let content = fs.readFileSync('src/components/VotingSection.tsx', 'utf8');

if (!content.includes('isAdminLoggedIn?: boolean;')) {
    content = content.replace('onNavigateToResults?: () => void;', 'onNavigateToResults?: () => void;\n  isAdminLoggedIn?: boolean;');
}

if (!content.includes('isAdminLoggedIn,')) {
    content = content.replace('onNavigateToResults,\n  nomineeGroups,\n}) => {', 'onNavigateToResults,\n  nomineeGroups,\n  isAdminLoggedIn,\n}) => {');
}

const replacement = `  return (
    <div className="space-y-8 animate-fade-in" id="voting-system-container">
      {(!isAdminLoggedIn && isBeforeVoting) ? (
        <div className="w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 sm:p-12 shadow-2xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-amber-400/10 rounded-full flex items-center justify-center border border-amber-400/20 mb-4">
            <Lock className="text-amber-400" size={32} />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Voting Period Has Not Started</h2>
          <p className="text-white/70 max-w-lg mx-auto leading-relaxed">
            The final list of nominees is currently being prepared. The official Voting Center will open on <strong className="text-amber-400">{formatDateTime(settings.votingStart)}</strong>. Please check back later to support your favorite nominees.
          </p>
        </div>
      ) : (
        <>
          {isAdminLoggedIn && isBeforeVoting && (
            <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4 flex items-center justify-center gap-3 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
              <ShieldCheck size={18} />
              <p className="text-xs font-bold tracking-wide">
                <span className="uppercase mr-2 font-mono">Admin Testing Mode:</span>
                You are viewing the Voting Center before it is officially open to the public.
              </p>
            </div>
          )}

      {/* Search & Filter Header Container */}`;

content = content.replace(`  return (
    <div className="space-y-8 animate-fade-in" id="voting-system-container">
      {/* Search & Filter Header Container */}`, replacement);

content = content.replace(/      \{\/\* Categories list \*\/\}[\s\S]*?      <\/div>\n    <\/div>\n  \);\n\};\n/, function(match) {
    // Add closing tag for the react fragment
    return match.replace(/      <\/div>\n    <\/div>\n  \);\n\};\n$/, '      </div>\n        </>\n      )}\n    </div>\n  );\n};\n');
});

fs.writeFileSync('src/components/VotingSection.tsx', content);
