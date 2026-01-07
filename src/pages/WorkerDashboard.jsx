// src/pages/WorkerDashboard.jsx
import { useState } from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Button, Tab, Tabs, Paper, useTheme, useMediaQuery, IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

import AdminCalendar from '../components/AdminCalendar';
import ShiftCardList from '../components/ShiftCardList';
import ShiftRequestDialog from '../components/ShiftRequestDialog';
import PageContainer from '../components/PageContainer';
import logo from '../assets/logo.jpg'; // ייבוא הלוגו

export default function WorkerDashboard() {
  const [selectedShift, setSelectedShift] = useState(null);
  const [openRequest, setOpenRequest] = useState(false);
  const [viewMode, setViewMode] = useState(0); 
  const navigate = useNavigate();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        
        <AppBar position="static" elevation={0} sx={{ 
  background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
  pb: isMobile ? 2 : 4 
}}>
  <Toolbar>
    {/* לוגו בצד שמאל (רק בדסקטופ) */}
    {!isMobile && (
      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
        <img src={logo} alt="לוגו האגודה" style={{ height: 40, borderRadius: 4 }} />
      </Box>
    )}

    {/* הכותרת - הוספנו textAlign: 'center' */}
    <Typography 
      variant={isMobile ? "h6" : "h5"} 
      component="div" 
      sx={{ 
        flexGrow: 1, 
        fontWeight: 'bold', 
        letterSpacing: 1,
        textAlign: 'center' 
      }}
    >
    פורטל שיבוץ
    </Typography>
    
    <Tooltip title="כניסת מנהל">
      {isMobile ? (
          <IconButton 
            onClick={() => navigate('/login')}
            sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
          >
            <LoginIcon />
          </IconButton>
      ) : (
          <Button 
            color="inherit" 
            startIcon={<LoginIcon />} 
            onClick={() => navigate('/login')}
            sx={{ bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
          >
            כניסת מנהל
          </Button>
      )}
    </Tooltip>
  </Toolbar>
          
          <Container maxWidth="xl">
            <Paper sx={{ 
              mt: isMobile ? 1 : 2, 
              borderRadius: 2, 
              bgcolor: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(5px)',
              color: 'white'
            }}>
              <Tabs 
                value={viewMode} 
                onChange={handleTabChange} 
                centered 
                variant={isMobile ? "fullWidth" : "standard"}
                textColor="inherit"
                indicatorColor="secondary"
                sx={{ '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)', '&.Mui-selected': { color: 'white', fontWeight: 'bold' } } }}
              >
                <Tab icon={<ViewModuleIcon />} label={isMobile ? "רשימה" : "רשימת משמרות"} iconPosition="start" />
                <Tab icon={<CalendarMonthIcon />} label={isMobile ? "יומן" : "תצוגת יומן"} iconPosition="start" />
              </Tabs>
            </Paper>
          </Container>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: isMobile ? 2 : 4, flexGrow: 1, mb: 4, px: isMobile ? 2 : 3 }}>
          {viewMode === 0 ? (
            <Box sx={{ animation: 'fadeIn 0.5s ease' }}>
              <Typography variant={isMobile ? "h6" : "h5"} sx={{ mb: 3, fontWeight: 'bold', color: '#334155' }} align="center">
                משמרות פנויות להרשמה
              </Typography>
              <ShiftCardList onShiftClick={handleShiftClick} />
            </Box>
          ) : (
            <Box sx={{ height: '70vh', bgcolor: 'white', borderRadius: 4, p: isMobile ? 1 : 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s ease' }}>
              <AdminCalendar onEventClick={handleShiftClick} />
            </Box>
          )}

          <ShiftRequestDialog
            open={openRequest}
            onClose={() => setOpenRequest(false)}
            shift={selectedShift}
          />
        </Container>

        {/* Footer עם הלוגו */}
        <Box sx={{ py: 2, bgcolor: '#1e40af', color: 'white', textAlign: 'center', mt: 'auto' }}>
          <img src={logo} alt="לוגו האגודה" style={{ height: 40, borderRadius: 4 }} />
          <Typography variant="caption" display="block">© כל הזכויות שמורות לאגודת הסטודנטים HIT</Typography>
        </Box>
      </Box>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </PageContainer>
  );
}