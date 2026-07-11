const fs = require('fs');
const lines = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8').split('\n');
lines[41] = 'import { Users, Search, Filter, ArrowUpDown, ChevronDown } from "lucide-react";';
lines[42] = '';
fs.writeFileSync('src/components/AdminDashboard.tsx', lines.join('\n'));
