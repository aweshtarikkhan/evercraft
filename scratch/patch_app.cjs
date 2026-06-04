const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add the import
const targetImport = 'import { supabase } from "./utils/supabase";';
const newImport = 'import { supabase } from "./utils/supabase";\nimport { LoginModal } from "./components/modals/LoginModal";';

if (content.includes(targetImport)) {
  content = content.replace(targetImport, newImport);
  console.log('✅ Added LoginModal import to App.tsx');
} else {
  console.error('❌ Could not find supabase import in App.tsx');
}

// 2. Remove local LoginModal definition
const lines = content.split('\n');
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// ─── LOGIN MODAL')) {
    startIdx = i;
  }
  if (lines[i].includes('// ─── IMAGE CROPPER MODAL')) {
    endIdx = i;
    break;
  }
}

if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
  // Remove lines between startIdx and endIdx
  lines.splice(startIdx, endIdx - startIdx);
  content = lines.join('\n');
  console.log(`✅ Removed inline LoginModal definition from App.tsx (removed lines ${startIdx + 1} to ${endIdx})`);
} else {
  console.error('❌ Could not find start or end markers for local LoginModal in App.tsx');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ App.tsx updated successfully');
