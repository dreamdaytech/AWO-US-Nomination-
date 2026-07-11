with open('src/components/VotingSection.tsx', 'r') as f:
    lines = f.readlines()

with open('src/components/VotingSection.tsx', 'w') as f:
    for i, line in enumerate(lines):
        if i + 1 == 427 and line.strip() == ')}':
            continue
        f.write(line)
