#!/usr/bin/env node
// Modo espelho: abre o app no navegador e puxa sozinho cada alteração enviada ao GitHub,
// para acompanhar as mudanças ao vivo (o Expo recarrega a tela sozinho).
//
// Uso:
//   npm run espelho                      segue a branch atual
//   npm run espelho -- desenvolvimento   passa a seguir outra branch do GitHub
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const INTERVALO_MS = 10_000;
const NO_WINDOWS = process.platform === 'win32';
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXPO_CLI = path.join(RAIZ, 'node_modules', 'expo', 'bin', 'cli');
const REINICIA_SE_MUDAR = ['package.json', 'package-lock.json', 'app.json'];

function git(...args) {
  const r = spawnSync('git', args, { cwd: RAIZ, encoding: 'utf8' });
  return { ok: r.status === 0, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}

let ultimoAviso = '';
function log(msg, { repetir = true } = {}) {
  if (!repetir && msg === ultimoAviso) return;
  ultimoAviso = msg;
  console.log(`\n[espelho ${new Date().toLocaleTimeString('pt-BR')}] ${msg}`);
}

function sair(msg) {
  console.error(`\n[espelho] ${msg}`);
  process.exit(1);
}

function npmInstall() {
  log('Instalando dependências (npm install)…');
  const r = spawnSync('npm', ['install'], { cwd: RAIZ, stdio: 'inherit', shell: NO_WINDOWS });
  if (r.status !== 0) sair('O npm install falhou. Veja a mensagem acima.');
}

// --- preparação -----------------------------------------------------------------------------

if (!git('rev-parse', '--is-inside-work-tree').ok) sair('Rode este comando dentro da pasta do projeto.');

const alvo = process.argv[2];
if (alvo) {
  git('fetch', '--quiet', '--prune', 'origin');
  if (!git('rev-parse', '--verify', '--quiet', `origin/${alvo}`).ok) sair(`Não achei a branch "${alvo}" no GitHub.`);
  if (git('rev-parse', '--abbrev-ref', 'HEAD').out !== alvo) {
    if (git('status', '--porcelain', '--untracked-files=no').out) {
      sair('Há arquivos alterados nesta pasta. Desfaça as alterações antes de trocar de branch.');
    }
    const r = git('checkout', '-B', alvo, '--track', `origin/${alvo}`);
    if (!r.ok) sair(r.err);
    log(`Agora seguindo a branch ${alvo}.`);
  }
}

if (!git('rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}').ok) {
  sair('Esta branch não está ligada a uma branch do GitHub. Rode: npm run espelho -- <nome-da-branch>');
}

// --- Expo -----------------------------------------------------------------------------------

let expo = null;
let reiniciando = false;

function iniciarExpo(abrirNavegador) {
  const args = [EXPO_CLI, 'start'];
  if (abrirNavegador) args.push('--web');
  expo = spawn(process.execPath, args, { cwd: RAIZ, stdio: 'inherit' });
  expo.on('exit', (code) => {
    if (!reiniciando) encerrar(code ?? 0);
  });
}

function pararExpo() {
  return new Promise((resolve) => {
    if (!expo || expo.exitCode !== null || expo.signalCode !== null) return resolve();
    expo.once('exit', () => resolve());
    if (NO_WINDOWS) spawnSync('taskkill', ['/pid', String(expo.pid), '/T', '/F']);
    else expo.kill('SIGINT');
  });
}

async function reiniciarComInstalacao() {
  reiniciando = true;
  await pararExpo();
  npmInstall();
  iniciarExpo(false);
  reiniciando = false;
  log('Expo reiniciado. Recarregue a página do navegador (F5) se ela não voltar sozinha.');
}

// --- sincronização com o GitHub -------------------------------------------------------------

let ocupado = false;

async function sincronizar() {
  if (ocupado) return false;
  ocupado = true;
  try {
    const f = git('fetch', '--quiet', '--prune', 'origin');
    if (!f.ok) {
      log(`Sem conexão com o GitHub agora (tento de novo em ${INTERVALO_MS / 1000} s).`, { repetir: false });
      return false;
    }
    if (!git('rev-parse', '--verify', '--quiet', '@{u}').ok) {
      log(
        'A branch que eu seguia não existe mais no GitHub (foi renomeada?). ' +
          'Feche com Ctrl+C e rode: npm run espelho -- <nome-novo-da-branch>',
        { repetir: false },
      );
      return false;
    }
    const antes = git('rev-parse', 'HEAD').out;
    const depois = git('rev-parse', '@{u}').out;
    if (antes === depois) return false;
    if (!git('merge-base', '--is-ancestor', 'HEAD', '@{u}').ok) {
      log('Esta pasta tem commits que não estão no GitHub, então não vou mexer nela.', { repetir: false });
      return false;
    }
    const m = git('merge', '--ff-only', '--quiet', '@{u}');
    if (!m.ok) {
      log(`Não consegui atualizar (há arquivos alterados nesta pasta?): ${m.err}`, { repetir: false });
      return false;
    }
    const novidades = git('log', '--reverse', '--format=  • %s', `${antes}..${depois}`).out;
    log(`Chegou alteração nova:\n${novidades}`);
    const mudou = git('diff', '--name-only', antes, depois).out.split('\n');
    return mudou.some((arquivo) => REINICIA_SE_MUDAR.includes(arquivo));
  } finally {
    ocupado = false;
  }
}

// --- execução -------------------------------------------------------------------------------

let timer = null;

async function encerrar(code = 0) {
  if (timer) clearInterval(timer);
  await pararExpo();
  process.exit(code);
}

process.on('SIGINT', () => encerrar(0));
process.on('SIGTERM', () => encerrar(0));

await sincronizar();
if (!existsSync(EXPO_CLI)) npmInstall();

log(
  `Modo espelho ligado na branch ${git('rev-parse', '--abbrev-ref', 'HEAD').out}. ` +
    `Confiro o GitHub a cada ${INTERVALO_MS / 1000} s. Ctrl+C para sair.`,
);
iniciarExpo(true);

timer = setInterval(async () => {
  if (reiniciando) return;
  const precisaReiniciar = await sincronizar();
  if (precisaReiniciar) {
    log('Dependências ou configuração mudaram.');
    await reiniciarComInstalacao();
  }
}, INTERVALO_MS);
