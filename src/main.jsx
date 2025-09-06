import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // <-- This is the crucial line!
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)