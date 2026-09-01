# Said.md

Turn captions from a public YouTube video into Markdown. Preview, copy, and download from the web app; use the Chrome side panel so you don’t need a new tab.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and paste a public video URL.

## Chrome extension (unpacked)

1. Keep `npm run dev` running (the extension calls `http://localhost:3000/api/convert`).
2. Open `chrome://extensions` and enable Developer mode.
3. Load unpacked and select the `extension/` folder.
4. On a YouTube watch page, click the toolbar icon to open the side panel.

After deploying to Vercel, set `API_BASE` in `extension/config.js` to your app URL.

## Current scope

- Existing captions/CC only; videos without captions fail
- No login; public videos only
- Output is a timestamped transcript Markdown file
- AI five-point notes are deferred to a later phase
