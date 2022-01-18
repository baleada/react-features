import type { DependencyList } from 'react'
import { scheduleBind } from './scheduleBind'
import type { BindValue, BindElement } from './scheduleBind'

export function bindStyle ({ element, property, value, dependencyList }: {
  element: BindElement,
  property: string,
  value: BindValue<string>,
  dependencyList: DependencyList
}) {
  scheduleBind<string>(
    {
      element,
      assign: ({ element, value }) => {
        if ((element as HTMLElement).style[property] === value) {
          return
        }
        
        (element as HTMLElement).style[property] = value
      },
      remove: ({ element }) => {
        (element as HTMLElement).style[property] = ''
      },
      value,
      dependencyList,
    }
  )
}
