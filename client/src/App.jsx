import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import Hotels from './pages/Hotels';
import Login from './pages/Login';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      <div className="relative flex min-h-screen flex-col bg-stone-100 text-slate-900 overflow-x-hidden selection:bg-amber-400 selection:text-slate-950">
        {/* Ambient Glassmorphic Glow Orbs */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-10 -left-20 h-96 w-96 rounded-full bg-amber-400/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-1/3 -right-20 h-[30rem] w-[30rem] rounded-full bg-indigo-500/12 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed -bottom-20 left-1/4 h-[28rem] w-[28rem] rounded-full bg-teal-400/12 blur-3xl"
        />

        <Navbar />
        <main className="relative z-10 flex-1 pb-24 md:pb-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
