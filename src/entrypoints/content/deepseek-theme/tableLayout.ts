const ASSISTANT_MESSAGE_SELECTOR = '.ds-message._63c77b1:not(.d29f3d7d)'
const TABLE_SELECTOR = `${ASSISTANT_MESSAGE_SELECTOR} :is(table, [role="table"])`
const MARKDOWN_CONTAINER_SELECTOR = `${ASSISTANT_MESSAGE_SELECTOR} :is(.ds-markdown, .ds-markdown-paragraph, ._871cbca)`
const TABLE_WRAPPER_CLASS = 'ccv-deepseek-table-scroll'

let observer: MutationObserver | null = null
let syncScheduled = false

function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE
}

function shouldSyncForNode(node: Node): boolean {
  if (!isElement(node)) return false
  return (
    node.matches(ASSISTANT_MESSAGE_SELECTOR)
    || Boolean(node.closest(ASSISTANT_MESSAGE_SELECTOR))
    || Boolean(node.querySelector(ASSISTANT_MESSAGE_SELECTOR))
    || node.matches(TABLE_SELECTOR)
    || Boolean(node.querySelector(TABLE_SELECTOR))
  )
}

function ensureWrapped(element: HTMLElement): void {
  const parent = element.parentElement
  if (!parent || parent.classList.contains(TABLE_WRAPPER_CLASS)) return

  const wrapper = document.createElement('div')
  wrapper.className = TABLE_WRAPPER_CLASS
  wrapper.setAttribute('data-ccv-deepseek-table-scroll', 'true')
  parent.insertBefore(wrapper, element)
  wrapper.appendChild(element)
}

function isOverflowBlockCandidate(
  element: HTMLElement,
  containerWidth: number,
): boolean {
  if (element.classList.contains(TABLE_WRAPPER_CLASS)) return false
  if (element.closest(`.${TABLE_WRAPPER_CLASS}`)) return false
  if (element.matches(':is(pre, code, img, svg, canvas, video, audio)')) return false
  if (element.children.length < 2) return false
  return element.scrollWidth > containerWidth + 24
}

export function syncDeepSeekTableLayout(root: ParentNode = document): void {
  root.querySelectorAll(TABLE_SELECTOR).forEach((element) => {
    ensureWrapped(element as HTMLElement)
  })

  root.querySelectorAll(MARKDOWN_CONTAINER_SELECTOR).forEach((container) => {
    const containerElement = container as HTMLElement
    const containerWidth = containerElement.clientWidth
    if (containerWidth <= 0) return

    Array.from(containerElement.children).forEach((child) => {
      if (!(child instanceof HTMLElement)) return
      if (!isOverflowBlockCandidate(child, containerWidth)) return
      ensureWrapped(child)
    })
  })
}

function scheduleSync(): void {
  if (syncScheduled || typeof document === 'undefined') return
  syncScheduled = true

  requestAnimationFrame(() => {
    syncScheduled = false
    syncDeepSeekTableLayout(document)
  })
}

export function initDeepSeekTableLayoutSync(): void {
  if (typeof document === 'undefined') return

  scheduleSync()

  if (observer || !document.body) return

  observer = new MutationObserver((mutations) => {
    if (mutations.some(mutation =>
      Array.from(mutation.addedNodes).some(shouldSyncForNode))) {
      scheduleSync()
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
}

export function __resetDeepSeekTableLayoutSyncForTests(): void {
  observer?.disconnect()
  observer = null
  syncScheduled = false

  document.querySelectorAll(`.${TABLE_WRAPPER_CLASS}`).forEach((wrapper) => {
    const wrappedElement = wrapper.firstElementChild
    if (wrappedElement && wrapper.parentNode) {
      wrapper.parentNode.insertBefore(wrappedElement, wrapper)
    }
    wrapper.remove()
  })
}
