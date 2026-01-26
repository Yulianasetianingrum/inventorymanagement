
const fs = require('fs');
const path = require('path');

function checkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            checkDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('ensureAdmin()') && !content.includes('function ensureAdmin') && !content.includes('ensureAdmin =')) {
                console.log(`Missing ensureAdmin in: ${fullPath}`);
            }
        }
    }
}

checkDir('./app/api/admin');
