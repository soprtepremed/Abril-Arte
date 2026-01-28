import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import Admin from './pages/Admin'
import Cliente from './pages/Cliente'
import MusicalBackground from './components/MusicalBackground'
import { DataProvider } from './context/DataContext'

function App() {
  return (
    <DataProvider>
      <Router basename="/Abril-Arte">
        <div className="relative min-h-screen">
          <MusicalBackground />
          <div className="relative z-10">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/cliente" element={<Cliente />} />
            </Routes>
          </div>
        </div>
      </Router>
    </DataProvider>
  )
}

export default App
