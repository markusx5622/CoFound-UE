#!/usr/bin/env node
/**
 * Exportador visual determinista para CoFound UE (sin dependencias npm).
 * Usa Chrome / Edge local mediante Chrome DevTools Protocol (CDP) + WebSocket nativo de Node.
 *
 * Modos de uso:
 * 1) Exportar slides desde un design.html local:
 *    node .agents/skills/cofound-visual-export/scripts/export-slides.mjs <ruta/design.html> [--out <dir>] [--scale 2] [--wait 250] [--only <nombre|indice>]
 *
 * 2) Capturar una URL real (ej. https://www.cofoundue.es):
 *    node .agents/skills/cofound-visual-export/scripts/export-slides.mjs --url <url> --out <archivo.png> [--width 390] [--height 844] [--scale 2] [--wait 1200] [--scroll 0] [--click "<selector>"] [--mobile]
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../../../..");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

function parseArgs(argv) {
  const args = {
    input: null,
    url: null,
    out: null,
    scale: 2,
    wait: 300,
    width: 1080,
    height: 1350,
    scroll: 0,
    click: null,
    mobile: false,
    only: null,
  };

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === "--url") {
      args.url = argv[++i];
    } else if (token === "--out") {
      args.out = argv[++i];
    } else if (token === "--scale") {
      args.scale = Number(argv[++i]);
    } else if (token === "--wait") {
      args.wait = Number(argv[++i]);
    } else if (token === "--width") {
      args.width = Number(argv[++i]);
    } else if (token === "--height") {
      args.height = Number(argv[++i]);
    } else if (token === "--scroll") {
      args.scroll = Number(argv[++i]);
    } else if (token === "--click") {
      args.click = argv[++i];
    } else if (token === "--mobile") {
      args.mobile = true;
    } else if (token === "--only") {
      args.only = argv[++i];
    } else if (!token.startsWith("--") && !args.input) {
      args.input = token;
    }
  }

  if (!args.input && !args.url) {
    throw new Error(
      "Uso:\n" +
        "  node export-slides.mjs <ruta/design.html> [--out <dir>] [--scale 2] [--wait 300] [--only <nombre|indice>]\n" +
        "  node export-slides.mjs --url <https://...> --out <archivo.png> [--width 390] [--height 844] [--scale 2] [--mobile]"
    );
  }
  return args;
}

function findBrowserExecutable() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    path.join(process.env.LOCALAPPDATA || "", "Google\\Chrome\\Application\\chrome.exe"),
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error(
    "No se encontró Google Chrome ni Microsoft Edge instalado. Define CHROME_PATH con la ruta del ejecutable."
  );
}

function startStaticServer(rootDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const reqUrl = new URL(req.url || "/", "http://127.0.0.1");
        const decodedPath = decodeURIComponent(reqUrl.pathname);
        const safeRel = path.normalize(decodedPath).replace(/^([/\\])+/, "");
        const fullPath = path.resolve(rootDir, safeRel);
        const relToRoot = path.relative(rootDir, fullPath);

        if (relToRoot.startsWith("..") || path.isAbsolute(relToRoot)) {
          res.writeHead(403);
          res.end("Forbidden");
          return;
        }

        const segments = relToRoot.split(/[\\/]/).filter(Boolean);
        if (segments.some((seg) => seg.startsWith("."))) {
          res.writeHead(403);
          res.end("Forbidden");
          return;
        }

        if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }

        const ext = path.extname(fullPath).toLowerCase();
        res.writeHead(200, {
          "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
          "Cache-Control": "no-store",
        });
        fs.createReadStream(fullPath).pipe(res);
      } catch (err) {
        res.writeHead(500);
        res.end(String(err));
      }
    });

    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      resolve({ server, port: addr.port });
    });
  });
}

function launchChrome(executablePath, userDataDir) {
  return new Promise((resolve, reject) => {
    const chromeArgs = [
      "--headless=new",
      "--remote-debugging-port=0",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--disable-background-networking",
      "--disable-sync",
      "--hide-scrollbars",
      "--mute-audio",
      "--force-color-profile=srgb",
      `--user-data-dir=${userDataDir}`,
      "about:blank",
    ];

    const proc = spawn(executablePath, chromeArgs, {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    let stderrBuf = "";
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        proc.kill();
        reject(new Error(`Timeout al iniciar Chrome headless. Stderr:\n${stderrBuf}`));
      }
    }, 15000);

    proc.stderr.on("data", (chunk) => {
      const text = chunk.toString("utf8");
      stderrBuf += text;
      const match = stderrBuf.match(/DevTools listening on (ws:\/\/127\.0\.0\.1:(\d+)\/[^\s]+)/);
      if (match && !resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve({ proc, debugPort: Number(match[2]), browserWsUrl: match[1] });
      }
    });

    proc.on("error", (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(err);
      }
    });

    proc.on("exit", (code) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(new Error(`Chrome finalizó inesperadamente (código ${code}). Stderr:\n${stderrBuf}`));
      }
    });
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.nextId = 1;
    this.pending = new Map();
    this.eventWaiters = [];
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (typeof globalThis.WebSocket !== "function") {
        reject(new Error("Se requiere Node.js >= 22 con WebSocket nativo."));
        return;
      }
      const ws = new globalThis.WebSocket(this.wsUrl);
      this.ws = ws;

      ws.addEventListener("open", () => resolve());
      ws.addEventListener("error", (err) => reject(err));
      ws.addEventListener("message", (evt) => {
        const msg = JSON.parse(String(evt.data));
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve: res, reject: rej, timer } = this.pending.get(msg.id);
          clearTimeout(timer);
          this.pending.delete(msg.id);
          if (msg.error) {
            rej(new Error(`CDP error ${msg.error.code}: ${msg.error.message}`));
          } else {
            res(msg.result);
          }
        } else if (msg.method) {
          for (let i = this.eventWaiters.length - 1; i >= 0; i--) {
            const waiter = this.eventWaiters[i];
            if (waiter.method === msg.method) {
              clearTimeout(waiter.timer);
              this.eventWaiters.splice(i, 1);
              waiter.resolve(msg.params);
            }
          }
        }
      });
    });
  }

  send(method, params = {}, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timeout esperando respuesta CDP para ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  waitForEvent(method, timeoutMs = 20000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout esperando evento CDP ${method}`));
      }, timeoutMs);
      this.eventWaiters.push({ method, resolve, timer });
    });
  }

  async evaluate(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      throw new Error(
        `Error JS en página: ${res.exceptionDetails.exception?.description || res.exceptionDetails.text}`
      );
    }
    return res.result?.value;
  }

  close() {
    if (this.ws && this.ws.readyState === 1) {
      this.ws.close();
    }
  }
}

function readPngDimensions(buffer) {
  // Cabecera PNG IHDR: bytes 16..24 contienen width y height big-endian
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitPageAssetsReady(cdp, extraWaitMs) {
  await cdp.evaluate(`(async () => {
    const withTimeout = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(r, ms))]);
    if (document.fonts && document.fonts.ready) {
      await withTimeout(document.fonts.ready, 5000);
    }
    const imgs = Array.from(document.images || []).filter((img) => {
      // Omitir imágenes lazy-loaded fuera del viewport para evitar bloqueos indefinidos
      if (img.loading === "lazy") {
        const rect = img.getBoundingClientRect();
        if (rect.top > window.innerHeight * 1.5) return false;
      }
      return true;
    });
    await withTimeout(
      Promise.all(imgs.map((img) => {
        if (img.complete && img.naturalWidth > 0) {
          return typeof img.decode === "function" ? img.decode().catch(() => {}) : Promise.resolve();
        }
        return new Promise((res) => {
          img.addEventListener("load", () => {
            if (typeof img.decode === "function") img.decode().catch(() => {}).finally(res);
            else res();
          }, { once: true });
          img.addEventListener("error", res, { once: true });
        });
      })),
      6000
    );
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  })()`);
  if (extraWaitMs > 0) {
    await sleep(extraWaitMs);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const chromePath = findBrowserExecutable();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "cofound-cdp-"));

  let staticServer = null;
  let chromeProc = null;
  let cdp = null;

  try {
    let targetUrl = args.url;
    let defaultOutDir = null;

    if (!targetUrl) {
      const absInput = path.resolve(process.cwd(), args.input);
      if (!fs.existsSync(absInput)) {
        throw new Error(`No existe el archivo de entrada: ${absInput}`);
      }
      const relToRoot = path.relative(REPO_ROOT, absInput);
      const serveRoot = relToRoot.startsWith("..") ? path.dirname(absInput) : REPO_ROOT;
      const urlPath = relToRoot.startsWith("..")
        ? "/" + path.basename(absInput)
        : "/" + relToRoot.split(path.sep).map(encodeURIComponent).join("/");

      const srv = await startStaticServer(serveRoot);
      staticServer = srv.server;
      targetUrl = `http://127.0.0.1:${srv.port}${urlPath}`;
      defaultOutDir = path.dirname(absInput);
    }

    const launched = await launchChrome(chromePath, userDataDir);
    chromeProc = launched.proc;

    // Obtener pestaña (target de tipo page) para conectar CDP
    const targetsRes = await fetch(`http://127.0.0.1:${launched.debugPort}/json/list`);
    const targets = await targetsRes.json();
    const pageTarget = targets.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
    if (!pageTarget) {
      throw new Error("No se encontró un target de tipo 'page' en Chrome headless.");
    }

    cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Emulation.setDefaultBackgroundColorOverride", {
      color: { r: 9, g: 9, b: 11, a: 1 },
    });

    if (args.url) {
      // MODO 2: Captura de URL real
      if (!args.out) {
        throw new Error("En modo --url debes indicar --out <ruta/archivo.png>");
      }
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: args.width,
        height: args.height,
        deviceScaleFactor: args.scale,
        mobile: args.mobile,
      });

      const loadPromise = cdp.waitForEvent("Page.loadEventFired");
      await cdp.send("Page.navigate", { url: targetUrl });
      await loadPromise;
      await waitPageAssetsReady(cdp, args.wait);

      if (args.click) {
        await cdp.evaluate(`(() => {
          const el = document.querySelector(${JSON.stringify(args.click)});
          if (el) el.click();
        })()`);
        await sleep(600);
      }

      if (args.scroll > 0) {
        await cdp.evaluate(`window.scrollTo({ top: ${args.scroll}, behavior: "instant" })`);
        await sleep(500);
      }

      const shot = await cdp.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
      });
      const buf = Buffer.from(shot.data, "base64");
      const outPath = path.resolve(process.cwd(), args.out);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, buf);
      const dims = readPngDimensions(buf);
      console.log(
        JSON.stringify(
          {
            mode: "url",
            url: targetUrl,
            file: path.relative(REPO_ROOT, outPath),
            pixels: `${dims.width}x${dims.height}`,
            sizeKB: Number((buf.length / 1024).toFixed(1)),
          },
          null,
          2
        )
      );
      return;
    }

    // MODO 1: Exportación de láminas (.slide) desde design.html
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1440,
      deviceScaleFactor: args.scale,
      mobile: false,
    });

    const loadPromise = cdp.waitForEvent("Page.loadEventFired");
    await cdp.send("Page.navigate", { url: targetUrl });
    await loadPromise;
    await waitPageAssetsReady(cdp, args.wait);

    const slides = await cdp.evaluate(`(() => {
      const nodes = Array.from(document.querySelectorAll(".slide"));
      return nodes.map((el, idx) => {
        const rect = el.getBoundingClientRect();
        const w = Number(el.dataset.width) || Math.round(rect.width) || 1080;
        const h = Number(el.dataset.height) || Math.round(rect.height) || 1350;
        const rawName = (el.dataset.name || "").trim();
        const safeName = rawName
          ? rawName.replace(/[^a-zA-Z0-9_-]/g, "-")
          : "slide-" + String(idx + 1).padStart(2, "0");
        return { index: idx, name: safeName, width: w, height: h };
      });
    })()`);

    if (!slides || slides.length === 0) {
      throw new Error(
        "No se encontró ningún elemento con clase `.slide` en design.html. Envuelve cada lámina en <section class=\"slide\" data-name=\"slide-01\" data-width=\"1080\" data-height=\"1350\">."
      );
    }

    // Inyectar estilos de aislamiento para capturar cada lámina sin márgenes, gaps ni fugas de hermanos
    await cdp.evaluate(`(() => {
      const style = document.createElement("style");
      style.id = "cofound-cdp-export-style";
      style.textContent = \`
        html[data-export-mode="1"],
        html[data-export-mode="1"] body {
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background: transparent !important;
          display: block !important;
        }
        html[data-export-mode="1"] .slide:not([data-export-active="1"]) {
          display: none !important;
        }
        html[data-export-mode="1"] .slide[data-export-active="1"] {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          margin: 0 !important;
          transform: none !important;
          box-shadow: none !important;
        }
      \`;
      document.head.appendChild(style);
      document.documentElement.setAttribute("data-export-mode", "1");
    })()`);

    const outDir = args.out ? path.resolve(process.cwd(), args.out) : defaultOutDir;
    fs.mkdirSync(outDir, { recursive: true });

    const results = [];
    for (const slide of slides) {
      if (args.only) {
        const matchIndex = String(slide.index + 1) === String(args.only);
        const matchName = slide.name === args.only;
        if (!matchIndex && !matchName) continue;
      }

      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: slide.width,
        height: slide.height,
        deviceScaleFactor: args.scale,
        mobile: false,
      });

      await cdp.evaluate(`(() => {
        const nodes = Array.from(document.querySelectorAll(".slide"));
        nodes.forEach((el, idx) => {
          if (idx === ${slide.index}) {
            el.setAttribute("data-export-active", "1");
          } else {
            el.removeAttribute("data-export-active");
          }
        });
      })()`);

      await cdp.evaluate(
        `new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))`
      );

      const shot = await cdp.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
        clip: {
          x: 0,
          y: 0,
          width: slide.width,
          height: slide.height,
          scale: 1,
        },
      });

      const buf = Buffer.from(shot.data, "base64");
      const outPath = path.join(outDir, `${slide.name}.png`);
      fs.writeFileSync(outPath, buf);
      const dims = readPngDimensions(buf);
      results.push({
        slide: slide.name,
        logical: `${slide.width}x${slide.height}`,
        pixels: `${dims.width}x${dims.height}`,
        sizeKB: Number((buf.length / 1024).toFixed(1)),
        file: path.relative(REPO_ROOT, outPath),
      });
    }

    if (results.length === 0) {
      throw new Error(`El filtro --only=${args.only} no coincidió con ninguna lámina.`);
    }

    console.log(JSON.stringify({ exported: results.length, scale: args.scale, slides: results }, null, 2));
  } finally {
    if (cdp) cdp.close();
    if (chromeProc && !chromeProc.killed) {
      chromeProc.kill();
    }
    if (staticServer) {
      staticServer.close();
    }
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {
      // En Windows Chrome puede tardar unos milisegundos en liberar locks temporales
    }
  }
}

main().catch((err) => {
  console.error("[cofound-visual-export] ERROR:", err.message || err);
  process.exit(1);
});
