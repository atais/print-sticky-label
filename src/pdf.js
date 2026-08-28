import {PDFDocument} from 'pdf-lib'

export async function createPositionedPdf(bytes, position) {
    const source = await PDFDocument.load(bytes)
    if (!source.getPageCount()) throw new Error('PDF nie ma żadnej strony.')

    const sourcePage = source.getPage(0)
    const width = sourcePage.getWidth()
    const height = sourcePage.getHeight()
    const document = await PDFDocument.create()
    const page = document.addPage([width, height])
    const label = await document.embedPage(sourcePage, {
        left: 0,
        bottom: height / 2,
        right: width / 2,
        top: height,
    })
    const targets = {
        1: {x: 0, y: height / 2},
        2: {x: width / 2, y: height / 2},
        3: {x: 0, y: 0},
        4: {x: width / 2, y: 0},
    }

    page.drawPage(label, {...targets[position], width: width / 2, height: height / 2})
    return document.save()
}
