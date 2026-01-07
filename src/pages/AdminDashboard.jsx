// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, Fab, Badge, IconButton, ToggleButton, ToggleButtonGroup } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssessmentIcon from '@mui/icons-material/Assessment';

import PageContainer from '../components/PageContainer';
import AdminCalendar from '../components/AdminCalendar';
import CreateShiftDialog from '../components/CreateShiftDialog';
import RequestsManager from '../components/RequestsManager';
import AdminShiftDetails from '../components/AdminShiftDetails';
import ReportsPanel from '../components/ReportsPanel';

export default function AdminDashboard() {
  const navigate = useNavigate();
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
        
        {/* Header - כותרת ממורכזת */}
        <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)' }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            
            {/* חלק שמאלי ריק לאיזון */}
            <Box sx={{ flex: 1 }} />
            
            {/* כותרת באמצע */}
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
              ניהול משמרות
            </Typography>

            {/* חלק ימני עם כפתורים */}
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton color="inherit" onClick={() => setOpenRequests(true)} sx={{ ml: 2 }}>
                <Badge badgeContent={pendingCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <Button color="inherit" onClick={handleLogout}>יציאה</Button>
            </Box>

          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 3, mb: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <ToggleButtonGroup
              value={view}
              exclusive
              onChange={(e, newView) => { if(newView) setView(newView) }}
              color="primary"
              sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}
            >
              <ToggleButton value="calendar" sx={{ px: 3 }}>
                <CalendarMonthIcon sx={{ mr: 1 }} /> יומן משמרות
              </ToggleButton>
              <ToggleButton value="reports" sx={{ px: 3 }}>
                <AssessmentIcon sx={{ mr: 1 }} /> דוחות ונתונים
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ flexGrow: 1, position: 'relative' }}>
            {view === 'calendar' ? (
              <Box sx={{ height: '75vh' }}>
                <AdminCalendar onEventClick={handleEventClick} />
                <Fab 
                  color="primary" 
                  sx={{ position: 'fixed', bottom: 30, left: 30 }}
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
      </Box>
    </PageContainer>
  );
}