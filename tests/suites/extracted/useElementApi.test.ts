import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('useElementApi')
)

suite(`builds single element API`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/single')
  await page.waitForSelector('span')

  const expected: any = {}

  const from = await page.evaluate(async () => (window as unknown as WithGlobals).testState.elementApi.element)
  expected.from = null

  assert.is(from, expected.from)
  
  const to = await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.elementApi.ref((window as unknown as WithGlobals).testState.stub.current)
    await (window as unknown as WithGlobals).nextTick()
    return (window as unknown as WithGlobals).testState.elementApi.element.tagName
  })
  expected.to = 'SPAN'

  assert.is(to, expected.to)
})

suite(`builds multiple elements API`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/multiple')
  await page.waitForSelector('span')

  const expected: any = {}

  const from = await page.evaluate(async () => [...(window as unknown as WithGlobals).testState.elementsApi.elements.current])
  expected.from = []

  assert.equal(from, expected.from)
  
  
  const to = await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.elementsApi.getRef(0)((window as unknown as WithGlobals).testState.stub0.current);
    (window as unknown as WithGlobals).testState.elementsApi.getRef(1)((window as unknown as WithGlobals).testState.stub1.current);
    (window as unknown as WithGlobals).testState.elementsApi.getRef(2)((window as unknown as WithGlobals).testState.stub2.current);
    return (window as unknown as WithGlobals).testState.elementsApi.elements.current.map(element => element.className)
  })
  expected.to = ['0', '1', '2']

  assert.equal(to, expected.to)
})

suite(`identifies single element`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/singleIdentified')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.elementApi.ref((window as unknown as WithGlobals).testState.stub.current);
          await (window as unknown as WithGlobals).nextTick();
          return (window as unknown as WithGlobals).testState.elementApi.id.current.length
        }),
        expected = 8

  assert.is(value, expected)
})

suite(`identifies multiple elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/multipleIdentified')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => (window as unknown as WithGlobals).testState.elementsApi.ids.current.every(id => id.length === 8)),
        expected = true

  assert.is(value, expected)
})

suite(`recognizes lengthening of multiple elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/multiple')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.elementsApi.elements.current = [(window as unknown as WithGlobals).testState.stub0.current];
          (window as unknown as WithGlobals).testState.forceUpdate();
          await (window as unknown as WithGlobals).nextTick();
          (window as unknown as WithGlobals).testState.elementsApi.elements.current = [
            (window as unknown as WithGlobals).testState.stub0.current,
            (window as unknown as WithGlobals).testState.stub1.current,
          ];  
          return {
            order: (window as unknown as WithGlobals).testState.elementsApi.status.current.order,
            length: (window as unknown as WithGlobals).testState.elementsApi.status.current.length,
          }
        }),
        expected = { order: 'none', length: 'lengthened' }

  assert.equal(value, expected)
})

suite(`recognizes shortening of multiple elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/multiple')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.elementsApi.elements.current = [
            (window as unknown as WithGlobals).testState.stub0.current,
            (window as unknown as WithGlobals).testState.stub1.current,
          ];
          (window as unknown as WithGlobals).testState.forceUpdate();
          await (window as unknown as WithGlobals).nextTick();
          (window as unknown as WithGlobals).testState.elementsApi.elements.current = (window as unknown as WithGlobals).testState.elementsApi.elements.current.slice(0, 1);
          (window as unknown as WithGlobals).testState.forceUpdate();
          await (window as unknown as WithGlobals).nextTick();
          return {
            order: (window as unknown as WithGlobals).testState.elementsApi.status.current.order,
            length: (window as unknown as WithGlobals).testState.elementsApi.status.current.length,
          }
        }),
        expected = { order: 'none', length: 'shortened' }

  assert.equal(value, expected)
})

suite(`recognizes reordering of multiple elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useElementApi/multiple')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.elementsApi.getRef(0)((window as unknown as WithGlobals).testState.stub0.current);
          (window as unknown as WithGlobals).testState.elementsApi.getRef(1)((window as unknown as WithGlobals).testState.stub1.current);
          (window as unknown as WithGlobals).testState.forceUpdate();
          await (window as unknown as WithGlobals).nextTick();
          (window as unknown as WithGlobals).testState.elementsApi.elements.current = (window as unknown as WithGlobals).testState.elementsApi.elements.current.slice().reverse();
          (window as unknown as WithGlobals).testState.forceUpdate();
          await (window as unknown as WithGlobals).nextTick();
          return {
            order: (window as unknown as WithGlobals).testState.elementsApi.status.current.order,
            length: (window as unknown as WithGlobals).testState.elementsApi.status.current.length,
          }
        }),
        expected = { order: 'changed', length: 'none' }

  assert.equal(value, expected)
})

suite.run()
