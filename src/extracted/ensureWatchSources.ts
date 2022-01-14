import type { DependencyList } from "react" 

export function ensureWatchSources (rawWatchSources?: DependencyList[0] | DependencyList): DependencyList {
  if (!rawWatchSources) {
    return []
  }

  return Array.isArray(rawWatchSources)
    ? rawWatchSources
    : [rawWatchSources]
}

