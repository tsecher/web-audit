import fs from 'fs';
// Setup config file.
if (fs.existsSync('web-audit.config.js.example')) {
    fs.copyFileSync('web-audit.config.js.example', 'web-audit.config.js');
}
else {
    console.log("non");
}
