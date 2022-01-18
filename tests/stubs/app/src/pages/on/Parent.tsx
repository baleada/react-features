import { useState } from "react"
import Child from './Child'

export default function () {
  const [stub, setStub] = useState(null),
        [count, setCount] = useState(0),
        [childIsMounted, setChildIsMounted] = useState(false)
  
  return (
    <>
      <span ref={setStub}>{count}</span>
      <button onClick={() => setChildIsMounted(!childIsMounted)}>button</button>
      {childIsMounted && <Child
        el={stub}
        setCount={setCount}
      />}  
    </>
  )
}
