import fs from 'fs';
import path from 'path';

const root = path.resolve('src');

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'app' || entry.name === 'node_modules') continue;
      walk(full);
    } else if (/\.tsx?$/.test(entry.name)) {
      let content = fs.readFileSync(full, 'utf8');
      let next = content
        .replace(/from "react-router"/g, 'from "@/lib/router"')
        .replace(/from 'react-router'/g, "from '@/lib/router'");
      if (!next.startsWith("'use client'") && !next.startsWith('"use client"')) {
        if (/use(State|Effect|Callback|Memo|Context|Ref|Navigate|Location|SearchParams)/.test(next) || next.includes('useAuth') || next.includes('useCareerData')) {
          next = `'use client';\n\n${next}`;
        }
      }
      if (next !== content) fs.writeFileSync(full, next);
    }
  }
}

walk(root);
console.log('imports fixed');
