import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import LandingPage from "@/pages/LandingPage"
import SignInPage from "@/pages/SignInPage"
import Dashboard from "@/pages/Dashboard"
import Lenis from "lenis"

// Lenis only runs on pages that use body-level scroll (Landing, SignIn).
// The Dashboard uses its own overflow-y-auto container and must NOT have Lenis.
function ScrollManager() {
  const location = useLocation()

  useEffect(() => {
    const isDashboard = location.pathname.startsWith("/dashboard")
    if (isDashboard) return  // leave native scroll untouched

    const lenis = new Lenis({ autoRaf: true })
    return () => {
      lenis.destroy()
    }
  }, [location.pathname])

  return null
}

function App() {
  return (
    <Router>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
