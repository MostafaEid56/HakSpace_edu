import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/public/LandingPage'
import CoursesPage from './pages/public/CoursesPage'
import CourseDetailsPage from './pages/public/CourseDetailsPage'
import LoginPage from './pages/public/LoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import LeadsPage from './pages/admin/LeadsPage'
import WhatsAppButton from './components/WhatsAppButton'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/leads" element={<LeadsPage />} />
      </Routes>
      <WhatsAppButton />
    </>
  )
}
export default App