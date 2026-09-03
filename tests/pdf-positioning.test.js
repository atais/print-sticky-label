import {mkdir, readFile, writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {createCanvas, DOMMatrix, ImageData, Path2D} from '@napi-rs/canvas'
import {describe, expect, it} from 'vitest'
import {createPositionedPdf} from '../src/pdf.js'

Object.assign(globalThis, {DOMMatrix, ImageData, Path2D})

const fixtures = resolve('tests/fixtures/pdf-positioning/expected')
const results = resolve('test-results/pdf-positioning')
const renderScale = 1.5
const channelTolerance = 16
const maxDifferentPixels = 0.001

async function renderFirstPage(bytes) {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
    const document = await pdfjs.getDocument({data: new Uint8Array(bytes), disableWorker: true}).promise
    const page = await document.getPage(1)
    const viewport = page.getViewport({scale: renderScale})
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
    const context = canvas.getContext('2d')

    await page.render({canvasContext: context, viewport}).promise
    return context.getImageData(0, 0, canvas.width, canvas.height)
}

function differentPixelRatio(actual, expected) {
    expect(actual.width).toBe(expected.width)
    expect(actual.height).toBe(expected.height)

    let differentPixels = 0
    for (let index = 0; index < actual.data.length; index += 4) {
        const difference = Math.max(
            Math.abs(actual.data[index] - expected.data[index]),
            Math.abs(actual.data[index + 1] - expected.data[index + 1]),
            Math.abs(actual.data[index + 2] - expected.data[index + 2]),
            Math.abs(actual.data[index + 3] - expected.data[index + 3]),
        )
        if (difference > channelTolerance) differentPixels += 1
    }
    return differentPixels / (actual.data.length / 4)
}

async function writeDiffImages(name, position, actual, expected) {
    await mkdir(results, {recursive: true})
    const diff = createCanvas(actual.width, actual.height)
    const context = diff.getContext('2d')
    const image = context.createImageData(actual.width, actual.height)

    for (let index = 0; index < actual.data.length; index += 4) {
        const difference = Math.max(
            Math.abs(actual.data[index] - expected.data[index]),
            Math.abs(actual.data[index + 1] - expected.data[index + 1]),
            Math.abs(actual.data[index + 2] - expected.data[index + 2]),
            Math.abs(actual.data[index + 3] - expected.data[index + 3]),
        )
        if (difference > channelTolerance) {
            image.data.set([255, 0, 90, 255], index)
        } else {
            image.data.set([235, 235, 235, 255], index)
        }
    }

    context.putImageData(image, 0, 0)
    await Promise.all([
        writeFile(resolve(results, `${name}-${position}-expected.png`), imageToPng(expected)),
        writeFile(resolve(results, `${name}-${position}-actual.png`), imageToPng(actual)),
        writeFile(resolve(results, `${name}-${position}-diff.png`), diff.toBuffer('image/png')),
    ])
}

function imageToPng(imageData) {
    const canvas = createCanvas(imageData.width, imageData.height)
    canvas.getContext('2d').putImageData(imageData, 0, 0)
    return canvas.toBuffer('image/png')
}

describe('PDF label positioning', () => {
    const cases = [
        {name: 'a4', source: 'a4/a4-1.pdf', expected: position => `a4/a4-${position}.pdf`},
        {name: 'a6', source: 'a6/in.pdf', expected: position => `a6/a6-${position}.pdf`},
    ]

    for (const testCase of cases) {
        for (const position of [1, 2, 3, 4]) {
            it(`matches the validated ${testCase.name.toUpperCase()} position ${position}`, async () => {
                const [source, expected] = await Promise.all([
                    readFile(resolve(fixtures, testCase.source)),
                    readFile(resolve(fixtures, testCase.expected(position))),
                ])
                const actual = await createPositionedPdf(source, position)
                const actualImage = await renderFirstPage(actual)
                const expectedImage = await renderFirstPage(expected)
                const difference = differentPixelRatio(actualImage, expectedImage)

                if (difference > maxDifferentPixels) await writeDiffImages(testCase.name, position, actualImage, expectedImage)
                expect(difference).toBeLessThanOrEqual(maxDifferentPixels)
            })
        }
    }
})
