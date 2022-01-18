import { useRef, useLayoutEffect } from 'react'
import type { DependencyList } from 'react'

export type ScheduleOptions = {
  /**
   * Set to `true` only when scheduling side effects for arrays of elements that have 
    a chance to reactively change order or length during the component lifecycle.
   */
  runsOnEveryLayout?: boolean,
}

/**
 * Schedule a side effect to run once after the component is mounted, then flush the side effect effect dependency change.
 * Truly the magic that glues this entire system together.
 */
export function schedule (
  { effect, dependencyList, toEffectedStatus }: {
    effect: () => any,
    dependencyList: DependencyList,
    toEffectedStatus: (current: any, previous: any) => 'stale' | 'fresh',
  },
  options: ScheduleOptions = {},
) {
  const status = useRef<'mounted' | 'unmounted'>('unmounted'),
        previous = useRef<DependencyList>([]),
        { runsOnEveryLayout = false } = options,
        scheduled = () => {
          switch (status.current) {
            case 'unmounted':
              effect()
              status.current = 'mounted'
              break
            case 'mounted':
              if (toEffectedStatus(dependencyList, previous.current) === 'fresh') break
              effect()
          }
      
          previous.current = dependencyList
        }

  if (runsOnEveryLayout) {
    useLayoutEffect(scheduled)
  } else {
    useLayoutEffect(scheduled, dependencyList)
  }
}
