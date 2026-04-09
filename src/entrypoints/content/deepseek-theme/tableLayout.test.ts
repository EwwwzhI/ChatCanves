import { afterEach, describe, expect, it } from 'vitest'
import {
  __resetDeepSeekTableLayoutSyncForTests,
  syncDeepSeekTableLayout,
} from './tableLayout'

afterEach(() => {
  __resetDeepSeekTableLayoutSyncForTests()
  document.body.innerHTML = ''
})

describe('deepseek table layout', () => {
  it('wraps assistant tables in a dedicated scroll container', () => {
    document.body.innerHTML = `
      <div class="ds-message _63c77b1">
        <div class="_871cbca">
          <table><tbody><tr><td>hello</td></tr></tbody></table>
        </div>
      </div>
    `

    syncDeepSeekTableLayout()

    const wrapper = document.querySelector('.ccv-deepseek-table-scroll')
    expect(wrapper).toBeTruthy()
    expect(wrapper?.querySelector('table')).toBeTruthy()
  })

  it('wraps role tables in a dedicated scroll container', () => {
    document.body.innerHTML = `
      <div class="ds-message _63c77b1">
        <div class="_871cbca">
          <div role="table"><div role="row"><div role="cell">hello</div></div></div>
        </div>
      </div>
    `

    syncDeepSeekTableLayout()

    const wrapper = document.querySelector('.ccv-deepseek-table-scroll')
    expect(wrapper).toBeTruthy()
    expect(wrapper?.querySelector('[role="table"]')).toBeTruthy()
  })

  it('does not duplicate wrappers on repeated sync', () => {
    document.body.innerHTML = `
      <div class="ds-message _63c77b1">
        <div class="_871cbca">
          <table><tbody><tr><td>hello</td></tr></tbody></table>
        </div>
      </div>
    `

    syncDeepSeekTableLayout()
    syncDeepSeekTableLayout()

    expect(document.querySelectorAll('.ccv-deepseek-table-scroll')).toHaveLength(1)
  })

  it('wraps overflow blocks that look like table layouts', () => {
    document.body.innerHTML = `
      <div class="ds-message _63c77b1">
        <div class="_871cbca" id="container">
          <div id="pseudo-table">
            <div>left</div>
            <div>right</div>
          </div>
        </div>
      </div>
    `

    const container = document.getElementById('container') as HTMLElement
    const pseudoTable = document.getElementById('pseudo-table') as HTMLElement

    Object.defineProperty(container, 'clientWidth', { value: 200, configurable: true })
    Object.defineProperty(pseudoTable, 'scrollWidth', { value: 420, configurable: true })

    syncDeepSeekTableLayout()

    expect(document.querySelectorAll('.ccv-deepseek-table-scroll')).toHaveLength(1)
    expect(document.querySelector('.ccv-deepseek-table-scroll')?.firstElementChild).toBe(
      pseudoTable,
    )
  })
})
