import { useState, useMemo, useRef } from 'react'
import { nanoid } from 'nanoid/non-secure'
import {
  ensureElementsFromAffordanceElement,
  schedule,
  ensureWatchSources,
  createToEffectedStatus,
  useEffecteds,
} from '../extracted'
import type { BindElement } from '../extracted'
import { DependencyList } from 'react'

export type IdentifyOptions = {
  watchSource?: DependencyList[0] | DependencyList,
}

export type Id<BindElementType extends BindElement> = BindElementType extends HTMLElement
  ? string
  : BindElementType extends HTMLElement[]
    ? string[]
    : never

export function identify<BindElementType extends BindElement> (
  { element }: { element: BindElementType },
  options: IdentifyOptions = {}
): Id<BindElementType> {
  const [ids, setIds] = useState<string[]>([]),
        ensuredElements = ensureElementsFromAffordanceElement(element),
        ensuredWatchSources = ensureWatchSources(options.watchSource),
        effecteds = useEffecteds(),
        nanoids = useRef(new WeakMap<HTMLElement, string>()),
        effect = () => {
          effecteds.current.clear()

          setIds(ensuredElements.map((element, index) => {
            if (!element) {
              return
            }

            effecteds.current.set(element, index)

            if (!nanoids.current.get(element)) {
              nanoids.current.set(element, nanoid(8))
            }

            return !!element.id ? element.id : nanoids.current.get(element)
          }))
        }
  
  schedule({
    effect,
    watchSources: [ensuredElements, ...ensuredWatchSources],
    toEffectedStatus: createToEffectedStatus(effecteds),
  })

  if (Array.isArray(element)) {
    return useMemo(() => ids, [ids]) as Id<BindElementType>
  }

  return useMemo(() => ids[0], [ids]) as Id<BindElementType>
}
