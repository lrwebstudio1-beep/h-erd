# Hotel Erdano — website

Static site for Hotel & Restaurant Erdano, Sarandë. Plain HTML, CSS and a small
script, with no framework and no build step. Upload the contents of `site/` to
any static host.

## Structure

```
site/                    ← deploy this folder
  index.html             Albanian (main page, /)
  en/index.html          English (/en/)
  it/index.html          Italian (/it/)
  404.html               "page not found" (served by Netlify / Cloudflare Pages / most hosts)
  css/style.css          all styles, shared by every language
  js/main.js             booking form → WhatsApp/email message, lazy-loaded videos
  img/  video/  fonts/   optimized images, videos, self-hosted fonts
  favicon.svg  robots.txt  sitemap.xml
_design-export/          original design-tool export + original photos (reference only, not deployed)
```

## Before going live

1. **Set the domain.** Every page uses the placeholder `https://hotel-erdano.example`
   for canonical, hreflang, Open Graph and sitemap URLs. Replace it everywhere with
   the real domain (it appears in the 3 `index.html` files, `sitemap.xml` and `robots.txt`):

   ```powershell
   Get-ChildItem site -Recurse -Include *.html,*.xml,*.txt |
     ForEach-Object { (Get-Content $_ -Raw) -replace 'https://hotel-erdano\.example', 'https://YOUR-DOMAIN' | Set-Content $_ -NoNewline }
   ```

2. Register the site in **Google Search Console** and submit `sitemap.xml`.
3. Link the website from the hotel's **Google Business Profile**.

## SEO

On the site: keyword titles/descriptions per language (Albanian "Sarandë", English and
Italian "Saranda", the spelling foreign guests search), hreflang between the 3 languages,
schema.org data (WebSite + Hotel + Restaurant + FAQPage, linked by `@id`), a visible FAQ
whose text **must stay identical** to the FAQPage JSON in the same page, image alt texts,
image sitemap with `lastmod`, `max-image-preview:large`, Open Graph preview image.

When editing: update `<lastmod>` in `sitemap.xml`; if you change an FAQ answer, change it
in both the `<details>` block and the JSON-LD; keep the address/phone exactly the same
everywhere (site, Google Business Profile, Booking, TripAdvisor, Facebook).

Filled from the hotel's Google Maps listing: `geo` coordinates (39.867641, 20.0155567) and
`hasMap` / "See reviews on Google" → `https://maps.google.com/?cid=1769334464069429081`
(listing name on Google: "HOTEL RESTORANT ERDANO").

Social profiles (footer "Follow us" + `sameAs` in the JSON-LD): Instagram
`hotel_restaurant_erdano`, Facebook `HotelErdanoSarande`. The hotel does **not** take
reservations through Booking.com; reservations are direct, so the JSON-LD `ReserveAction`
and the restaurant's `acceptsReservations` point to WhatsApp (`https://wa.me/355684950566`).

Not yet filled in (need real data, don't guess): `priceRange` (e.g. `"€€"`), TripAdvisor URL.

**Map:** the Google Maps embed (contact section) loads only after the visitor clicks
"Show map", so no Google requests or cookies happen before consent. The embed URL lives
in `js/main.js` (`MAP_SRC`); the CSP allows frames from `https://www.google.com` only.

## Security

The site has no server code, database, login or forms that send data, so most
attack types don't apply. What remains is handled like this:

| Protection | Where |
|---|---|
| Content-Security-Policy: only this site's own files can load (one exception: the Google Maps frame from `https://www.google.com`); inline scripts/styles, `eval`, other domains, `<base>` and form hijacking all blocked; Trusted Types required | `_headers`, `.htaccess`, and a `<meta>` copy in every page |
| Clickjacking blocked (`frame-ancestors 'none'`, `X-Frame-Options: DENY`) | `_headers`, `.htaccess` |
| HTTPS forced (`Strict-Transport-Security`, HTTP→HTTPS redirect, `upgrade-insecure-requests`) | `_headers`, `.htaccess` |
| `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` (camera, mic, location… off), `Cross-Origin-Opener-Policy` | `_headers`, `.htaccess` |
| Hidden/config files, directory listings and non-GET methods refused | `.htaccess` (Netlify/Cloudflare do this by default) |
| Booking script validates dates/guest count and never writes HTML; external links use `rel="noopener"` | `js/main.js`, HTML |
| Photos and videos stripped of GPS/camera metadata | `img/`, `video/` |
| Vulnerability contact | `.well-known/security.txt` (renew `Expires` yearly) |

**Rules when editing:** keep `_headers`, `.htaccess` and the `<meta>` CSP in sync.
Don't add `style="…"`, `onclick="…"` or inline `<script>` code: the policy blocks them
(put CSS in `css/style.css` and JS in `js/main.js`). Adding a third-party service
(Google Maps embed, analytics, booking widget) requires allowing its domain in the
CSP. Strip metadata from new photos before uploading.

Once live, check the headers at https://securityheaders.com and the HTTPS setup at
https://www.ssllabs.com/ssltest/. Turn on 2-factor login for the hosting account,
the domain registrar and `hotelerdano2025@gmail.com`: for a static site these
accounts are the main way in.

## Editing content

Each language is its own page, so text changes are made in each of the three
`index.html` files. Layout and colors live only in `css/style.css`.

- **Phone / WhatsApp number:** search for `355684950566` (HTML files and `js/main.js`).
- **Email:** search for `hotelerdano2025@gmail.com` (HTML files and `js/main.js`).
- **Room "Ask for price" links:** the WhatsApp text is URL-encoded in each link's `href`.
  If you rename a room, update the name in both the heading and the link text.
- **Rating (4.6):** appears in the stats block and the reviews section of each page.
  The partial fifth star is the `offset="60%"` in the star SVG.
- **Booking form messages** (the WhatsApp text with dates) come from the
  `<script id="i18n">` block at the bottom of each page.

## Preview locally

Opening `site/index.html` directly works. For the language links and the 404 page
to behave exactly like on the host, serve the folder, e.g. with VS Code's
"Live Server" extension.

## Images

Photos were re-encoded as JPEG (quality 80) and named by content. For a further
~40% saving, convert them to WebP/AVIF (e.g. with squoosh.app) and swap the
`src` attributes.
