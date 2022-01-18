import { useMemo } from 'react'
import type { MutableRefObject } from 'react'
import { isRef } from './isRef'

export type SupportedElement = HTMLElement // | Document | (Window & typeof globalThis)

export type AffordanceElement<ElementType extends SupportedElement> = ElementType
  | MutableRefObject<ElementType[]>

export function ensureElementsFromAffordanceElement<ElementType extends SupportedElement> (affordanceElement: AffordanceElement<ElementType>): ElementType[] {
  if (isRef(affordanceElement)) {
    return affordanceElement.current
  }

  return useMemo(() => [affordanceElement], [affordanceElement])
}
