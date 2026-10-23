import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';

const Login = lazy(() => import('./pages/admin/Login.jsx'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.jsx'));
const Overview = lazy(() => import('./pages/admin/Overview.jsx'));
const ProfileEditor = lazy(() => import('./pages/admin/ProfileEditor.jsx'));
const CollectionEditor = lazy(() => import('./pages/admin/CollectionEditor.jsx'));
const Messages = lazy(() => import('./pages/admin/Messages.jsx'));
const AiSettings = lazy(() => import('./pages/admin/AiSettings.jsx'));

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="profile" element={<ProfileEditor />} />
          <Route path="projects" element={<CollectionEditor kind="projects" />} />
          <Route path="experience" element={<CollectionEditor kind="experience" />} />
          <Route path="skills" element={<CollectionEditor kind="skills" />} />
          <Route path="achievements" element={<CollectionEditor kind="achievements" />} />
          <Route path="messages" element={<Messages />} />
          <Route path="ai" element={<AiSettings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
