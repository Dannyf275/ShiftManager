import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { AnimatePresence } from 'framer-motion';

import theme from './theme'; // העיצוב שלנו
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';

// רכיב לניהול המעברים בין הדפים
function AnimatedRoutes({ user }) {
  const location = useLocation();

  return (
    // AnimatePresence מאפשר לרכיב היוצא לסיים אנימציה לפני שהוא נעלם
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<WorkerDashboard />} />
        <Route path="/login" element={<Login />} />
        {/* הגנה על נתיב המנהל - רק אם יש משתמש מחובר */}
        <Route 
          path="/admin" 
          element={user ? <AdminDashboard /> : <Navigate to="/login" />} 
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // בדיקת מצב משתמש (האם מחובר?) בטעינה הראשונית
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // מסך טעינה בזמן שהמערכת בודקת חיבור
  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* איפוס עיצוב דפדפן */}
      <Router>
        <AnimatedRoutes user={user} />
      </Router>
    </ThemeProvider>
  );
}

export default App;