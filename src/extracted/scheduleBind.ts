import type { DependencyList } from 'react'
import { AffordanceElement, ensureElementsFromAffordanceElement } from './ensureElementsFromAffordanceElement'
import { ensureWatchSources } from './ensureWatchSources'
import { schedule } from './schedule'
import { createToEffectedStatus } from './createToEffectedStatus'
import { useEffecteds } from '.'

export type BindElement = AffordanceElement<HTMLElement>

export type BindValue<ValueType extends string | number | boolean> =
  ValueType
  | BindValueGetter<ValueType>
  
export type BindValueGetter<ValueType extends string | number | boolean> = ({ element, index }: { element: HTMLElement, index: number }) => ValueType

export function scheduleBind<ValueType extends string | number | boolean> (
  { element, assign, remove, value, watchSources }: {
    element: BindElement,
    assign: ({ element, value, index }:  { element: HTMLElement, value: ValueType, index?: number }) => void,
    remove: ({ element, index }:  { element: HTMLElement, index?: number }) => void,
    value: BindValue<ValueType>,
    watchSources: DependencyList[0] | DependencyList,
  }
): void {
  const elements = ensureElementsFromAffordanceElement(element),
        ensuredWatchSources = ensureWatchSources(watchSources),
        effecteds = useEffecteds(),
        toEffectedStatus = createToEffectedStatus(effecteds)

  if (typeof value === 'function') {
    const get = value

    schedule({
      effect: () => {
        effecteds.current.clear()

        elements.forEach((element, index) => {
          if (!element) {
            return
          }

          effecteds.current.set(element, index)

          const value = get({ element, index })

          if (value === undefined) {
            remove({ element, index })
            return
          }

          assign({ element, value: get({ element, index }), index })
        })
      },
      watchSources: [elements, ...ensuredWatchSources],
      toEffectedStatus,
    })

    return
  }

  schedule({
    effect: () => {
      effecteds.current.clear()
      
      elements.forEach((element, index) => {
        if (!element) {
          return
        }
        
        effecteds.current.set(element, index)

        if (value === undefined) {
          remove({ element })
          return
        }
        
        assign({ element, value })
      })
    },
    watchSources: [elements, ...ensuredWatchSources],
    toEffectedStatus,
  })
}
