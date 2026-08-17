// dsh-mpkg-wallpaper —— 宿主端（hybrid 模式：大文件流式上传 + Range 播放 + Steam 自动发现）
// 纯客户端逻辑仍在 ./client.js。本文件提供：
//   GET  /api/mpkg-wallpaper/ping                → { ok:true }（客户端探测 host 是否可用）
//   POST /api/mpkg-wallpaper/upload              → 流式接收 mpkg → 存磁盘 → 返回条目索引
//   GET  /api/mpkg-wallpaper/media?token=&index= → Range 流式返回 mpkg 内某个条目
//   GET  /api/mpkg-wallpaper/steam-inventory     → (Windows) 自动发现壁纸引擎安装与壁纸列表
import { createWriteStream, createReadStream, mkdirSync, existsSync, statSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const BASE = '/api/mpkg-wallpaper';
const HEAD_BYTES = 2 * 1024 * 1024; // 与客户端一致的容器头读取量
const WE_APPID = '431960';
const STEAM_PROBE_DIRS = [
  'C:\\Program Files (x86)\\Steam',
  'C:\\Program Files\\Steam',
  'D:\\Steam',
  'D:\\SteamLibrary',
  'E:\\SteamLibrary',
];

/** token → { path, size, dataStart, entries } */
const files = new Map();

/** 解析 mpkg 容器头（与 client.js 的 parseMpkg 相同逻辑，返回 dataStart + 条目表）。 */
function parseMpkgHead(buf) {
  let pos = 0;
  const versionLength = buf.readUInt32LE(pos); pos += 4;
  pos += versionLength; // 跳过 version 字符串
  const fileTotal = buf.readUInt32LE(pos); pos += 4;
  const entries = [];
  for (let i = 0; i < fileTotal; i++) {
    const nameLength = buf.readUInt32LE(pos); pos += 4;
    const name = buf.toString('utf8', pos, pos + nameLength); pos += nameLength;
    const index = buf.readUInt32LE(pos); pos += 4;
    const size = buf.readUInt32LE(pos); pos += 4;
    entries.push({ name, index, size });
  }
  return { dataStart: pos, entries };
}

function json(res, code, obj) {
  res.writeHead(code, { 'content-type': 'application/json' });
  res.end(JSON.stringify(obj));
}

/** Steam 注册表里的安装路径（Windows）。 */
function steamPathFromRegistry() {
  if (process.platform !== 'win32') return null;
  try {
    const reg = join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'reg.exe');
    const out = execFileSync(reg, ['query', 'HKCU\\Software\\Valve\\Steam', '/v', 'SteamPath'], {
      encoding: 'utf8', windowsHide: true, timeout: 5000, stdio: ['ignore', 'pipe', 'ignore'],
    });
    const m = /SteamPath\s+REG_SZ\s+(.+)/i.exec(out);
    return m ? m[1].trim().replace(/\\\\/g, '\\') : null;
  } catch { return null; }
}

/** ③ 自动发现：定位壁纸引擎安装目录（Steam libraryfolders.vdf + 常见路径探测）。 */
function locateWallpaperEngine() {
  const probes = [];
  const reg = steamPathFromRegistry();
  if (reg) probes.push(reg);
  probes.push(...STEAM_PROBE_DIRS);
  const libraries = [];
  for (const probe of probes) {
    const vdf = join(probe, 'steamapps', 'libraryfolders.vdf');
    if (existsSync(vdf)) {
      try {
        const text = readFileSync(vdf, 'utf8');
        let current = null;
        for (const line of text.split(/\r?\n/)) {
          const m = /^\s*"path"\s+"([^"]+)"\s*$/.exec(line);
          if (m) { current = m[1].replace(/\\\\/g, '\\'); continue; }
          if (current && line.includes(WE_APPID) && !libraries.includes(current)) libraries.push(current);
        }
      } catch { /* skip */ }
    }
    if (existsSync(join(probe, 'steamapps', 'common', 'wallpaper_engine'))) libraries.push(probe);
  }
  const roots = [...new Set([...probes, ...libraries])];
  for (const root of roots) {
    const dir = join(root, 'steamapps', 'common', 'wallpaper_engine');
    if (existsSync(join(dir, 'wallpaper32.exe'))) return dir;
  }
  const alt = 'C:\\Program Files (x86)\\Wallpaper Engine';
  return existsSync(join(alt, 'wallpaper32.exe')) ? alt : null;
}

// ①(修正) 硬依赖 webServer：cordis 等待 HTTP 服务挂载后再 apply（dsh-wallpaper-engine 同款）。
// 之前用 ctx.inject(['webServer'], (ws) => …) 时回调参数是 webCtx 而非服务对象，
// ws.register 实际不存在 → 路由从未注册 → 客户端 ping 404 → hybrid 回退纯浏览器模式。
export const inject = ['webServer'];

