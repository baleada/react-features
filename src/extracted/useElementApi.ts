import { useState, useRef, useEffect } from 'react'
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
  elements: (null | ElementType)[],
  status: { order: 'changed' | 'none', length: 'shortened' | 'lengthened' | 'none' },
}

export type SingleElementApi<ElementType extends SupportedElement> = {
  ref: (el: null | ElementType) => any,
  element: null | ElementType,
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

  const componentStatus = useRef<'rendering' | 'rendered'>('rendering')

  if (multiple) {
    const [elements, setElements]: [
            ElementApi<ElementType, true, false>['elements'],
            Dispatch<SetStateAction<ElementApi<ElementType, true, false>['elements']>>
          ] = useState([]),
          getFunctionRef: ElementApi<ElementType, true, false>['getRef'] = index => newElement => {
            if (componentStatus.current = 'rendered') {
              componentStatus.current = 'rendering'
              previousElements.current = currentElements.current
              currentElements.current = []
            }

            if (newElement) currentElements.current[index] = newElement
          },
          [status, setStatus]: [
            ElementApi<ElementType, true, false>['status'],
            Dispatch<SetStateAction<ElementApi<ElementType, true, false>['status']>>
          ] = useState({ order: 'none' as const, length: 'none' as const }),
          previousElements = useRef<(null | ElementType)[]>([]),
          currentElements = useRef<(null | ElementType)[]>([])
    
    useEffect(() => {
      setElements(currentElements.current)
      componentStatus.current = 'rendered'

      const length = (() => {
        if (currentElements.current.length > previousElements.current.length) return 'lengthened'
        if (currentElements.current.length < previousElements.current.length) return 'shortened'
        return 'none'
      })()

      const order = (() => {
        if (length === 'lengthened') {
          for (let i = 0; i < previousElements.current.length; i++) {
            if (!previousElements.current[i].isSameNode(currentElements.current[i])) return 'changed'
          }

          return 'none'
        }

        for (let i = 0; i < currentElements.current.length; i++) {
          if (!currentElements.current[i].isSameNode(previousElements.current[i])) return 'changed'
        }

        return 'none'
      })()

      setStatus({ order, length })
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
          Dispatch<SetStateAction<ElementApi<ElementType, false, false>['element']>>
        ] = useState(null),
        functionRef: ElementApi<ElementType, false, false>['ref'] = newElement => setElement(newElement)

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
