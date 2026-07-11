import re

with open('src/components/VotingSection.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'className="w-16 h-16 rounded-full',
    'className="w-20 h-20 rounded-full'
)

with open('src/components/VotingSection.tsx', 'w') as f:
    f.write(content)
print("Updated modal image size!")
