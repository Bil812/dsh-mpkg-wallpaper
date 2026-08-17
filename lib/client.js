window.__ModuleLoader__.load({
	id: "@local/dsh-mpkg-wallpaper",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		let react = require("react");

		// ═══════════════════════════════════════════════════════════════════
		//  常量
		// ═══════════════════════════════════════════════════════════════════
		const ROW_ID = "mpkg-wallpaper";
		const NS = "ui-mpkg-wallpaper";
		const STORE_KEY = "dsh.mpkg-wallpaper.v2";
		const DEFAULT_OPACITY = 82;
		const DEFAULT_BLUR = 12;
		const DEFAULT_ZOOM = 100;
		const DEFAULT_SIDEBAR = true;
		const DEFAULT_SHARP = true;
		const DEFAULT_HEADER = true;
		const DEFAULT_HEADER_BG = true;
		const DEFAULT_HEADER_BLUR_AMOUNT = 80; // 标题栏磨砂程度 0-100%（白雾厚度，独立于整屏虚化）
		const DEFAULT_DIALOG_BLUR = true;
		const DEFAULT_DIALOG_AMOUNT = 14;
		const DEFAULT_POPOVER_BLUR = true;   // 弹层虚化（菜单/提示/遮罩）开关
		const DEFAULT_POPOVER_AMOUNT = 10;   // 弹层虚化程度
		const DEFAULT_MASK_BLUR = true;   // 遮罩虚化（设置/弹层打开时全屏背景遮罩）
		const DEFAULT_MASK_AMOUNT = 8;    // 遮罩虚化程度
		const DEFAULT_UNIFY_TINT = true; // 统一虚化：整屏模糊感由一个独立条控制
		const DEFAULT_UNIFY_AMOUNT = 30; // 统一虚化程度 0-40：0=所有控件透明透出壁纸，40=强模糊+实心
		const DEFAULT_CHAT_FOLLOW = true; // 统一虚化下，聊天区壁纸是否跟随整屏虚化（关=由磨砂模糊接管）
		const DEFAULT_SESSION_FOLLOW = true; // 统一虚化下，「新会话」按钮是否随整屏虚化（关=随面板不透明度）
		const DEFAULT_THINK_BG = false; // Deep diving 背景方框：默认取消（透明）
		const DEFAULT_ENABLED = true;
		const DEFAULT_CLOCK = false;
		const DEFAULT_CLOCK_24H = true;
		const DEFAULT_CLOCK_SEC = false;
		const DEFAULT_CLOCK_DATE = false;
		const DEFAULT_CLOCK_POS = "tr";
		const DEFAULT_CLOCK_SIZE = 40;
		const BG_WRAP_ID = "mpw-bgWrap";
		const BG_IMG_ID = "mpw-bgImg";
		const BG_VIDEO_ID = "mpw-bgVideo";
		/** ⑥ 设置导航图标（中性"风景画"图标，非壁纸引擎商标，无侵权风险）。 */
		const NAV_ICON = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0ic2t5IiB4MT0iMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM3YWEyZmYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM0YjZmZDQiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8cmVjdCB4PSIyIiB5PSIyIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHJ4PSIzIiBmaWxsPSJ1cmwoI3NreSkiLz4KPGNpcmNsZSBjeD0iMTQiIGN5PSI2LjUiIHI9IjEuOCIgZmlsbD0iI2ZmZDc2ZSIvPgo8cGF0aCBkPSJNMiAxNCBMNyA5IEwxMC41IDEyLjUgTDEzIDEwIEwxOCAxNC41IEwxOCAxNSBRMTggMTYgMTcgMTYgTDMgMTYgUTIgMTYgMiAxNSBaIiBmaWxsPSIjMmYzZDU3Ii8+CjxwYXRoIGQ9Ik03IDkgTDUuNSA3LjUgTDQgOSBaIiBmaWxsPSIjM2U1ZjRmIi8+CjxyZWN0IHg9IjIiIHk9IjIiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgcng9IjMiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZjY2IiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+";

		// ═══════════════════════════════════════════════════════════════════
		//  localStorage 持久化（⑤：读写带缓存 + 防抖，滑杆不卡顿）
		// ═══════════════════════════════════════════════════════════════════
		let sectionCache = null;
		let persistTimer = null;
		function loadSection() {
			try {
				const raw = localStorage.getItem(STORE_KEY);
				if (!raw) return {};
				const parsed = JSON.parse(raw);
				return parsed && typeof parsed === "object" ? parsed : {};
			} catch {
				return {};
			}
		}
		/** 带缓存的读取：避免每次滑杆事件都解析大 JSON（背景图 data URL 有 1MB+）。 */
		function readSection() {
			if (sectionCache) return sectionCache;
			sectionCache = loadSection();
			return sectionCache;
		}
		/** 写入内存缓存 + 防抖落盘。instant=true 立即写（文件选择/复位）。 */
		function writeSection(next, instant) {
			sectionCache = next;
			if (persistTimer) clearTimeout(persistTimer);
			persistTimer = setTimeout(() => {
				try {
					localStorage.setItem(STORE_KEY, JSON.stringify(sectionCache));
				} catch {
					/* 存储满时静默失败 */
				}
			}, instant ? 0 : 250);
		}
		function saveSection(patch) {
			const next = Object.assign({}, readSection(), patch);
			writeSection(next, true);
			return next;
		}
		function clearSection() {
			sectionCache = null;
			if (persistTimer) clearTimeout(persistTimer);
			try {
				localStorage.removeItem(STORE_KEY);
			} catch {}
		}

		// ═══════════════════════════════════════════════════════════════════
		//  IndexedDB 大图存储（③：高清 GIF/大图超过 localStorage 上限时用）
		// ═══════════════════════════════════════════════════════════════════
		let idbDb = null;
		function idbOpen() {
			if (idbDb) return Promise.resolve(idbDb);
			return new Promise((resolve, reject) => {
				try {
					if (typeof indexedDB === "undefined") { reject(new Error("no idb")); return; }
					const req = indexedDB.open("dsh-mpkg-wallpaper", 1);
					req.onupgradeneeded = () => { req.result.createObjectStore("images"); };
					req.onsuccess = () => { idbDb = req.result; resolve(idbDb); };
					req.onerror = () => reject(req.error);
				} catch (e) { reject(e); }
			});
		}
		function idbPut(key, value) {
			return idbOpen().then((db) => new Promise((resolve, reject) => {
				try {
					const tx = db.transaction("images", "readwrite");
					tx.objectStore("images").put(value, key);
					tx.oncomplete = () => resolve();
					tx.onerror = () => reject(tx.error);
				} catch (e) { reject(e); }
			}));
		}
		function idbGet(key) {
			return idbOpen().then((db) => new Promise((resolve, reject) => {
				try {
					const tx = db.transaction("images", "readonly");
					const req = tx.objectStore("images").get(key);
					req.onsuccess = () => resolve(req.result);
					req.onerror = () => reject(req.error);
				} catch (e) { reject(e); }
			}));
		}
		function idbDel(key) {
			return idbOpen().then((db) => new Promise((resolve, reject) => {
				try {
					const tx = db.transaction("images", "readwrite");
					tx.objectStore("images").delete(key);
					tx.oncomplete = () => resolve();
					tx.onerror = () => reject(tx.error);
				} catch (e) { reject(e); }
			})).catch(() => {});
		}
		/** dataUrl 太大时写入 IndexedDB，返回 "idb:bg" 标记；否则原样返回。 */
		function storeImage(dataUrl) {
			if (dataUrl.length <= 2 * 1024 * 1024) return Promise.resolve(dataUrl);
			return idbPut("bg", dataUrl).then(() => "idb:bg").catch(() => dataUrl);
		}
		/** 视频 Blob 存入 IndexedDB（①：外部渲染成视频后作为动态背景）。 */
		function storeVideoBlob(blob) {
			return idbPut("bg", blob).then(() => "idb:blob");
		}
		/** ③(新) 大图片 Blob 直接存 IndexedDB（不走 dataURL，避免 base64 膨胀 1.37 倍爆内存），
		 *  返回 "idb:img" 标记；小图走 dataURL 直接内联。 */
		function storeImageBlob(blob) {
			if (blob.size <= 2 * 1024 * 1024) {
				return blobToDataUrl(blob).then((d) => (d.length > 2 * 1024 * 1024 ? idbPut("bg", d).then(() => "idb:img") : d));
			}
			return idbPut("bg", blob).then(() => "idb:img");
		}

		// ═══════════════════════════════════════════════════════════════════
		//  mpkg 解析（Wallpaper Engine 手机版 .mpkg 容器）
		//  布局：头部 + 全部条目头（在前），随后是全部文件数据（连续）
		//    header : version_length(u32 LE) + version + file_total(u32 LE)
		//    entry  : name_length(u32) + name + index(u32) + size(u32)
		//    data   : 第 i 个文件位于 dataStart + entries[i].index，长度 size
		// ═══════════════════════════════════════════════════════════════════
		function parseMpkg(buffer) {
			const dv = new DataView(buffer);
			const decoder = new TextDecoder();
			let pos = 0;
			const versionLength = dv.getUint32(pos, true); pos += 4;
			const version = decoder.decode(new Uint8Array(buffer, pos, versionLength)); pos += versionLength;
			const fileTotal = dv.getUint32(pos, true); pos += 4;
			const entries = [];
			for (let i = 0; i < fileTotal; i++) {
				const nameLength = dv.getUint32(pos, true); pos += 4;
				const name = decoder.decode(new Uint8Array(buffer, pos, nameLength)); pos += nameLength;
				const index = dv.getUint32(pos, true); pos += 4;
				const size = dv.getUint32(pos, true); pos += 4;
				entries.push({ name, index, size });
			}
			return { version, entries, dataStart: pos };
		}

		function guessMime(name) {
			const n = name.toLowerCase();
			if (n.endsWith(".gif")) return "image/gif";
			if (n.endsWith(".png")) return "image/png";
			if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
			if (n.endsWith(".webp")) return "image/webp";
			if (n.endsWith(".mp4")) return "video/mp4";
			if (n.endsWith(".webm")) return "video/webm";
			if (n.endsWith(".mov")) return "video/quicktime";
			if (n.endsWith(".json")) return "application/json";
			return "application/octet-stream";
		}

		function entryBytes(buffer, entry, dataStart) {
			return new Uint8Array(buffer, dataStart + entry.index, entry.size);
		}

		/** 当前时段（用于按时间选择素材，⑨）。 */
		function timeSlotKey(date) {
			const h = date.getHours();
			if (h >= 5 && h < 8) return "morning";
			if (h >= 8 && h < 17) return "day";
			if (h >= 17 && h < 19) return "dusk";
			return "night";
		}

		/** 按当前时间挑背景素材：优先 preview_{时段}.gif / {时段}.gif 等；否则回退任意图片。 */
		function pickBackgroundEntry(entries, date) {
			const slot = timeSlotKey(date);
			const suffixes = [slot, "day", "night", "dusk", "morning"];
			for (const suf of suffixes) {
				for (const ext of ["gif", "png", "jpg", "jpeg", "webp"]) {
					const hit = entries.find((e) => {
						const n = e.name.toLowerCase();
						return n === `preview_${suf}.${ext}` || n === `preview-${suf}.${ext}` || n === `${suf}.${ext}`;
					});
					if (hit) return { entry: hit, slot: suf === slot ? slot : null };
				}
			}
			// ① 内嵌 mp4（视频类壁纸）优先：比 preview.gif 清晰得多
			const vid = entries.find((e) => /\.(mp4|webm|mov)$/i.test(e.name));
			if (vid) return { entry: vid, slot: null };
			const any = entries.find((e) => /\.(gif|png|jpe?g|webp)$/i.test(e.name)) || null;
			return { entry: any, slot: null };
		}

		function blobToDataUrl(blob) {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result);
				reader.onerror = () => reject(reader.error);
				reader.readAsDataURL(blob);
			});
		}

		/** 确保 GIF 无限循环（有的预览图可能只循环 N 次；⑪）。返回新的 Uint8Array。 */
		function ensureInfiniteGif(bytes) {
			if (bytes.length < 13) return bytes;
			const packed = bytes[10];
			let pos = 13;
			if (packed & 0x80) pos += 3 * (1 << ((packed & 0x07) + 1));
			const needle = [0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2e, 0x30]; // NETSCAPE2.0
			for (let p = pos; p <= bytes.length - 20; p++) {
				if (bytes[p] === 0x21 && bytes[p + 1] === 0xff && bytes[p + 2] === 0x0b) {
					let match = true;
					for (let k = 0; k < needle.length; k++) {
						if (bytes[p + 3 + k] !== needle[k]) { match = false; break; }
					}
					if (match) {
						// 结构: 21 FF 0B NETSCAPE2.0 03 01 [lo] [hi] 00
						if (bytes[p + 14] === 0x03 && bytes[p + 15] === 0x01) {
							bytes[p + 16] = 0;
							bytes[p + 17] = 0;
						}
						return bytes;
					}
				}
			}
			// 没有 NETSCAPE 扩展 → 插入一个（无限循环）
			const ext = [0x21, 0xff, 0x0b, 0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2e, 0x30, 0x03, 0x01, 0x00, 0x00, 0x00];
			const out = new Uint8Array(bytes.length + ext.length);
			out.set(bytes.subarray(0, pos), 0);
			out.set(ext, pos);
			out.set(bytes.subarray(pos), pos + ext.length);
			return out;
		}

		/** 处理视频纹理壁纸：提取 MP4、按时间选时段、存入 IndexedDB。
		 *  ③(重做) readEntry(entry, limit?) 按需读取，424MB 大包不整体进内存。 */
		async function handleVideoTexes(mpkg, vtex, file, t, showError, readEntry) {
			try {
				// 提取每个视频纹理的 MP4 并识别时间槽
				const list = [];
				let cfg = { enabled: true, morning: 4, day: 9, dusk: 17, night: 20 };
				let propsMap = null;
				const proj = mpkg.entries.find((e) => e.name === "project.json");
				if (proj) {
					try {
						const pj = JSON.parse(new TextDecoder().decode(await readEntry(proj)));
						propsMap = (pj.general && pj.general.properties) || null;
					} catch {}
				}
				const key2 = file.name + "|" + file.size;
				const propEdits = (readSection().propEdits && readSection().propEdits[key2]) || {};
				if (propsMap) cfg = timeConfigFromProps(propsMap, propEdits);
				for (let i = 0; i < vtex.length; i++) {
					const e = vtex[i];
					// ③(新) 内存防护：超大视频纹理在移动端直接 OOM（页面崩溃），前置跳过
					if (e.size > 250 * 1024 * 1024) continue;
					// ⑤(新) 分段读取：先读 tex 头 4KB 找 ftyp 偏移，再只读 mp4 段
					// （避免整个大 tex 进内存：峰值 = mp4 大小，而非 tex 大小）。
					const texHead = await readEntry(e, 4096);
					const mp4Off = extractTexVideoOffset(texHead);
					let mp4 = null;
					if (mp4Off !== null) {
						mp4 = await readEntry(e, e.size - mp4Off, mp4Off);
					} else {
						const bytes = await readEntry(e);
						mp4 = extractTexVideo(bytes);
					}
					if (!mp4 || !mp4.length) continue;
					const slot = slotFromName(e.name);
					const skey = slot || "v" + i;
					const blob = new Blob([mp4], { type: "video/mp4" });
					if (blob.size > 250 * 1024 * 1024) continue;
					await idbPut("bg-" + skey, blob);
					list.push({ slot: slot || skey, name: e.name, key: skey, size: blob.size });
				}
				if (!list.length) {
					// ⑨(重做) 视频纹理都无法提取时返回 false，让 onMpkg 回退到 preview.gif
					//（用户至少能看到预览，而不是静默无反应）
					const anyBig = vtex.some((e) => e.size > 250 * 1024 * 1024);
					showError(anyBig ? t("mpkg.vtexBig") : t("mpkg.noAsset"));
					return false;
				}
				// 选当前时段
				let active = null;
				if (cfg.enabled && list.some((l) => l.slot === "morning" || l.slot === "day" || l.slot === "dusk" || l.slot === "night")) {
					const slot = slotForTime(cfg, new Date());
					active = list.find((l) => l.slot === slot) || list[0];
				} else {
					active = list[0];
				}
				const activeBlob = await idbGet("bg-" + active.key);
				if (activeBlob) await idbPut("bg", activeBlob);
				const info = await extractProjectInfoAsync(mpkg.entries, readEntry);
				const lensDef = lensDefaultsFromProps(propsMap);
				// ③ 标题用真实文件名；⑤⑥ 镜头默认值（用户未改过才生效）
				const cur = readSection();
				const lensPatch = {};
				if (lensDef) {
					if (cur.zoom === void 0) lensPatch.zoom = lensDef.zoom;
					if (cur.lensX === void 0) lensPatch.lensX = lensDef.x;
					if (cur.lensY === void 0) lensPatch.lensY = lensDef.y;
				}
				writeSection(Object.assign({}, cur, {
					image: "idb:blob", source: "视频纹理:" + active.name,
					fromMpkg: true, converted: "mp4",
					timeVideos: list, timeConfig: cfg, activeSlot: active.slot || active.key,
					mpkgKey: key2, mpkgName: file.name,
					info: { title: info ? info.title : "", properties: info ? info.properties : [] },
					slot: null
				}, lensPatch), true);
				applyFromStorage();
				setHint(t("time.picked") + "：" + t("time." + (active.slot || "day")));
				return true;
			} catch (err) {
				console.error("[dsh-mpkg-wallpaper] handleVideoTexes 失败:", err);
				showError(t("mpkg.fail") + String(err && err.message || err));
				return false;
			}
		}
		/** ⑥ 从壁纸属性读镜头默认值（镜头大小/位置X/Y，按文本匹配 镜头/lens）。 */
		function lensDefaultsFromProps(propsMap) {
			if (!propsMap) return null;
			let zoom = 100, x = 0, y = 0;
			for (const k of Object.keys(propsMap)) {
				const p = propsMap[k];
				const txt = ((p.text || "") + " " + k).toLowerCase();
				const v = Number(p && p.value);
				if (isNaN(v)) continue;
				if (/镜头大小|lens\s*size/.test(txt)) zoom = Math.max(10, Math.min(2000, v <= 1 ? v * 100 : v));
				else if (/镜头位置\s*x|lens\s*position\s*x/.test(txt)) x = Math.max(-2000, Math.min(2000, v));
				else if (/镜头位置\s*y|lens\s*position\s*y/.test(txt)) y = Math.max(-2000, Math.min(2000, v));
			}
			if (zoom === 100 && x === 0 && y === 0) return null;
			return { zoom, x, y };
		}

		/** 清理属性标签：去 HTML 标签 / 实体 / 多余空白（⑤）。 */
		function cleanLabel(text) {
			return (text || "")
				.replace(/<[^>]*>/g, "")
				.replace(/&nbsp;/gi, " ")
				.replace(/&amp;/g, "&")
				.replace(/&lt;/g, "<")
				.replace(/&gt;/g, ">")
				.replace(/&quot;/g, '"')
				.replace(/&#39;|&apos;/g, "'")
				.replace(/\s+/g, " ")
				.trim();
		}

		/** 解析 project.json 文本，提取标题 + 可调参数信息。 */
		function extractProjectInfo(jsonText) {
			try {
				const json = JSON.parse(jsonText);
				const props = json.general && json.general.properties;
				const list = [];
				if (props) {
					for (const key of Object.keys(props)) {
						if (!safePropKey(key)) continue;
						const p = props[key];
						if (!p || typeof p !== "object") continue;
						const label = cleanLabel(p.text);
						if (!label) continue;
						let value = p.value;
						if (Array.isArray(p.options) && p.options.length) {
							const opt = p.options.find((o) => String(o.value) === String(value));
							if (opt) value = opt.label;
						}
						// type "text" 是纯展示性条目（作者信息/说明），不给输入框（⑥）
						const displayOnly = p.type === "text";
						// ① 关键开关识别（entry animation 开场动画 / prompt box 提示框）
						const keyText = (label + " " + (p.text || "")).toLowerCase();
						const important = /entry\s*animation|开场动画|入场动画|prompt\s*box|提示框|水印|盗版|防盗|开始时间|随现实时间|timevarying|morningtime|daytime|dusktime|nighttime|时间变化|时间段/.test(keyText);
						list.push({ key, label, value: value === void 0 ? "" : value, type: p.type, options: p.options || null, displayOnly, important });
					}
				}
				return { title: json.title || "", properties: list };
			} catch (e) {
				return null;
			}
		}
		/** ③(重做) 异步版：project.json 按需读取（424MB 大包不整体进内存）。 */
		async function extractProjectInfoAsync(entries, readEntry) {
			const proj = entries.find((e) => e.name === "project.json");
			if (!proj) return null;
			try {
				const buf = await readEntry(proj);
				return extractProjectInfo(new TextDecoder().decode(buf));
			} catch (e) {
				return null;
			}
		}


		// ═══════════════════════════════════════════════════════════════════
		//  背景 DOM（一个固定 img 层；用 <img> 保证 GIF 动画可靠播放，⑪）
		// ═══════════════════════════════════════════════════════════════════
		function ensureBgDom() {
			let wrap = document.getElementById(BG_WRAP_ID);
			if (!wrap) {
				wrap = document.createElement("div");
				wrap.id = BG_WRAP_ID;
				wrap.className = "mpw-bgWrap";
				const img = document.createElement("img");
				img.id = BG_IMG_ID;
				img.className = "mpw-bgImg";
				img.alt = "";
				img.draggable = false;
				img.referrerPolicy = "no-referrer";
				img.crossOrigin = "anonymous";
				img.style.display = "none";
				const video = document.createElement("video");
				video.id = BG_VIDEO_ID;
				video.className = "mpw-bgVideo";
				video.autoplay = true;
				video.loop = true;
				video.muted = true;
				video.playsInline = true;
				video.referrerPolicy = "no-referrer";
				video.style.display = "none";
				// ②(新) 视频播放失败检测：编码不支持/加载失败时不再静默（写 console + 全局标记）
				video.addEventListener("error", () => {
					console.warn("[dsh-mpkg-wallpaper] 视频背景加载失败（编码可能不被浏览器支持）:", video.src);
					try { window.__mpwVideoFailed = true; } catch {}
				});
				wrap.appendChild(img);
				wrap.appendChild(video);
				(document.body || document.documentElement).appendChild(wrap);
			}
			return wrap;
		}
		function bgElements() {
			return {
				img: document.getElementById(BG_IMG_ID),
				video: document.getElementById(BG_VIDEO_ID),
				wrap: document.getElementById(BG_WRAP_ID)
			};
		}
		let clockEl = null;
		let clockTimer = null;
		function ensureClockEl() {
			if (clockEl) return clockEl;
			clockEl = document.createElement("div");
			clockEl.id = "mpw-clock";
			clockEl.style.cssText = "position:fixed;z-index:2000;pointer-events:none;font-family:ui-monospace,SFMono-Regular,monospace;font-variant-numeric:tabular-nums;text-shadow:0 1px 6px rgba(0,0,0,.55);color:var(--dsw-alias-label-primary,#e8eaf0);";
			(document.body || document.documentElement).appendChild(clockEl);
			return clockEl;
		}
		function clockText() {
			const s = readSection();
			const now = new Date();
			let h = now.getHours();
			const use24 = s.clock24h !== void 0 ? !!s.clock24h : DEFAULT_CLOCK_24H;
			const hs = use24 ? String(h).padStart(2, "0") : String(((h % 12) || 12)).padStart(2, "0");
			const sec = s.clockSec !== void 0 ? !!s.clockSec : DEFAULT_CLOCK_SEC;
			const date = s.clockDate !== void 0 ? !!s.clockDate : DEFAULT_CLOCK_DATE;
			const t = `${hs}:${String(now.getMinutes()).padStart(2, "0")}${sec ? ":" + String(now.getSeconds()).padStart(2, "0") : ""}`;
			return date ? `${now.getMonth() + 1}月${now.getDate()}日 ${t}` : t;
		}
		function tickClock() {
			const s = readSection();
			const on = s.clock !== void 0 ? !!s.clock : DEFAULT_CLOCK;
			if (!on) {
				if (clockEl) clockEl.style.display = "none";
				if (clockTimer) { clearInterval(clockTimer); clockTimer = null; }
				return;
			}
			const el = ensureClockEl();
			el.style.display = "";
			el.textContent = clockText();
		}
		function updateClock() {
			const s = readSection();
			const on = s.clock !== void 0 ? !!s.clock : DEFAULT_CLOCK;
			if (!on) { tickClock(); return; }
			const el = ensureClockEl();
			const pos = s.clockPos !== void 0 ? s.clockPos : DEFAULT_CLOCK_POS;
			const size = s.clockSize !== void 0 ? s.clockSize : DEFAULT_CLOCK_SIZE;
			el.style.fontSize = size + "px";
			el.style.top = /t/.test(pos) ? "18px" : "auto";
			el.style.bottom = /b/.test(pos) ? "18px" : "auto";
			el.style.left = /l/.test(pos) ? "18px" : "auto";
			el.style.right = /r/.test(pos) ? "18px" : "auto";
			tickClock();
			if (!clockTimer) clockTimer = setInterval(tickClock, 1000);
		}

		let lastObjectUrl = null;
		// P0②(优化) 背景内容签名：仅当壁纸源真正变化时才重建 img/video 层。
		// 拖动模糊/透明度等滑块时 applyFromStorage 会反复进入，若无此缓存
		// idb:blob 每次都会新建 ObjectURL → 视频反复重缓冲、GIF 重播。
		// IndexedDB 每次 get 返回新 Blob 实例（结构化克隆），故用 size+type 做内容签名。
		let lastBgSig = null;
		// ①(修正) 背景应用代数：applyFromStorage 每次调用递增；异步 IndexedDB 回调
		// 若在更新的应用之后才返回（竞态），会被忽略——修复"视频壁纸→GIF 壁纸
		// 切换后背景仍显示旧视频"的问题（旧视频的 idbGet 回调晚到覆盖新背景）。
		let bgGen = 0;
		function showImageEl() {
			const { img, video, wrap } = bgElements();
			if (!img || !video || !wrap) return;
			try { video.pause(); } catch {}
			if (lastObjectUrl) { try { URL.revokeObjectURL(lastObjectUrl); } catch {} lastObjectUrl = null; }
			try { video.removeAttribute("src"); } catch {}
			// ①(加固) 用 CSS 类切换 img/video 显示（比 inline style 更可靠）
			wrap.classList.remove("mpw-video");
			wrap.classList.add("mpw-img");
			video.style.display = "none";
			img.style.display = "";
		}
		function showVideoEl(url) {
			const { img, video, wrap } = bgElements();
			if (!img || !video || !wrap) return;
			// ①(加固) CSS 类切换：视频壁纸显示 video、隐藏 img
			wrap.classList.remove("mpw-img");
			wrap.classList.add("mpw-video");
			img.style.display = "none";
			if (lastObjectUrl && lastObjectUrl !== url) { try { URL.revokeObjectURL(lastObjectUrl); } catch {} }
			lastObjectUrl = url;
			try { if (video.src !== url) video.src = url; } catch {}
			video.style.display = "";
			try { const p = video.play(); if (p && p.catch) p.catch(() => {}); } catch {}
		}

		/** 从 localStorage 状态渲染背景 DOM + 样式。 */
		function applyFromStorage() {
			bgGen++;
			const gen = bgGen;
			// ⑭ backdrop-filter 支持：用 CSS.supports 判断即可（用户实测 Via/Firefox 都支持）。
			// 之前用"屏幕外测试元素 + getComputedStyle"检测会误判 false（屏幕外/透明
			// 元素 computed backdropFilter 可能为空），导致 blur 被跳过只剩半透明=白纱。
			try {
				window.__mpwBackdropRendered = !!(typeof CSS !== "undefined" && !!CSS.supports && CSS.supports("backdrop-filter", "blur(1px)"));
			} catch { window.__mpwBackdropRendered = true; }
			const sectionRaw = readSection();
			const enabled = sectionRaw.enabled !== void 0 ? !!sectionRaw.enabled : DEFAULT_ENABLED;
			// ④ 总开关关闭 → 视为无背景（恢复默认外观）
			const section = enabled ? sectionRaw : Object.assign({}, sectionRaw, { image: "" });
			const { img, video, wrap } = bgElements();
			if (!img || !video || !wrap) return;
			const image = section.image || "";
			if (image === "idb:blob") {
				idbGet("bg").then((v) => {
					if (gen !== bgGen) return; // 过期回调（已有更新的应用）
					if (!(v instanceof Blob)) return;
					const sig = v.size + ":" + v.type;
					if (lastBgSig && lastBgSig.sig === sig && lastBgSig.url) {
						// 内容未变：复用已有 ObjectURL，不重建 video（避免重缓冲）
						showVideoEl(lastBgSig.url);
						return;
					}
					if (lastBgSig && lastBgSig.url) { try { URL.revokeObjectURL(lastBgSig.url); } catch {} }
					const url = URL.createObjectURL(v);
					lastBgSig = { sig, url };
					showVideoEl(url);
				}).catch(() => {});
			} else if (image === "idb:img") {
				// ③(新) 大图片 Blob 路径：ObjectURL 显示，不走 dataURL（防内存膨胀）
				idbGet("bg").then((v) => {
					if (gen !== bgGen) return; // 过期回调
					if (!(v instanceof Blob)) return;
					const sig = v.size + ":" + v.type;
					if (lastBgSig && lastBgSig.sig === sig && lastBgSig.url) {
						if (img.src !== lastBgSig.url) img.src = lastBgSig.url;
						showImageEl();
						return;
					}
					if (lastBgSig && lastBgSig.url) { try { URL.revokeObjectURL(lastBgSig.url); } catch {} }
					const url = URL.createObjectURL(v);
					lastBgSig = { sig, url };
					if (img.src !== url) img.src = url;
					showImageEl();
				}).catch(() => {});
			} else if (typeof image === "string" && image.indexOf("idb:") === 0) {
				idbGet("bg").then((v) => { if (gen !== bgGen) return; if (v && img.src !== v) { img.src = v; showImageEl(); } }).catch(() => {});
			} else {
				lastBgSig = null;
				if (img.src !== image) {
					console.log("[dsh-mpkg-wallpaper] 背景切换: img.src →", String(image).slice(0, 40) + "…");
					img.src = image;
					showImageEl();
				} else {
					console.log("[dsh-mpkg-wallpaper] 背景切换: img.src 未变（可能是重复应用）", String(image).slice(0, 40) + "…");
				}
			}
			if (image) {
				const zoom = section.zoom !== void 0 ? section.zoom : DEFAULT_ZOOM;
				wrap.style.setProperty("--mpw-zoom", String(zoom / 100));
				wrap.style.setProperty("--mpw-lensX", String(section.lensX !== void 0 ? section.lensX : 0) + "px");
				wrap.style.setProperty("--mpw-lensY", String(section.lensY !== void 0 ? section.lensY : 0) + "px");
				wrap.classList.toggle("mpw-sharp", section.sharp !== void 0 ? !!section.sharp : DEFAULT_SHARP);
				// ⑯ 磨砂模糊条 → 壁纸层 blur（0 = 完全清晰）。
				// ①(修正) 壁纸层 blur **始终**由磨砂模糊条控制，不随整屏虚化条：
				// 整屏虚化（unifyAmount）只控制各区域白雾（alpha），壁纸本身模糊度
				// 若也接 unifyAmount，聊天区壁纸会跟着整屏虚化变（chatFollow 失效）。
				const bgBlur = section.blur !== void 0 ? section.blur : DEFAULT_BLUR;
				wrap.style.setProperty("--mpw-bg-blur", bgBlur > 0 ? `blur(${bgBlur}px)` : "none");
			}
			const styleEl = getStyleEl();
			if (styleEl) {
				try { styleEl.textContent = buildCss(section); }
				catch (err) { console.error("[dsh-mpkg-wallpaper] buildCss failed:", err); }
			}
			// ⑭ token override：弹层/主画布/侧边栏半透明（对话框虚化核心）
			try { applyTokenOverrides(pluginCtx, section); } catch {}
			try { applyDialogInline(section); } catch {}
			try { updateClock(); } catch {}
		}

		/**
		 * ⑭ 用 token override 实现对话框/弹层半透明（参考 ui-theme-background-custom 方案）。
		 * DSH 的弹层/菜单/对话框背景由 --dsw-alias-bg-overlay 驱动；主画布由
		 * --dsw-alias-bg-base 驱动、侧边栏由 --dsw-specific-sidebar-fill 驱动。
		 * overrideTokens 从 token 层面让这些表面半透明，弹层自动跟随（不猜类名），
		 * 背景壁纸在 z-index:-1 层透过半透明表面显示 → 对话框虚化跟随背景位置颜色。
		 */
		function applyTokenOverrides(ctx, section) {
			if (!ctx || !ctx.theme || typeof ctx.theme.overrideTokens !== "function") return;
			const enabled = section.enabled !== void 0 ? !!section.enabled : DEFAULT_ENABLED;
			const hasImage = !!section.image;
			const dialogBlur = section.dialogBlur !== void 0 ? !!section.dialogBlur : DEFAULT_DIALOG_BLUR;
			const opacity = section.opacity !== void 0 ? section.opacity : DEFAULT_OPACITY;
			// ③(新) 统一虚化：主画布底透明度跟随 opacity（白雾厚度与侧边栏一致）
			const unifyTint = section.unifyTint !== void 0 ? !!section.unifyTint : DEFAULT_UNIFY_TINT;
			// 弹层/菜单/设置面板背景保持 DSH 原色，通过 token 变半透明
			//（颜色跟随主题，不覆盖背景；配合 buildCss 的 backdrop-filter blur）。
			// 透明度：虚化开 → 60-75% 半透明；关/无背景 → 还原。
			let a = 1;
			const bdOk = window.__mpwBackdropRendered !== false;
			if (enabled && hasImage && dialogBlur && bdOk) {
				const panel = Math.max(50, Math.min(100, opacity)) / 100;
				a = Math.min(0.78, 0.60 + 0.15 * (1 - panel));
			}
			const toAlpha = (staticVar, alpha) => `color-mix(in srgb, var(${staticVar}) ${Math.round(alpha * 100)}%, transparent)`;
			// 主画布背景（聊天区）：统一虚化开 → unifyAmount 映射的 alpha（0=全透明透出壁纸）；
			// chatFollow 关 → 由磨砂模糊条接管（blur*2.5 映射白雾）；
			// 关 → 0.62（原默认，跟随 dialogBlur）
			const chatFollow = section.chatFollow !== void 0 ? !!section.chatFollow : DEFAULT_CHAT_FOLLOW;
			const blurVal = section.blur !== void 0 ? section.blur : DEFAULT_BLUR;
			const baseAlpha = enabled && hasImage && dialogBlur
				? (unifyTint
					? (chatFollow
						? Math.max(0, Math.min(1, (section.unifyAmount !== void 0 ? section.unifyAmount : DEFAULT_UNIFY_AMOUNT) / 40))
						: Math.max(0, Math.min(1, blurVal * 0.025)))
					: 0.62)
				: 1;
			const overrides = {
				// 主画布背景半透明 → 壁纸透到所有区域（含输入框背后），
				// 这样输入框/弹层的 backdrop-filter 才能模糊到壁纸（Aqua 生效的关键）。
				// 透明度 0.62：壁纸可见且文字可读。
				"--dsw-alias-bg-base": {
					light: toAlpha("--dsw-static-neutral-bluish-00", baseAlpha),
					dark: toAlpha("--dsw-static-neutral-bluish-950", baseAlpha)
				},
				"--dsw-alias-bg-overlay": {
					light: toAlpha("--dsw-static-neutral-bluish-150", a),
					dark: toAlpha("--dsw-static-neutral-bluish-700", a)
				},
				"--dsw-alias-bg-layer-2": {
					light: toAlpha("--dsw-static-neutral-bluish-50", a),
					dark: toAlpha("--dsw-static-neutral-bluish-850", a)
				},
				// 注意：input-major（composer 输入框）和 bubble（聊天气泡）不再由
				// token 控制——buildCss 的 CSS 已直接给 [data-composer-card] 设背景，
				// 双重半透明会导致颜色过深/发白。
				// assistantOutput：Deep diving 思考框背景去掉（用户要求）
				"--dsw-alias-bg-layer-1": {
					light: "transparent",
					dark: "transparent"
				}
			};
			if (!(enabled && hasImage)) {
				try { if (tokenDisposer) { tokenDisposer(); tokenDisposer = null; } } catch {}
				return;
			}
			try {
				if (tokenDisposer) { tokenDisposer(); tokenDisposer = null; }
				tokenDisposer = ctx.theme.overrideTokens("@local/dsh-mpkg-wallpaper-tokens", overrides);
			} catch (err) { console.error("[dsh-mpkg-wallpaper] overrideTokens failed:", err); }
		}		/**
		 * ⑭ 内联应用对话框虚化 + fade 修复（绕过 CSS 选择器匹配问题）。
		 * CSS 选择器可能因 hash 类名/结构变化失配，这里直接用 JS 找到元素
		 * 并内联 backdrop-filter / 渐变，确保生效。
		 */
		function applyDialogInline(section) {
			const enabled = section.enabled !== void 0 ? !!section.enabled : DEFAULT_ENABLED;
			if (!enabled) return;
			const dialogBlur = section.dialogBlur !== void 0 ? !!section.dialogBlur : DEFAULT_DIALOG_BLUR;
			const dialogAmount = section.dialogAmount !== void 0 ? section.dialogAmount : DEFAULT_DIALOG_AMOUNT;
			const thinkBg = section.thinkBg !== void 0 ? !!section.thinkBg : DEFAULT_THINK_BG;
			const panel = Math.max(50, Math.min(100, section.opacity !== void 0 ? section.opacity : DEFAULT_OPACITY));
			// 对话框虚化：完全由 buildCss 的 CSS 控制。
			// 这里只处理 Deep diving 背景方框（见下方）
			// Deep diving 背景方框：开关控制（默认关 = 透明 + 文字可见色）
			const turnStatuses = document.querySelectorAll('[role="status"]');
			const thinkRows = document.querySelectorAll('[data-variant="think"]');
			if (thinkBg) {
				thinkRows.forEach((el) => { el.style.background = ""; });
				turnStatuses.forEach((el) => {
					el.style.background = "";
					el.style.color = "";
					el.style.webkitTextFillColor = "";
					el.style.webkitBackgroundClip = "";
					el.style.backgroundClip = "";
					el.style.backdropFilter = "";
					el.style.webkitBackdropFilter = "";
				});
			} else {
				thinkRows.forEach((el) => { el.style.background = "transparent"; });
				turnStatuses.forEach((el) => {
					el.style.background = "transparent";
					el.style.color = "var(--dsw-alias-label-secondary, #9aa4b2)";
					el.style.webkitTextFillColor = "var(--dsw-alias-label-secondary, #9aa4b2)";
					el.style.webkitBackgroundClip = "border-box";
					el.style.backgroundClip = "border-box";
					el.style.backdropFilter = "none";
					el.style.webkitBackdropFilter = "none";
				});
			}
			// fade 修复：用户要求直接取消列表底部的白色渐变（不要半透明，直接隐藏）
			document.querySelectorAll('[class*="fade"]').forEach((el) => {
				if (!el.className || el.className.indexOf("fade") < 0) return;
				// 优先匹配 workspace/session 列表区域；否则匹配绝对定位在底部的渐变 fade
				const p = el.closest('[data-slot*="workspaces"], [data-slot*="session"], [class*="regionArea"], [class*="sidebarCol"]');
				let isListFade = !!p;
				if (!isListFade) {
					try {
						const cs = getComputedStyle(el);
						isListFade = cs.position === "absolute" && (cs.bottom === "0px" || parseFloat(cs.bottom) <= 1);
					} catch {}
				}
				if (isListFade) {
					el.style.display = "none";
				}
			});
		}
		/** MutationObserver 持续应用内联样式（React 重挂载时补打）。 */
		function startInlineWatcher(sectionRef) {
			let timer = null;
			const obs = new MutationObserver(() => {
				if (timer) return;
				timer = setTimeout(() => {
					timer = null;
					try { applyDialogInline(readSection()); } catch {}
				}, 120);
			});
			obs.observe(document.documentElement, { childList: true, subtree: true });
			return () => obs.disconnect();
		}

		/** 仅更新 CSS 的预览（滑杆拖动时调用，避免 React 重渲染卡顿，③）。 */
		function previewCss(patch) {
			const merged = Object.assign({}, readSection(), patch);
			const el = getStyleEl();
			if (el) { try { el.textContent = buildCss(merged); } catch (err) { console.error("[dsh-mpkg-wallpaper] previewCss failed:", err); } }
			// 内联 backdrop-filter 同步（否则内联旧值覆盖 CSS 新值，虚化程度拉条失效）
			try { applyDialogInline(merged); } catch {}
		}
		/** buildCss 里 _noBlur=true 时临时关闭 backdrop-filter（拖动时降低重绘开销，①）。 */
		function effBlur(section, def) {
			return section._noBlur ? 0 : def;
		}

		// ═══════════════════════════════════════════════════════════════════
		//  CSS 生成
		//  注意：backdrop-filter 会为 fixed 定位子元素创建包含块，绝不能加在
		//  侧边栏/聊天区的根元素上（否则设置弹窗会被"关"在侧边栏里，①），
		//  只加在内部滚动容器上（regionArea / scrollBody / details body）。
		// ═══════════════════════════════════════════════════════════════════
		function buildCss(section) {
			// ③(修正) 总开关关闭时统一视为无背景：所有路径（applyFromStorage/previewCss）
			// 都走同一逻辑，避免拖动滑块时 previewCss 绕过 enabled 检查把壁纸又显示出来
			if (section && section.enabled === false) {
				section = Object.assign({}, section, { image: "" });
			}
			const hasImage = !!(section && section.image);
			const opacity = section.opacity !== void 0 ? section.opacity : DEFAULT_OPACITY;
			// 磨砂条 blur：不走 effBlur（_noBlur 拖动时临时关掉会闪），壁纸层 blur 实时
			const blur = section.blur !== void 0 ? section.blur : DEFAULT_BLUR;
			const sidebar = section.sidebar !== void 0 ? !!section.sidebar : DEFAULT_SIDEBAR;
			const headerBlur = section.headerBlur !== void 0 ? !!section.headerBlur : DEFAULT_HEADER;
			const headerBg = section.headerBg !== void 0 ? !!section.headerBg : DEFAULT_HEADER_BG;
			const dialogBlur = section.dialogBlur !== void 0 ? !!section.dialogBlur : DEFAULT_DIALOG_BLUR;
			const dialogAmount = section.dialogAmount !== void 0 ? section.dialogAmount : DEFAULT_DIALOG_AMOUNT;
			// ②(新) 弹层虚化（菜单/提示/遮罩）独立于对话框虚化
			const popoverBlur = section.popoverBlur !== void 0 ? !!section.popoverBlur : DEFAULT_POPOVER_BLUR;
			const popoverAmount = section.popoverAmount !== void 0 ? section.popoverAmount : DEFAULT_POPOVER_AMOUNT;
			// ②(重做) 遮罩虚化（设置/弹层打开时的全屏背景）独立于弹层虚化
			const maskBlur = section.maskBlur !== void 0 ? !!section.maskBlur : DEFAULT_MASK_BLUR;
			const maskAmount = section.maskAmount !== void 0 ? section.maskAmount : DEFAULT_MASK_AMOUNT;
			const thinkBg = section.thinkBg !== void 0 ? !!section.thinkBg : DEFAULT_THINK_BG;
			const panel = Math.max(50, Math.min(100, opacity));
			const details = Math.min(100, panel + 3);
			const hideBg = hasImage && panel >= 100;
			// ③(新) 统一虚化：所有表面白雾厚度一致 = panel%（跟随外观-不透明度条）。
			// unifyTint=true 时各区域不再用各自写死的百分比，全部用 U(原值)=panel，
			// 视觉上侧边栏/聊天区/标题栏/输入框不再"一块白一块透"地分裂背景。
			const unifyTint = section.unifyTint !== void 0 ? !!section.unifyTint : DEFAULT_UNIFY_TINT;
			// ①(重做) 统一虚化：unifyTint 开时整屏模糊感由独立条 unifyAmount 控制——
			// 0px = 所有控件完全透明（透出壁纸），40px = 强模糊 + 实心。
			// 壁纸层 blur 也由它接管（磨砂条作废）；设置界面/聊天框除外（按 dialogBlur/mask）。
			// ①(新) chatFollow：聊天区壁纸是否跟随整屏虚化；关 → 由磨砂模糊条接管
			//（磨砂条越高聊天区白雾越厚：alpha = blur*2.5，0→0% / 40→100%）。
			const unifyAmount = section.unifyAmount !== void 0 ? section.unifyAmount : DEFAULT_UNIFY_AMOUNT;
			const uAlpha = Math.max(0, Math.min(100, Math.round((unifyAmount / 40) * 100)));
			const chatFollow = section.chatFollow !== void 0 ? !!section.chatFollow : DEFAULT_CHAT_FOLLOW;
			const chatAlpha = unifyTint
				? (chatFollow ? uAlpha : Math.max(0, Math.min(100, Math.round(blur * 2.5))))
				: 0; // 非 unify 时不用（聊天区走 token 0.62）
			const U = (v) => unifyTint ? uAlpha : v;
			// 区域 backdrop-filter：unify 开时整屏接管 → 全部 none（避免 containing block 陷阱）；
			// 关时跟随磨砂条。
			const blurFilter = unifyTint ? "none" : (blur > 0 ? `blur(${blur}px)` : "none");
			let css = `/* ── 背景插件 @local/dsh-mpkg-wallpaper v3 生成的样式 ── */\n`;
			if (!hasImage) {
				// ② 未设置背景时：不显示壁纸层，面板恢复不透明（默认外观）
				css += `
html, body { background: transparent !important; }
.mpw-bgWrap { display: none !important; }
.pI_x6G_frame { background-color: var(--dsw-alias-bg-base) !important; }
.pI_x6G_sidebarCol,
.hHd-Xa_root { background-color: var(--dsw-specific-sidebar-fill) !important; }
.wSkVaW_root { background-color: var(--dsw-alias-bg-base) !important; }
.ydkMvW_root { background-color: var(--dsw-alias-bg-base) !important; }
`;
				return css + buildUiCss();
			}
			css += `
html, body {
	background: transparent !important;
}
.mpw-bgWrap {
	position: fixed; inset: 0; z-index: -1; overflow: hidden; pointer-events: none;
	/* 缩放 <100% 时边缘露出底色（③），避免透明露白 */
	background-color: var(--dsw-alias-bg-base, #0e1420);
}
/* ①(加固) img/video 显示由 CSS 类控制（避免切换残留） */
.mpw-bgWrap.mpw-img video { display: none !important; }
.mpw-bgWrap.mpw-video img { display: none !important; }
.mpw-bgWrap img,
.mpw-bgWrap video {
	width: 100%; height: 100%; object-fit: cover;
	/* ④(修正) 镜头：translate 在前、scale 在后 → 平移量不被缩放影响
	   （原 scale 在前导致 zoom>100 时平移被放大、zoom<100 时平移不够，
	   用户反馈"只能渲染整个屏幕的位置"）。transform 列表从左到右复合，
	   translate() scale() = 先缩放后平移（平移是原始像素）。 */
	transform: translate(var(--mpw-lensX, 0), var(--mpw-lensY, 0)) scale(var(--mpw-zoom, 1));
	transform-origin: center center;
	/* ⑯ 磨砂模糊条：壁纸层自身 blur，拖到 0 = 完全清晰 */
	filter: var(--mpw-bg-blur, none) ${section.sharp !== void 0 && !section.sharp ? "" : "contrast(1.06) saturate(1.12)"};
}
.mpw-bgWrap.mpw-sharp {
	filter: contrast(1.06) saturate(1.12);
}
.pI_x6G_frame {
	background-color: transparent !important;
}
/* 侧边栏根（半透明，不设 backdrop-filter）。
   ③(新) 取色统一：unify 开时用主题静态色 panel%（与聊天区 bg-base 同色系同厚度，
   不再用 sidebar-fill 导致侧边栏与聊天区颜色不同、背景被"分裂"） */
.pI_x6G_sidebarCol,
.hHd-Xa_root {
	background-color: ${unifyTint
		? `color-mix(in srgb, var(--dsw-static-neutral-bluish-950) ${U(panel)}%, transparent)`
		: `color-mix(in srgb, var(--dsw-specific-sidebar-fill) ${panel}%, transparent)`} !important;
}
${unifyTint ? `body:not([data-ds-dark-theme]) .pI_x6G_sidebarCol,
body:not([data-ds-dark-theme]) .hHd-Xa_root {
	background-color: color-mix(in srgb, var(--dsw-static-neutral-bluish-00) ${U(panel)}%, transparent) !important;
}` : ""}
.hHd-Xa_newSession {
	/* ④(新) 统一虚化开：随整屏虚化（sessionFollow）或随面板不透明度；关：随面板不透明度 */
	background-color: color-mix(in srgb, var(--dsw-alias-button-elevated-fill) ${unifyTint ? (section.sessionFollow !== void 0 ? !!section.sessionFollow : DEFAULT_SESSION_FOLLOW) ? uAlpha : panel : panel}%, transparent) !important;
	border-color: color-mix(in srgb, var(--dsw-alias-border-l2) 65%, transparent) !important;
}
/* ⑬(新) 取消工作区列表底部的自带渐变 fade（用户要求直接去掉白色虚化带） */
.hHd-Xa_regionArea [class*="fade"],
[data-slot*="workspaces"] [class*="fade"],
[data-slot*="session"] [class*="fade"] {
	display: none !important;
}
/* 聊天区 / 详情面板根：背景透明，由 token override 的 --dsw-alias-bg-base
   控制半透明（避免双重透明叠加） */
.wSkVaW_root {
	background-color: transparent !important;
}
/* ⑤(修正) 输入框座（composerSeat）：去掉白色渐变特效（用户反馈拉高不透明度时
   输入框附近出现白渐变、有边界、收起也延伸）。保持透明透出壁纸。 */
.wSkVaW_root[data-phase="active"] .wSkVaW_composerSeat {
	background: transparent !important;
}
.ydkMvW_root {
	/* ③(新) unify 开 → 与聊天区同色系（static 色）；关 → 原 bg-base 混色 */
	background-color: ${unifyTint
		? `color-mix(in srgb, var(--dsw-static-neutral-bluish-950) ${U(details)}%, transparent)`
		: `color-mix(in srgb, var(--dsw-alias-bg-base) ${U(details)}%, transparent)`} !important;
}
${unifyTint ? `body:not([data-ds-dark-theme]) .ydkMvW_root {
	background-color: color-mix(in srgb, var(--dsw-static-neutral-bluish-00) ${U(details)}%, transparent) !important;
}` : ""}
/* 磨砂 blur：壁纸层自身 filter blur（磨砂条控制，见 .mpw-bgWrap img/video）。
   聊天区 scrollBody：不加 backdrop-filter（避免与输入框虚化嵌套冲突，
   Firefox 嵌套会隔离输入框 blur），半透明背景透出（模糊的）壁纸。
   输入框虚化由输入框自己的 backdrop-filter 处理（虚化开关控制）。 */
.hHd-Xa_regionArea {
	backdrop-filter: ${blurFilter} !important;
}
/* ①(修正) 左上角(logoRow/品牌/新会话) + 左下角(设置/底部)：
   不加 backdrop-filter（settingsArea/footArea 是设置弹层 fixed 遮罩的祖先，
   backdrop-filter 会创建包含块把弹层"关"进侧边栏！），只清背景透明，
   磨砂跟随由 root 半透明 + 壁纸层 filter blur 提供（透出模糊壁纸，效果等价）。 */
[data-slot="sidebar"] [class*="logoRow"],
[data-slot="sidebar"] [class*="footArea"],
[data-slot="sidebar"] [class*="footerActions"],
[data-slot="sidebar"] [class*="settingsArea"] {
	background-color: transparent !important;
}
/* ⑩(新) 第三方插件注入侧边栏的内容（DSH-better-sidebar/account-balance 等）：
   兜底 45% 雾底保证在壁纸上可读；不加 !important → 插件自己的背景样式优先 */
[data-slot="sidebar"] [data-plugin] {
	background-color: color-mix(in srgb, var(--dsw-alias-bg-base) 45%, transparent);
	border-radius: 8px;
}
.wSkVaW_scrollBody {
	backdrop-filter: none !important;
	/* 统一虚化开 → 透明：底色完全由 bg-base（panel%）提供，与侧边栏白雾厚度一致，
	   避免 scrollBody 与 bg-base 双层叠加导致聊天区比侧边栏更白（背景分裂）。
	   关 → 保持 68% 半透明底。 */
	background-color: ${unifyTint ? "transparent" : `color-mix(in srgb, var(--dsw-alias-bg-base) ${U(68)}%, transparent)`} !important;
}
.ydkMvW_body {
	backdrop-filter: ${blurFilter} !important;
}
`;
			if (headerBlur && headerBg) {
				// ①(修正) 标题栏磨砂：半透明透出（已模糊的）壁纸，磨砂视觉由整张壁纸的
				// 磨砂模糊条提供。**绝不能加 backdrop-filter**——header 内有 fixed 子元素
				// （子代理展开面板/后台任务条），backdrop-filter 会成为它们的 containing
				// block，导致面板定位错乱、被聊天文字覆盖（用户实测 bug）。
				// ①(重做) 整屏虚化开时完全接管标题栏（0 = 标题栏也透明，与其他区域一致）；
				// 关闭时由磨砂程度条（headerBlurAmount）控制标题栏雾底。
				const hblurAmt = section.headerBlurAmount !== void 0 ? section.headerBlurAmount : DEFAULT_HEADER_BLUR_AMOUNT;
				const hdrAlpha = unifyTint ? uAlpha : Math.max(0, Math.min(100, hblurAmt));
				const hdrBg = `color-mix(in srgb, var(--dsw-static-neutral-bluish-950) ${hdrAlpha}%, transparent)`;
				css += `
.wSkVaW_header {
	background-color: ${hdrBg} !important;
	backdrop-filter: none !important;
	border-bottom: 1px solid transparent !important;
}
body:not([data-ds-dark-theme]) .wSkVaW_header {
	background-color: color-mix(in srgb, var(--dsw-static-neutral-bluish-00) ${hdrAlpha}%, transparent) !important;
}
`;
			}
			if (headerBg && !headerBlur) {
				// ①(新) 标题栏透出壁纸但不磨砂：实心主题色（无 backdrop-filter）
				css += `
.wSkVaW_header {
	background-color: var(--dsw-static-neutral-bluish-00) !important;
	backdrop-filter: none !important;
}
body[data-ds-dark-theme] .wSkVaW_header {
	background-color: var(--dsw-static-neutral-bluish-950) !important;
}
`;
			}
			if (!headerBg) {
				// ①④(修正) 标题栏不透出壁纸：白色不透明（用户要求"关=一片白色的不透明状态"）。
				// 不能用 var(--dsw-alias-bg-base)——它已被 token override 成半透明会透出壁纸。
				// 用主题静态色：亮色=白、暗色=深色（跟随 data-ds-dark-theme）。
				css += `
.wSkVaW_header {
	background-color: var(--dsw-static-neutral-bluish-00) !important;
	backdrop-filter: none !important;
}
body[data-ds-dark-theme] .wSkVaW_header {
	background-color: var(--dsw-static-neutral-bluish-950) !important;
}
`;
			}
			if (!sidebar) {
				// ⑥ 侧边栏不透出壁纸：恢复为不透明，保持与聊天区区分
				css += `
.pI_x6G_sidebarCol,
.hHd-Xa_root {
	background-color: var(--dsw-specific-sidebar-fill) !important;
}
.hHd-Xa_newSession {
	background-color: var(--dsw-alias-button-elevated-fill) !important;
}
.hHd-Xa_regionArea { backdrop-filter: none !important; }
.hHd-Xa_regionArea [class*="fade"],
[data-slot*="workspaces"] [class*="fade"],
[data-slot*="session"] [class*="fade"] {
	display: none !important;
}
`;
			}
			if (hideBg) {
				// ④ 面板 100% 不透明时：隐藏壁纸层，帧底色用主题色，避免中缝透出背景
				css += `
.mpw-bgWrap { display: none !important; }
.pI_x6G_frame { background-color: var(--dsw-alias-bg-base) !important; }
`;
			}			// ⑫(重做) ② 对话框虚化 / 弹层虚化分割：
			// - 对话框虚化（dialogBlur/dialogAmount）→ 设置面板等 [role=dialog] + 聊天输入框
			// - 弹层虚化（popoverBlur/popoverAmount）→ 菜单/提示/data-surface + 全屏遮罩（mask）
			// scrollBody 已无 backdrop-filter（避免嵌套冲突），所以输入框的
			// 独立 blur 能生效（模糊滚动经过的字 + 背后的壁纸）。
			const bdSupported = window.__mpwBackdropRendered !== false;
			if (dialogBlur && dialogAmount > 0 && bdSupported) {
				const dlgFilter = `blur(${dialogAmount}px)`;
				css += `
/* ── 对话框虚化（[role=dialog]/[role=alertdialog] 居中窗口 + 聊天输入框） ── */
[role="dialog"],
[role="alertdialog"],
[data-composer-card] {
	backdrop-filter: ${dlgFilter} !important;
	-webkit-backdrop-filter: ${dlgFilter} !important;
}
[role="dialog"] [class*="card"] {
	backdrop-filter: none !important;
}
/* 提问输入框（composer）：虚化开 = 半透明背景，透出模糊壁纸/经过的字。
   聊天框按 dialogBlur 单独设置（不随统一虚化） */
[data-composer-card] {
	background-color: color-mix(in srgb, #1b2233 42%, transparent) !important;
}
body:not([data-ds-dark-theme]) [data-composer-card] {
	background-color: color-mix(in srgb, #dde3ee 55%, transparent) !important;
}
/* 输入框背后区域（composerStack/seat）背景透明，让壁纸透到输入框背后 */
[data-slot*="composer"] [class*="stack"],
[data-slot*="composer"] [class*="Stack"],
[data-slot*="composer"] [class*="seat"],
[data-slot*="composer"] [class*="Seat"],
[class*="composerStack"],
[class*="composerSeat"] {
	background: transparent !important;
}
/* ⑤(修正) 输入框外围 seat：去掉白色渐变特效（用户反馈拉高不透明度时
   输入框附近出现白渐变、有边界、收起也延伸）。保持透明透出壁纸。 */
[data-slot*="composer"] [class*="seat"],
[data-slot*="composer"] [class*="Seat"] {
	backdrop-filter: none !important;
	background: transparent !important;
}
`;
			}
			// ②(新) 弹层虚化（菜单/提示/data-surface，独立于对话框）
			if (popoverBlur && popoverAmount > 0 && bdSupported) {
				const popFilter = `blur(${popoverAmount}px)`;
				css += `
/* ── 弹层虚化（菜单/下拉/提示/列表/悬浮面板，非居中窗口） ── */
[role="menu"],
[role="tooltip"],
[role="alert"],
[role="listbox"],
[role="combobox"],
[data-dsh-surface] {
	backdrop-filter: ${popFilter} !important;
	-webkit-backdrop-filter: ${popFilter} !important;
}
[role="menu"] [class*="card"],
[role="tooltip"] [class*="card"] {
	backdrop-filter: none !important;
}
`;
			}
			// ⑯ 虚化关 → 输入框纯白不透明（用户要求：关闭虚化则输入框不透明）
			if (hasImage && !(dialogBlur && dialogAmount > 0)) {
				css += `
[data-composer-card] {
	background-color: var(--dsw-alias-bg-base) !important;
	backdrop-filter: none !important;
	-webkit-backdrop-filter: none !important;
}
[data-slot*="composer"] [class*="seat"],
[data-slot*="composer"] [class*="Seat"] {
	background: transparent !important;
	backdrop-filter: none !important;
}
`;
			}
			// ⑯(新) 5 处未虚化区域补透明（DOM 研究确认的选择器）
			if (hasImage) {
				css += `
/* ── 5 处未虚化区域：背景透明透出（模糊的）壁纸 ── */
/* 区域1: 左上角品牌+新会话按钮（半透明，与侧边栏一致）。
   ③(修正) unify 开时随 sessionFollow（开=整屏 uAlpha，0px 时应透明无白底；关=面板不透明度） */
button[class*="newSession"] {
	background-color: color-mix(in srgb, var(--dsw-alias-button-elevated-fill) ${unifyTint ? (section.sessionFollow !== void 0 ? !!section.sessionFollow : DEFAULT_SESSION_FOLLOW) ? uAlpha : panel : panel}%, transparent) !important;
	border-color: color-mix(in srgb, var(--dsw-alias-border-l2) 65%, transparent) !important;
}
/* 区域4: 标题栏下方 1px 横线（header::after）去掉 */
.wSkVaW_header:after { display: none !important; }
/* 区域3: Cordis 面板（设置上方状态条，无 role=dialog）补虚化 + 半透明。
   ③(新) unify 开 → 与聊天区同色系（static 色），backdrop-filter 取消（整屏磨砂接管） */
[data-cordis-panel] {
	backdrop-filter: ${unifyTint ? "none" : blurFilter} !important;
	-webkit-backdrop-filter: ${unifyTint ? "none" : blurFilter} !important;
	background-color: ${unifyTint
		? `color-mix(in srgb, var(--dsw-static-neutral-bluish-950) ${U(62)}%, transparent)`
		: `color-mix(in srgb, var(--dsw-alias-bg-base) ${U(62)}%, transparent)`} !important;
}
${unifyTint ? `body:not([data-ds-dark-theme]) [data-cordis-panel] {
	background-color: color-mix(in srgb, var(--dsw-static-neutral-bluish-00) ${U(62)}%, transparent) !important;
}` : ""}
[data-cordis-panel] [class*="row"] {
	background-color: ${unifyTint
		? `color-mix(in srgb, var(--dsw-static-neutral-bluish-950) ${U(55)}%, transparent)`
		: `color-mix(in srgb, var(--dsw-alias-bg-base) ${U(55)}%, transparent)`} !important;
}
${unifyTint ? `body:not([data-ds-dark-theme]) [data-cordis-panel] [class*="row"] {
	background-color: color-mix(in srgb, var(--dsw-static-neutral-bluish-00) ${U(55)}%, transparent) !important;
}` : ""}
/* 区域5: 侧边栏收起后 rail 右缘 1px 接缝透明 */
[data-sidebar-collapsed] .pI_x6G_sidebarCol { border-right-color: transparent !important; }
[data-sidebar-collapsed] [class*="sidebarCol"] { border-right-color: transparent !important; }
/* 区域5b: 收起后 rail 内部面（logoRow/newSession/footArea）透出模糊壁纸：
   同样不加 backdrop-filter（root 是弹层祖先，会困住 fixed 弹层） */
[data-sidebar-collapsed] [class*="root"] {
	background-color: transparent !important;
}
/* ②(重做) 遮罩虚化独立（maskBlur/maskAmount）：设置/弹层打开时全屏背景遮罩的虚化，
   与对话框虚化、弹层虚化分开控制。匹配所有 [class*="mask"]。 */
[class*="mask"] {
	backdrop-filter: ${(maskBlur && maskAmount > 0 && bdSupported) ? `blur(${maskAmount}px)` : "none"} !important;
	-webkit-backdrop-filter: ${(maskBlur && maskAmount > 0 && bdSupported) ? `blur(${maskAmount}px)` : "none"} !important;
}
`;
			}
			if (thinkBg) {
				// 开关开：恢复 Deep diving 背景方框 + 虚化 + 蓝色文字
				// （方框=渐变背景，浏览器未生效 background-clip:text 时显示为方框；
				//   生效时渐变只在文字上=蓝色文字；backdrop-filter 虚化方框背后的壁纸）
				const dlgFilter2 = dialogBlur && dialogAmount > 0 ? `blur(${dialogAmount}px)` : "blur(12px)";
				css += `
/* Deep diving 背景方框（开关：开）→ 方框 + 虚化 + 蓝字 */
[data-variant="think"] { background: var(--dsw-alias-bg-base) !important; }
[role="status"] {
	background: linear-gradient(90deg, var(--dsw-static-deepseek-500) 0%, var(--dsw-static-deepseek-500) 40%, var(--dsw-static-deepseek-200) 50%, var(--dsw-static-deepseek-500) 60%, var(--dsw-static-deepseek-500) 100%) !important;
	-webkit-background-clip: text !important; background-clip: text !important;
	color: transparent !important; -webkit-text-fill-color: transparent !important;
	backdrop-filter: ${dlgFilter2} !important;
	-webkit-backdrop-filter: ${dlgFilter2} !important;
}
`;
			} else {
				// 开关关（默认）：取消 Deep diving 背景方框，文字显示在壁纸上
				css += `
/* Deep diving 背景方框（开关：关）→ 透明 + 文字可见色 */
[data-variant="think"] { background: transparent !important; }
[data-variant="think"] [class*="thinkBody"] { background: transparent !important; }
[role="status"] {
	background: transparent !important;
	backdrop-filter: none !important;
	-webkit-backdrop-filter: none !important;
	color: var(--dsw-alias-label-secondary, #9aa4b2) !important;
	-webkit-text-fill-color: var(--dsw-alias-label-secondary, #9aa4b2) !important;
	-webkit-background-clip: border-box !important;
	background-clip: border-box !important;
}
`;
			}
			css += `
@supports not (backdrop-filter: blur(1px)) {
	.hHd-Xa_regionArea, .wSkVaW_scrollBody, .ydkMvW_body { backdrop-filter: none !important; }
}
`;
			return css + buildUiCss();
		}

		/** 设置页 UI 样式（与背景模式无关，公共部分）。 */
		function buildUiCss() {
			return `
/* ── 设置页 UI ── */
.mpw_row { display: flex; flex-direction: column; gap: 10px; padding: 4px 0; max-width: 720px; }
.mpw_title { font-size: 16px; line-height: 24px; font-weight: 600; color: var(--dsw-alias-label-primary); }
.mpw_desc { font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-tertiary); margin: 0; }
/* ⑤(重做) 分组排版：大分组标题用背景块区分（不再只是一条线，一眼分清分组） */
.mpw_section {
	margin: 16px 0 6px; padding: 7px 12px;
	border-radius: 10px;
	background: color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent);
	font-size: 13px; line-height: 20px; font-weight: 600;
	color: var(--dsw-alias-label-primary); letter-spacing: 0.02em;
}
.mpw_section:first-of-type { margin-top: 10px; }
.mpw_field { display: flex; flex-direction: column; gap: 6px; padding: 8px 4px; border-top: 1px solid color-mix(in srgb, var(--dsw-alias-border-l2) 45%, transparent); }
.mpw_label { font-size: 13px; line-height: 20px; font-weight: 500; color: var(--dsw-alias-label-secondary); }
.mpw_inline { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.mpw_input {
	flex: 1; min-width: 0; height: 34px; padding: 0 10px; box-sizing: border-box;
	border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px;
	background: var(--dsw-alias-bg-module-platform); color: var(--dsw-alias-label-primary);
	font: inherit; font-size: 13px;
}
.mpw_button {
	flex: none; height: 34px; padding: 0 14px; border: 1px solid rgba(255,255,255,0.25); border-radius: 10px;
	background: #3964fe !important; color: #ffffff !important;
	font: inherit; font-size: 13px; cursor: pointer; outline: none;
}
.mpw_button:hover { filter: brightness(1.08); }
.mpw_button:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary, #7aa2ff); outline-offset: 2px; }
.mpw_fileBtn, .mpw_reset {
	align-self: flex-start; height: 32px; padding: 0 14px; border-radius: 10px;
	border: 1px solid var(--dsw-alias-border-l2); background: transparent;
	color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; cursor: pointer;
}
.mpw_fileBtn:hover, .mpw_reset:hover { background: var(--dsw-alias-interactive-bg-hover); }
.mpw_slider { flex: 1; min-width: 0; }
.mpw_numInput {
	flex: none; width: 76px; height: 30px; padding: 0 8px; box-sizing: border-box;
	border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px;
	background: var(--dsw-alias-bg-module-platform); color: var(--dsw-alias-label-primary);
	font: inherit; font-size: 12px; text-align: right;
}
/* ④(修正) 输入框聚焦：去掉浏览器默认黄/蓝 outline，灰框→主题深色框（与设置页其他输入框一致） */
.mpw_input:focus, .mpw_numInput:focus {
	outline: none !important;
	border-color: var(--dsw-alias-label-primary) !important;
	box-shadow: 0 0 0 1px var(--dsw-alias-label-primary);
}
.mpw_value {
	flex: none; text-align: right; font-size: 13px; padding-left: 2px;
	color: var(--dsw-alias-label-secondary); font-variant-numeric: tabular-nums;
}
/* ③(新) 滑条旁「默认」小按钮 */
.mpw_miniBtn {
	flex: none; height: 28px; padding: 0 10px; border-radius: 8px;
	border: 1px solid var(--dsw-alias-border-l2); background: transparent;
	color: var(--dsw-alias-label-secondary); font: inherit; font-size: 12px; cursor: pointer;
}
.mpw_miniBtn:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.mpw_hint { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary); margin: 0; }
/* ④(新) 导入失败/错误提示：红色醒目，不再一闪而过看不清 */
.mpw_hint.mpw_err { color: #ff6b6b; font-weight: 500; }
.mpw_info { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); margin: 0; }
.mpw_props { display: flex; flex-direction: column; gap: 6px; padding: 8px; border-radius: 8px; background: var(--dsw-alias-bg-module-platform); }
.mpw_prop { display: flex; flex-direction: column; gap: 4px; padding: 6px 0; }
.mpw_propLabel { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary); }
.mpw_propLabel b { color: var(--dsw-alias-label-secondary); font-weight: 500; }
.mpw_check { display: flex; align-items: center; gap: 8px; }
.mpw_check input { accent-color: var(--dsw-alias-brand-primary, #3964fe); }
/* ② 左右滑动式开关 */
.mpw_switch {
	flex: none; width: 40px; height: 22px; padding: 0; border-radius: 11px;
	border: 1px solid color-mix(in srgb, var(--dsw-alias-label-primary) 14%, transparent);
	background: color-mix(in srgb, var(--dsw-alias-label-primary) 16%, transparent);
	position: relative; cursor: pointer; transition: background .15s ease; outline: none;
}
.mpw_switch::after {
	content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px;
	border-radius: 50%; background: var(--dsw-alias-label-primary);
	box-shadow: 0 1px 2px rgba(0,0,0,0.35); transition: left .15s ease;
}
.mpw_switch.mpw_on { background: var(--dsw-alias-brand-primary, #3964fe); border-color: transparent; }
.mpw_switch.mpw_on::after { left: 20px; background: #fff; }
.mpw_switch:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary, #7aa2ff); outline-offset: 2px; }
/* ⑥ 纯展示性条目 */
.mpw_static { padding: 2px 0; }
.mpw_important { border-left: 2px solid var(--dsw-alias-brand-primary, #3964fe); padding-left: 8px; }
.mpw_static .mpw_propLabel { color: var(--dsw-alias-label-secondary); }
/* ④ 展开/收起 */
.mpw_moreBtn { align-self: flex-start; }
.mpw_propInput {
	height: 30px; padding: 0 8px; box-sizing: border-box; max-width: 260px;
	border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px;
	background: var(--dsw-alias-bg-module-platform); color: var(--dsw-alias-label-primary);
	font: inherit; font-size: 12px;
}
.mpw_propSlider { flex: 1; min-width: 120px; max-width: 260px; }
.mpw_tag { font-size: 11px; line-height: 16px; padding: 1px 6px; border-radius: 6px; background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,0.15)); color: var(--dsw-alias-label-tertiary); }
/* ⑥ 设置导航图标：隐藏默认齿轮，显示自定义图标 */
.VOzbGW_navList button:has(.mpw_navIconImg) .VOzbGW_navIcon { display: none !important; }
.mpw_navIconImg {
	width: 16px; height: 16px; flex: none; vertical-align: -3px; margin-right: 8px;
	border-radius: 4px; object-fit: cover;
	background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
}
/* ④ 冲突确认弹窗 */
.mpw_mask {
	position: fixed; inset: 0; z-index: 3000;
	background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center;
}
.mpw_dialog {
	width: min(420px, calc(100vw - 48px)); box-sizing: border-box;
	/* ①(修正) 弹窗背景不透明：layer-2 token 会被本插件的虚化 override 半透明化，
	   导致弹窗透出壁纸；改用主题静态色（亮=白 / 暗=深）保证内容清晰 */
	background: var(--dsw-static-neutral-bluish-950);
	border: 1px solid var(--dsw-alias-border-l2);
	border-radius: 16px; padding: 20px; box-shadow: var(--dsw-shadow-lv3, 0 12px 40px rgba(0,0,0,.35));
	display: flex; flex-direction: column; gap: 12px;
}
body:not([data-ds-dark-theme]) .mpw_dialog {
	background: var(--dsw-static-neutral-bluish-00);
}
`;
		}

		// ═══════════════════════════════════════════════════════════════════
		//  冲突检测（④：同时装了其他壁纸/主题插件时自动关闭本功能）
		// ═══════════════════════════════════════════════════════════════════
		const CONFLICT_IDS = [
			"@local/dsh-bg-image", "dsh-bg-image", "dsh-skin", "dsh-dream-skin",
			"dsh-wallpaper-rotator", "dsh_web_client_theme_switcher",
			"@local/dsh-ui-preset-enhance", "ui-theme-switcher", "theme-switcher"
		];
		// P1④(新) 皮肤类插件的 body 属性签名（各 skin.json 的 bodyAttr）：
		// 皮肤启用后在 <body> 打 data-* 属性，比扫 [data-plugin] 更直接
		const CONFLICT_BODY_ATTRS = [
			"data-dsh-aurora", "data-dsh-whale-song", "data-dsh-skin",
			"data-dsh-ui-skin", "data-dsh-theme", "data-skin"
		];
		function detectConflicts() {
			const found = [];
			try {
				const els = document.querySelectorAll ? document.querySelectorAll("[data-plugin]") : [];
				els.forEach((el) => {
					const id = (el.getAttribute && el.getAttribute("data-plugin")) || "";
					if (id && CONFLICT_IDS.some((c) => id.indexOf(c) >= 0 || c.indexOf(id) >= 0)) {
						if (found.indexOf(id) < 0) found.push(id);
					}
				});
			} catch {}
			// ⑪(新) 运行时检测：其他插件往 body/html 设了背景图，或存在其他全屏背景层
			try {
				const bodyBg = document.body ? getComputedStyle(document.body).backgroundImage : "none";
				if (bodyBg && bodyBg !== "none") found.push("body-background");
				const htmlBg = getComputedStyle(document.documentElement).backgroundImage;
				if (htmlBg && htmlBg !== "none") found.push("html-background");
			} catch {}
			// P1④(新) 皮肤类插件的 body 属性签名检测（data-dsh-aurora 等）
			try {
				if (document.body) {
					CONFLICT_BODY_ATTRS.forEach((attr) => {
						if (document.body.hasAttribute(attr)) found.push(attr);
					});
				}
			} catch {}
			try {
				document.querySelectorAll("body > *").forEach((el) => {
					if (el.classList && el.classList.contains("mpw-bgWrap")) return; // 自己的壁纸层
					const cs = getComputedStyle(el);
					const z = Number(cs.zIndex);
					if (cs.position === "fixed" && isFinite(z) && z < 0) {
						found.push("fullscreen-bg:" + ((el.className && String(el.className)) || el.tagName));
					}
				});
			} catch {}
			return Array.from(new Set(found));
		}

		// ═══════════════════════════════════════════════════════════════════
		//  视频纹理（tex 内嵌 MP4）：提取 + 时间槽识别
		// ═══════════════════════════════════════════════════════════════════
		/** 检查 tex 前 4KB 是否有 MP4 魔数（ftyp）。 */
		function texHasVideo(bytes) {
			const n = Math.min(65536, bytes.length - 4);
			for (let i = 0; i < n; i++) {
				if (bytes[i] === 0x66 && bytes[i+1] === 0x74 && bytes[i+2] === 0x79 && bytes[i+3] === 0x70) return true;
			}
			return false;
		}
		/** 从 tex 前部找内嵌 MP4 的偏移（ftyp-4）；找不到返回 null。 */
		function extractTexVideoOffset(bytes) {
			const n = Math.min(65536, bytes.length - 4);
			for (let i = 0; i < n; i++) {
				if (bytes[i] === 0x66 && bytes[i+1] === 0x74 && bytes[i+2] === 0x79 && bytes[i+3] === 0x70) {
					const start = i - 4;
					return start >= 0 ? start : null;
				}
			}
			return null;
		}
		/** 从 tex 提取内嵌 MP4（从 ftyp-4 到结尾）。 */
		function extractTexVideo(bytes) {
			const off = extractTexVideoOffset(bytes);
			return off === null ? null : bytes.slice(off);
		}
		/** 由纹理名识别时间槽：清晨/白天/黄昏/夜晚 或 morning/day/dusk/night。 */
		function slotFromName(name) {
			const n = name.toLowerCase();
			if (/清晨|morning/.test(n)) return "morning";
			if (/白天|^day|day[^n]/.test(n)) return "day";
			if (/黄昏|dusk/.test(n)) return "dusk";
			if (/夜晚|night/.test(n)) return "night";
			return null;
		}
		/** 从 project.json 属性读时间配置（含已编辑值）。 */
		function timeConfigFromProps(props, propEdits) {
			const get = (k, def) => {
				if (propEdits && propEdits[k] !== void 0) return Number(propEdits[k]);
				if (props && props[k] && props[k].value !== void 0) return Number(props[k].value);
				return def;
			};
			return {
				enabled: get("timevarying", 1) !== 0,
				morning: get("morningtime", 4),
				day: get("daytime", 9),
				dusk: get("dusktime", 17),
				night: get("nighttime", 20)
			};
		}
		/** 按时间配置 + 当前时间算时间槽。 */
		function slotForTime(cfg, date) {
			const h = date.getHours();
			if (h >= cfg.morning && h < cfg.day) return "morning";
			if (h >= cfg.day && h < cfg.dusk) return "day";
			if (h >= cfg.dusk && h < cfg.night) return "dusk";
			return "night";
		}

		// ═══════════════════════════════════════════════════════════════════
		//  安全加固（③）：文件类型嗅探 + URL 协议白名单 + 属性键过滤
		// ═══════════════════════════════════════════════════════════════════
		/** 读文件头判断真实类型；未知/可疑（SVG/HTML/脚本等）返回 null。 */
		function sniffFileType(file) {
			return new Promise((resolve) => {
				try {
					const reader = new FileReader();
					reader.onload = () => {
						try {
							const bytes = new Uint8Array(reader.result, 0, 16);
							const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join(" ");
							const ascii = String.fromCharCode(...bytes.slice(0, 8));
							if (hex.indexOf("89 50 4e 47") === 0) return resolve("png");
							if (ascii.indexOf("GIF8") === 0) return resolve("gif");
							if (hex.indexOf("ff d8 ff") === 0) return resolve("jpeg");
							if (ascii.indexOf("RIFF") === 0 && ascii.indexOf("WEBP") > 0) return resolve("webp");
							if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) return resolve("mp4"); // ....ftyp
							if (hex.indexOf("1a 45 df a3") === 0) return resolve("webm"); // Matroska/WebM
							// mpkg：头部 version_length(u32 LE) + "PKGM"
							const vl = bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);
							if (vl > 0 && vl < 64 && ascii.indexOf("PKGM") === 4) return resolve("mpkg");
							resolve(null);
						} catch { resolve(null); }
					};
					reader.onerror = () => resolve(null);
					reader.readAsArrayBuffer(file.slice(0, 16));
				} catch { resolve(null); }
			});
		}
		/** URL 协议白名单：仅 http(s) 与 data:image。 */
		function sanitizeImageUrl(value) {
			const v = String(value || "").trim();
			if (/^https?:\/\//i.test(v)) return v;
			if (/^data:image\//i.test(v)) return v;
			return null;
		}
		/** 属性键安全：禁止原型污染相关键。 */
		function safePropKey(key) {
			return key !== "__proto__" && key !== "constructor" && key !== "prototype";
		}

		// ═══════════════════════════════════════════════════════════════════
		//  设置页组件（settings.section：出现在设置左侧导航，⑤）
		// ═══════════════════════════════════════════════════════════════════
		/** 左右滑动式开关（②：不用打勾的 checkbox）。 */
		function Toggle({ checked, onChange, disabled }) {
			const h = react.createElement;
			return h("button", {
				type: "button",
				role: "switch",
				"aria-checked": !!checked,
				disabled: !!disabled,
				className: "mpw_switch" + (checked ? " mpw_on" : ""),
				onClick: () => onChange(!checked)
			});
		}

		function MpkgSection(props) {
			try {
			const { t } = props;
			const initMeta = (() => {
				const s = readSection();
				if (s.fromMpkg && s.mpkgKey && s.info) return { name: s.mpkgName, key: s.mpkgKey, info: s.info, entryName: s.source || "preview.gif", slot: s.slot };
				return null;
			})();
			const [section, setSection] = react.useState(readSection());
			const [mpkgMeta, setMpkgMeta] = react.useState(initMeta); // { name, key, info, entryName, slot }
			const [busy, setBusy] = react.useState(false);
			const [hint, setHint] = react.useState("");
			const [url, setUrl] = react.useState("");
			const [propsExpanded, setPropsExpanded] = react.useState(false);
			const [conflictModal, setConflictModal] = react.useState(false);
			const [previewModal, setPreviewModal] = react.useState(false);
			const [errorModal, setErrorModal] = react.useState(false);
			const [errorMsg, setErrorMsg] = react.useState("");
			const [conflicts, setConflicts] = react.useState([]);
			// ①(新) 统一错误弹窗：导入失败/文件过大/无法使用等提示全部弹窗体现
			const showError = (msg) => { setErrorMsg(String(msg)); setErrorModal(true); setHint(String(msg)); };
			const mpkgRef = react.useRef(null);
			const imgRef = react.useRef(null);

			// ④ 初始冲突检测（设置页打开时其他插件都已加载）
			react.useEffect(() => {
				setConflicts(detectConflicts());
			}, []);

			// ④ 总开关：开启时若有冲突 → 弹窗确认
			const onMaster = (v) => {
				if (v && conflicts.length && !section.forceEnabled) {
					setConflictModal(true);
					return;
				}
				commit({ enabled: v }, true);
			};
			const confirmEnable = () => {
				setConflictModal(false);
				commit({ enabled: true, forceEnabled: true }, true);
				setConflicts(detectConflicts());
			};

			const commit = (patch, instant) => {
				const next = Object.assign({}, readSection(), patch);
				writeSection(next, instant);
				setSection(next);
				applyFromStorage();
				return next;
			};

			// ① 恢复默认：只重置外观数值，不清除已导入的壁纸
			const resetSettings = () => {
				const s = readSection();
				const keep = {
					image: s.image, source: s.source, mpkgKey: s.mpkgKey, mpkgName: s.mpkgName,
					info: s.info, slot: s.slot, fromMpkg: s.fromMpkg, converted: s.converted,
					propEdits: s.propEdits, forceEnabled: s.forceEnabled
				};
				writeSection(Object.assign({}, keep, {
					opacity: DEFAULT_OPACITY, blur: DEFAULT_BLUR, zoom: DEFAULT_ZOOM,
					sidebar: DEFAULT_SIDEBAR, sharp: DEFAULT_SHARP,
					headerBlur: DEFAULT_HEADER, headerBg: DEFAULT_HEADER_BG, headerBlurAmount: DEFAULT_HEADER_BLUR_AMOUNT,
					dialogBlur: DEFAULT_DIALOG_BLUR, dialogAmount: DEFAULT_DIALOG_AMOUNT,
					popoverBlur: DEFAULT_POPOVER_BLUR, popoverAmount: DEFAULT_POPOVER_AMOUNT,
					maskBlur: DEFAULT_MASK_BLUR, maskAmount: DEFAULT_MASK_AMOUNT,
					unifyTint: DEFAULT_UNIFY_TINT, unifyAmount: DEFAULT_UNIFY_AMOUNT, chatFollow: DEFAULT_CHAT_FOLLOW, sessionFollow: DEFAULT_SESSION_FOLLOW,
					thinkBg: DEFAULT_THINK_BG,
					enabled: DEFAULT_ENABLED
				}), true);
				setSection(readSection());
				applyFromStorage();
			};
			// ① 清除已导入的壁纸（保留外观数值）
			const clearBg = () => {
				idbDel("bg");
				const s = readSection();
				writeSection(Object.assign({}, s, { image: "", source: "", fromMpkg: false, converted: "", mpkgKey: "", mpkgName: "", info: undefined, slot: null }), true);
				setSection(readSection());
				setMpkgMeta(null);
				applyFromStorage();
			};

			const onMpkg = async (e) => {
				const file = e.target.files && e.target.files[0];
				e.target.value = "";
				if (!file) return;
				// ③ 安全：先嗅探真实类型，拒绝 SVG/HTML/任意可执行内容
				const type = await sniffFileType(file);
				if (!type) { showError(t("file.unsafe")); return; }
				// ② 选择器静默兼容 mp4/视频：直接作为视频背景，界面不宣传
				if (type === "mp4" || type === "webm") {
					if (file.size > 100 * 1024 * 1024) { showError(t("file.tooLarge")); return; }
					setHint("");
					storeVideoBlob(file).then((marker) => commit({ image: marker, source: file.name }, true));
					return;
				}
				if (type !== "mpkg") { showError(t("file.unsafe")); return; }
				// ⑨(新) 整体大小上限：超大 mpkg（>600MB）移动端浏览器几乎无法处理，直接提示
				if (file.size > 600 * 1024 * 1024) { showError(t("mpkg.huge")); return; }
				setBusy(true);
				setHint("");
				try {
					// ③(重做) 按需读取：只读文件前部（头部+条目头，通常 <2MB）解析容器，
					// 条目数据（preview/视频纹理/project.json）用 file.slice 按需单独读。
					// 424MB 大包不再整体 arrayBuffer 进内存（移动端会 OOM 崩溃）。
					const HEAD_BYTES = 2 * 1024 * 1024;
					const headBuf = await file.slice(0, Math.min(file.size, HEAD_BYTES)).arrayBuffer();
					const mpkg = parseMpkg(headBuf);
					const readEntry = async (entry, limit, offset) => {
						const off = offset || 0;
						const len = limit ? Math.min(entry.size - off, limit) : entry.size - off;
						if (len <= 0) return new Uint8Array(0);
						return new Uint8Array(await file.slice(mpkg.dataStart + entry.index + off, mpkg.dataStart + entry.index + off + len).arrayBuffer());
					};
					const readEntryHead = (entry) => readEntry(entry, 65536);
					// 时间变化：扫描视频纹理（tex 内嵌 MP4），按壁纸时间设置选当前时段
					const vtex = [];
					for (const e of mpkg.entries) {
						// ①(修正) 视频纹理候选排除规则（基于语义，非特定壁纸）：
						// - 抠像层：蓝幕/绿幕/抠像（只有人物，透明背景，不能当主背景）
						// - 入场动画：入场/开场/intro/entry animation（短开场，循环主背景才是要的）
						// ② 只把大尺寸视频纹理当主背景
						if (e.name.endsWith(".tex") && e.size > 5 * 1024 * 1024
							&& !/蓝幕|绿幕|bluescreen|greenscreen|chroma|keying|抠像/i.test(e.name)
							&& !/入场|开场|intro|entry\s*animation|entryanimation/i.test(e.name)) {
							const head = await readEntryHead(e);
							if (texHasVideo(head)) vtex.push(e);
						}
					}
					if (vtex.length) {
						const ok = await handleVideoTexes(mpkg, vtex, file, t, showError, readEntry);
						if (ok) {
							// ③(修正) 视频纹理导入成功后也要更新名称/素材显示（原来 setMpkgMeta(null)
							// 导致导入后元数据不刷新，需清壁纸或重复导入才更新）
							const s2 = readSection();
							setMpkgMeta(s2.fromMpkg && s2.mpkgKey && s2.info
								? { name: s2.mpkgName, key: s2.mpkgKey, info: s2.info, entryName: s2.source || "preview.gif", slot: s2.slot }
								: null);
							setBusy(false);
							return;
						}
						// ⑨(新) 视频纹理无法提取 → 回退到 preview.gif（继续走下方图片路径）
					}
					let pick = pickBackgroundEntry(mpkg.entries, new Date());
					let entry = pick.entry, slot = pick.slot;
					if (!entry) { showError(t("mpkg.noAsset")); return; }
					let stored = null;
					let isVideo = false;
					const isMp4 = /\.(mp4|webm|mov)$/i.test(entry.name);
					// ② 修复：内嵌 mp4/mov（视频类壁纸）直接作为视频背景
					if (isMp4 && entry.size <= 600 * 1024 * 1024) {
						// ⑤(重做) 独立 mp4：file.slice 直接创建 Blob（懒引用，不读入 JS 内存）。
						// 洛茜系列是 260-445MB 的独立 mp4 壁纸，原 readEntry(arrayBuffer) 会 OOM；
						// Blob 引用文件区域，JS 内存峰值低，可尝试大视频（上限 600MB）
						const vblob = file.slice(mpkg.dataStart + entry.index, mpkg.dataStart + entry.index + entry.size, guessMime(entry.name));
						stored = await storeVideoBlob(vblob);
						isVideo = true;
					} else if (isMp4) {
						// ⑥(新) 超大独立视频（>600MB，如 zmd_01 的 747MB mp4）：
						// 存储配额/播放内存都不可行 → 自动回退 preview 图片（至少能用上壁纸）
						const imgPick = pickBackgroundEntry(mpkg.entries.filter((e) => !/\.(mp4|webm|mov)$/i.test(e.name)), new Date());
						if (!imgPick || !imgPick.entry) { showError(t("mpkg.videoHuge")); return; }
						entry = imgPick.entry; slot = imgPick.slot;
						let bytes = await readEntry(entry);
						if (/\.gif$/i.test(entry.name)) bytes = ensureInfiniteGif(bytes.slice());
						const blob = new Blob([bytes], { type: guessMime(entry.name) });
						if (blob.size > 200 * 1024 * 1024) { showError(t("mpkg.tooLarge")); return; }
						stored = await storeImageBlob(blob);
						isVideo = false;
						setHint(t("mpkg.videoHuge"));
					} else {
						// 图片/GIF
						let bytes = await readEntry(entry);
						if (/\.gif$/i.test(entry.name)) bytes = ensureInfiniteGif(bytes.slice());
						const blob = new Blob([bytes], { type: guessMime(entry.name) });
						// ③(新) 大图片走 Blob 存储（idb:img），不走 dataURL（防膨胀爆内存）；
						// 上限 50MB → 200MB（大壁纸包预览图经常很大）
						if (blob.size > 200 * 1024 * 1024) { setHint(t("mpkg.tooLarge")); return; }
						stored = await storeImageBlob(blob);
					}
					const info = await extractProjectInfoAsync(mpkg.entries, readEntry);
					const key = file.name + "|" + file.size;
					const meta = { name: file.name, key, info, entryName: entry.name, slot };
					commit({
						image: stored, source: entry.name, mpkgKey: key, mpkgName: file.name,
						info: { title: info ? info.title : "", properties: info ? info.properties : [] },
						slot: slot || null, fromMpkg: true, converted: isVideo ? "mp4" : "gif",
						// ⑦(修正) 非视频纹理壁纸不带时间变化：清掉上一个壁纸残留的时段配置
						timeVideos: undefined, timeConfig: undefined, activeSlot: null
					}, true);
					setMpkgMeta(meta);
					// ①(修正) 视频→图片切换：强制清掉背景内容缓存，确保新壁纸立即显示
					try { lastBgSig = null; } catch {}
					// ⑨(修正) 回退成功时清掉 vtexBig 提示（不再残留红色报错）
					// ⑤(新) 图片路径 = 预览模式提示：浏览器只能显示预览图，动态内容需 App 渲染
					setHint((slot ? t("time.picked") + "：" + t("time." + slot) + " · " : "") + t("mpkg.previewMode"));
					// ②(新) 预览模式弹窗（识别到最终用 GIF/图片时弹出）
					try { setPreviewModal(true); } catch {}
				} catch (err) {
					console.error("[dsh-mpkg-wallpaper] onMpkg 失败:", err);
					// ⑨(新) 报错友好化：区分存储配额不足 / 内存不足 / 解析失败
					const en = err && err.name;
					const em = String(err && err.message || err);
					showError(en === "QuotaExceededError"
						? t("mpkg.quota")
						: /memory|allocat|out of|ArrayBuffer|too large/i.test(em)
							? t("mpkg.oom")
							: t("mpkg.fail") + em);
				} finally {
					setBusy(false);
				}
			};

			const onMedia = async (e) => {
				const file = e.target.files && e.target.files[0];
				e.target.value = "";
				if (!file) return;
				// ③ 安全：先嗅探真实类型，拒绝 SVG/HTML 等
				const type = await sniffFileType(file);
				if (!type || (type !== "png" && type !== "gif" && type !== "jpeg" && type !== "webp" && type !== "mp4" && type !== "webm")) {
					setHint(t("file.unsafe"));
					return;
				}
				if (file.size > 100 * 1024 * 1024) { setHint(t("file.tooLarge")); return; }
				setMpkgMeta(null);
				if (type === "mp4" || type === "webm") {
					// ① 视频背景：存入 IndexedDB，<video> 循环播放
					setHint("");
					storeVideoBlob(file).then((marker) => commit({ image: marker, source: file.name }, true));
					return;
				}
				// ③(新) 图片：>2MB 直接存 Blob（idb:img，防 dataURL 膨胀）；小图走 dataURL
				setHint("");
				storeImageBlob(file).then((stored) => commit({ image: stored, source: file.name }, true));
			};

			const applyUrl = () => {
				const safe = sanitizeImageUrl(url);
				if (!safe) { setHint(t("url.unsafe")); return; }
				setMpkgMeta(null);
				commit({ image: safe, source: "url", fromMpkg: false }, true);
			};


			const propEdits = (section.propEdits && section.propEdits[section.mpkgKey]) || {};
			const setProp = (key, value) => {
				const key2 = section.mpkgKey;
				if (!key2 || !safePropKey(key)) return;
				const edits = Object.assign({}, propEdits, { [key]: value });
				const propEditsAll = Object.assign({}, section.propEdits || {}, { [key2]: edits });
				commit({ propEdits: propEditsAll }, true);
			};
			const allProps = mpkgMeta && mpkgMeta.info ? mpkgMeta.info.properties.slice() : [];
			// ④ 随现实时间变化关闭时，隐藏时间设置（清晨/白天/黄昏/夜晚开始时间 + 时间段选择）
			const tvProp = allProps.find((p) => /随现实时间|timevarying|real time/.test(p.label + " " + p.key));
			const tvEnabled = tvProp ? (propEdits[tvProp.key] !== void 0 ? !!propEdits[tvProp.key] : !!tvProp.value) : true;
			const TIME_KEYS = new Set(["morningtime", "daytime", "dusktime", "nighttime", "display"]);
			// ④(重做) 参数渲染暂不可用（浏览器显示的是预渲染素材，改了不生效）：
			// 默认全部折叠，只显示「展开全部」按钮；点击展开后只读展示全部参数。
			const propsShown = tvEnabled ? allProps : allProps.filter((p) => !TIME_KEYS.has(p.key));
			const propsToShow = propsExpanded ? propsShown : [];

			const h = react.createElement;
			const sliderRow = (label, field, min, max, suffix, step, def) => {
				const val = section[field] !== void 0 ? section[field] : def;
				const rangeRef = react.useRef(null);
				const numRef = react.useRef(null);
				const timer = react.useRef(null);
				const rafRef = react.useRef(null);
				const dragging = react.useRef(false);
				const fmt = (v) => (Number.isInteger(v) ? String(v) : String(Number(v.toFixed(2))));
				const apply = (v) => {
					let n = Number(v);
					if (isNaN(n)) return;
					n = Math.max(min, Math.min(max, n));
					if (rangeRef.current && String(rangeRef.current.value) !== String(n)) rangeRef.current.value = n;
					if (numRef.current && String(numRef.current.value) !== String(fmt(n))) numRef.current.value = fmt(n);
					previewCss(Object.assign({ [field]: n }, dragging.current ? { _noBlur: true } : {}));
					if (timer.current) clearTimeout(timer.current);
					timer.current = setTimeout(() => commit({ [field]: n }), 350);
				};
				// ⑤ 外部值变化（恢复默认等）时同步滑杆与数值框
				react.useEffect(() => {
					if (dragging.current) return;
					if (rangeRef.current && String(rangeRef.current.value) !== String(val)) rangeRef.current.value = val;
					if (numRef.current && String(numRef.current.value) !== String(fmt(val))) numRef.current.value = fmt(val);
				});
				const onRangeInput = (ev) => {
					dragging.current = true;
					const v = Number(ev.target.value);
					if (numRef.current) numRef.current.value = fmt(v);
					if (rafRef.current) cancelAnimationFrame(rafRef.current);
					rafRef.current = requestAnimationFrame(() => { previewCss(Object.assign({ [field]: v }, { _noBlur: true })); });
					if (timer.current) clearTimeout(timer.current);
					timer.current = setTimeout(() => { commit({ [field]: v }); }, 350);
				};
				const onNumInput = (ev) => {
					dragging.current = true;
					if (timer.current) clearTimeout(timer.current);
					// 清洗：只留数字和一个小数点；禁科学计数法(e/E/±)、限长 7 位、最多 2 位小数
					let raw = ev.target.value;
					raw = raw.replace(/[^0-9.]/g, "");
					const dot = raw.indexOf(".");
					if (dot >= 0) {
						raw = raw.slice(0, dot + 1) + raw.slice(dot + 1).replace(/\./g, "").slice(0, 2);
					}
					if (raw.length > 7) raw = raw.slice(0, 7);
					if (numRef.current && numRef.current.value !== raw) numRef.current.value = raw;
					// 空/非法输入：不提交，等失焦收敛
					if (raw === "" || raw === "." || isNaN(Number(raw))) return;
					const c = Math.max(min, Math.min(max, Number(raw)));
					if (rangeRef.current) rangeRef.current.value = c;
					previewCss(Object.assign({ [field]: c }, { _noBlur: true }));
					timer.current = setTimeout(() => commit({ [field]: c }), 500);
				};
				const onNumBlur = (ev) => {
					dragging.current = false;
					if (timer.current) { clearTimeout(timer.current); timer.current = null; }
					const raw = numRef.current ? numRef.current.value : "";
					let n = Number(raw);
					if (raw === "" || isNaN(n)) n = val;
					n = Math.max(min, Math.min(max, n));
					// 失焦时收敛并写回输入框
					if (numRef.current) numRef.current.value = fmt(n);
					apply(n);
				};
				const endDrag = () => {
					dragging.current = false;
					if (rafRef.current) cancelAnimationFrame(rafRef.current);
					previewCss({});
				};
				return h("div", { className: "mpw_field" }, [
					h("label", { className: "mpw_label" }, label),
					h("div", { className: "mpw_inline" }, [
						h("input", {
							ref: rangeRef,
							className: "mpw_slider", type: "range", min, max, step: step || 1,
							defaultValue: val, onInput: onRangeInput,
							onPointerDown: () => { dragging.current = true; },
							onPointerUp: endDrag,
							onPointerCancel: endDrag,
							onKeyUp: endDrag
						}),
						h("input", {
							ref: numRef,
							className: "mpw_numInput", type: "text", inputMode: "decimal", autoComplete: "off",
							defaultValue: fmt(val),
							onInput: onNumInput,
							onBlur: onNumBlur,
							onKeyDown: (ev) => {
								// 双保险：直接拦截 e/E/+/-（科学计数法键）
								if (ev.key === "e" || ev.key === "E" || ev.key === "+" || ev.key === "-") ev.preventDefault();
							}
						}),
						h("span", { className: "mpw_value" }, suffix),
						// ③(新) 「默认」按钮：一键恢复该滑条默认值
						def !== void 0
							? h("button", { className: "mpw_reset mpw_miniBtn", type: "button", onClick: () => apply(def) }, t("default"))
							: null
					])
				]);
			};
			const toggleRow = (label, desc, field, def) => {
				const checked = section[field] !== void 0 ? !!section[field] : def;
				return h("div", { className: "mpw_field" }, [
					h("label", { className: "mpw_label" }, label),
					h("div", { className: "mpw_inline" }, [
						h(Toggle, { checked, onChange: (v) => commit({ [field]: v }) }),
						h("span", { className: "mpw_hint" }, desc)
					])
				]);
			};

			return h("div", { className: "mpw_row" }, [
				h("div", { className: "mpw_title" }, t("title")),
				h("p", { className: "mpw_desc" }, t("desc")),

				// ═══ 背景来源 ═══
				h("div", { className: "mpw_section" }, t("sec.source")),

				// ④ 总开关：开启/关闭整个功能
				h("div", { className: "mpw_field" }, [
					h("label", { className: "mpw_label" }, t("master")),
					h("div", { className: "mpw_inline" }, [
						h(Toggle, {
							checked: section.enabled !== void 0 ? !!section.enabled : DEFAULT_ENABLED,
							onChange: onMaster
						}),
						h("span", { className: "mpw_hint" }, section.enabled !== void 0 && !section.enabled ? t("master.off") : t("master.desc"))
					]),
					conflicts.length ? h("p", { className: "mpw_hint" }, `${t("conflict.detected")}：${conflicts.join(", ")}`) : null
				]),

				// mpkg 文件
				h("div", { className: "mpw_field" }, [
					h("div", { className: "mpw_inline" }, [
						h("button", { className: "mpw_fileBtn", type: "button", onClick: () => mpkgRef.current && mpkgRef.current.click() },
							busy ? t("mpkg.busy") : t("mpkg.pick")),
						h("span", { className: "mpw_hint" }, t("mpkg.hint"))
					]),
					h("input", { ref: mpkgRef, type: "file", accept: ".mpkg,.mp4,.webm,.mkv,.mov", style: { display: "none" }, onChange: onMpkg }),
					// ① 单独清除背景的控件（不重置外观数值）
					section.image ? h("div", { className: "mpw_inline" }, [
						h("button", { className: "mpw_reset", type: "button", onClick: clearBg }, t("clear.bg"))
					]) : null,
					mpkgMeta && mpkgMeta.info && section.fromMpkg ? h("div", { className: "mpw_props" }, [
						mpkgMeta.name ? h("p", { className: "mpw_info" }, h("b", null, mpkgMeta.name)) : null,
						mpkgMeta.info && mpkgMeta.info.title && mpkgMeta.info.title !== mpkgMeta.name ? h("p", { className: "mpw_hint" }, mpkgMeta.info.title) : null,
						h("p", { className: "mpw_hint" }, `${t("mpkg.using")}：${mpkgMeta.entryName}${section.converted === "mp4" ? "（视频）" : ""}${section.timeConfig && section.timeConfig.enabled && section.timeVideos && section.timeVideos.length ? " · " + t("time.now") + "：" + t("time." + slotForTime(section.timeConfig, new Date())) : ""}`)
					]) : null
				]),

				// 可调参数展示（④(重做)：默认折叠成「展开全部」按钮 + 只读 + "暂不可用"——
				// 浏览器显示的是预渲染素材，修改参数不会生效；值仅供对照壁纸引擎 App 使用）
				mpkgMeta && mpkgMeta.info && section.fromMpkg && allProps.length ? h("div", { className: "mpw_field" }, [
					h("label", { className: "mpw_label" }, `${t("props.title")}（${t("props.unavailable")}）`),
					h("p", { className: "mpw_hint" }, t("props.desc")),
					propsExpanded ? h("div", { className: "mpw_props" }, [
						propsToShow.map((p) => {
							// 纯展示性条目（作者信息/说明）：不渲染输入框
							if (p.displayOnly) {
								return h("div", { className: "mpw_prop mpw_static", key: p.key },
									h("span", { className: "mpw_propLabel" }, p.label));
							}
							const edited = propEdits[p.key] !== void 0 ? propEdits[p.key] : p.value;
							const isBool = typeof p.value === "boolean";
							const fmt = (v) => {
								if (typeof v === "boolean") return v ? t("props.on") : t("props.off");
								if (Array.isArray(p.options) && p.options.length) {
									const o = p.options.find((x) => String(x.value) === String(v));
									return o ? cleanLabel(o.label) : String(v);
								}
								return String(v);
							};
							return h("div", { className: "mpw_prop", key: p.key }, [
								h("div", { className: "mpw_propLabel" }, h("b", null, p.label)),
								h("span", { className: "mpw_propValue" }, fmt(edited))
							]);
						}),
						!tvEnabled ? h("p", { className: "mpw_hint" }, t("props.tvOff")) : null,
						// ⑥(重做) 重置壁纸参数：放进折叠内容区（展开参数后显示在列表末尾）
						h("div", { className: "mpw_inline", style: { marginTop: 6 } }, [
							h("button", { className: "mpw_reset mpw_moreBtn", type: "button", onClick: () => {
								const s = readSection();
								if (!s.mpkgKey) { setHint(t("props.none")); return; }
								const pe = Object.assign({}, s.propEdits || {});
								delete pe[s.mpkgKey];
								const next = Object.assign({}, s, { propEdits: pe });
								writeSection(next, true);
								setSection(next);
								setHint(t("props.resetDone"));
							} }, t("props.resetWallpaper"))
						])
					]) : null,
					h("div", { className: "mpw_inline" }, [
						h("button", { className: "mpw_reset mpw_moreBtn", type: "button", onClick: () => setPropsExpanded(!propsExpanded) },
							propsExpanded ? t("props.collapse") : t("props.expand") + `（${propsShown.length}）`)
					])
				]) : null,

				// 图片链接
				h("div", { className: "mpw_field" }, [
					h("label", { className: "mpw_label" }, t("url.label")),
					h("div", { className: "mpw_inline" }, [
						h("input", {
							className: "mpw_input", type: "text", value: url,
							placeholder: t("url.placeholder"),
							onChange: (ev) => setUrl(ev.target.value),
							onKeyDown: (ev) => { if (ev.key === "Enter") applyUrl(); }
						}),
						h("button", { className: "mpw_button", type: "button", onClick: applyUrl }, t("url.apply"))
					])
				]),

				// 本地图片/动图
				h("div", { className: "mpw_field" }, [
					h("div", { className: "mpw_inline" }, [
						h("button", { className: "mpw_fileBtn", type: "button", onClick: () => imgRef.current && imgRef.current.click() }, t("file.pick")),
						h("span", { className: "mpw_hint" }, t("file.hint"))
					]),
					h("input", { ref: imgRef, type: "file", accept: "image/*,.gif,.mp4,.webm,.mkv,.mov", style: { display: "none" }, onChange: onMedia })
				]),

				// ═══ 外观 ═══
				h("div", { className: "mpw_section" }, t("sec.appearance")),
				// ②(新) 外观组说明：各项作用一目了然
				h("p", { className: "mpw_hint" }, t("sec.appearance.desc")),

				sliderRow(t("opacity"), "opacity", 50, 100, "%", 0.01, DEFAULT_OPACITY),
				sliderRow(t("blur"), "blur", 0, 40, "px", 1, DEFAULT_BLUR),
				sliderRow(t("zoom"), "zoom", 10, 2000, "%", 5, DEFAULT_ZOOM),
				// ⑥ 镜头位置（平移）
				h("div", { className: "mpw_field" }, [
					h("label", { className: "mpw_label" }, t("lens.pos")),
					h("div", { className: "mpw_inline" }, [
						h("input", {
							className: "mpw_numInput", type: "text", inputMode: "decimal", autoComplete: "off",
							defaultValue: section.lensX !== void 0 ? section.lensX : 0,
							onInput: (ev) => {
								// 清洗：只留数字和一个小数点；禁科学计数法、限长 7 位、最多 2 位小数
								let raw = ev.target.value;
								raw = raw.replace(/[^0-9.-]/g, "");
								const firstMinus = raw.indexOf("-");
								if (firstMinus > 0) raw = raw.slice(0, firstMinus) + raw.slice(firstMinus + 1);
								const minus = raw.startsWith("-") ? "-" : "";
								const body = minus ? raw.slice(1) : raw;
								const dot = body.indexOf(".");
								let clean = dot >= 0 ? body.slice(0, dot + 1) + body.slice(dot + 1).replace(/\./g, "").slice(0, 2) : body;
								if (clean.length > 7) clean = clean.slice(0, 7);
								raw = minus + clean;
								if (ev.target.value !== raw) ev.target.value = raw;
								if (raw === "" || raw === "-" || raw === "." || raw === "-." || isNaN(Number(raw))) return;
								const v = Number(raw);
								if (!isNaN(v)) commit({ lensX: Math.max(-2000, Math.min(2000, v)) });
							},
							onKeyDown: (ev) => {
								if (ev.key === "e" || ev.key === "E" || ev.key === "+") ev.preventDefault();
							}
						}),
						h("input", {
							className: "mpw_numInput", type: "text", inputMode: "decimal", autoComplete: "off",
							defaultValue: section.lensY !== void 0 ? section.lensY : 0,
							onInput: (ev) => {
								let raw = ev.target.value;
								raw = raw.replace(/[^0-9.-]/g, "");
								const firstMinus = raw.indexOf("-");
								if (firstMinus > 0) raw = raw.slice(0, firstMinus) + raw.slice(firstMinus + 1);
								const minus = raw.startsWith("-") ? "-" : "";
								const body = minus ? raw.slice(1) : raw;
								const dot = body.indexOf(".");
								let clean = dot >= 0 ? body.slice(0, dot + 1) + body.slice(dot + 1).replace(/\./g, "").slice(0, 2) : body;
								if (clean.length > 7) clean = clean.slice(0, 7);
								raw = minus + clean;
								if (ev.target.value !== raw) ev.target.value = raw;
								if (raw === "" || raw === "-" || raw === "." || raw === "-." || isNaN(Number(raw))) return;
								const v = Number(raw);
								if (!isNaN(v)) commit({ lensY: Math.max(-2000, Math.min(2000, v)) });
							},
							onKeyDown: (ev) => {
								if (ev.key === "e" || ev.key === "E" || ev.key === "+") ev.preventDefault();
							}
						}),
						h("span", { className: "mpw_hint" }, `${t("lens.x")} / ${t("lens.y")}`),
						// ③(新) 镜头位置「默认」按钮：恢复 0/0
						h("button", { className: "mpw_reset mpw_miniBtn", type: "button", onClick: () => commit({ lensX: 0, lensY: 0 }, true) }, t("default"))
					])
				]),

				// ═══ 界面虚化 ═══
				h("div", { className: "mpw_section" }, t("sec.blur")),
				h("p", { className: "mpw_hint" }, t("sec.blur.desc")),

				// ①(重做) 统一虚化：开关 + 独立条（0 = 所有控件透明透出壁纸，40 = 强模糊+实心）。
				// 开时其他虚化设置全部作废，只按这个条；设置界面/聊天框除外（按各自设置）。
				toggleRow(t("unifyTint"), t("unifyTint.desc"), "unifyTint", DEFAULT_UNIFY_TINT),
				// ⑥ 条件显示滑条：⚠️ sliderRow 内含 hooks，绝不能条件渲染（React 会因
				// hooks 数量变化崩溃导致整页空白）——始终渲染，用 wrapper display 隐藏。
				h("div", { style: { display: (section.unifyTint !== void 0 ? !!section.unifyTint : DEFAULT_UNIFY_TINT) ? "" : "none" } },
					sliderRow(t("unifyAmount"), "unifyAmount", 0, 40, "px", 1, DEFAULT_UNIFY_AMOUNT)),
				// ①(新) 聊天壁纸是否跟随整屏虚化（统一虚化开启时显示）。
				// 关 = 聊天区虚化由「磨砂模糊」条接管（整屏虚化只管侧边栏/标题栏等）。
				h("div", { style: { display: (section.unifyTint !== void 0 ? !!section.unifyTint : DEFAULT_UNIFY_TINT) ? "" : "none" } },
					toggleRow(t("chatFollow"), t("chatFollow.desc"), "chatFollow", DEFAULT_CHAT_FOLLOW)),
				// ④(新) 新会话按钮是否随整屏虚化（统一虚化开启时显示）；关 = 随面板不透明度
				h("div", { style: { display: (section.unifyTint !== void 0 ? !!section.unifyTint : DEFAULT_UNIFY_TINT) ? "" : "none" } },
					toggleRow(t("sessionFollow"), t("sessionFollow.desc"), "sessionFollow", DEFAULT_SESSION_FOLLOW)),

				// ⑫(新) 对话框/弹层虚化开关
				toggleRow(t("dialogBlur"), t("dialogBlur.desc"), "dialogBlur", DEFAULT_DIALOG_BLUR),

				// ⑮(新) 浏览器虚化支持提示（Via/WebView 常声明支持但不渲染真模糊）
				window.__mpwBackdropRendered === false
					? h("p", { className: "mpw_hint" }, t("blur.unsupported"))
					: null,

				// ⑫(新) 对话框虚化程度（⑥：开关关 → 滑条隐藏；始终渲染防 hooks 崩溃）
				h("div", { style: { display: (section.dialogBlur !== void 0 ? !!section.dialogBlur : DEFAULT_DIALOG_BLUR) ? "" : "none" } },
					sliderRow(t("dialogBlurAmount"), "dialogAmount", 0, 40, "px", 1, DEFAULT_DIALOG_AMOUNT)),

				// ②(新) 弹层虚化（菜单/提示/遮罩）：开关 + 程度条，独立于对话框虚化
				toggleRow(t("popoverBlur"), t("popoverBlur.desc"), "popoverBlur", DEFAULT_POPOVER_BLUR),
				h("div", { style: { display: (section.popoverBlur !== void 0 ? !!section.popoverBlur : DEFAULT_POPOVER_BLUR) ? "" : "none" } },
					sliderRow(t("popoverBlurAmount"), "popoverAmount", 0, 40, "px", 1, DEFAULT_POPOVER_AMOUNT)),
				// ②(重做) 遮罩虚化独立（设置/弹层打开时的全屏背景遮罩）
				toggleRow(t("maskBlur"), t("maskBlur.desc"), "maskBlur", DEFAULT_MASK_BLUR),
				h("div", { style: { display: (section.maskBlur !== void 0 ? !!section.maskBlur : DEFAULT_MASK_BLUR) ? "" : "none" } },
					sliderRow(t("maskBlurAmount"), "maskAmount", 0, 40, "px", 1, DEFAULT_MASK_AMOUNT)),

				// ═══ 透出壁纸 ═══
				h("div", { className: "mpw_section" }, t("sec.show")),
				h("p", { className: "mpw_hint" }, t("sec.show.desc")),

				// ⑥ 侧边栏透出开关
				toggleRow(t("sidebar"), t("sidebar.desc"), "sidebar", DEFAULT_SIDEBAR),

				// ⑤ 标题栏透出壁纸（②：与侧边栏透出归一类）
				toggleRow(t("headerBg"), t("headerBg.desc"), "headerBg", DEFAULT_HEADER_BG),

				// ①(重做) 标题栏磨砂：归到「标题栏透出壁纸」下面，透出关闭时隐藏。
				// 磨砂程度独立可调（headerBlurAmount），即使统一虚化 0px 也保持雾底保证字可读。
				h("div", { style: { display: (section.headerBg !== void 0 ? !!section.headerBg : DEFAULT_HEADER_BG) ? "" : "none" } },
					toggleRow(t("headerBlur"), t("headerBlur.desc"), "headerBlur", DEFAULT_HEADER)),
				h("div", { style: { display: (section.headerBg !== void 0 ? !!section.headerBg : DEFAULT_HEADER_BG) && (section.headerBlur !== void 0 ? !!section.headerBlur : DEFAULT_HEADER) ? "" : "none" } },
					sliderRow(t("headerBlurAmount"), "headerBlurAmount", 0, 100, "%", 1, DEFAULT_HEADER_BLUR_AMOUNT)),

				// ═══ 其他 ═══
				h("div", { className: "mpw_section" }, t("sec.other")),

				// ⑦ 轻度锐化（可能影响 GIF 流畅度）
				toggleRow(t("sharp"), t("sharp.desc"), "sharp", DEFAULT_SHARP),

				// ②(新) Deep diving 背景方框开关（移到"其他"组）
				toggleRow(t("thinkBg"), t("thinkBg.desc"), "thinkBg", DEFAULT_THINK_BG),


				// ① 恢复默认（只重置外观数值，不清除已导入壁纸）
				h("div", { className: "mpw_field" }, [
					h("button", { className: "mpw_reset", type: "button", onClick: resetSettings }, t("reset"))
				]),
				hint ? h("p", { className: "mpw_hint" + (/^(解析失败|文件过大|背景素材过大|存储空间|内存不足|此壁纸的视频纹理|不支持)/.test(hint) ? " mpw_err" : "") }, hint) : null,

				// ①(新) 通用错误弹窗（文件过大 / 无法使用 / 解析失败等）
				errorModal ? h("div", { className: "mpw_mask", onClick: () => setErrorModal(false) }, [
					h("div", { className: "mpw_dialog", onClick: (ev) => ev.stopPropagation() }, [
						h("div", { className: "mpw_title" }, t("error.title")),
						h("p", { className: "mpw_desc" }, errorMsg),
						h("div", { className: "mpw_inline" }, [
							h("button", { className: "mpw_button", type: "button", onClick: () => setErrorModal(false) }, t("preview.ok"))
						])
					])
				]) : null,

				// ⑤(新) 预览模式弹窗（导入后最终用 GIF/图片时提示）
				previewModal ? h("div", { className: "mpw_mask", onClick: () => setPreviewModal(false) }, [
					h("div", { className: "mpw_dialog", onClick: (ev) => ev.stopPropagation() }, [
						h("div", { className: "mpw_title" }, t("preview.title")),
						h("p", { className: "mpw_desc" }, t("preview.desc")),
						h("div", { className: "mpw_inline" }, [
							h("button", { className: "mpw_button", type: "button", onClick: () => setPreviewModal(false) }, t("preview.ok"))
						])
					])
				]) : null,

				// ④ 冲突确认弹窗（自绘覆盖层）
				conflictModal ? h("div", { className: "mpw_mask", onClick: () => setConflictModal(false) }, [
					h("div", { className: "mpw_dialog", onClick: (ev) => ev.stopPropagation() }, [
						h("div", { className: "mpw_title" }, t("conflict.title")),
						h("p", { className: "mpw_desc" }, `${t("conflict.body")}：${conflicts.join(", ")}`),
						h("div", { className: "mpw_inline" }, [
							h("button", { className: "mpw_button", type: "button", onClick: confirmEnable }, t("conflict.confirm")),
							h("button", { className: "mpw_reset", type: "button", onClick: () => setConflictModal(false) }, t("conflict.cancel"))
						])
					])
				]) : null
			]);
		} catch (err) {
			// 渲染错误边界：任何渲染异常只显示错误信息，绝不整页空白
			console.error("[dsh-mpkg-wallpaper] 设置页渲染失败:", err);
			return h("div", { className: "mpw_field" }, [
				h("p", { className: "mpw_hint" }, "壁纸引擎设置渲染出错: " + String(err && err.message || err))
			]);
		}
	}

		// ═══════════════════════════════════════════════════════════════════
		//  多语言
		// ═══════════════════════════════════════════════════════════════════
		const zh = {
			"nav": "壁纸引擎背景",
			"master": "启用壁纸引擎背景功能",
			"clear.bg": "清除背景",
			"master.desc": "开启后应用所选背景",
			"master.off": "已关闭（检测到其他壁纸/主题插件或手动关闭）",
			"conflict.detected": "检测到可能冲突的插件",
			"conflict.title": "检测到插件冲突",
			"conflict.body": "以下插件可能与本功能冲突（都会改动界面背景/外观）。仍要开启吗？",
			"conflict.confirm": "仍然开启",
			"conflict.cancel": "取消",
			"title": "壁纸引擎 mpkg 背景",
			"desc": "直接加载 Wallpaper Engine 的 .mpkg 文件作为页面背景：视频类壁纸自动播放内嵌 mp4，场景类壁纸取 preview.gif。支持时间变化、时钟、镜头缩放与界面虚化。设置保存在当前浏览器。",
			"sec.source": "背景来源",
			"sec.appearance": "外观",
			"sec.appearance.desc": "面板不透明度=所有区域白雾厚度；磨砂模糊=整张壁纸的模糊程度（0=清晰）；镜头缩放/位置=背景画面的放大与平移（缩小可看到画面边缘的组件）",
			"sec.blur": "界面虚化",
			"sec.blur.desc": "统一虚化=整屏所有控件的模糊感（一个条全管）；对话框/弹层/遮罩=弹层打开时的背景虚化；聊天输入框虚化随对话框开关",
			"sec.show": "透出壁纸",
			"sec.show.desc": "控制对应区域是否显示壁纸：关=纯色不透明",
			"sec.other": "其他",
			"mpkg.pick": "选择 .mpkg 文件",
			"mpkg.busy": "解析中…",
			"mpkg.hint": "支持 Wallpaper Engine 的 .mpkg 包；此位置也可直接选择 mp4/webm 视频文件；视频类壁纸自动播放内嵌 mp4",
			"mpkg.noAsset": "该 mpkg 内未找到图片/GIF 素材",
			"mpkg.previewMode": "预览模式：当前以预览图显示；该壁纸的完整动态内容（Live2D 场景/高清视频）需壁纸引擎 App 渲染",
			"mpkg.tooLarge": "背景素材过大（视频>600MB / 图片>200MB），浏览器无法处理，请换一个 mpkg",
			"mpkg.huge": "文件过大（>600MB），移动端浏览器无法处理，请换小一点的 mpkg",
			"mpkg.videoHuge": "视频文件过大（>600MB），浏览器无法播放，已自动回退使用预览图",
			"mpkg.quota": "浏览器存储空间不足，无法保存此壁纸素材（可清除其他壁纸后再试）",
			"mpkg.oom": "文件过大导致内存不足，解析失败。请换小于 300MB 的壁纸，或用壁纸引擎 App 查看",
			"mpkg.vtexBig": "此壁纸的视频纹理超过 250MB，浏览器无法播放（请用壁纸引擎 App 查看）",
			"mpkg.fail": "解析失败：",
			"mpkg.using": "当前背景素材",
			"props.title": "可调参数",
			"props.desc": "浏览器显示的是壁纸引擎预渲染的素材，修改参数不会改变画面。以下为壁纸自带的参数及当前值，供对照：如需修改，请在壁纸引擎 App 中调整",
			"props.unavailable": "暂不可用",
			"props.on": "开",
			"props.off": "关",
			"props.expand": "展开全部",
			"props.important": "★ 关键开关",
			"props.resetWallpaper": "重置壁纸参数",
			"props.resetDone": "壁纸参数已恢复默认",
			"props.tvOff": "随现实时间变化已关闭，时间设置已隐藏（打开开关后显示）",
			"error.title": "导入失败",
			"preview.title": "预览模式",
			"preview.desc": "该壁纸当前以预览图（GIF/图片）显示，浏览器无法播放其动态内容（Live2D 场景/高清视频需壁纸引擎 App 渲染）。",
			"preview.ok": "知道了",
			"props.none": "请先导入壁纸",
			"props.collapse": "收起",
			"url.label": "图片链接（支持 data:image 的 GIF）",
			"url.placeholder": "https://… 或 data:image/…",
			"url.apply": "应用",
			"url.unsafe": "仅支持 http/https 或 data:image 链接",
			"file.unsafe": "不支持的文件类型（已拒绝）",
			"file.pick": "选择本地图片/动图",
			"file.hint": "支持图片/动图（大文件自动存本地，刷新不丢）",
			"file.tooLarge": "文件超过 50MB，请换一张或使用链接。",
			"opacity": "面板不透明度",
			"blur": "磨砂模糊",
			"zoom": "镜头缩放",
			"lens.pos": "镜头位置（平移）",
			"lens.x": "X",
			"lens.y": "Y",
			"sidebar": "侧边栏透出壁纸",
			"sidebar.desc": "关闭后侧边栏恢复不透明，避免左右透明度不一致",
			"headerBlur": "标题栏磨砂",
			"headerBg": "标题栏透出壁纸",
			"headerBg.desc": "关闭后标题栏为纯白（暗色主题为纯深色）不透明，不再显示壁纸",
			"headerBlur.desc": "标题栏半透明透出（已模糊的）壁纸，磨砂程度独立可调（下方滑条），即使整屏虚化调 0 也保持雾底保证文字可读。需先开启「标题栏透出壁纸」",
			"headerBlurAmount": "标题栏磨砂程度",
			"unifyTint": "统一虚化",
			"unifyTint.desc": "开启后，整个界面（侧边栏/标题栏/聊天区等）的朦胧感统一由一个条控制：拉到 0 = 全部透明露出壁纸，拉高 = 界面越来越朦胧。设置面板和聊天输入框除外。关闭后各区域单独调节",
			"unifyAmount": "整屏虚化程度",
			"chatFollow": "聊天壁纸跟随整屏",
			"chatFollow.desc": "统一虚化开启时：聊天区壁纸是否跟随整屏虚化程度。关 = 聊天区由「磨砂模糊」条接管（整屏虚化只管侧边栏/标题栏等）",
			"sessionFollow": "新会话按钮跟随整屏",
			"sessionFollow.desc": "统一虚化开启时：「添加新会话」按钮是否随整屏虚化程度。关 = 随面板不透明度",
			"dialogBlur": "虚化对话框",
			"dialogBlur.desc": "屏幕中央的窗口（设置面板、下载/确认弹窗等）和聊天输入框的背景虚化；滚动经过输入框的文字会变朦胧",
			"dialogBlurAmount": "对话框虚化程度",
			"popoverBlur": "虚化弹层",
			"popoverBlur.desc": "从界面某处弹出的面板：右键菜单、下拉选择、提示气泡等",
			"popoverBlurAmount": "弹层虚化程度",
			"maskBlur": "虚化遮罩（全屏背景）",
			"maskBlur.desc": "打开设置面板或弹层时，窗口后面那层半透明背景的朦胧程度",
			"maskBlurAmount": "遮罩虚化程度",
			"thinkBg": "Deep diving 背景方框",
			"thinkBg.desc": "开：显示思考状态（Deep diving）的深蓝背景方框；关（默认）：背景透明，文字直接显示在壁纸上",
			"blur.unsupported": "⚠️ 当前浏览器（Via/WebView）不真正渲染背景模糊，虚化仅显示半透明。建议用 Chrome/Firefox 浏览器获得完整磨砂效果",
			"sharp": "轻度锐化",
			"sharp.desc": "提升低清 GIF 观感；若动画卡顿请关闭",
			"time.picked": "已按当前时间选择素材",
			"time.now": "当前时段",
			"time.morning": "清晨",
			"time.day": "白天",
			"time.dusk": "黄昏",
			"time.night": "夜晚",
			"reset": "恢复默认",
			"default": "默认",
		};
		const en = {
			"nav": "MPKG Wallpaper",
			"master": "Enable mpkg background",
			"clear.bg": "Clear background",
			"master.desc": "On applies the chosen background",
			"master.off": "Disabled (conflicting wallpaper/theme plugins detected or manually off)",
			"conflict.detected": "Potentially conflicting plugins detected",
			"conflict.title": "Plugin conflict detected",
			"conflict.body": "These plugins may conflict with this feature (both alter the UI background/appearance). Enable anyway?",
			"conflict.confirm": "Enable anyway",
			"conflict.cancel": "Cancel",
			"title": "Wallpaper Engine mpkg background",
			"desc": "Load Wallpaper Engine .mpkg files as the page background: video wallpapers play their embedded mp4, scene wallpapers use their preview.gif. Supports time-of-day switching, a clock, lens zoom, and UI frosted blur. Settings persist in this browser.",
			"sec.source": "Background source",
			"sec.appearance": "Appearance",
			"sec.appearance.desc": "Panel opacity = frosted tint thickness of all areas; Frosted blur = how blurred the wallpaper itself is (0 = sharp); Lens zoom/position = zoom and pan of the background image (zoom out to see components at the picture edges)",
			"sec.blur": "UI blur",
			"sec.blur.desc": "Unified blur = the frosted feel of all controls (one slider rules all); dialog/popover/mask = background blur when popups open; chat input blur follows the dialog toggle",
			"sec.show": "Show wallpaper",
			"sec.show.desc": "Whether the corresponding area shows the wallpaper: off = solid color, opaque",
			"sec.other": "Other",
			"mpkg.pick": "Choose .mpkg file",
			"mpkg.busy": "Parsing…",
			"mpkg.hint": "Wallpaper Engine .mpkg packages; you can also pick an mp4/webm video file here; video wallpapers play their embedded mp4",
			"mpkg.noAsset": "No image/GIF asset found in this mpkg",
			"mpkg.previewMode": "Preview mode: showing the preview image; the wallpaper's full dynamic content (Live2D scene/HD video) requires the Wallpaper Engine app",
			"mpkg.tooLarge": "Background asset too large (video >600MB / image >200MB) — the browser cannot handle it",
			"mpkg.huge": "File too large (>600MB) — mobile browsers cannot handle it; pick a smaller mpkg",
			"mpkg.videoHuge": "Video too large (>600MB) — the browser cannot play it; automatically fell back to the preview image",
			"mpkg.quota": "Browser storage quota exceeded; free up space (clear other wallpapers) and retry",
			"mpkg.oom": "File too large — out of memory while parsing. Use a wallpaper under 300MB or view it in the Wallpaper Engine app",
			"mpkg.vtexBig": "This wallpaper's video texture exceeds 250MB — the browser cannot play it (view it in the Wallpaper Engine app)",
			"mpkg.fail": "Parse failed: ",
			"mpkg.using": "Current background asset",
			"props.title": "Adjustable options",
			"props.desc": "The browser shows pre-rendered wallpaper assets, so editing these options cannot change the picture. Listed below are the wallpaper's own parameters and their current values for reference; change them in the Wallpaper Engine app instead",
			"props.unavailable": "unavailable",
			"props.on": "On",
			"props.off": "Off",
			"props.expand": "Show all",
			"props.important": "★ Key switch",
			"props.resetWallpaper": "Reset wallpaper options",
			"props.resetDone": "Wallpaper options restored to defaults",
			"props.tvOff": "Real-time variation is off — time settings hidden (enable it to show them)",
			"error.title": "Import failed",
			"preview.title": "Preview mode",
			"preview.desc": "This wallpaper is currently shown as a preview image (GIF/picture); the browser cannot play its dynamic content (Live2D scene / HD video requires the Wallpaper Engine app).",
			"preview.ok": "Got it",
			"props.none": "Import a wallpaper first",
			"props.collapse": "Collapse",
			"url.label": "Image URL (GIF data: URLs work too)",
			"url.placeholder": "https://… or data:image/…",
			"url.apply": "Apply",
			"url.unsafe": "Only http/https or data:image URLs are allowed",
			"file.unsafe": "Unsupported file type (rejected)",
			"file.pick": "Choose local image/GIF",
			"file.hint": "Images/GIF supported (large files auto-saved locally, persist on refresh)",
			"file.tooLarge": "File exceeds 50MB — pick another or use a URL.",
			"opacity": "Panel opacity",
			"blur": "Frosted blur",
			"zoom": "Lens zoom (wallpaper camera)",
			"lens.pos": "Lens position (pan)",
			"lens.x": "X",
			"lens.y": "Y",
			"sidebar": "Show wallpaper in sidebar",
			"sidebar.desc": "Off keeps the sidebar opaque so left/right translucency stays consistent",
			"headerBlur": "Frost the title bar",
			"headerBg": "Show wallpaper behind the title bar",
			"headerBg.desc": "Off makes the title bar solid white (solid dark in dark theme), no wallpaper behind it",
			"headerBlur.desc": "Title bar semi-transparent over the (blurred) wallpaper; frosted amount adjustable via the slider below and kept even when full-screen blur is 0, so text stays readable. Needs \"Show wallpaper behind the title bar\" on",
			"headerBlurAmount": "Title bar frost amount",
			"unifyTint": "Unify blur",
			"unifyTint.desc": "On: the whole interface (sidebar, title bar, chat area, etc.) shares one frosted feel controlled by a single slider: 0 = everything transparent showing the wallpaper, higher = more hazy. The settings panel and chat input box keep their own settings. Off = per-area control",
			"unifyAmount": "Full-screen blur amount",
			"chatFollow": "Chat follows full-screen",
			"chatFollow.desc": "When unified blur is on: whether the chat area wallpaper follows the full-screen blur amount. Off = the chat area is taken over by the Frosted blur slider (full-screen blur only affects sidebar/title bar etc.)",
			"sessionFollow": "New-chat button follows full-screen",
			"sessionFollow.desc": "When unified blur is on: whether the New chat button follows the full-screen blur amount. Off = it follows the panel opacity",
			"dialogBlur": "Blur dialogs",
			"dialogBlur.desc": "Center-screen windows (settings, download/confirm popups) and the chat input box get a blurred backdrop; text scrolling under the input box turns hazy",
			"dialogBlurAmount": "Dialog blur amount",
			"popoverBlur": "Blur popovers/mask",
			"popoverBlur.desc": "Panels popping out from somewhere: context menus, dropdowns, tooltip bubbles",
			"popoverBlurAmount": "Popover blur amount",
			"maskBlur": "Blur mask (full-screen backdrop)",
			"maskBlur.desc": "Haziness of the translucent backdrop layer behind a window when settings/popovers open",
			"maskBlurAmount": "Mask blur amount",
			"thinkBg": "Deep diving background box",
			"thinkBg.desc": "On: show the Deep diving thinking status background box; Off (default): transparent, text sits directly on the wallpaper",
			"blur.unsupported": "⚠️ This browser (Via/WebView) does not truly render backdrop blur; blur appears as translucency only. Use Chrome/Firefox for the full frosted effect",
			"sharp": "Light sharpen",
			"clock.title": "Show time (clock)",
			"clock.desc": "Overlay a live clock on the background, replacing the built-in time component",
			"clock.24h": "24-hour format",
			"clock.sec": "Show seconds",
			"clock.date": "Show date",
			"clock.pos": "Position",
			"clock.tl": "Top-left",
			"clock.tr": "Top-right",
			"clock.bl": "Bottom-left",
			"clock.br": "Bottom-right",
			"sharp.desc": "Improves low-res GIF look; disable if animation stutters",
			"time.picked": "Asset picked by current time",
			"time.now": "Current period",
			"time.morning": "Morning",
			"time.day": "Day",
			"time.dusk": "Dusk",
			"time.night": "Night",
			"reset": "Restore defaults",
			"default": "Default",
		};

		// ═══════════════════════════════════════════════════════════════════
		//  插件主体
		// ═══════════════════════════════════════════════════════════════════
		const inject = ["slots", "locale", "theme"];

		/** 当前 ctx（apply 时保存，供 applyFromStorage 里 overrideTokens 用）。 */
		let pluginCtx = null;
		/** 上一次 token override 的 disposer。 */
		let tokenDisposer = null;

		let styleEl = null;
		function getStyleEl() {
			if (!styleEl) {
				styleEl = document.createElement("style");
				styleEl.setAttribute("data-plugin", "@local/dsh-mpkg-wallpaper");
				(document.head || document.documentElement).appendChild(styleEl);
			}
			return styleEl;
		}

		function apply(ctx) {
			try {
				pluginCtx = ctx;
				applyInner(ctx);
			} catch (err) {
				// 防护：任何运行时错误只影响本插件，绝不拖垮 harness 启动
				console.error("[dsh-mpkg-wallpaper] apply failed:", err);
			}
		}

		function applyInner(ctx) {
			// 背景 DOM 常驻
			ensureBgDom();
			// ⑭ 内联虚化 watcher：持续应用 dialog/fade 内联样式
			applyDialogInline(readSection());
			if (window.__mpwInlineWatcher === void 0) {
				window.__mpwInlineWatcher = startInlineWatcher();
			}
			// ⑪(新) 与其他壁纸/主题插件冲突 → 自动关闭本功能（用户要求）。
			// 检测范围：已装插件 ID（data-plugin）+ 运行时背景检测（body/html 背景图、
			// 其他全屏背景层）。forceEnabled=true（用户手动强开）时豁免，避免反复关闭。
			try {
				const cf = detectConflicts();
				if (cf.length) {
					const s = readSection();
					if (s.enabled !== false && !s.forceEnabled) {
						console.warn("[dsh-mpkg-wallpaper] 检测到可能冲突的壁纸/主题插件，已自动关闭本功能:", cf.join(", "));
						writeSection(Object.assign({}, s, { enabled: false }), true);
					}
				}
			} catch {}
			applyFromStorage();
			window.addEventListener("storage", (e) => {
				if (e.key === STORE_KEY) {
					try { applyFromStorage(); } catch {}
				}
			});
			// 时间变化：每分钟检查时段，跨时段自动切换视频
			try {
				setInterval(() => {
					const s = readSection();
					if (!s.timeVideos || !s.timeConfig || !s.timeConfig.enabled) return;
					const slot = slotForTime(s.timeConfig, new Date());
					if (slot === s.activeSlot) return;
					const item = s.timeVideos.find((l) => l.slot === slot);
					if (!item) return;
					idbGet("bg-" + item.key).then((v) => {
						if (!v) return;
						idbPut("bg", v).then(() => {
							writeSection(Object.assign({}, readSection(), { activeSlot: item.slot || item.key }), true);
							applyFromStorage();
						});
					}).catch(() => {});
				}, 60000);
			} catch {}
			const sectionInjected = () => ({
				commit: () => { applyFromStorage(); }
			});
			// ⑤ 注册为设置左侧导航的独立页面
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: ROW_ID,
				order: 40,
				label: () => react.createElement(react.Fragment, null,
					react.createElement("img", { src: NAV_ICON, alt: "", className: "mpw_navIconImg" }),
					" " + ctx.locale.bind(NS)("nav")),
				locale: NS,
				inject: sectionInjected
			}, MpkgSection));
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "ui-mpkg-wallpaper: settings section dictionaries");
		}

		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});
