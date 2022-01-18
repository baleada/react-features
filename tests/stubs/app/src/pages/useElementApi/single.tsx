import { useRef } from 'react'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { WithGlobals } from '../../../../../fixtures/types';

export default function () {
  const stub = useRef(null)

  const elementApi = useElementApi();

  (window as unknown as WithGlobals).testState =  { elementApi, stub }

  return (
    <span ref={stub}></span>
  )
}
