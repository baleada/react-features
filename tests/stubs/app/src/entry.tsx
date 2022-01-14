import React from 'react'
import ReactDOM from 'react-dom'
import { useRoutes, BrowserRouter as Router } from 'react-router-dom'
import routes from 'virtual:generated-pages-react'
import type { WithGlobals } from '../../../fixtures/types'

function App () {
  return useRoutes(routes)
}

ReactDOM.render(
  <Router>
    {/* @ts-ignore */}
    <App />
  </Router>,
  document.getElementById('app')
);

(window as unknown as WithGlobals).nextTick = () => new Promise(resolve => setTimeout(resolve, 0))
