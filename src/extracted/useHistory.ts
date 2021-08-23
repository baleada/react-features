import { nextTick, shallowRef, watch } from 'vue'
import type { Ref } from 'vue'
import type { Navigateable } from '@baleada/logic'
import { useNavigateable } from '@baleada/vue-composition'

export type History<Item> = {
  recorded: Ref<Navigateable<Item>>,
  record: (item: Item) => void,
  undo: (options?: { distance?: number }) => void,
  redo: (options?: { distance?: number }) => void,
}

export type UseHistoryOptions = {
  maxLength?: true | number,
}

const defaultOptions: UseHistoryOptions = {
  maxLength: true,
}

export function useHistory<Item> (options: UseHistoryOptions = {}) {
  const { maxLength } = { ...defaultOptions, ...options },
        recorded: History<Item>['recorded'] = useNavigateable<Item>([]),
        status = shallowRef<'ready' | 'recorded' | 'undone' | 'redone'>('ready'),
        record: History<Item>['record'] = item => {
          
          if (maxLength === true || recorded.value.array.length < maxLength) {            
            recorded.value.array = [...recorded.value.array , item]
            status.value = 'recorded'
            return
          }
          
          recorded.value.array = [...recorded.value.array.slice(1), item]
          status.value = 'recorded'
        },
        undo: History<Item>['undo'] = (options = {}) => {
          if (status.value === 'recorded') {
            // Wait for recorded array watch effect to navigate to new location
            // before undoing to previous location
            nextTick(() => recorded.value.previous({ loops: false, ...options }))
            status.value = 'undone'
            return
          }

          recorded.value.previous({ loops: false, ...options })
          status.value = 'undone'
        },
        redo: History<Item>['redo'] = (options = {}) => {
          recorded.value.next({ loops: false, ...options })
          status.value = 'redone'
        }

  watch (
    () => recorded.value.array,
    () => recorded.value.navigate(recorded.value.array.length - 1)
  )

  return {
    recorded,
    record,
    undo,
    redo,
  }
}
