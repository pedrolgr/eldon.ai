import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { HomePage } from './app/routes/HomePage'
import { DashboardPage } from './app/routes/DashboardPage'
import { ServerPage } from './app/routes/ServerPage'

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
