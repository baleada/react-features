import { useStorage } from '../extracted'
import type { Storage, StorageOptions } from '../extracted'
import type { Tablist } from '../interfaces'

export type TablistStorage = Storage
export type TablistStorageOptions = StorageOptions

const defaultOptions: TablistStorageOptions = {
  key: 'Baleada Features tablist'
}

export function useTablistStorage (tablist: Tablist, options: TablistStorageOptions = {}): TablistStorage {
  const { key } = { ...defaultOptions, ...options }

  return useStorage({
    key,
    initialEffect: storeable => {
      switch (storeable.value.status) {
        case 'stored':
          const { selected, focused } = JSON.parse(storeable.value.string)
          tablist.focus.exact(focused)
          tablist.select.exact(selected)
          break
        case 'ready':
        case 'removed':
          // Do nothing
          // `useTablist` has already assigned initial value
          break
      }
    },
    getString: () => JSON.stringify({ focused: tablist.focused.value, selected: tablist.selected.value }),
  })
}
