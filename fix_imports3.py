import re
with open('src/components/AdminDashboard.tsx', 'r', encoding='utf8') as f:
    content = f.read()

content = re.sub(r'import \{ Users\s+Search, Filter, ArrowUpDown, ChevronDown\} from "lucide-react";', 
                 'import { Users, Search, Filter, ArrowUpDown, ChevronDown } from "lucide-react";', content)

with open('src/components/AdminDashboard.tsx', 'w', encoding='utf8') as f:
    f.write(content)
