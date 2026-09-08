import {createPositionedPdf} from './pdf.js'
import './style.css'
import './layout.js'

const $ = (selector) => document.querySelector(selector)
const fileInput = $('#fileInput'), dropzone = $('#dropzone'), filename = $('#filename')
const makeBtn = $('#makeBtn'), downloadBtn = $('#downloadBtn')
const preview = $('#preview'), previewFrame = $('#previewFrame')
const isTouchDevice = matchMedia('(pointer: coarse)').matches
let selectedFile, selectedPosition = 1, outputUrl, outputName

function setFile(file) {
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) return
    selectedFile = file;
    filename.textContent = file.name;
    makeBtn.disabled = false
}

dropzone.addEventListener('click', () => fileInput.click())
dropzone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        fileInput.click()
    }
})
fileInput.addEventListener('change', (event) => setFile(event.target.files[0]))
for (const name of ['dragenter', 'dragover']) dropzone.addEventListener(name, (event) => {
    event.preventDefault();
    dropzone.classList.add('drag')
})
for (const name of ['dragleave', 'drop']) dropzone.addEventListener(name, (event) => {
    event.preventDefault();
    dropzone.classList.remove('drag')
})
dropzone.addEventListener('drop', (event) => setFile(event.dataTransfer.files[0]))
document.querySelector('.paper').addEventListener('click', (event) => {
    const quad = event.target.closest('.quad')
    if (!quad) return
    selectedPosition = Number(quad.dataset.pos)
    document.querySelectorAll('.quad').forEach((item) => item.classList.toggle('selected', item === quad))
})

function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 2_000)
}

makeBtn.addEventListener('click', async () => {
    if (!selectedFile) return;
    makeBtn.disabled = true;
    downloadBtn.disabled = true;
    try {
        const blob = new Blob([await createPositionedPdf(await selectedFile.arrayBuffer(), selectedPosition)], {type: 'application/pdf'});
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        outputUrl = URL.createObjectURL(blob);
        outputName = `${selectedFile.name.replace(/\.pdf$/i, '')}_pole-${selectedPosition}.pdf`;
        if (isTouchDevice) {
            window.open(outputUrl, '_blank')
        } else {
            previewFrame.src = outputUrl;
            preview.style.display = 'block';
        }
        downloadBtn.disabled = false
    } catch (error) {
        console.error(error)
    } finally {
        makeBtn.disabled = false
    }
})
downloadBtn.addEventListener('click', async () => {
    if (outputUrl && outputName) downloadBlob(await (await fetch(outputUrl)).blob(), outputName)
})
