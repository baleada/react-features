import { useRef, useEffect } from 'react'
import type { DependencyList } from 'react'

/**
 * Schedule a side effect to run once after the component is mounted, then flush the side effect effect dependency change.
 * Truly the magic that glues this entire system together.
 */
export function schedule (
  { effect, watchSources, toEffectedStatus }: {
    effect: () => any,
    watchSources: DependencyList,
    toEffectedStatus: (current: any, previous: any) => 'stale' | 'fresh',
  }
) {
  const status = useRef<'mounted' | 'unmounted'>('unmounted'),
        previous = useRef<DependencyList>([])

  useEffect(() => {
    switch (status.current) {
      case 'unmounted':
        effect()
        status.current = 'mounted'
        break
      case 'mounted':
        if (toEffectedStatus(watchSources, previous.current) === 'fresh') break
        effect()
    }

    previous.current = watchSources
  }, watchSources)
}
