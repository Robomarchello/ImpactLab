import 'leaflet/dist/leaflet.css';

import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MainSwitcher from './MainSwitcher'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MainSwitcher />
  </React.StrictMode>
)
