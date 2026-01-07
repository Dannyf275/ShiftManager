// src/components/ReportsPanel.jsx
import { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Card, CardContent, Grid, 
  Paper, useTheme
} from '@mui/material';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ReportsPanel() {
  const theme = useTheme();
  const getFirstDayOfMonth = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const getLastDayOfMonth = () => new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getLastDayOfMonth());
  const [reportData, setReportData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);

    try {
      const shiftsRef = collection(db, 'shifts');
      const shiftsQ = query(shiftsRef, where('start', '>=', startDate), where('start', '<=', endDate));
      const shiftsSnapshot = await getDocs(shiftsQ);
      const shifts = shiftsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const requestsRef = collection(db, 'requests');
      const reqQ = query(requestsRef, where('status', '==', 'approved'));
      const reqSnapshot = await getDocs(reqQ);
      const approvedRequests = reqSnapshot.docs.map(doc => doc.data());

      let totalShifts = shifts.length;
      let fullyMannedShifts = 0;
      let totalMissingWorkers = 0;
      let missingByRole = {};

      shifts.forEach(shift => {
        let isShiftFull = true;
        shift.roles.forEach(roleReq => {
          const assignedCount = approvedRequests.filter(
            r => r.shiftId === shift.id && r.requestedRole === roleReq.role
          ).length;
          const missing = Math.max(0, roleReq.count - assignedCount);
          if (missing > 0) {
            isShiftFull = false;
            totalMissingWorkers += missing;
            if (!missingByRole[roleReq.role]) missingByRole[roleReq.role] = 0;
            missingByRole[roleReq.role] += missing;
          }
        });
        if (isShiftFull) fullyMannedShifts++;
      });

      const chartFormattedData = Object.keys(missingByRole).map(role => ({
        name: role,
        missing: missingByRole[role]
      }));

      setReportData({ totalShifts, fullyMannedShifts, totalMissingWorkers });
      setChartData(chartFormattedData);

    } catch (error) { console.error(error); }
    setLoading(false);
  };

  return (
    <Box sx={{ mt: 1, p: 3, bgcolor: 'white', borderRadius: 4, boxShadow: 1, height: '100%', overflowY: 'auto' }}>
      
      {/* כותרת ראשית ממורכזת */}
      <Typography variant="h5" gutterBottom fontWeight="bold" color="primary" align="center">
        דוחות חודשיים וניתוח נתונים
      </Typography>
      
      {/* שורת סינון ממורכזת */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center', mb: 4, flexWrap: 'wrap' }}>
        <TextField 
          label="מתאריך" type="date" InputLabelProps={{ shrink: true }}
          value={startDate} onChange={(e) => setStartDate(e.target.value)}
        />
        <TextField 
          label="עד תאריך" type="date" InputLabelProps={{ shrink: true }}
          value={endDate} onChange={(e) => setEndDate(e.target.value)}
        />
        <Button variant="contained" onClick={generateReport} disabled={loading}>
          {loading ? 'מעבד...' : 'סנן מחדש'}
        </Button>
      </Box>

      {reportData && (
        <Grid container spacing={3} justifyContent="center">
          {/* כרטיסים - טקסט ממורכז */}
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#eff6ff', borderRadius: 3, boxShadow: 'none', border: '1px solid #bfdbfe' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" variant="subtitle2">סה"כ משמרות בחודש</Typography>
                <Typography variant="h3" fontWeight="bold" color="primary.main">{reportData.totalShifts}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#f0fdf4', borderRadius: 3, boxShadow: 'none', border: '1px solid #bbf7d0' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" variant="subtitle2">משמרות מאוישות מלא</Typography>
                <Typography variant="h3" fontWeight="bold" color="success.main">{reportData.fullyMannedShifts}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#fef2f2', borderRadius: 3, boxShadow: 'none', border: '1px solid #fecaca' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" variant="subtitle2">סה"כ חוסרים בכ"א</Typography>
                <Typography variant="h3" fontWeight="bold" color="error.main">{reportData.totalMissingWorkers}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* גרף */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom align="center">התפלגות חוסרים לפי תפקיד</Typography>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend wrapperStyle={{ justifyContent: 'center' }} />
                    <Bar dataKey="missing" name="עובדים חסרים" fill={theme.palette.error.main} radius={[0, 4, 4, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                  <Typography color="textSecondary">אין חוסרים להצגה בטווח זה! 👏</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}