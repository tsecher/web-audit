import path from 'path';
import fs from 'fs';
import { AppConfigFileName } from "##/app/conf/AppConfig";
// Setup config file.
const examplePath = path.join(path.dirname(import.meta.url), `..`, `..`, `${AppConfigFileName}.example`).replace('file:', '');
;
if (!fs.existsSync(AppConfigFileName) && fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, AppConfigFileName);
}
