import { writeFile } from 'node:fs/promises';
import { items } from '../dist/catalog.js';
import { nutritionFor } from '../dist/nutrition.js';

// Keep the feed small; ingredient and vitamin details remain loaded on demand.
const summary = Object.fromEntries([...items].map(([id, entry]) => [id, nutritionFor(entry, items).energy]));
await writeFile(new URL('../dist/nutrition-summary.js', import.meta.url),
  '// Generated from nutrition-data.js. Run node scripts/build-nutrition-summary.mjs after recipe edits.\n' +
  `export const energyRanges = ${JSON.stringify(summary)};\n`);
console.log(`Built calorie summaries for ${items.size} menu entries.`);
