import { closeSync, copyFileSync, existsSync, openSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backendRoot = path.join(projectRoot, 'backend');
const backendEnv = path.join(backendRoot, '.env');
const databaseFile = path.join(backendRoot, 'prisma', 'dev.db');
const isNewDatabase = !existsSync(databaseFile);

if (!existsSync(backendEnv)) {
  copyFileSync(path.join(backendRoot, '.env.example'), backendEnv);
  console.log('Criado backend/.env com a configuração local de desenvolvimento.');
}

if (isNewDatabase) {
  closeSync(openSync(databaseFile, 'a'));
}

function runNpm(args) {
  const npmCli = process.env.npm_execpath;
  const command = npmCli ? process.execPath : (process.platform === 'win32' ? 'npm.cmd' : 'npm');
  const commandArgs = npmCli ? [npmCli, ...args] : args;
  const result = spawnSync(command, commandArgs, {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(result.error.message);
  }

  if (result.status !== 0) {
    throw new Error(`Falha ao executar: npm ${args.join(' ')}`);
  }
}

try {
  runNpm(['run', 'db:generate', '--workspace', 'nidus-backend']);
  runNpm(['exec', '--workspace', 'nidus-backend', '--', 'prisma', 'migrate', 'deploy']);

  if (isNewDatabase) {
    runNpm(['run', 'db:seed', '--workspace', 'nidus-backend']);
  }
} catch (error) {
  if (isNewDatabase && existsSync(databaseFile)) {
    unlinkSync(databaseFile);
  }
  console.error(error.message);
  process.exit(1);
}

console.log('Nidus configurado. Use `npm run dev` para iniciar frontend e backend.');
