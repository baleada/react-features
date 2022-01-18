import { useRef } from 'react'
import type { DependencyList } from 'react'
import { scheduleBind } from './scheduleBind'
import type { BindValue, BindElement } from './scheduleBind'

export function bindList (
  { element, list, value, dependencyList }: {
    element: BindElement,
    list: 'class' | 'rel',
    value: BindValue<string>,
    dependencyList: DependencyList,
  }
) {
  const cache = useRef(new WeakMap<HTMLElement, string>())

  scheduleBind({
    element,
    value,
    assign: ({ element, value }) => {
      const domTokenList: HTMLElement['classList'] = element[`${list}List`]

      if (domTokenList.contains(`${value}`)) {
        return
      }
      
      const cached = cache.current.get(element) || ''

      domTokenList.remove(...toListStrings(cached))
      domTokenList.add(...toListStrings(`${value}`))
      
      cache.current.set(element, `${value}`)
    },
    remove: () => {},
    dependencyList,
  })
}

function toListStrings (value: string): string[] {
  return value.split(' ').filter(string => string)
}