function apply(ctx) {
  const webServer = ctx.webServer;
  if (!webServer || typeof webServer.register !== 'function') return;
  {
    // 探测 host 可用性
    webServer.register({
      kind: 'exact', path: BASE + '/ping',
      handler: (req, res) => json(res, 200, { ok: true }),
    });

    // 流式接收 mpkg → 磁盘 → 返回条目索引（hybrid 大文件模式）
    webServer.register({
      kind: 'exact', path: BASE + '/upload',
      handler: async (req, res) => {
        try {
          const token = crypto.randomBytes(16).toString('hex');
          const dir = join(tmpdir(), 'dsh-mpkg-wallpaper');
          mkdirSync(dir, { recursive: true });
          const filePath = join(dir, token + '.mpkg');
          const out = createWriteStream(filePath);
          let head = Buffer.alloc(0);
          let size = 0;
          for await (const chunk of req) {
            size += chunk.length;
            if (head.length < HEAD_BYTES) head = Buffer.concat([head, chunk]);
            if (!out.write(chunk)) await new Promise((r) => out.once('drain', r));
          }
          await new Promise((r) => { out.end(r); });
          const { dataStart, entries } = parseMpkgHead(head);
          files.set(token, { path: filePath, size, dataStart, entries });
          json(res, 200, { ok: true, token, size, entries });
        } catch (err) {
          json(res, 500, { ok: false, error: String(err && err.message || err) });
        }
      },
    });

    // Range 流式返回 mpkg 内某个条目（视频/图片直接播放）
    webServer.register({
      kind: 'exact', path: BASE + '/media',
      handler: (req, res) => {
        try {
          const url = new URL(req.url || '', 'http://localhost');
          const token = url.searchParams.get('token') || '';
          const idx = Number(url.searchParams.get('index'));
          const rec = files.get(token);
          if (!rec || !rec.entries[idx]) { json(res, 404, { ok: false, error: 'not found' }); return; }
          const entry = rec.entries[idx];
          const st = statSync(rec.path);
          const off = Math.max(0, Number(url.searchParams.get('offset')) || 0);
          const start = rec.dataStart + entry.index + off;
          const end = start + entry.size - 1 - off;
          const name = entry.name.toLowerCase();
          const mime = name.endsWith('.gif') ? 'image/gif'
            : name.endsWith('.png') ? 'image/png'
            : name.endsWith('.jpg') || name.endsWith('.jpeg') ? 'image/jpeg'
            : name.endsWith('.webp') ? 'image/webp'
            : name.endsWith('.mp4') ? 'video/mp4'
            : name.endsWith('.webm') ? 'video/webm'
            : 'application/octet-stream';
          const range = req.headers.range;
          if (range) {
            const m = /bytes=(\d*)-(\d*)/.exec(range);
            const rs = m && m[1] ? parseInt(m[1], 10) : 0;
            const re = m && m[2] ? parseInt(m[2], 10) : entry.size - 1;
            const s = start + Math.max(0, rs);
            const e = start + Math.min(entry.size - 1, re);
            if (s > e) { res.writeHead(416, { 'content-range': `bytes */${entry.size}` }); res.end(); return; }
            res.writeHead(206, {
              'content-type': mime, 'accept-ranges': 'bytes',
              'content-range': `bytes ${s - start}-${e - start}/${entry.size}`,
              'content-length': e - s + 1,
            });
            createReadStream(rec.path, { start: s, end: e }).pipe(res);
          } else {
            res.writeHead(200, { 'content-type': mime, 'accept-ranges': 'bytes', 'content-length': entry.size });
            createReadStream(rec.path, { start, end }).pipe(res);
          }
        } catch (err) {
          json(res, 500, { ok: false, error: String(err && err.message || err) });
        }
      },
    });

    // ③(新) Steam 自动发现：返回壁纸引擎安装目录 + 可移植壁纸列表（video/web）
    webServer.register({
      kind: 'exact', path: BASE + '/steam-inventory',
      handler: (req, res) => {
        try {
          const installDir = locateWallpaperEngine();
          if (!installDir) { json(res, 200, { ok: true, installDir: null, wallpapers: [] }); return; }
          const projectsRoots = [
            join(installDir, 'projects', 'myprojects'),
            join(installDir, 'projects', 'defaultprojects'),
            join(installDir, 'steamapps', 'workshop', 'content', WE_APPID),
          ];
          const wallpapers = [];
          const scan = (root) => {
            if (!existsSync(root)) return;
            for (const dir of readdirSync(root)) {
              const p = join(root, dir);
              const proj = join(p, 'project.json');
              if (!existsSync(proj)) continue;
              try {
                const meta = JSON.parse(readFileSync(proj, 'utf8'));
                const type = (meta.type || 'scene').toLowerCase();
                wallpapers.push({ title: meta.title || dir, dir: p, type, preview: join(p, 'preview.jpg') });
              } catch { /* skip */ }
            }
          };
          for (const root of projectsRoots) scan(root);
          json(res, 200, { ok: true, installDir, wallpapers });
        } catch (err) {
          json(res, 500, { ok: false, error: String(err && err.message || err) });
        }
      },
    });
  }
}

export { apply };
