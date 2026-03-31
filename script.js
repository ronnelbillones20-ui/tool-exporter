let pyodide;
let currentMode = 'XLS_TO_PDF';

async function initPyodide() {
    pyodide = await loadPyodide();
    await pyodide.loadPackage(["pandas", "openpyxl"]);
    // For PDF to Excel, we use a micro-pip install for pdfplumber
    await pyodide.loadPackage("micropip");
    const micropip = pyodide.pyimport("micropip");
    await micropip.install('pdfplumber');
    
    document.getElementById('status').innerText = "System Ready";
}

initPyodide();

// File Input Handling
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('fileInput');
const convertBtn = document.getElementById('convertBtn');

dropZone.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
    if (e.target.files.length > 0) {
        document.getElementById('file-label').innerText = e.target.files[0].name;
        convertBtn.classList.remove('hidden');
    }
};

convertBtn.onclick = async () => {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        document.getElementById('status').innerText = "Processing... Please wait.";

        try {
            if (currentMode === 'PDF_TO_XLS') {
                await convertPdfToExcel(uint8Array, file.name);
            } else {
                // Simplified Excel handling logic via Python
                await processExcelData(uint8Array, file.name);
            }
            document.getElementById('status').innerText = "Conversion Complete!";
        } catch (err) {
            console.error(err);
            document.getElementById('status').innerText = "Error during conversion.";
        }
    };
    reader.readAsArrayBuffer(file);
};

async function convertPdfToExcel(data, filename) {
    pyodide.FS.writeFile("input.pdf", data);
    
    const pythonCode = `
import pdfplumber
import pandas as pd

def extract_pdf():
    all_data = []
    with pdfplumber.open("input.pdf") as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                df = pd.DataFrame(table[1:], columns=table[0])
                # Numeric type enforcement
                for col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='ignore')
                all_data.append(df)
    
    final_df = pd.concat(all_data, ignore_index=True)
    final_df.to_excel("output.xlsx", index=False)

extract_pdf()
    `;
    
    await pyodide.runPythonAsync(pythonCode);
    const output = pyodide.FS.readFile("output.xlsx");
    downloadFile(output, filename.replace(".pdf", ".xlsx"), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
}

function downloadFile(data, name, type) {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
}
