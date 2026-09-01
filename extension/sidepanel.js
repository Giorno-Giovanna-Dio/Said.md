const statusEl = document.getElementById("status");
const form = document.getElementById("form");
const urlInput = document.getElementById("url");
const clearButton = document.getElementById("clear");
const connectButton = document.getElementById("connect");
const submitButton = document.getElementById("submit");
const actions = document.getElementById("actions");
const preview = document.getElementById("preview");
const copyButton = document.getElementById("copy");
const downloadButton = document.getElementById("download");
const connectedEl = document.getElementById("connected");
const thumbEl = document.getElementById("thumb");
const thumbLinkEl = document.getElementById("thumb-link");
const videoTitleEl = document.getElementById("video-title");
const videoUrlEl = document.getElementById("video-url");

let current = null;
let lastAutoVideoId = null;
let lastFetchedVideoId = null;
let skipAutoFillForVideoId = null;
let convertGeneration = 0;
let convertTimer = null;
let thumbObjectUrl = "";
const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

function parseYouTubeVideoId(input) {
  const trimmed = String(input || "").trim();
  if (!trimmed) return null;
  if (VIDEO_ID_RE.test(trimmed)) return trimmed;
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && VIDEO_ID_RE.test(id) ? id : null;
    }
    const fromQuery = url.searchParams.get("v");
    if (fromQuery && VIDEO_ID_RE.test(fromQuery)) return fromQuery;
    const parts = url.pathname.split("/").filter(Boolean);
    if (
      parts[0] &&
      parts[1] &&
      ["shorts", "embed", "live", "v"].includes(parts[0]) &&
      VIDEO_ID_RE.test(parts[1])
    ) {
      return parts[1];
    }
    return null;
  } catch {
    return null;
  }
}

function setStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.classList.toggle("error", isError);
}

function showResult({ markdown, filename }) {
  current = { markdown, filename };
  preview.textContent = markdown;
  preview.classList.remove("hidden");
  actions.classList.remove("hidden");
}

function hideResult() {
  current = null;
  preview.classList.add("hidden");
  actions.classList.add("hidden");
  preview.textContent = "";
}

function watchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function syncClearButton() {
  clearButton.classList.toggle("hidden", !urlInput.value.trim());
}

function hideConnected() {
  connectedEl.classList.add("hidden");
  if (thumbObjectUrl) {
    URL.revokeObjectURL(thumbObjectUrl);
    thumbObjectUrl = "";
  }
  thumbEl.removeAttribute("src");
  videoTitleEl.textContent = "Untitled video";
  videoUrlEl.textContent = "";
}

async function loadThumbnail(videoId) {
  if (thumbObjectUrl) {
    URL.revokeObjectURL(thumbObjectUrl);
    thumbObjectUrl = "";
  }
  try {
    const response = await fetch(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, {
      referrerPolicy: "no-referrer",
    });
    if (!response.ok) throw new Error("Thumbnail request failed");
    const blob = await response.blob();
    thumbObjectUrl = URL.createObjectURL(blob);
    thumbEl.src = thumbObjectUrl;
  } catch {
    thumbEl.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }
}

function showConnected({ videoId, title, url }) {
  const nextUrl = url || watchUrl(videoId);
  thumbLinkEl.href = nextUrl;
  videoTitleEl.textContent = title?.replace(/ - YouTube$/, "") || `YouTube ${videoId}`;
  videoUrlEl.textContent = nextUrl;
  connectedEl.classList.remove("hidden");
  connectedEl.classList.remove("flash");
  void connectedEl.offsetWidth;
  connectedEl.classList.add("flash");
  loadThumbnail(videoId).catch(() => {});
}

function clearLink() {
  skipAutoFillForVideoId = parseYouTubeVideoId(urlInput.value);
  lastFetchedVideoId = null;
  lastAutoVideoId = null;
  convertGeneration += 1;
  urlInput.value = "";
  hideResult();
  hideConnected();
  setStatus("Focus a YouTube watch page, then press Connect.");
  syncClearButton();
  urlInput.focus();
}

async function readPageFromTab(tab) {
  if (!tab?.id) return { href: tab?.url || "", title: tab?.title || "" };
  try {
    const [injected] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({ href: window.location.href, title: document.title }),
    });
    return {
      href: injected?.result?.href || tab.url || "",
      title: injected?.result?.title || tab.title || "",
    };
  } catch {
    return { href: tab.url || "", title: tab.title || "" };
  }
}

async function inspectTab(tab) {
  if (!tab) return null;
  const page = await readPageFromTab(tab);
  const videoId = parseYouTubeVideoId(page.href);
  if (!videoId) return null;
  return {
    videoId,
    title: page.title,
    url: watchUrl(videoId),
  };
}

async function findCurrentVideo() {
  const windowIds = [];
  try {
    const currentWin = await chrome.windows.getCurrent();
    if (currentWin?.id != null) windowIds.push(currentWin.id);
  } catch {
    // Fall through to last-focused.
  }
  try {
    const last = await chrome.windows.getLastFocused({ windowTypes: ["normal"] });
    if (last?.id != null && !windowIds.includes(last.id)) windowIds.push(last.id);
  } catch {
    // Stay with whatever we already have.
  }

  for (const windowId of windowIds) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, windowId });
      const found = await inspectTab(tab);
      if (found) return found;
    } catch {
      // Try the next window.
    }
  }
  return null;
}

