import {degrees, PageSizes, PDFDocument} from 'pdf-lib'

const a4PageSize = [595.2756, 841.8898]
const a6VerticalInset = 23.1764

function isA4Page(width, height) {
    const [a4Width, a4Height] = PageSizes.A4
    return Math.abs(width - a4Width) < 1 && Math.abs(height - a4Height) < 1
}

function isLandscapeA4Page(width, height) {
    return isA4Page(height, width)
}

export async function createPositionedPdf(bytes, position) {
    const source = await PDFDocument.load(bytes)
    if (!source.getPageCount()) throw new Error('PDF nie ma żadnej strony.')

    const sourcePage = source.getPage(0)
    const width = sourcePage.getWidth()
    const height = sourcePage.getHeight()
    const document = await PDFDocument.create()
    if (isLandscapeA4Page(width, height)) return createFromLandscape(document, sourcePage, position)
    const [pageWidth, pageHeight] = isA4Page(width, height) ? [width, height] : a4PageSize
    const page = document.addPage([pageWidth, pageHeight])
    const sourceIsA4 = isA4Page(width, height)
    const label = sourceIsA4
        ? await document.embedPage(sourcePage, {
            left: 0,
            bottom: pageHeight / 2,
            right: pageWidth / 2,
            top: pageHeight,
        })
        : await document.embedPage(sourcePage)
    const labelWidth = sourceIsA4 ? pageWidth / 2 : width
    const labelHeight = sourceIsA4 ? pageHeight / 2 : height
    const verticalInset = sourceIsA4 ? 0 : a6VerticalInset
    const targets = {
        1: {x: 0, y: pageHeight / 2 + verticalInset},
        2: {x: pageWidth / 2, y: pageHeight / 2 + verticalInset},
        3: {x: 0, y: verticalInset},
        4: {x: pageWidth / 2, y: verticalInset},
    }

    page.drawPage(label, {
        ...targets[position],
        width: labelWidth,
        height: labelHeight,
    })
    return document.save()
}

// Landscape A4 holds the label in its upper-left quadrant, turned 90° clockwise.
async function createFromLandscape(document, sourcePage, position) {
    const [pageWidth, pageHeight] = a4PageSize
    const page = document.addPage([pageWidth, pageHeight])
    const quadrantWidth = pageHeight / 2
    const quadrantHeight = pageWidth / 2
    const label = await document.embedPage(sourcePage, {
        left: 0,
        bottom: sourcePage.getHeight() - quadrantHeight,
        right: quadrantWidth,
        top: sourcePage.getHeight(),
    })
    const x = position % 2 ? 0 : pageWidth / 2
    const y = position > 2 ? 0 : pageHeight / 2

    // rotating 90° counter-clockwise around (x, y) shifts the label left by its height
    page.drawPage(label, {x: x + quadrantHeight, y, width: quadrantWidth, height: quadrantHeight, rotate: degrees(90)})
    return document.save()
}
