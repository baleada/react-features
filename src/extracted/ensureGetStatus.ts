import { MutableRefObject } from 'react'
import type { BindReactiveValueGetter } from '../affordances'
import { isRef } from './isRef'
import type { BindValueGetter } from './scheduleBind'

export type StatusOption<Status extends string> = BindValueGetter<Status> | BindReactiveValueGetter<Status>

export type GetStatus<Status extends string, AffordanceElementType extends HTMLElement | MutableRefObject<HTMLElement[]>> = 
  AffordanceElementType extends MutableRefObject<HTMLElement[]>
    ? (index: number) => Status
    : () => Status

export function ensureGetStatus<Status extends string, AffordanceElementType extends HTMLElement | MutableRefObject<HTMLElement[]>> (
  { element, status }: {
    element: AffordanceElementType,
    status: StatusOption<Status>,
  }
): GetStatus<Status, AffordanceElementType> {
  if (isRef(element)) {
    return (index => {
      if (typeof status === 'function') {
        return status({ element: element.current[index], index })
      }
  
      return status.get({ element: element.current[index], index })
    }) as GetStatus<Status, AffordanceElementType>
  }

  return () => {
    if (typeof status === 'function') {
      return status({ element: element, index: 0 })
    }

    return status.get({ element: element, index: 0 })
  }
}
