import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const destination = fileURLToPath(new URL('../public/assets/', import.meta.url));
const source = process.argv[2];
if (!source)
  throw new Error('Provide the directory containing the generated source images.');
const files = {
  gathering: 'exec-c4d28130-bcdd-4994-9aa5-e4ae5635f809.png',
  chicken: 'exec-96f798a7-055d-441e-9b02-266eda4ffee2.png',
  salad: 'exec-e1c6dfcd-e513-4d51-9f1d-f50f6a2b511a.png',
  couscous: 'exec-8fdf3458-4ffc-4cfd-8e02-71b9f0be3b9c.png',
  hummus: 'exec-8ab29d66-6349-4ca8-93c2-e44d1f4bf7ec.png',
  cake: 'exec-34bada1c-2874-421c-a51a-506942d597ac.png',
  lemonade: 'exec-8a2055b8-e6e3-4d5c-af5f-4bcf81eaa144.png',
};
for (const [name, file] of Object.entries(files)) {
  await sharp(path.join(source, file))
    .resize({ width: name === 'gathering' ? 1440 : 900, withoutEnlargement: true })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(path.join(destination, name + '.jpg'));
  console.log(`Prepared ${name}.jpg`);
}
