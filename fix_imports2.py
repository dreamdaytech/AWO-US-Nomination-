with open('src/components/AdminDashboard.tsx', 'r', encoding='utf8') as f:
    content = f.read()

content = content.replace('import { Users\n  Search, Filter, ArrowUpDown, ChevronDown} from "lucide-react";', 'import { Users, Search, Filter, ArrowUpDown, ChevronDown } from "lucide-react";')

with open('src/components/AdminDashboard.tsx', 'w', encoding='utf8') as f:
    f.write(content)
