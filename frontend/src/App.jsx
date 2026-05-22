import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Siswa from './pages/Siswa';
import Kabupaten from './pages/Kabupaten';
import Kecamatan from './pages/Kecamatan';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Siswa />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/kabupaten" 
            element={
              <ProtectedRoute>
                <Kabupaten />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/kecamatan" 
            element={
              <ProtectedRoute>
                <Kecamatan />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
