import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const files=readdirSync('tests').filter(name=>name.endsWith('.test.mjs')).map(name=>'tests/'+name);
process.exit(spawnSync(process.execPath,['--test','--test-reporter=dot',...files],{stdio:'inherit'}).status??1);
