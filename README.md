# FormJobs

A static site for people who just took a job in Ireland: first-month take-home, PAYE / USC / PRSI, pension, and the paperwork around the first payslip.

The Angular app is a **standalone SPA**. Pay estimates, guides, and the checklist all run in the browser. No API or server is required after `ng build`.

An optional C# engine in `src/FormJobs.Core` mirrors the same 2026 Revenue maths for unit tests.

## Run the site

```bash
cd src/web
npm start
```

Open http://localhost:4200

If `npm` is not on your PATH, use the shims in `.tools/`:

```bash
export PATH="$PWD/.tools:$PATH"
```

Production build (static files in `src/web/dist/web/browser`):

```bash
cd src/web
npm run build
```

Serve that folder with any static host (Netlify, GitHub Pages, nginx, `npx serve`).

## Optional C# tests

```bash
dotnet test
```

## Not tax advice

Estimates use published 2026 Revenue bands. Payroll, emergency tax, and extra credits (rent, health) will differ.
