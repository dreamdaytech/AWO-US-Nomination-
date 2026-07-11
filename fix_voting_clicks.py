import re

with open('src/components/VotingSection.tsx', 'r') as f:
    content = f.read()

# Change card onClick
content = content.replace(
    '''                          onClick={() => {
                            if (isVotingClosed) return;
                            onCastVote(category.id, nom.id);
                          }}''',
    '''                          onClick={() => {
                            setSelectedNominee(nom);
                          }}'''
)

# Add onClick to button
content = content.replace(
    '''                            <button
                              disabled={isVotingClosed}
                              className={`w-full text-[11px] font-bold py-2.5 px-3 rounded-lg border transition-all ${''',
    '''                            <button
                              disabled={isVotingClosed}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isVotingClosed) return;
                                onCastVote(category.id, nom.id);
                              }}
                              className={`w-full text-[11px] font-bold py-2.5 px-3 rounded-lg border transition-all ${'''
)

with open('src/components/VotingSection.tsx', 'w') as f:
    f.write(content)
print("Updated VotingSection clicks!")
