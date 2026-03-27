import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { HomePage } from './app/routes/HomePage/HomePage'
import { DashboardPage } from './app/routes/DashboardPage/DashboardPage'
import { ServerPage } from './app/routes/ServerPage/ServerPage'

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/dashboard/:serverId', element: <ServerPage /> },
])

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
