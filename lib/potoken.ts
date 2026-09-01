import { BG, GOOG_API_KEY, buildURL, type WebPoSignalOutput } from "bgutils-js";

const REQUEST_KEY = "O43z0dpjhgX20SCx4KAo";
const MINTER_TTL_MS = 30 * 60 * 1000;

type Minter = {
  mintAsWebsafeString: (identifier: string) => Promise<string>;
};

let cached:
  | {
      minter: Minter;
      createdAt: number;
    }
  | null = null;

let domReady = false;

async function ensureDom() {
  if (domReady) return;
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
    url: "https://www.youtube.com/",
  });
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    location: dom.window.location,
    origin: dom.window.origin,
  });
  domReady = true;
}

async function createMinter(visitorData: string): Promise<Minter> {
  await ensureDom();
  const bgConfig = {
    fetch: (input: string | URL | Request, init?: RequestInit) =>
      fetch(input, init),
    globalObj: globalThis,
    requestKey: REQUEST_KEY,
    identifier: visitorData,
  };
  const challenge = await BG.Challenge.create(bgConfig);
  if (!challenge) {
    throw new Error("BotGuard challenge failed");
  }
  const interpreterJs =
    challenge.interpreterJavascript
      ?.privateDoNotAccessOrElseSafeScriptWrappedValue;
  if (!interpreterJs) {
    throw new Error("BotGuard interpreter missing");
  }
  // YouTube BotGuard ships a VM as a script; this is required to mint PoTokens.
  new Function(interpreterJs)();
  const botguard = await BG.BotGuardClient.create({
    program: challenge.program,
    globalName: challenge.globalName,
    globalObj: globalThis,
  });
  const webPoSignalOutput: WebPoSignalOutput = [];
  const botguardResponse = await botguard.snapshot({ webPoSignalOutput });
  const integrityResponse = await fetch(buildURL("GenerateIT", false), {
    method: "POST",
    headers: {
      "Content-Type": "application/json+protobuf",
      "x-goog-api-key": GOOG_API_KEY,
      "x-user-agent": "grpc-web-javascript/0.1",
    },
    body: JSON.stringify([REQUEST_KEY, botguardResponse]),
  });
  if (!integrityResponse.ok) {
    throw new Error(`integrity token HTTP ${integrityResponse.status}`);
  }
  const integrityJson = (await integrityResponse.json()) as unknown[];
  const integrityToken = integrityJson[0];
  if (typeof integrityToken !== "string" || !integrityToken) {
    throw new Error("no integrity token");
  }
  return BG.WebPoMinter.create({ integrityToken }, webPoSignalOutput);
}

export async function mintVideoPoToken(
  visitorData: string,
  videoId: string,
): Promise<string> {
  const now = Date.now();
  if (!cached || now - cached.createdAt > MINTER_TTL_MS) {
    cached = {
      minter: await createMinter(visitorData),
      createdAt: now,
    };
  }
  return cached.minter.mintAsWebsafeString(videoId);
}
