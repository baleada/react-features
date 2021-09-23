import { ref, computed, watch, shallowRef, nextTick, onMounted } from 'vue'
import type { Ref } from 'vue'
import { useCompleteable } from '@baleada/vue-composition'
import { Completeable } from '@baleada/logic'
import type { CompleteableOptions } from '@baleada/logic'
import { on, bind } from '../affordances'
import {
  useHistory,
  useSingleElement,
  toInputEffectNames,
} from '../extracted'
import type {
  SingleElement,
  History,
  UseHistoryOptions,
} from '../extracted'

export type Textbox = {
  root: SingleElement<HTMLInputElement | HTMLTextAreaElement>,
  completeable: ReturnType<typeof useCompleteable>,
  history: History<{ string: string, selection: Completeable['selection'] }>,
}

export type UseTextboxOptions = {
  initialValue?: string,
  toValid?: (string: string) => boolean,
  completeable?: CompleteableOptions,
  history?: UseHistoryOptions,
}

const defaultOptions: UseTextboxOptions = {
  toValid: () => true,
  initialValue: '',
}

export function useTextbox (options: UseTextboxOptions = {}): Textbox {
  const {
    initialValue,
    toValid,
    completeable: completeableOptions,
  } = { ...defaultOptions, ...options }

  
  // ELEMENTS
  const root: Textbox['root'] = useSingleElement<HTMLInputElement | HTMLTextAreaElement>()

  
  // BASIC BINDINGS
  bind({
    element: root.element,
    values: {
      ariaInvalid: computed(() => 
        !toValid(completeable.value.string)
          ? 'true'
          : 'false'
      )
    }
  })

  
  // COMPLETEABLE
  const completeable: Textbox['completeable'] = useCompleteable(initialValue, completeableOptions || {}),
        selectionEffect = (event: Event | KeyboardEvent) => completeable.value.selection = toSelection(event),
        arrowStatus: Ref<'ready' | 'unhandled' | 'handled'> = ref('ready')

  bind({
    element: root.element,
    values: {
      value: computed(() => completeable.value.string),
    },
  })

  watch(
    () => completeable.value.selection,
    () => {
      (root.element.value as HTMLInputElement | HTMLTextAreaElement).setSelectionRange(
        completeable.value.selection.start,
        completeable.value.selection.end,
        completeable.value.selection.direction,
      )
    },
    { flush: 'post' }
  )

  
  // HISTORY
  const history: Textbox['history'] = useHistory(),
        historyEffect = (event: Event | KeyboardEvent) => history.record({
          string: (event.target as HTMLInputElement | HTMLTextAreaElement).value,
          selection: toSelection(event),
        })

  watch(
    () => history.recorded.value.location,
    () => {
      const { string, selection } = history.recorded.value.item
      completeable.value.string = string
      completeable.value.selection = selection
    },
  )

  history.record({
    string: completeable.value.string,
    selection: completeable.value.selection,
  })
  

  // MULTIPLE CONCERNS
  const status = shallowRef<'ready' | 'input' | 'undone' | 'redone'>('ready')
  
  on<'input' | 'select' | 'focus' | 'mouseup' | 'touchend' | '+arrow' | '+cmd' | '+ctrl' | 'cmd+z' | 'cmd+y' | 'ctrl+z' | 'ctrl+y'>({
    element: root.element,
    effects: defineEffect => [
      defineEffect(
        'input',
        event => {
          event.preventDefault()

          const newString = (event.target as HTMLInputElement | HTMLTextAreaElement).value,
                newSelection = toSelection(event),
                effectsByName: Record<ReturnType<typeof toInputEffectNames>[0], () => void> = {
                  recordNew: () => {
                    historyEffect(event)
                  },
                  recordPrevious: () => {
                    history.record({
                      string: completeable.value.string,
                      selection: completeable.value.selection,
                    })
                  },
                  recordNone: () => {
                    completeable.value.string = newString
                    completeable.value.selection = newSelection
                  },
                  nextTickRecordNone: () => nextTick(() => {
                    completeable.value.string = newString
                    completeable.value.selection = newSelection
                  }),
                },
                effectNames = toInputEffectNames({
                  previousString: completeable.value.string,
                  newString,
                  lastRecordedString: history.recorded.value.array[history.recorded.value.array.length - 1].string,
                  previousSelection: completeable.value.selection,
                  newSelection,
                })

          for (const name of effectNames) {
            effectsByName[name]()
          }

          status.value = 'input'
        },
      ),
      defineEffect(
        'select',
        event => {
          event.preventDefault()
          selectionEffect(event)
        },
      ),
      defineEffect(
        'focus',
        () => completeable.value.setSelection({ start: 0, end: completeable.value.string.length, direction: 'forward' })
      ),
      defineEffect(
        'mouseup',
        selectionEffect
      ),
      defineEffect(
        'touchend',
        selectionEffect
      ),
      defineEffect(
        'arrow' as '+arrow',
        {
          createEffect: () => event => {
            if (!event.shiftKey) {
              selectionEffect(event)
            }
          },
          options: {
            listen: { keyDirection: 'up' },
          },
        }
      ),
      // Same keycombo, but keydown instead of keyup
      defineEffect(
        'arrow' as '+arrow',
        event => {
          if (event.metaKey) {
            // Arrow up won't fire if meta key is held down.
            // Need to store status so that meta keyup can handle selection change.
            arrowStatus.value = 'unhandled'
          }
        }
      ),
      defineEffect(
        'cmd' as '+cmd',
        {
          createEffect: () => event => {
            if (!event.shiftKey) {
              switch (arrowStatus.value) {
                case 'ready':
                case 'handled':
                  // do nothing
                  break
                case 'unhandled':
                  arrowStatus.value = 'handled'
                  selectionEffect(event)
                  break
              }
            }
          },
          options: { listen: { keyDirection: 'up' } },
        }
      ),
      defineEffect(
        'cmd+z',
        event => keyboardUndo(event)
      ),
      defineEffect(
        'ctrl+z',
        event => keyboardUndo(event)
      ),
      defineEffect(
        'cmd+y',
        event => keyboardRedo(event)
      ),
      defineEffect(
        'ctrl+y',
        event => keyboardRedo(event)
      ),
    ],
  })

  function keyboardUndo (event: KeyboardEvent) {
    event.preventDefault()      

    if (status.value === 'undone') {
      history.undo()
      return
    }

    const lastRecordedString = history.recorded.value.array[history.recorded.value.array.length - 1].string,
          recordNew = () => {
            historyEffect(event)
          },
          change: {
            previousStatus: 'recorded' | 'unrecorded',
          } = {
            previousStatus: lastRecordedString === completeable.value.string ? 'recorded': 'unrecorded',
          }
    
    if (change.previousStatus === 'unrecorded') {
      recordNew()
    }
      
    history.undo()

    status.value = 'undone'
  }

  function keyboardRedo (event: KeyboardEvent) {
    event.preventDefault()
    history.redo()

    status.value = 'redone'
  }


  // API
  return {
    root,
    completeable,
    history,
  }
}

function toSelection (event: Event | KeyboardEvent): Completeable['selection'] {
  return {
    start: (event.target as HTMLInputElement | HTMLTextAreaElement).selectionStart,
    end: (event.target as HTMLInputElement | HTMLTextAreaElement).selectionEnd,
    direction: (event.target as HTMLInputElement | HTMLTextAreaElement).selectionDirection,
  }
}