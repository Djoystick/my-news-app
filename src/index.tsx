import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'

// eruda — только для прод-отладки в Telegram
if (import.meta.env.PROD) {
  import('eruda').then((eruda) => {
    eruda.default.init()
  })
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root not found')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
