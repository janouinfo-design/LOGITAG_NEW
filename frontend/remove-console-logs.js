const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!fullPath.includes('node_modules') && !fullPath.includes('.git')) {
                getAllFiles(fullPath, arrayOfFiles);
            }
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Split the content into lines to process
    const lines = content.split('\n');
    const newLines = [];
    let inCatchBlock = false;
    let bracketCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Track catch blocks
        if (line.includes('catch')) {
            inCatchBlock = true;
            bracketCount = 0;
        }

        // Count brackets to determine catch block scope
        if (inCatchBlock) {
            bracketCount += (line.match(/{/g) || []).length;
            bracketCount -= (line.match(/}/g) || []).length;
            if (bracketCount <= 0) {
                inCatchBlock = false;
            }
        }

            modified = true;
            continue;
        }

        newLines.push(line);
    }

    if (modified) {
        fs.writeFileSync(filePath, newLines.join('\n'));
    }
}

const startPath = process.cwd();
const files = getAllFiles(startPath);

files.forEach(file => {
    try {
        processFile(file);
    } catch (error) {
        console.error(`Error processing ${file}:`, error);
    }
});
