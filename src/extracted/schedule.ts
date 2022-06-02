import { useRef, useLayoutEffect } from 'react'
import type { DependencyList } from 'react'
import { useGuardedLayoutEffect } from './useGuardedLayoutEffect'
import type { GuardedDependency } from './useGuardedLayoutEffect'

type DependencyOrGuardedDependencyList = readonly (string | number | boolean | any[] | GuardedDependency<string | number | boolean | any[]>)[]

export function defineGuardedDependency<Current> (getCurrent: () => Current, shouldRunEffect: (previous: Current) => boolean) {
  return {
    getCurrent,
    shouldRunEffect,
  }
}

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
    dependencyList: DependencyOrGuardedDependencyList,
    toEffectedStatus: (current: any, previous: any) => 'stale' | 'fresh',
  },
  options: ScheduleOptions = {},
) {
  const status = useRef<'mounted' | 'unmounted'>('unmounted')

  for (const dependencyOrGuardedDependency of dependencyList) {
    if (isGuardedDependency(dependencyOrGuardedDependency)) {
      const scheduled = previous => {
        switch (status.current) {
          case 'unmounted':
            effect()
            status.current = 'mounted'
            break
          case 'mounted':
            if (toEffectedStatus(dependencyList, previous.current) === 'fresh') break
            effect()
        }
      }
      useGuardedLayoutEffect({
        getCurrent: dependencyOrGuardedDependency.getCurrent,
        shouldRunEffect: dependencyOrGuardedDependency.shouldRunEffect,
        effect,
      })

      continue
    }
    
    useLayoutEffect(effect, [dependencyOrGuardedDependency])
  }
        previous = useRef<DependencyList>([]),
        { runsOnEveryLayout = false } = options,
        scheduled = previous => {
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

function isGuardedDependency (dependencyOrGuardedDependency: any): dependencyOrGuardedDependency is GuardedDependency<any> {
  return typeof dependencyOrGuardedDependency === 'object'
    && typeof dependencyOrGuardedDependency.getCurrent === 'function'
    && typeof dependencyOrGuardedDependency.shouldRunEffect === 'function'
}
