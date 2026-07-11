import re

with open('src/components/ChairmanMessage.tsx', 'r') as f:
    content = f.read()

# Add imports
content = content.replace(
    'import { CONTACT_INFO } from "../data";',
    'import { CONTACT_INFO } from "../data";\nimport { TimelineSettings } from "../types";\nimport { formatDateTime } from "../utils";'
)

# Add props interface
content = content.replace(
    'export const ChairmanMessage: React.FC = () => {',
    'interface ChairmanMessageProps {\n  timelineSettings?: TimelineSettings;\n}\n\nexport const ChairmanMessage: React.FC<ChairmanMessageProps> = ({ timelineSettings }) => {'
)

# Update dates in text
content = content.replace(
    '<span>Date: July 3, 2026</span>',
    '<span>Date: {timelineSettings ? formatDateTime(timelineSettings.announcementStart, "short") : "July 3, 2026"}</span>'
)

content = content.replace(
    '<span className="text-white font-medium underline decoration-amber-500/30">Saturday, September 5, 2026</span>',
    '<span className="text-white font-medium underline decoration-amber-500/30">{timelineSettings ? formatDateTime(timelineSettings.ceremony) : "Saturday, September 5, 2026"}</span>'
)

content = content.replace(
    '<span className="text-white font-medium">Friday, July 10, 2026</span>',
    '<span className="text-white font-medium">{timelineSettings ? formatDateTime(timelineSettings.nominationStart) : "Friday, July 10, 2026"}</span>'
)

content = content.replace(
    '<span className="text-white font-medium">Thursday, July 30, 2026</span>',
    '<span className="text-white font-medium">{timelineSettings ? formatDateTime(timelineSettings.nominationEnd) : "Thursday, July 30, 2026"}</span>'
)

content = content.replace(
    '<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400 font-bold">Friday, July 31 to Tuesday, August 25, 2026</span>',
    '<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400 font-bold">{timelineSettings ? `${formatDateTime(timelineSettings.votingStart)} to ${formatDateTime(timelineSettings.votingEnd)}` : "Friday, July 31 to Tuesday, August 25, 2026"}</span>'
)

content = content.replace(
    'Join us on Saturday, September 5, 2026, as we celebrate',
    'Join us on {timelineSettings ? formatDateTime(timelineSettings.ceremony) : "Saturday, September 5, 2026"}, as we celebrate'
)

with open('src/components/ChairmanMessage.tsx', 'w') as f:
    f.write(content)
print("Updated ChairmanMessage!")
