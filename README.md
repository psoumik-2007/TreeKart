# TreeKart

TreeKart is a responsive, single-page plant nursery storefront built with HTML, CSS, and vanilla JavaScript. It includes a searchable plant collection, category filters, dark mode, enquiry links, FAQs, and a client-side product admin demo.

## Features

- Responsive landing page and nursery catalogue
- Plant search and category filtering
- Light and dark themes
- Product enquiry links for phone and WhatsApp
- Contact form that prepares an email in the visitor's email application
- Demo product administration with add, edit, stock, and delete actions
- Browser-local product and theme preferences

## Project files

- `index.html` — page structure and CDN configuration
- `styles.css` — custom styles and responsive effects
- `script.js` — catalogue, interactions, and demo administration
- `TreeKart-icon.png` — site icon

## Requirements and dependencies

There is no build step, package manager, or installable project dependency. The page loads these resources from third-party CDNs at runtime:

- Tailwind CSS Play CDN
- Google Fonts (Fraunces and Plus Jakarta Sans)
- Unsplash-hosted photos

An internet connection is needed for those external resources. JavaScript uses modern browser features, including `localStorage`, `sessionStorage`, `IntersectionObserver`, and `crypto.randomUUID()`.

## Run locally

You can serve the project with Python's built-in static file server (Python 3):

```sh
python -m http.server 8000
```

Then open <http://localhost:8000> in a modern browser. No dependencies need to be installed.

## Deploy

This is a static site and can be hosted by GitHub Pages or any static web host:

1. In the GitHub repository, open **Settings → Pages**.
2. Choose **Deploy from a branch**.
3. Select `main` and the repository root (`/`), then save.
4. Wait for the Pages deployment and open the URL shown in the Pages settings.

Keep `index.html`, `styles.css`, `script.js`, and `TreeKart-icon.png` together in the published directory.

## Demo and production notes

- The product catalogue and theme are saved only in the current browser's local storage. They are not shared between visitors or devices and can be cleared by the browser.
- The admin screen is a front-end demonstration, not secure authentication. Its demo credentials are `admin` / `admin123`; anyone can inspect the client-side source and bypass this check. Do not use it to protect real data or deploy it as a production admin system.
- The contact details, address, social links, product catalogue, reviews, and business statistics in the page are example content or placeholders. Replace and verify them before publishing as a real business.
- The contact form opens the visitor's email application; it does not submit to a server. Product enquiry actions use the example phone number.
- There is no payment, checkout, inventory backend, or image upload service.

## License

No license has been specified for this project. All rights reserved unless the repository owner adds a license.
