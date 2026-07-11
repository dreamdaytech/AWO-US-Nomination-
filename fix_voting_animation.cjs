const fs = require('fs');

let content = fs.readFileSync('src/components/VotingSection.tsx', 'utf8');

if (!content.includes('const [justVotedId')) {
  content = content.replace(
    'const [selectedNominee, setSelectedNominee] = useState<Nominee | null>(null);',
    'const [selectedNominee, setSelectedNominee] = useState<Nominee | null>(null);\n  const [justVotedId, setJustVotedId] = useState<string | null>(null);'
  );
}

content = content.replace(
  'isSelected\n                              ? "bg-amber-400/5 border-amber-400/40 shadow-md"\n                              : isVotingClosed',
  'justVotedId === nom.id\n                              ? "bg-amber-400/10 border-amber-400 scale-[1.02] shadow-[0_0_30px_rgba(251,191,36,0.3)] z-10"\n                              : isSelected\n                              ? "bg-amber-400/5 border-amber-400/40 shadow-md"\n                              : isVotingClosed'
);

const checkmarkOld = 'isSelected\n                                  ? "border-amber-400 bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.5)] scale-110"\n                                  : isVotingClosed';
const checkmarkNew = 'isSelected\n                                  ? justVotedId === nom.id\n                                    ? "border-amber-400 bg-amber-400 text-black shadow-[0_0_25px_rgba(251,191,36,0.8)] scale-[1.3] animate-pulse"\n                                    : "border-amber-400 bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.5)] scale-110"\n                                  : isVotingClosed';

content = content.replace(checkmarkOld, checkmarkNew);

const onClickOld = `                                if (isVotingClosed) return;
                                onCastVote(category.id, nom.id);
                              }}`;
const onClickNew = `                                if (isVotingClosed) return;
                                onCastVote(category.id, nom.id);
                                setJustVotedId(nom.id);
                                setTimeout(() => setJustVotedId(null), 600);
                              }}`;

content = content.replace(onClickOld, onClickNew);

fs.writeFileSync('src/components/VotingSection.tsx', content);
