# GlassConvert

A browser-based file conversion utility using **Pyodide** (Python in WebAssembly) and **Tailwind CSS**.

## Features
- **Excel to PDF:** Preserves PHP currency formatting and borders.
- **PDF to Excel:** Uses `pdfplumber` to extract multi-page tables while maintaining numeric data types.
- **Privacy First:** All processing happens in your browser. No files are uploaded to a server.

## Deployment to GitHub Pages
1. Create a new repository on GitHub.
2. Upload `index.html`, `style.css`, and `script.js`.
3. Go to **Settings > Pages**.
4. Set the Source to **Deploy from a branch** and select `main`.
5. Your tool will be live at `https://[your-username].github.io/[repo-name]/`.

## Technical Notes
- **Merged Cells:** The Python logic utilizes `pandas` with `ffill()` logic (forward fill) to handle gaps often created by merged cells in financial spreadsheets.
- **Currency:** Ensure your Excel source uses standard currency formatting; `openpyxl` reads the format string to maintain "₱" symbols.
