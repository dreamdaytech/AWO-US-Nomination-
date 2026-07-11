with open('src/components/VotingSection.tsx', 'r', encoding='utf8') as f:
    content = f.read()

import re

# find the last occurrence of `      )}`
content = re.sub(r'      \)\}\s*<\/>\s*\)\}\s*<\/>\s*\)\}\s*<\/div>\s*\);\s*\};\s*$', '      )}\n        </>\n      )}\n    </div>\n  );\n};\n', content)

with open('src/components/VotingSection.tsx', 'w', encoding='utf8') as f:
    f.write(content)
