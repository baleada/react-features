import { useState, useRef, MutableRefObject } from 'react'
import type { Dispatch, SetStateAction } from 'react'
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

export type MultipleIdentifiedElementsApi<ElementType extends SupportedElement> = MultipleElementsApi<ElementType> & { ids: Id<ElementType[]> }
export type SingleIdentifiedElementApi<ElementType extends SupportedElement> = SingleElementApi<ElementType> & { id: Id<ElementType> }

export type MultipleElementsApi<ElementType extends SupportedElement> = {
  getRef: (index: number) => (el: null | ElementType) => any,
  elements: MutableRefObject<(null | ElementType)[]>,
  status: { order: 'changed' | 'none', length: 'shortened' | 'lengthened' | 'none' },
}

export type SingleElementApi<ElementType extends SupportedElement> = {
  ref: (el: null | ElementType) => any,
  element: MutableRefObject<null | ElementType>,
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
          getFunctionRef: ElementApi<ElementType, true, false>['getRef'] = index => newElement => {
            if (newElement) elements.current[index] = newElement
          },
          [status, setStatus]: [
            ElementApi<ElementType, true, false>['status'],
            Dispatch<SetStateAction<ElementApi<ElementType, true, false>['status']>>
          ] = useState({ order: 'none' as const, length: 'none' as const }),
          previousElements = useRef<(null | ElementType)[]>([])
    
    setStatus((() => {
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

      return { order, length }
    })())

    if (identified) {
      const ids = identify({ element: elements.current })

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

  const element: ElementApi<ElementType, false, false>['element'] = useRef(null),
        functionRef: ElementApi<ElementType, false, false>['ref'] = newElement => element.current = newElement

  if (identified) {
    const id = identify({ element: element.current })
    
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
