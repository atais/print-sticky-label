# Working notes for agents

## Tests

- `npm test` compares rendered first-page pixels of `createPositionedPdf` output against reference PDFs.
- Fixtures live in `tests/fixtures/pdf-positioning/<case>/` as `in.pdf` plus `out-1.pdf` … `out-4.pdf` (quarters: 1 upper left, 2 upper right, 3 lower left, 4 lower right). Keep inputs and expected outputs strictly separated.
- A new input case = new folder with `in.pdf`, add its name to `cases` in `tests/pdf-positioning.test.js`, generate the `out-N.pdf` files with the code, then ask the user to validate them visually.

## Fixture anonymization

Real shipping labels must be anonymized before they are committed (names, addresses, parcel/POK numbers, pickup points, barcode, QR). Done with LibreOffice, without UNO (bundled Python is killed on this machine):

1. `soffice --headless --convert-to odg in.pdf` (PDF opens as a Draw document).
2. Edit `content.xml` inside the ODG: replace text, shuffle barcode bar heights/gaps and QR module positions so they no longer decode.
3. Zip back (`mimetype` first, stored), then `soffice --headless --convert-to pdf`.
4. Render and look at the result before committing.

## Release and deploy

- Commit messages are in Polish, conventional style (`feat:`, `fix:`, `docs:`).
- GitHub Pages deploys through `.github/workflows/deploy-pages.yml`, triggered by publishing a release or by `workflow_dispatch`.
- Releases are semver tags (`gh release create vX.Y.Z --target main`); new feature = minor bump, fix = patch. Publishing the release triggers the deploy, so no separate manual deploy is needed afterwards.
- Only commit, push, or release when the user asks.
