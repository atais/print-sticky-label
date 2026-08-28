import {PDFDocument} from 'pdf-lib'
import {icon} from '@fortawesome/fontawesome-svg-core'
import {faGithub} from '@fortawesome/free-brands-svg-icons/faGithub'
import './style.css'

const $ = (selector) => document.querySelector(selector)
const fileInput = $('#fileInput'), dropzone = $('#dropzone'), filename = $('#filename')
const makeBtn = $('#makeBtn'), downloadBtn = $('#downloadBtn')
const preview = $('#preview'), previewFrame = $('#previewFrame')
let selectedFile, selectedPosition = 1, outputUrl, outputName

$('#buildVersion').textContent = import.meta.env.VITE_BUILD_VERSION || 'local'
$('#githubIcon').innerHTML = icon(faGithub).html.join('')

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

async function createPositionedPdf(file, position) {
    const source = await PDFDocument.load(await file.arrayBuffer())
    if (!source.getPageCount()) throw new Error('PDF nie ma żadnej strony.')
    const sourcePage = source.getPage(0), width = sourcePage.getWidth(), height = sourcePage.getHeight()
    const document = await PDFDocument.create(), page = document.addPage([width, height])
    const label = await document.embedPage(sourcePage, {left: 0, bottom: height / 2, right: width / 2, top: height})
    const targets = {
        1: {x: 0, y: height / 2},
        2: {x: width / 2, y: height / 2},
        3: {x: 0, y: 0},
        4: {x: width / 2, y: 0}
    }
    page.drawPage(label, {...targets[position], width: width / 2, height: height / 2})
    return document.save()
}

makeBtn.addEventListener('click', async () => {
    if (!selectedFile) return;
    makeBtn.disabled = true;
    downloadBtn.disabled = true;
    try {
        const blob = new Blob([await createPositionedPdf(selectedFile, selectedPosition)], {type: 'application/pdf'});
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        outputUrl = URL.createObjectURL(blob);
        outputName = `${selectedFile.name.replace(/\.pdf$/i, '')}_pole-${selectedPosition}.pdf`;
        previewFrame.src = outputUrl;
        preview.style.display = 'block';
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
