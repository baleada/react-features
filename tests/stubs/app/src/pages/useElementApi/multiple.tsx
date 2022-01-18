import { useReducer, useState, useEffect, useLayoutEffect, useRef } from 'react'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { WithGlobals } from '../../../../../fixtures/types';

export default function () {
  const stub0 = useRef(null),
        stub1 = useRef(null),
        stub2 = useRef(null),
        [_, forceUpdate] = useReducer(x => x + 1, 0)

  const elementsApi = useElementApi({ multiple: true });

  (window as unknown as WithGlobals).testState =  {
    elementsApi,
    stub0,
    stub1,
    stub2,
    forceUpdate,
  }

  return (
    <>
      <span ref={stub0} className="0"></span>
      <span ref={stub1} className="1"></span>
      <span ref={stub2} className="2"></span>
    </>
  )
}
