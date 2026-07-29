import * as React from 'react'

// How a dragged row looks and moves, shared by every list that reorders by
// dragging: the Products page's categories and products, and the product form's
// variants and customizations.

// Give the drag a floating copy of the row that tracks the cursor. The in-list
// row is hidden (opacity-0) once dragging starts, so without an explicit drag
// image the browser would show nothing; this clones the row, lays it out
// off-screen as an elevated card, and hands it to the drag operation.
export function setRowDragImage(event: React.DragEvent<HTMLElement>) {
  const node = event.currentTarget
  const rect = node.getBoundingClientRect()
  const offsetX = event.clientX - rect.left
  const offsetY = event.clientY - rect.top
  const clone = node.cloneNode(true) as HTMLElement
  clone.classList.remove('opacity-0')
  clone.style.position = 'fixed'
  clone.style.top = '0'
  clone.style.left = '-10000px'
  clone.style.width = `${rect.width}px`
  clone.style.margin = '0'
  clone.style.opacity = '1'
  clone.style.pointerEvents = 'none'
  clone.style.borderRadius = '8px'
  clone.style.background = 'var(--card, #ffffff)'
  clone.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.06)'
  document.body.appendChild(clone)
  event.dataTransfer.setDragImage(clone, offsetX, offsetY)
  // The drag image is snapshotted synchronously, so the clone can go now.
  window.setTimeout(() => clone.remove(), 0)
}

// FLIP reorder animation: rows register their node by id, and after every
// render each row that changed vertical position is snapped back to its old
// spot with a transform, then transitioned to its new spot — so reorders slide
// instead of jumping. Returns a ref callback to attach to each row.
export function useReorderTransition() {
  const nodes = React.useRef(new Map<string, HTMLElement>())
  const prevTops = React.useRef(new Map<string, number>())

  const register = React.useCallback(
    (id: string, node: HTMLElement | null) => {
      if (node) nodes.current.set(id, node)
      else nodes.current.delete(id)
    },
    [],
  )

  React.useLayoutEffect(() => {
    const nextTops = new Map<string, number>()
    nodes.current.forEach((node, id) => {
      const top = node.offsetTop
      nextTops.set(id, top)
      const prev = prevTops.current.get(id)
      if (prev !== undefined && prev !== top) {
        const delta = prev - top
        node.style.transition = 'none'
        node.style.transform = `translateY(${delta}px)`
        // A row mid-slide would otherwise pass back under the stationary
        // cursor and fire another dragover, swapping it back on a loop. Make
        // it ignore pointer/drag events until it settles.
        node.style.pointerEvents = 'none'
        // Next frame: release to the new position with a transition.
        requestAnimationFrame(() => {
          node.style.transition = 'transform 200ms ease'
          node.style.transform = ''
          const done = () => {
            node.style.pointerEvents = ''
            node.removeEventListener('transitionend', done)
          }
          node.addEventListener('transitionend', done)
        })
      }
    })
    prevTops.current = nextTops
  })

  return register
}
