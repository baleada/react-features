import { useRef, useEffect } from 'react'

export function useEffecteds () {
  const effecteds = useRef(new Map<HTMLElement, number>())

  useEffect(() => () => effecteds.current.clear(), [])

  return effecteds
}
