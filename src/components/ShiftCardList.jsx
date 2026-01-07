// src/components/ShiftCardList.jsx
import { useState, useEffect } from 'react';
import { 
  Grid, Card, CardContent, Typography, Button, Box, Chip 
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupsIcon from '@mui/icons-material/Groups';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default function ShiftCardList({ onShiftClick }) {
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    const fetchShifts = async () => {
      const today = new Date().toISOString().split('T')[0];
      const q = query(
        collection(db, 'shifts'),
        where('start', '>=', today),
        orderBy('start', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const shiftsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        extendedProps: { ...doc.data() }
      }));
      setShifts(shiftsData);
    };

    fetchShifts();
  }, []);

  return (
    // השינוי כאן: justifyContent="center"
    <Grid container spacing={3} sx={{ pb: 4 }} justifyContent="center">
      {shifts.map((shift) => (
        <Grid item xs={12} sm={6} md={4} key={shift.id}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 4, 
              border: '1px solid #e5e7eb',
              transition: 'all 0.3s',
              height: '100%', // אחידות בגובה
              display: 'flex', flexDirection: 'column',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                borderColor: 'primary.main'
              }
            }}
          >
            <CardContent sx={{ p: 3, flexGrow: 1 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box sx={{ 
                  bgcolor: 'primary.light', color: 'white', p: 1.5, borderRadius: '50%',
                  boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)'
                }}>
                  <EventIcon />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>
                    {shift.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(shift.start).toLocaleDateString('he-IL')}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Chip 
                  icon={<AccessTimeIcon />} 
                  label={new Date(shift.start).toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})} 
                  size="small" 
                  sx={{ bgcolor: '#f3f4f6' }}
                />
                <Chip 
                  icon={<GroupsIcon />} 
                  label={`${shift.roles.reduce((sum, r) => sum + r.count, 0)} תפקידים`} 
                  size="small" 
                  sx={{ bgcolor: '#f3f4f6' }}
                />
              </Box>
              
              {shift.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                  {shift.description}
                </Typography>
              )}
              
              <Box sx={{ mt: 'auto' }}>
                <Button 
                    variant="contained" 
                    fullWidth 
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => onShiftClick(shift)}
                    sx={{ borderRadius: 3 }}
                >
                    הרשמה למשמרת
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
      
      {shifts.length === 0 && (
        <Box width="100%" textAlign="center" mt={5}>
          <Typography variant="h6" color="text.secondary">לא נמצאו משמרות עתידיות פנויות</Typography>
        </Box>
      )}
    </Grid>
  );
}