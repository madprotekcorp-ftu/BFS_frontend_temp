import type React from 'react'
import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom'
import { PublicLayout } from '@/components/site/PublicLayout'
import { PageLoader } from '@/components/ui/Feedback'
import HomePage from '@/pages/public/HomePage'

// Public pages other than Home and the whole admin app are code-split
// so the public site stays light.
const AboutPage = lazy(() => import('@/pages/public/AboutPage'))
const ServicesPage = lazy(() => import('@/pages/public/ServicesPage'))
const ServiceDetailPage = lazy(() => import('@/pages/public/ServiceDetailPage'))
const EmiCalculatorPage = lazy(() => import('@/pages/public/EmiCalculatorPage'))
const ContactPage = lazy(() => import('@/pages/public/ContactPage'))
const PrivacyPage = lazy(() => import('@/pages/public/PrivacyPage'))
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'))

const AdminRoot = lazy(() => import('@/admin/AdminRoot'))
const AdminShell = lazy(() => import('@/admin/AdminRoot').then((m) => ({ default: m.AdminShell })))
const LoginPage = lazy(() => import('@/admin/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/admin/pages/DashboardPage'))
const LeadsPage = lazy(() => import('@/admin/pages/LeadsPage'))
const LeadDetailPage = lazy(() => import('@/admin/pages/LeadDetailPage'))
const EmployeesPage = lazy(() => import('@/admin/pages/EmployeesPage'))
const ImportPage = lazy(() => import('@/admin/pages/ImportPage'))
const DocumentsPage = lazy(() => import('@/admin/pages/DocumentsPage'))

const S = ({ children }: { children: React.ReactNode }) => <Suspense fallback={<PageLoader />}>{children}</Suspense>

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/about', element: <S><AboutPage /></S> },
      { path: '/services', element: <S><ServicesPage /></S> },
      { path: '/services/:slug', element: <S><ServiceDetailPage /></S> },
      { path: '/emi-calculator', element: <S><EmiCalculatorPage /></S> },
      { path: '/contact', element: <S><ContactPage /></S> },
      { path: '/privacy-policy', element: <S><PrivacyPage /></S> },
      { path: '*', element: <S><NotFoundPage /></S> },
    ],
  },
  {
    path: '/admin',
    element: <S><AdminRoot><Outlet /></AdminRoot></S>,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'login', element: <S><LoginPage /></S> },
      {
        element: <S><AdminShell /></S>,
        children: [
          { path: 'dashboard', element: <S><DashboardPage /></S> },
          { path: 'leads', element: <S><LeadsPage /></S> },
          { path: 'leads/:id', element: <S><LeadDetailPage /></S> },
          { path: 'employees', element: <S><EmployeesPage /></S> },
          { path: 'import', element: <S><ImportPage /></S> },
          { path: 'documents', element: <S><DocumentsPage /></S> },
          { path: '*', element: <Navigate to="/admin/dashboard" replace /> },
        ],
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
