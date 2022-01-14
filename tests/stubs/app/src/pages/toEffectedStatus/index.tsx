import { useState, useEffect, useRef } from 'react'
import { useEffecteds } from '../../../../../../src/extracted/useEffecteds'
import { createToEffectedStatus } from '../../../../../../src/extracted/createToEffectedStatus'
import { WithGlobals } from '../../../../../fixtures/types'

export default function () {
  const [element1, setElement1] = useState(null)
  const [element2, setElement2] = useState(null)
  const functionRef1 = (el) => {
    previousElements.current = currentElements.current
    currentElements.current = []
    currentElements.current[0] = el
    setElement1(el)
  }
  const functionRef2 = (el) => {
    currentElements.current[1] = el
    setElement2(el)
  }
  const currentElements = useRef([])
  const previousElements = useRef([])

  const [effectedStatus, setEffectedStatus] = useState('')

  const effecteds = useEffecteds()

  const [elements, setElements] = useState([])

  const [stub, setStub] = useState(0)
  const previousStub = useRef(stub)

  useEffect(() => {
    setElements([element1, element2])

    effecteds.current.clear()

    for (let i = 0; i < elements.length; i++) {
      effecteds.current.set(elements[i], i)
    }    
  }, [element1, element2])

  const toEffectedStatus = createToEffectedStatus(effecteds)

  const status = useRef<'mounted' | 'unmounted'>('unmounted')

  useEffect(() => {
    if (status.current === 'unmounted') {
      status.current = 'mounted'
      return
    }

    setEffectedStatus(toEffectedStatus([elements, stub], [previousElements.current, previousStub.current]))
  
    effecteds.current.clear()

    for (let i = 0; i < elements.length; i++) {
      effecteds.current.set(elements[i], i)
    }
  }, [elements, stub]);
  
  (window as unknown as WithGlobals).testState = {
    element1,
    element2,
    elements,
    setElements,
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
      <span ref={functionRef2}></span>
    </>
  )
}

