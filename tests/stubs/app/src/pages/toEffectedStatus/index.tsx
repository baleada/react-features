import { useState, useEffect, useRef } from 'react'
import { useEffecteds } from '../../../../../../src/extracted/useEffecteds'
import { createToEffectedStatus } from '../../../../../../src/extracted/createToEffectedStatus'
import { WithGlobals } from '../../../../../fixtures/types'

export default function () {
  const element1 = useRef(null)
  const element2 = useRef(null)
  const functionRef1 = (el) => {
    element1.current = el
  }
  const functionRef2 = (el) => {
    element2.current = el
  }

  const [effectedStatus, setEffectedStatus] = useState('')
  
  const elements = useRef([])
  const previousElements = useRef([])

  previousElements.current = elements.current  
  elements.current = [element1.current, element2.current]

  const [stub, setStub] = useState(0)
  const [updates, setUpdates] = useState(0)
  const previousStub = useRef(stub)

  const effecteds = useEffecteds()

  useEffect(() => {
    effecteds.current.clear()
    for (let i = 0; i < elements.current.length; i++) {
      effecteds.current.set(elements.current[i], i)
    }
  })

  const toEffectedStatus = createToEffectedStatus(effecteds)
  
  useEffect(() => {
    setEffectedStatus(toEffectedStatus([elements.current, stub], [previousElements.current, previousStub.current]))
  }, [stub])
  
  useEffect(() => {
    setEffectedStatus(toEffectedStatus([elements.current], [previousElements.current]))
  }, [updates]);
  
  (window as unknown as WithGlobals).testState = {
    element1,
    element2,
    elements,
    updates,
    setUpdates,
    stub,
    setStub: num => {
      previousStub.current = stub
      setStub(num)
    },
    effectedStatus,
  }

  return (
    <>
      <span ref={functionRef1}></span>
      <div ref={functionRef2}></div>
    </>
  )
}

