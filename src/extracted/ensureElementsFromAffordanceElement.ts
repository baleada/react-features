import { useMemo } from 'react'

export type SupportedElement = HTMLElement // | Document | (Window & typeof globalThis)

export type AffordanceElement<ElementType extends SupportedElement> = ElementType
  | ElementType[]

export function ensureElementsFromAffordanceElement<ElementType extends SupportedElement> (affordanceElement: AffordanceElement<ElementType>): ElementType[] {
  if (Array.isArray(affordanceElement)) {
    return useMemo(() => affordanceElement, [affordanceElement])
  }

  return useMemo(() => [affordanceElement], [affordanceElement])
}
