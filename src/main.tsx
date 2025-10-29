import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import App from './App.tsx'
import Blog from './pages/Blog.tsx'
import BlogPost from './pages/BlogPost.tsx'
import YandexMetrika from './components/YandexMetrika.tsx'

// Layout с трекингом метрики
function Layout() {
  return (
    <>
      <YandexMetrika />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <App /> },
      { path: '/blog', element: <Blog /> },
      { path: '/blog/:slug', element: <BlogPost /> },
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
