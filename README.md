# Said.md

Turn captions from a public YouTube video into Markdown. Preview, copy, and download from the web app; use the Chrome side panel so you don’t need a new tab.

Caption fetching has to run on your computer. YouTube blocks the same request from Vercel datacenter IPs.

## Run locally

You need [Node.js](https://nodejs.org/) 20+.

```bash
git clone https://github.com/Giorno-Giovanna-Dio/Said.md.git
cd Said.md
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and paste a public video URL that has captions/CC.

## Chrome extension (unpacked)

1. Keep `npm run dev` running. The side panel calls `http://localhost:3000/api/convert` (it also tries 3001 and 3002).
2. Open `chrome://extensions` and enable Developer mode.
3. Load unpacked and select the `extension/` folder.
4. On a YouTube watch page, click the toolbar icon to open the side panel.

## Current scope

- Existing captions/CC only; videos without captions fail
- No login; public videos only
- Output is a timestamped transcript Markdown file
- AI five-point notes are deferred to a later phase
