import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import LandingPage from "@/pages/LandingPage"
import SignInPage from "@/pages/SignInPage"
import Dashboard from "@/pages/Dashboard"
import Lenis from "lenis"

function App() {
  useEffect(() => {
    new Lenis({
      autoRaf: true,
    });
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
