# Print Sticky Label

Browser-based tool for repositioning a PDF label into one of four quarters of an A4 sticky-label sheet.

The original label must occupy the upper-left quarter of the first PDF page. Select an unused quarter, generate the repositioned PDF, preview it, and download it when ready. PDF processing happens locally in the browser.

## Printing

Print the generated PDF at **100% / Actual Size / Rzeczywisty rozmiar** so the label dimensions remain correct.

## Development

- Node.js 24 or newer
- npm

### Run locally

```bash
npm install
npm run dev
```

Open the local address shown by Vite.

### Production build

```bash
npm run build
npm run preview
```

The deployable static site is generated in `dist/`.

### Deploy to GitHub Pages

The included workflow at `.github/workflows/deploy-pages.yml` builds and deploys the application when you publish a GitHub release. Create the release from a version tag (for example, `v1.0.0`). You can also run **Deploy to GitHub Pages** manually from the Actions tab.

Before the first deployment, open **Settings → Pages** in the GitHub repository and set **Build and deployment → Source** to **GitHub Actions**. This one-time setting enables the Pages site; without it, the workflow cannot upload the Pages artifact.

The footer displays the release tag as the build version. Local builds display `local`.
