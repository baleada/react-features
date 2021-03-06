import { useIdentified, ensureElementFromExtendable } from '../extracted'
import type { Extendable } from '../extracted'

export type Description = { root: ReturnType<typeof useIdentified> }

export function useDescription (extendable: Extendable): Description {
  return {
    root: useIdentified({
      identifying: ensureElementFromExtendable(extendable),
      attribute: 'ariaDescribedby'
    })
  }
}