function applyConnectedVideo(found, { convert = false } = {}) {
  if (!found) return false;
  skipAutoFillForVideoId = null;
  const videoChanged = lastAutoVideoId !== found.videoId;
  lastAutoVideoId = found.videoId;
  urlInput.value = found.url;
  showConnected(found);
  syncClearButton();
  if (videoChanged) {
    hideResult();
    lastFetchedVideoId = null;
  }
  if (convert) {
    setStatus("Fetching captions…");
    scheduleConvert();
  } else {
    setStatus("Connected to the current YouTube video.");
  }
  return true;
}

async function connectCurrentVideo() {
  connectButton.disabled = true;
  connectButton.textContent = "Connecting…";
  setStatus("Looking for the video in the main window…");
  try {
    const found = await findCurrentVideo();
    if (!found) {
      setStatus(
        "No YouTube video in the main window. Open a watch page, then press Connect.",
        true,
      );
      return;
    }
    applyConnectedVideo(found);
    setStatus("Fetching captions…");
    runConvert();
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Could not connect.", true);
  } finally {
    connectButton.disabled = false;
    connectButton.textContent = "Connect current video";
  }
}

function videoFromTabUrl(tab) {
  const href = tab?.url || "";
  const videoId = parseYouTubeVideoId(href);
  if (!videoId) return null;
  return {
    videoId,
    title: tab?.title || "",
    url: watchUrl(videoId),
  };
}

function maybeFollowTab(tab) {
  if (!lastAutoVideoId) return;
  const found = videoFromTabUrl(tab);
  if (!found) return;
  if (skipAutoFillForVideoId && found.videoId === skipAutoFillForVideoId) return;
  if (found.videoId === lastAutoVideoId) return;
  applyConnectedVideo(found, { convert: true });
}

function downloadMarkdown(filename, markdown) {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(href);
}

const API_CANDIDATES = [
  API_BASE,
  "http://localhost:3002",
  "http://127.0.0.1:3002",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter((value, index, list) => list.indexOf(value) === index);

let apiBase = API_BASE;

async function postConvert(base, url, timeoutMs) {
  const response = await fetch(`${base}/api/convert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    const error = new Error(data.message || "Conversion failed");
    error.api = true;
    throw error;
  }
  return { markdown: data.markdown, filename: data.filename };
}

async function isSaidApi(base) {
  try {
    const response = await fetch(`${base}/api/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "" }),
      signal: AbortSignal.timeout(1200),
    });
    const data = await response.json().catch(() => ({}));
    return data.error === "INVALID_URL";
  } catch {
    return false;
  }
}

async function resolveApiBase() {
  if (await isSaidApi(apiBase)) return apiBase;
  const checks = await Promise.all(
    API_CANDIDATES.map(async (base) => ({
      base,
      ok: await isSaidApi(base),
    })),
  );
  const hit = checks.find((item) => item.ok);
  if (!hit) {
    throw new Error(
      "Can't reach the Said.md web app. Run npm run dev and reload this extension.",
    );
  }
  apiBase = hit.base;
  return apiBase;
}

async function convertViaApi(url) {
  const base = await resolveApiBase();
  try {
    return await postConvert(base, url, 50_000);
  } catch (error) {
    if (error?.api) throw error;
    throw new Error(
      "Can't reach the Said.md web app. Run npm run dev and reload this extension.",
    );
  }
}

function scheduleConvert() {
  window.clearTimeout(convertTimer);
  convertTimer = window.setTimeout(() => {
    convertCurrentLink({ silent: true }).catch(() => {});
  }, 400);
}

function setBusy(isBusy) {
  submitButton.disabled = isBusy;
  submitButton.textContent = isBusy ? "Fetching captions…" : "Convert to Markdown";
}

async function convertCurrentLink({ force = false, silent = false } = {}) {
  const url = urlInput.value.trim();
  const videoId = parseYouTubeVideoId(url);
  if (!videoId) {
    throw new Error("That doesn’t look like a YouTube URL.");
  }
  if (!force && videoId === lastFetchedVideoId && current) {
    setStatus("Done. Preview, copy, or download.");
    return;
  }

  const generation = ++convertGeneration;
  hideResult();
  setBusy(true);
  setStatus("Fetching captions…");
  try {
    const result = await convertViaApi(url);
    if (generation !== convertGeneration) return;
    lastFetchedVideoId = videoId;
    showResult(result);
    setStatus("Done. Preview, copy, or download.");
  } catch (error) {
    if (generation !== convertGeneration) return;
    lastFetchedVideoId = null;
    if (silent) {
      setStatus(error instanceof Error ? error.message : "Conversion failed", true);
      return;
    }
    throw error;
  } finally {
    if (generation === convertGeneration) {
      setBusy(false);
    }
  }
}

async function runConvert() {
  try {
    await convertCurrentLink({ force: true });
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Conversion failed", true);
  }
}

urlInput.addEventListener("input", () => {
  syncClearButton();
  if (!urlInput.value.trim() && lastAutoVideoId) {
    skipAutoFillForVideoId = lastAutoVideoId;
  }
});
clearButton.addEventListener("click", clearLink);
connectButton.addEventListener("click", () => {
  connectCurrentVideo();
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (!changeInfo.url) return;
  maybeFollowTab(tab);
});

submitButton.addEventListener("click", () => {
  runConvert();
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  runConvert();
});

copyButton.addEventListener("click", async () => {
  if (!current) return;
  try {
    await navigator.clipboard.writeText(current.markdown);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = current.markdown;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  copyButton.textContent = "Copied";
  window.setTimeout(() => {
    copyButton.textContent = "Copy";
  }, 1600);
});

downloadButton.addEventListener("click", () => {
  if (!current) return;
  downloadMarkdown(current.filename, current.markdown);
});

syncClearButton();
