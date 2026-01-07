// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, Fab, Badge, IconButton, ToggleButton, ToggleButtonGroup, useTheme, useMediaQuery } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';

import PageContainer from '../components/PageContainer';
import AdminCalendar from '../components/AdminCalendar';
import CreateShiftDialog from '../components/CreateShiftDialog';
import RequestsManager from '../components/RequestsManager';
import AdminShiftDetails from '../components/AdminShiftDetails';
import ReportsPanel from '../components/ReportsPanel';
import logo from '../assets/logo.jpg'; // ייבוא הלוגו (נניח שהוא בתיקיית assets)

export default function AdminDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [view, setView] = useState('calendar');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openRequests, setOpenRequests] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedShift, setSelectedShift] = useState(null);
  const [openShiftDetails, setOpenShiftDetails] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'requests'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => setPendingCount(snapshot.size));
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
    navigate('/');
  };

  const handleEventClick = (event) => {
    setSelectedShift(event);
    setOpenShiftDetails(true);
  };

  return (
    <PageContainer>
      <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)' }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: isMobile ? 1 : 2 }}>
            
            {/* צד שמאל: לוגו (רק בדסקטופ) */}
            {!isMobile && (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <img src={logo} alt="לוגו האגודה" style={{ height: 40, borderRadius: 4 }} />
              </Box>
            )}
            
            {/* כותרת באמצע */}
            <Typography variant={isMobile ? "subtitle1" : "h6"} component="div" sx={{ fontWeight: 'bold', letterSpacing: 1, textAlign: 'center', flexGrow: isMobile ? 1 : 0 }}>
              ניהול משמרות
            </Typography>

            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <IconButton color="inherit" onClick={() => setOpenRequests(true)} sx={{ ml: 1 }}>
                <Badge badgeContent={pendingCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              
              {isMobile ? (
                 <IconButton color="inherit" onClick={handleLogout}><LogoutIcon /></IconButton>
              ) : (
                 <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>יציאה</Button>
              )}
            </Box>

          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 2, mb: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', px: isMobile ? 1 : 3 }}>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <ToggleButtonGroup
              value={view}
              exclusive
              onChange={(e, newView) => { if(newView) setView(newView) }}
              color="primary"
              size={isMobile ? "small" : "medium"}
              sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}
            >
              <ToggleButton value="calendar" sx={{ px: isMobile ? 2 : 3 }}>
                <CalendarMonthIcon sx={{ mr: 1 }} /> {isMobile ? "יומן" : "יומן משמרות"}
              </ToggleButton>
              <ToggleButton value="reports" sx={{ px: isMobile ? 2 : 3 }}>
                <AssessmentIcon sx={{ mr: 1 }} /> {isMobile ? "דוחות" : "דוחות ונתונים"}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ flexGrow: 1, position: 'relative' }}>
            {view === 'calendar' ? (
              <Box sx={{ height: isMobile ? 'calc(100vh - 200px)' : '75vh' }}>
                <AdminCalendar onEventClick={handleEventClick} />
                <Fab 
                  color="primary" 
                  size={isMobile ? "medium" : "large"}
                  sx={{ position: 'fixed', bottom: 20, left: 20 }}
                  onClick={() => setOpenCreateDialog(true)}
                >
                  <AddIcon />
                </Fab>
              </Box>
            ) : (
              <ReportsPanel />
            )}
          </Box>

          <CreateShiftDialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} />
          <RequestsManager open={openRequests} onClose={() => setOpenRequests(false)} />
          <AdminShiftDetails shift={selectedShift} open={openShiftDetails} onClose={() => setOpenShiftDetails(false)} />

        </Container>

        {/* Footer עם הלוגו */}
        <Box sx={{ py: 2, bgcolor: '#1e3a8a', color: 'white', textAlign: 'center', mt: 'auto' }}>
          <img src={logo} alt="לוגו האגודה" style={{ height: 40, borderRadius: 4 }} />
          <Typography variant="caption" display="block">© כל הזכויות שמורות לאגודת הסטודנטים HIT</Typography>
        </Box>

      </Box>
    </PageContainer>
  );
}