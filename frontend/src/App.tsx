import { RouterProvider } from 'react-router/internal/react-server-client'
import { router } from './other/routes/route'

function App() {

  return (
    <RouterProvider router={router} />
  )
}

export default App
