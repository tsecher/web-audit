import path from 'path';
import fs from 'fs';

// @ts-ignore
import ejs from 'ejs';

export const generateFile = async (input: string, output: string, data: any) => {
  const tplPath = path.join(path.dirname(import.meta.url), `../../templates`, input).replace('file:', '');
  const tpl = fs.readFileSync(tplPath, 'utf-8');
  const val = await ejs.render(tpl, data);
  fs.writeFileSync(output, val);
};
