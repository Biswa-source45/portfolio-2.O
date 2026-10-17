# Biswabhusan Sahoo — Portfolio

A static site with no build step: plain HTML, CSS and JS, using GSAP, ScrollTrigger, Lenis and anime.js.

## Files
- `index.html`: markup and all CSS (themes, loader, rope, mock-ups)
- `main.js`: behaviour (loader, themes, scroll effects, 3D, rope and rocket, logo box, viewer count)
- `assets/`: libraries (GSAP, ScrollTrigger, Lenis, anime.js) and `photo.jpg`

## Run locally
```
npx serve .
# or
python3 -m http.server 8000
```
Open http://localhost:8000. Opening `index.html` directly also works, but use a server for best results.

## Edit
Open the folder in Antigravity, VS Code or Claude Code. Common edits:
- Text and links: `index.html`. Search for `LinkedIn` and `Live site` to replace the placeholder URLs.
- Colours and themes: the `.pf[data-theme=...]` blocks in the `<style>` section of `index.html`.
- Viewer count: it is fixed at 2,340 (`.vnum` in `main.js`). Connect a real counter if you want a true number.
- Photo: replace `assets/photo.jpg`.

## Deploy
Vercel:
1. Push this folder to a GitHub repo.
2. In Vercel choose Add New → Project and import the repo.
3. Set Framework Preset to "Other" and leave the build command and output directory empty.
4. Deploy.

Netlify and GitHub Pages also work: publish the repo root with no build command.
