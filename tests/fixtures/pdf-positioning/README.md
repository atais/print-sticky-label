# PDF positioning test fixtures

Add the four manually validated reference PDFs to the `expected` folder:

```text
tests/fixtures/pdf-positioning/
└── expected/
    ├── a4-1.pdf
    ├── a4-2.pdf
    ├── a4-3.pdf
    └── a4-4.pdf
```

`expected/a4-1.pdf` is also the source PDF: it contains the original label in the upper-left quarter of its first A4 page.

Each `expected/a4-N.pdf` must be the manually validated result with that label in quarter `N`:

1. upper left
2. upper right
3. lower left
4. lower right

The automated test will generate all four positions from `expected/a4-1.pdf`, render the generated and reference PDFs, and compare their first-page pixels. This compares the visible print result instead of the PDF files' binary contents, which can differ even when two PDFs look identical.

Run the check with `npm test`.

GitHub Actions runs the same check on every branch push and pull request.

When it fails, the workflow uploads an artifact named `pdf-positioning-diffs` containing the expected render, generated render, and a pink highlighted diff for each failing position.
