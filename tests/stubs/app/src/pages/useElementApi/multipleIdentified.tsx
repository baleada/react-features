import { useRef } from 'react'
import { useElementApi } from '../../../../../../src/extracted/useElementApi'
import { WithGlobals } from '../../../../../fixtures/types';

export default function () {
  const stub0 = useRef(null),
        stub1 = useRef(null),
        stub2 = useRef(null)

  const elementsApi = useElementApi({ multiple: true, identified: true });

  (window as unknown as WithGlobals).testState =  {
    elementsApi,
    stub0,
    stub1,
    stub2,
  }

  return (
    <>
      <span ref={elementsApi.getRef(0)} className="0"></span>
      <span ref={elementsApi.getRef(1)} className="1"></span>
      <span ref={elementsApi.getRef(2)} className="2"></span>
    </>
  )
}
