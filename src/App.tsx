import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { PendingListPage } from './pages/PendingListPage';
import { ReviewPage } from './pages/ReviewPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <PendingListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review/:id"
          element={
            <ProtectedRoute>
              <ReviewPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
