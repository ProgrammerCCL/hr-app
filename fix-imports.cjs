
const fs = require('fs');
const path = require('path');
const baseDir = 'src';

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Fix imports to use @/ alias (more robust regex)
            const modules = ['lib', 'context', 'components', 'types', 'i18n'];
            modules.forEach(mod => {
                const regex = new RegExp(`from '(\\.\\.\\/)+${mod}(['/])`, 'g');
                content = content.replace(regex, `from '@/${mod}$2`);
            });
            
            fs.writeFileSync(fullPath, content);
        }
    });
}
walk(baseDir);
