import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'import { Category, Nominee, Nomination, Message, SystemPhase, TimelineSettings } from "../types";',
    'import { Category, Nominee, Nomination, Message, SystemPhase, TimelineSettings } from "../types";\nimport { formatDateTime } from "../utils";'
)

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)
print("Updated AdminDashboard Import!")
