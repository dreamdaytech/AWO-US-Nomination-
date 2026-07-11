const fs = require('fs');

const appPath = 'src/App.tsx';
let appCode = fs.readFileSync(appPath, 'utf8');
appCode = appCode.replace('onNavigateToResults={() => setActiveTab("results")}', 'onNavigateToResults={() => setActiveTab("results")}\n              onNavigateToNominate={() => setActiveTab("nominate")}');
fs.writeFileSync(appPath, appCode);

const sectionPath = 'src/components/VotingSection.tsx';
let sectionCode = fs.readFileSync(sectionPath, 'utf8');

sectionCode = sectionCode.replace('onNavigateToResults?: () => void;', 'onNavigateToResults?: () => void;\n  onNavigateToNominate?: () => void;');
sectionCode = sectionCode.replace('onNavigateToResults,\n  nomineeGroups,', 'onNavigateToResults,\n  onNavigateToNominate,\n  nomineeGroups,');

const oldText = `<p className="text-white/70 max-w-lg mx-auto leading-relaxed">
            The final list of nominees is currently being prepared. The official Voting Center will open on <strong className="text-amber-400">{formatDateTime(settings.votingStart)}</strong>. Please check back later to support your favorite nominees.
          </p>`;

const newText = `<div className="text-white/70 max-w-2xl mx-auto leading-relaxed space-y-4 text-sm">
            <p>Thank you for your interest in the AWOL AMERICA 10th Annual Achievement Awards.</p>
            <p>
              The final list of approved nominees is currently being prepared and reviewed by the AWOL AMERICA management team. The official <strong className="text-amber-400">Voting Center will open on {formatDateTime(settings.votingStart)}</strong>, when community members will be able to view the nominees and vote for their favorite candidates.
            </p>
            <p>
              If you would like to recognize an outstanding individual, organization, or initiative, you can still submit a nomination by visiting our Nomination Page:
            </p>
            <div className="pt-2 pb-4">
              <button
                onClick={onNavigateToNominate}
                className="bg-amber-400 hover:bg-amber-300 text-black px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-400/20"
              >
                Go to Nomination Page
              </button>
            </div>
            <p>
              Please check back on the voting opening date to participate in celebrating the achievements and contributions of our nominees.
            </p>
            <p className="font-medium text-white/90">
              Thank you for your continued support of AWOL AMERICA.
            </p>
          </div>`;

sectionCode = sectionCode.replace(oldText, newText);
fs.writeFileSync(sectionPath, sectionCode);
