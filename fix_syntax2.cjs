const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  'List  Search, Filter, ArrowUpDown, ChevronDown',
  'List, Search, Filter, ArrowUpDown, ChevronDown'
);

code = code.replace(
  '              </div>\n\n          {/* TAB 4: GUESTBOOK MODERATION */}',
  '              </div>\n            </div>\n          )}\n\n          {/* TAB 4: GUESTBOOK MODERATION */}'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
