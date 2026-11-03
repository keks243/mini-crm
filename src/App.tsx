import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './auth/RequireAuth';
import { RequireRole } from './auth/RequireRole';
import { useAuth } from './auth/useAuth';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { MyTasksPage } from './pages/MyTasksPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ObjectDetailPage } from './pages/ObjectDetailPage';
import { ObjectsPage } from './pages/ObjectsPage';
import { TaskDetailPage } from './pages/TaskDetailPage';

/** Стартовая страница зависит от роли. */
function HomeRedirect() {
  const { isExecutor } = useAuth();
  return <Navigate to={isExecutor ? '/my-tasks' : '/objects'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/objects" element={<ObjectsPage />} />
          <Route path="/objects/:id" element={<ObjectDetailPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />

          <Route element={<RequireRole role="executor" />}>
            <Route path="/my-tasks" element={<MyTasksPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
