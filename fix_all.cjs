const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// I will remove the IIFE because it's messing up the JSX parser if not done perfectly.
// Instead, I'll extract the displayedNominees variable to the top of the component render!
