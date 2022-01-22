import { useRef, useLayoutEffect, useCallback, MutableRefObject, useState, Dispatch } from 'react'
import { identify } from '../affordances'
import type { Id } from '../affordances'
import type { SupportedElement } from './ensureElementsFromAffordanceElement'

export type ElementApi<ElementType extends SupportedElement, Multiple extends boolean, Identified extends boolean> = Multiple extends true
  ? Identified extends true
    ? MultipleIdentifiedElementsApi<ElementType>
    : MultipleElementsApi<ElementType>
  : Identified extends true
    ? SingleIdentifiedElementApi<ElementType>
    : SingleElementApi<ElementType>

export type MultipleIdentifiedElementsApi<ElementType extends SupportedElement> = MultipleElementsApi<ElementType> & { ids: Id<MutableRefObject<ElementType[]>> }
export type SingleIdentifiedElementApi<ElementType extends SupportedElement> = SingleElementApi<ElementType> & { id: Id<ElementType> }

export type MultipleElementsApi<ElementType extends SupportedElement> = {
  getRef: (index: number) => (el: ElementType) => any,
  elements: MutableRefObject<(ElementType)[]>,
  status: MutableRefObject<{ order: 'changed' | 'none', length: 'shortened' | 'lengthened' | 'none' }>,
}

export type SingleElementApi<ElementType extends SupportedElement> = {
  ref: (el: ElementType) => any,
  element: ElementType,
}

export type UseElementOptions<Multiple extends boolean, Identified extends boolean> = {
  multiple?: Multiple,
  identified?: Identified
}

const defaultOptions: UseElementOptions<false, false> = {
  multiple: false,
  identified: false, 
}

export function useElementApi<
  ElementType extends SupportedElement,
  Multiple extends boolean = false,
  Identified extends boolean = false,
> (options: UseElementOptions<Multiple, Identified> = {}): ElementApi<ElementType, Multiple, Identified> {
  const { multiple, identified } = { ...defaultOptions, ...options }

  if (multiple) {
    const elements: ElementApi<ElementType, true, false>['elements'] = useRef([]),
          getFunctionRef: ElementApi<ElementType, true, false>['getRef'] = useCallback(index => newElement => {
            if (newElement) elements.current[index] = newElement
          }, []),
          status: ElementApi<ElementType, true, false>['status'] = useRef({ order: 'none' as const, length: 'none' as const }),
          previousElements = useRef<(ElementType)[]>([])

    useLayoutEffect(() => {
      const length = (() => {
        if (elements.current.length > previousElements.current.length) return 'lengthened'
        if (elements.current.length < previousElements.current.length) return 'shortened'
        return 'none'
      })()

      const order = (() => {
        if (length === 'lengthened') {
          for (let i = 0; i < previousElements.current.length; i++) {
            if (!previousElements.current[i].isSameNode(elements.current[i])) return 'changed'
          }

          return 'none'
        }

        for (let i = 0; i < elements.current.length; i++) {
          if (!elements.current[i].isSameNode(previousElements.current[i])) return 'changed'
        }

        return 'none'
      })()

      status.current = { order, length }

      previousElements.current = [...elements.current]
    })

    if (identified) {
      const ids = identify({ element: elements })

      return {
        getRef: getFunctionRef,
        elements,
        status,
        ids,
      } as ElementApi<ElementType, Multiple, Identified>
    }

    return {
      getRef: getFunctionRef,
      elements,
      status,
    } as ElementApi<ElementType, Multiple, Identified>
  }

  const [element, setElement]: [
          ElementApi<ElementType, false, false>['element'],
          Dispatch<ElementApi<ElementType, false, false>['element']>,
        ] = useState(null),
        functionRef: ElementApi<ElementType, false, false>['ref'] = useCallback(newElement => setElement(newElement), [])

  if (identified) {
    const id = identify({ element })
    
    return {
      ref: functionRef,
      element,
      id,
    } as ElementApi<ElementType, Multiple, Identified>
  }

  return {
    ref: functionRef,
    element,
  } as ElementApi<ElementType, Multiple, Identified>
}
