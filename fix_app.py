import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('<ChairmanMessage />', '<ChairmanMessage timelineSettings={timelineSettings} />')

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Updated App.tsx!")
