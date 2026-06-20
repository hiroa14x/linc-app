import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = path.join(root, 'lib/screening-data.ts');
const contextPath = path.join(root, 'lib/screening-context.tsx');
const snackPath = path.join(root, 'snack/App.tsx');

const stripExports = (source) => source.replace(/^export /gm, '');

const dataSource = stripExports(await readFile(dataPath, 'utf8')).trim();
const contextSource = await readFile(contextPath, 'utf8');
const snackSource = await readFile(snackPath, 'utf8');

const constantsStart = contextSource.indexOf('const FACTOR_ORDER');
const constantsEnd = contextSource.indexOf('interface ScreeningState');
const functionsStart = contextSource.indexOf('function isDifficultyKey');

if (constantsStart < 0 || constantsEnd < 0 || functionsStart < 0) {
  throw new Error('screening-context.tsxの同期対象を見つけられませんでした。');
}

const constantsSource = stripExports(
  contextSource.slice(constantsStart, constantsEnd),
).trim();
const functionsSource = stripExports(contextSource.slice(functionsStart)).trim();

const generated = `// GENERATED_SCREENING_START\n${dataSource}\n\n` +
  `type SpecialistType = 'ST' | 'OT' | 'both' | null;\n` +
  `type RouteName = 'onboarding' | 'grade' | 'step01' | 'step02' | 'step03' | 'result' | 'map' | 'contact';\n\n` +
  `${constantsSource}\n\n${functionsSource}\n// GENERATED_SCREENING_END\n\n`;

const generatedStart = snackSource.indexOf('// GENERATED_SCREENING_START');
const generatedEnd = snackSource.indexOf('// GENERATED_SCREENING_END');
const legacyStart = snackSource.indexOf('type DifficultyType =');
const prefecturesStart = snackSource.indexOf('const PREFECTURES = [');

let nextSource;
if (generatedStart >= 0 && generatedEnd >= 0) {
  const afterGenerated = generatedEnd + '// GENERATED_SCREENING_END'.length;
  nextSource = snackSource.slice(0, generatedStart) + generated + snackSource.slice(afterGenerated).trimStart();
} else if (legacyStart >= 0 && prefecturesStart >= 0) {
  nextSource = snackSource.slice(0, legacyStart) + generated + snackSource.slice(prefecturesStart);
} else {
  throw new Error('snack/App.tsxの同期対象を見つけられませんでした。');
}

const nextPrefecturesStart = nextSource.indexOf('const PREFECTURES = [');
const nextPrefecturesEnd = nextSource.indexOf('\n];', nextPrefecturesStart);
const appStart = nextSource.indexOf('export default function App()');

if (nextPrefecturesStart < 0 || nextPrefecturesEnd < 0 || appStart < 0) {
  throw new Error('snack/App.tsxのアプリ本体を見つけられませんでした。');
}

nextSource =
  nextSource.slice(0, nextPrefecturesEnd + '\n];'.length) +
  '\n\n' +
  nextSource.slice(appStart);

await writeFile(snackPath, nextSource);
