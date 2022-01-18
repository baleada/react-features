import { useRef } from 'react'
import type { MutableRefObject } from 'react'
import type { DependencyList } from 'react'
import { nanoid } from 'nanoid/non-secure'

import { ensureElementsFromAffordanceElement } from '../extracted/ensureElementsFromAffordanceElement'
import { schedule } from '../extracted/schedule'
import { createToEffectedStatus } from '../extracted/createToEffectedStatus'
import { useEffecteds } from '../extracted/useEffecteds'
import { isRef } from '../extracted/isRef'

import type { BindElement } from '../extracted/scheduleBind'

export type IdentifyOptions = {
  dependencyList?: DependencyList[0] | DependencyList,
}

export type Id<BindElementType extends BindElement> = BindElementType extends (HTMLElement | MutableRefObject<HTMLElement>)
  ? MutableRefObject<string>
  : MutableRefObject<string[]>

export function identify<BindElementType extends BindElement> (
  { element }: { element: BindElementType },
  options: IdentifyOptions = {}
): Id<BindElementType> {
  const ids = useRef<string[]>([]),
        ensuredElements = ensureElementsFromAffordanceElement(element),
        effecteds = useEffecteds(),
        nanoids = useRef(new WeakMap<HTMLElement, string>()),
        effect = () => {
          effecteds.current.clear()

          ids.current = ensuredElements.map((element, index) => {
            if (!element) {
              return
            }
            
            effecteds.current.set(element, index)
            
            
            if (!nanoids.current.get(element)) {
              nanoids.current.set(element, nanoid(8))
            }

            return !!element.id ? element.id : nanoids.current.get(element)
          })

          setReturnedRef()
        }

  const returnedRef = useRef(null),
        setReturnedRef = (() => {
          if (isRef(element)) {
            if (Array.isArray(element.current)) {
              return () => {
                returnedRef.current = ids.current
              }
            }
            
            return () => {
              returnedRef.current = ids.current[0]
            }
          }
          
          return () => {
            returnedRef.current = ids.current[0]
          }
        })()

  schedule({
    effect,
    dependencyList: [ensuredElements, ...(options.dependencyList || [])],
    toEffectedStatus: createToEffectedStatus(effecteds),
  }, { runsOnEveryUpdate: isRef(element) })

  return returnedRef as Id<BindElementType>
}
