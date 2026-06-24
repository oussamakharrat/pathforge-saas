import fs from 'fs';
import path from 'path';

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.tsx')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('@/pages/')) {
        fs.writeFileSync(full, content.replaceAll('@/pages/', '@/views/'));
      }
    }
  }
}

walk(path.resolve('src/app'));
console.log('fixed');
