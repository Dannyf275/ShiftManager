// src/pages/WorkerDashboard.jsx
import { useState } from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Button, Tab, Tabs, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

import AdminCalendar from '../components/AdminCalendar';
import ShiftCardList from '../components/ShiftCardList';
import ShiftRequestDialog from '../components/ShiftRequestDialog';
import PageContainer from '../components/PageContainer';

export default function WorkerDashboard() {
  const [selectedShift, setSelectedShift] = useState(null);
  const [openRequest, setOpenRequest] = useState(false);
  const [viewMode, setViewMode] = useState(0); // 0 = כרטיסים, 1 = יומן
  const navigate = useNavigate();

  const handleShiftClick = (shift) => {
    setSelectedShift(shift);
    setOpenRequest(true);
  };

  const handleTabChange = (event, newValue) => {
    setViewMode(newValue);
  };

  return (
    <PageContainer>
      <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
        
        {/* Header מעוצב ומרכזי */}
        <AppBar position="static" elevation={0} sx={{ 
          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
          pb: 4 
        }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box width={100} /> {/* Spacer לאיזון */}
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
              פורטל שיבוץ משמרות
            </Typography>
            <Button 
              color="inherit" 
              startIcon={<LoginIcon />} 
              onClick={() => navigate('/login')}
              sx={{ bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
            >
              כניסת מנהל
            </Button>
          </Toolbar>
          
          {/* טאבים בתוך ה-Header */}
          <Container maxWidth="xl">
            <Paper sx={{ 
              mt: 2, 
              borderRadius: 2, 
              bgcolor: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(5px)',
              color: 'white'
            }}>
              <Tabs 
                value={viewMode} 
                onChange={handleTabChange} 
                centered 
                textColor="inherit"
                indicatorColor="secondary"
                sx={{ '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)', '&.Mui-selected': { color: 'white', fontWeight: 'bold' } } }}
              >
                <Tab icon={<ViewModuleIcon />} label="רשימת משמרות" iconPosition="start" />
                <Tab icon={<CalendarMonthIcon />} label="תצוגת יומן" iconPosition="start" />
              </Tabs>
            </Paper>
          </Container>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, flexGrow: 1, mb: 4 }}>
          {viewMode === 0 ? (
            // תצוגת כרטיסים
            <Box sx={{ animation: 'fadeIn 0.5s ease' }}>
              {/* הוספתי align="center" */}
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#334155' }} align="center">
                משמרות פנויות להרשמה
              </Typography>
              <ShiftCardList onShiftClick={handleShiftClick} />
            </Box>
          ) : (
            // תצוגת יומן
            <Box sx={{ height: '70vh', bgcolor: 'white', borderRadius: 4, p: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s ease' }}>
              <AdminCalendar onEventClick={handleShiftClick} />
            </Box>
          )}

          <ShiftRequestDialog
            open={openRequest}
            onClose={() => setOpenRequest(false)}
            shift={selectedShift}
          />
        </Container>
      </Box>

      {/* אנימציה פשוטה למעבר */}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </PageContainer>
  );
}