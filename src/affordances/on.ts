import type { MutableRefObject } from 'react'
import { useListenable } from '@baleada/react-composition'
import type { Listenable, ListenableOptions, ListenableSupportedType, ListenEffect, ListenOptions } from '@baleada/logic'
import { ensureElementsFromAffordanceElement } from '../extracted/ensureElementsFromAffordanceElement'
import { ensureListenOptions } from '../extracted/ensureListenOptions'
import { createToEffectedStatus } from '../extracted/createToEffectedStatus'
import { schedule } from '../extracted/schedule'
import { toEntries } from '../extracted/toEntries'
import { useEffecteds } from '../extracted/useEffecteds'
import type { AffordanceElement } from '../extracted/ensureElementsFromAffordanceElement'
import { isRef } from '../extracted/isRef'

type DefineOnEffect<Type extends ListenableSupportedType = ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> = 
  <EffectType extends Type>(type: EffectType, effect: OnEffect<EffectType, RecognizeableMetadata>)
    => [type: Type, effect: OnEffect<Type, RecognizeableMetadata>]

export type OnElement = AffordanceElement<HTMLElement>

export type OnEffect<Type extends ListenableSupportedType = ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> = ListenEffect<Type> | OnEffectObject<Type, RecognizeableMetadata>

export type OnEffectObject<Type extends ListenableSupportedType = ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> = {
  createEffect: OnEffectCreator<Type, RecognizeableMetadata>,
  options?: {
    listenable?: ListenableOptions<Type, RecognizeableMetadata>,
    listen?: Type extends 'intersect'
      ? {
        observer?: Omit<ListenOptions<'intersect'>['observer'], 'root'> & {
          root?: ListenOptions<'intersect'>['observer']['root'] | MutableRefObject<ListenOptions<'intersect'>['observer']['root']>
        }
      }
      : ListenOptions<Type>,
  },
}

export type OnEffectCreator<Type extends ListenableSupportedType = ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> = (
  { element, index: elementIndex, off }: {
    element: HTMLElement,
    index: number,
    off: () => void,
    listenable: MutableRefObject<Listenable<Type, RecognizeableMetadata>>
  }
) => ListenEffect<Type>

// TODO: Support modifiers: https://v3.vuejs.org/api/directives.html#v-on
// Not all are necessary, as Listenable solves a lot of those problems.
// .once might be worth supporting.
export function on<Type extends ListenableSupportedType = ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> (
  { element, effects }: {
    element: OnElement,
    effects: Record<Type, OnEffect<Type, RecognizeableMetadata>>
      | ((defineEffect: DefineOnEffect<Type, RecognizeableMetadata>) => [type: Type, effect: OnEffect<Type, RecognizeableMetadata>][])
  }
) {
  const ensuredElements = ensureElementsFromAffordanceElement(element),
        effectsEntries = typeof effects === 'function'
          ? effects(createDefineOnEffect<Type, RecognizeableMetadata>())
          : toEntries(effects) as [Type, OnEffect<Type>][],
        ensuredEffects = effectsEntries.map(([type, listenParams]) => {
          const { createEffect, options } = ensureListenParams<Type, RecognizeableMetadata>(listenParams)
          
          return {
            listenable: useListenable<Type, RecognizeableMetadata>(type, options?.listenable),
            listenParams: { createEffect, options: options?.listen }
          }
        }),
        effecteds = useEffecteds(),
        effect = () => {
          effecteds.current.clear()

          ensuredEffects.forEach(({ listenable, listenParams: { createEffect, options } }) => {            
            ensuredElements.forEach((element, index) => {
              if (!element) {
                return
              }

              effecteds.current.set(element, index)

              listenable.current.stop({ target: element })

              const off = () => {
                listenable.current.stop({ target: element })
              }

              listenable.current.listen(
                (listenEffectParam => {
                  const listenEffect = createEffect({
                    element,
                    index,
                    off,
                    // Listenable instance gives access to Recognizeable metadata
                    listenable,
                  })

                  return listenEffect(listenEffectParam)
                }) as ListenEffect<Type>,
                { ...ensureListenOptions(options), target: element }
              )
            })
          })
        }

  schedule({
    effect,
    dependencyList: [ensuredElements],
    toEffectedStatus: createToEffectedStatus(effecteds),
  }, { runsOnEveryUpdate: isRef(element) })

  // useListenable cleans up side effects automatically
}

function createDefineOnEffect<Type extends ListenableSupportedType = ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> (): DefineOnEffect<Type, RecognizeableMetadata> {
  return ((type, effect) => {
    return [type, effect]
  }) as DefineOnEffect<Type, RecognizeableMetadata>
}

function ensureListenParams<Type extends ListenableSupportedType = ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> (rawListenable: OnEffect<Type, RecognizeableMetadata>): OnEffectObject<Type, RecognizeableMetadata> {
  return typeof rawListenable === 'function'
    ? { createEffect: () => rawListenable }
    : {
        createEffect: rawListenable.createEffect,
        options: rawListenable.options,
      }
}
