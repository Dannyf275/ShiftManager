// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CssBaseline } from '@mui/material' // ייבוא איפוס העיצוב

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* CssBaseline דואג לאיפוס שוליים ודפדפן */}
    <CssBaseline /> 
    <App />
  </React.StrictMode>,
)