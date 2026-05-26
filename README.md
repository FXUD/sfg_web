# Starr Fintech Global — sfg.xyz

The official holding-group website for **Starr Fintech Global (SFG)**.
Zero-build static site (HTML + CSS + vanilla JS), animated with
[GSAP](https://gsap.com/) loaded from CDN. Design language: **"Infra
Terminal"** — near-black, JetBrains Mono + Archivo, lime/cyan accents,
node-graph background, scramble-decode headings.

## Structure

```
index.html                  Home — hero, high-frequency framework,
                            strategy research, infrastructure, contact
team.html                   6 leadership (photos) + 16 CMT members
contact.html                Contact form (mailto-based — see below)
privacy-policy.html         Legal draft — review with counsel before launch
accessibility-statement.html Legal draft
assets/
  sfg.css                   Shared design system
  sfg.js                    Shared motion layer (node canvas, scramble,
                            scroll reveals, count-ups, mobile menu)
  team/*.jpg                Leadership headshots (mx/sd/az/cc/cs/ry)
vercel.json                 Static headers + clean URLs
```

No build step, no dependencies to install. To preview locally:

```bash
python3 -m http.server 4321        # then open http://localhost:4321
```

## Editing

- **Copy / sections** live directly in the `.html` files.
- **Colors, type, spacing** are CSS variables at the top of `assets/sfg.css`.
- **Add a leadership photo**: drop a square JPG into `assets/team/`
  named `<initials>.jpg` (e.g. `cc.jpg`) and reference it in the card's
  `.avatar` in `team.html`. Missing files fall back to the initials block
  automatically (`onerror="this.remove()"`).
- **Contact form** currently composes a `mailto:` to `msx@sfg.xyz`. To use a
  real backend, set `ENDPOINT` in the inline script of `contact.html` to a
  Formspree (or similar) URL — it will `POST` instead of opening mail.

## Deploy (Vercel)

1. **New Project** → import `FXUD/sfg_web` (personal GitHub account).
2. **Root Directory:** leave as `./` (this repo *is* the site root — do
   not set `sfg-site/`).
3. **Framework Preset:** `Other`. Leave Build Command and Output Directory
   empty — it's served as static files.
4. **Deploy**, verify the `*.vercel.app` preview.
5. **Domains** → add `sfg.xyz`, then update DNS at the registrar per the
   records Vercel shows (moving it off Wix).

Vercel Hobby (free) hosts multiple projects and custom domains; only usage
(bandwidth/build minutes) is metered, not project count. Note Hobby's terms
are intended for non-commercial use — consider Pro for a company site.

## License

© Starr Fintech Global. Starr Quant Lab Ltd. is a BVI Business Company.
All rights reserved. Not for redistribution.
