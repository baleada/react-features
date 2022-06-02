import type { DependencyList } from 'react'
import type { StatusOption } from './ensureGetStatus'

export function ensureDependencyListFromStatus<Status extends string> (status: StatusOption<Status>): DependencyList {
  if (typeof status === 'function') {
    return []
  }
  
  return status.dependencyList
}
