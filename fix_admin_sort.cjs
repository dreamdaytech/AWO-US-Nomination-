const fs = require('fs');

let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const oldLine = `                      const categoryNominees = filtered.filter((n) => n.categoryId === cat.id);`;
const newLine = `                      const categoryNominees = filtered.filter((n) => n.categoryId === cat.id).sort((a,b) => b.votes - a.votes);`;

content = content.replace(oldLine, newLine);
fs.writeFileSync('src/components/AdminDashboard.tsx', content);
