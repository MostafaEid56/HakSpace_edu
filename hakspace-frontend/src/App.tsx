import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/public/LandingPage'
import CoursesPage from './pages/public/CoursesPage'
import CourseDetailsPage from './pages/public/CourseDetailsPage'
import LoginPage from './pages/public/LoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import LeadsPage from './pages/admin/LeadsPage'
import AdminCoursesPage from './pages/admin/AdminCoursesPage'
import WhatsAppButton from './components/WhatsAppButton'
import AdminLayout from './components/AdminLayout'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/dashboard" element={<AdminLayout><DashboardPage /></AdminLayout>} />
        <Route path="/admin/courses" element={<AdminLayout><AdminCoursesPage /></AdminLayout>} />
        <Route path="/admin/leads" element={<AdminLayout><LeadsPage /></AdminLayout>} />
      </Routes>
      <WhatsAppButton />
    </>
  )
}
export default App