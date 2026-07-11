import re

with open('src/components/NominationForm.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'Friday, July 10, 2026',
    '{timelineSettings ? formatDateTime(timelineSettings.nominationStart) : "Friday, July 10, 2026"}'
)

content = content.replace(
    'Thursday, July 30, 2026 (11:59 PM)',
    '{timelineSettings ? formatDateTime(timelineSettings.nominationEnd) : "Thursday, July 30, 2026 (11:59 PM)"}'
)

with open('src/components/NominationForm.tsx', 'w') as f:
    f.write(content)
print("Updated NominationForm!")
