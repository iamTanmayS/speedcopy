import fs from 'fs';
import path from 'path';

const typesDir = 'd:/codes/speedcopy/backend/core-service/src/types';
const files = fs.readdirSync(typesDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
    const filePath = path.join(typesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Replace `from './filename'` with `from './filename.js'`
    // Replace `from "./filename"` with `from "./filename.js"`
    content = content.replace(/from\s+['"](\.\/[^'"]+)['"]/g, "from '$1.js'");

    // Since we appended .js, let's fix if we accidentally appended it twice: .js.js
    content = content.replace(/\.js\.js/g, '.js');

    fs.writeFileSync(filePath, content);
});

console.log('Fixed imports in', files.length, 'files');
