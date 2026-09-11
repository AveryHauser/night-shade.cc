# night-shade.cc

Personal dev site for Avery Hauser — projects in progress, the home lab, and open decisions.
Plain HTML/CSS/JS. No framework, no build step, no analytics.

```
index.html              the page
404.html                Cloudflare Pages serves this for missing routes
assets/js/projects.js   ← all project content lives here
assets/js/site.js       renders cards, filters, and the belladonna hero
assets/css/site.css     styles (tokens at the top)
assets/favicon.svg
_headers                security headers for Cloudflare Pages (CSP, HSTS, etc.)
.well-known/security.txt
robots.txt
```

## Updating projects

Edit `assets/js/projects.js`. Each entry becomes a card **and** a fruit on the hero plant:

| status     | on the plant  |
|------------|---------------|
| `running`  | ripe black berry |
| `building` | green berry   |
| `planned`  | flower        |
| `idea`     | bud           |

Fields: `id`, `title`, `field` (`ai`, `security`, `infra`, `club`, `web`), `status`, `host`, `summary`,
optional `url`, `stack[]`, `notes[]`, `next`. Bump `updated` at the top when you edit.
The plant has 12 fruit slots; projects past 12 still get cards.

The lab diagram, inventory table, GPU comparison and "Now & next" lists are plain HTML in `index.html`.

## Preview locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deploy to Cloudflare Pages

1. Push this folder to a GitHub repo (e.g. `night-shade.cc`).
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → pick the repo.
3. Build settings: framework preset **None**, build command **empty**, output directory **`/`**.
4. After the first deploy: project → **Custom domains** → add `night-shade.cc` (and `www.night-shade.cc` if you want it).
   Since the domain's DNS is already on Cloudflare, the records are created for you.

Or from the CLI: `npx wrangler pages deploy . --project-name night-shade`

Every push to `main` redeploys.

## Things to finish

- **Email:** the site lists `hello@night-shade.cc`. Turn on Cloudflare **Email Routing** for the domain and forward
  that address to your inbox (free), or change the address in `index.html` and `.well-known/security.txt`.
- **GitHub:** uncomment the GitHub line in the footer of `index.html` and add your handle.
- **security.txt:** `Expires` is set to 2027-09-11. Renew it before then.
- **Fonts:** loaded from Google Fonts (Gloock, Schibsted Grotesk, JetBrains Mono). To drop that third-party request,
  download the woff2 files into `assets/fonts/`, add `@font-face` rules to `site.css`, remove the `<link>` tags,
  and change `font-src` in `_headers` to `'self'`.

## Kept off the site on purpose

No IP addresses, subnet ranges, router models on the WAN side, tailnet names, or location. The lab diagram is
conceptual. Worth a second look before adding anything that maps your network more precisely.
