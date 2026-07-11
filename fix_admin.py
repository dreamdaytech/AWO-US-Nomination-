import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<span className="text-[10px] text-white/50 block mt-0.5">July 9, 2026</span>',
    '<span className="text-[10px] text-white/50 block mt-0.5">{timelineSettings ? formatDateTime(timelineSettings.announcementStart, "short") : "July 9, 2026"}</span>'
)

content = content.replace(
    '<span className="text-[10px] text-white/50 block mt-0.5">July 15, 2026</span>',
    '<span className="text-[10px] text-white/50 block mt-0.5">{timelineSettings ? formatDateTime(timelineSettings.nominationStart, "short") : "July 15, 2026"}</span>'
)

content = content.replace(
    '<span className="text-[10px] text-white/50 block mt-0.5">August 10, 2026</span>',
    '<span className="text-[10px] text-white/50 block mt-0.5">{timelineSettings ? formatDateTime(timelineSettings.votingStart, "short") : "August 10, 2026"}</span>'
)

content = content.replace(
    '<span className="text-[10px] text-white/50 block mt-0.5">August 28, 2026</span>',
    '<span className="text-[10px] text-white/50 block mt-0.5">{timelineSettings ? formatDateTime(timelineSettings.votingEnd, "short") : "August 28, 2026"}</span>'
)

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(content)
print("Updated AdminDashboard!")
