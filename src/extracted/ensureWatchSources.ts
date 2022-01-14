import type { DependencyList } from "react" 

export function ensureWatchSources (rawWatchSources?: DependencyList[0] | DependencyList): DependencyList {
  if (rawWatchSources === undefined) {
    return []
  }

  return Array.isArray(rawWatchSources)
    ? rawWatchSources
    : [rawWatchSources]
}

