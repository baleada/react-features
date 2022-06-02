import { useLayoutEffect, useRef } from 'react'

export type GuardedDependency<Current extends string | boolean | number | any[]> = {
  getCurrent: () => Current,
  shouldPerformEffect: (previous: Current) => boolean,
}

export function useGuardedLayoutEffect<Current extends string | boolean | number | any[]> ({ getCurrent, shouldPerformEffect, effect }: GuardedDependency<Current> & {
  effect: (previous: Current) => void,
}): void {
  const previous = useRef<Current>()

  useLayoutEffect(() => {
    if (shouldPerformEffect(previous.current)) {
      effect(previous.current)
    }

    const current = getCurrent()

    previous.current = Array.isArray(current)
      ? [...current] as Current
      : current    
  })
}
