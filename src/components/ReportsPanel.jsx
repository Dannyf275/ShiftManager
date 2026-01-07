// src/components/ReportsPanel.jsx
import { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Card, CardContent, Grid, 
  Paper, useTheme, Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow, TableContainer
} from '@mui/material';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PersonIcon from '@mui/icons-material/Person';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';

export default function ReportsPanel() {
  const theme = useTheme();
  
  // ניהול תאריכים
  const getFirstDayOfMonth = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const getLastDayOfMonth = () => new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getLastDayOfMonth());
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState(0); // 0 = משמרות, 1 = עובדים

  // נתונים לדוחות
  const [shiftsReport, setShiftsReport] = useState(null); // דוח חוסרים
  const [workersReport, setWorkersReport] = useState([]); // דוח עובדים (מערך)

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);

    try {
      // 1. שליפת משמרות בטווח
      const shiftsRef = collection(db, 'shifts');
      const shiftsQ = query(shiftsRef, where('start', '>=', startDate), where('start', '<=', endDate));
      const shiftsSnapshot = await getDocs(shiftsQ);
      const shifts = shiftsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // 2. שליפת בקשות מאושרות (בלי סינון תאריך בשאילתה כי קשה לסנכרן, נסנן ידנית לפי ID משמרת)
      const requestsRef = collection(db, 'requests');
      const reqQ = query(requestsRef, where('status', '==', 'approved'));
      const reqSnapshot = await getDocs(reqQ);
      const approvedRequests = reqSnapshot.docs.map(doc => doc.data());

      // --- חישוב דוח 1: סטטוס משמרות ---
      let totalShifts = shifts.length;
      let fullyMannedShifts = 0;
      let totalMissingWorkers = 0;
      let missingByRole = {};

      shifts.forEach(shift => {
        let isShiftFull = true;
        
        // בדיקה אילו בקשות שייכות למשמרת הזו
        const shiftRequests = approvedRequests.filter(r => r.shiftId === shift.id);

        shift.roles.forEach(roleReq => {
          const assignedCount = shiftRequests.filter(r => r.requestedRole === roleReq.role).length;
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

      const chartData = Object.keys(missingByRole).map(role => ({ name: role, missing: missingByRole[role] }));
      setShiftsReport({ totalShifts, fullyMannedShifts, totalMissingWorkers, chartData });


      // --- חישוב דוח 2: שעות עובדים ---
      // מילון לצבירת נתונים לפי תעודת זהות
      const workersStats = {}; 

      approvedRequests.forEach(req => {
        // מציאת המשמרת הרלוונטית כדי לחשב שעות
        const shift = shifts.find(s => s.id === req.shiftId);
        
        // נחשב רק אם המשמרת נמצאת בטווח התאריכים שנבחר (כלומר היא ברשימת shifts ששלפנו)
        if (shift) {
            const workerId = req.workerId || 'unknown'; // תמיכה לאחור אם אין ת"ז
            
            // חישוב שעות (סיום פחות התחלה במילישניות, המרה לשעות)
            const start = new Date(shift.start);
            const end = new Date(shift.end);
            const durationHours = (end - start) / (1000 * 60 * 60);

            if (!workersStats[workerId]) {
                workersStats[workerId] = {
                    name: req.workerName,
                    id: workerId,
                    phone: req.workerPhone,
                    totalShifts: 0,
                    totalHours: 0,
                    roles: new Set() // נאסוף את התפקידים שעשה
                };
            }

            workersStats[workerId].totalShifts += 1;
            workersStats[workerId].totalHours += durationHours;
            workersStats[workerId].roles.add(req.requestedRole);
        }
      });

      // המרה למערך לטובת התצוגה + מיון לפי שעות (מהגדול לקטן)
      const workersArray = Object.values(workersStats).map(w => ({
          ...w,
          roles: Array.from(w.roles).join(', '),
          totalHours: parseFloat(w.totalHours.toFixed(1)) // עיגול ספרה אחרי הנקודה
      })).sort((a, b) => b.totalHours - a.totalHours);

      setWorkersReport(workersArray);

    } catch (error) { console.error(error); }
    setLoading(false);
  };

  return (
    <Box sx={{ mt: 1, p: 3, bgcolor: 'white', borderRadius: 4, boxShadow: 1, height: '100%', overflowY: 'auto' }}>
      
      <Typography variant="h5" gutterBottom fontWeight="bold" color="primary" align="center">
        דוחות וניתוח נתונים
      </Typography>
      
      {/* פילטר תאריכים */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center', mb: 3, flexWrap: 'wrap' }}>
        <TextField 
          label="מתאריך" type="date" InputLabelProps={{ shrink: true }}
          value={startDate} onChange={(e) => setStartDate(e.target.value)}
        />
        <TextField 
          label="עד תאריך" type="date" InputLabelProps={{ shrink: true }}
          value={endDate} onChange={(e) => setEndDate(e.target.value)}
        />
        <Button variant="contained" onClick={generateReport} disabled={loading}>
          {loading ? 'מעבד...' : 'הפק דוח'}
        </Button>
      </Box>

      {/* טאבים למעבר בין סוגי דוחות */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs 
            value={reportType} 
            onChange={(e, v) => setReportType(v)} 
            centered 
            indicatorColor="primary"
            textColor="primary"
        >
            <Tab icon={<WorkHistoryIcon />} label="סטטוס משמרות" />
            <Tab icon={<PersonIcon />} label="סיכום שעות עובדים" />
        </Tabs>
      </Paper>

      {/* --- תצוגה 1: דוח משמרות --- */}
      {reportType === 0 && shiftsReport && (
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" variant="subtitle2">סה"כ משמרות</Typography>
                <Typography variant="h3" fontWeight="bold" color="primary.main">{shiftsReport.totalShifts}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" variant="subtitle2">מאוישות מלא</Typography>
                <Typography variant="h3" fontWeight="bold" color="success.main">{shiftsReport.fullyMannedShifts}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#fef2f2', border: '1px solid #fecaca' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" variant="subtitle2">סה"כ חוסרים</Typography>
                <Typography variant="h3" fontWeight="bold" color="error.main">{shiftsReport.totalMissingWorkers}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom align="center">התפלגות חוסרים לפי תפקיד</Typography>
              {shiftsReport.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shiftsReport.chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                  <Typography color="textSecondary">אין חוסרים להצגה בטווח זה!</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* --- תצוגה 2: דוח עובדים ושעות --- */}
      {reportType === 1 && (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell><strong>שם העובד</strong></TableCell>
                        <TableCell><strong>תעודת זהות</strong></TableCell>
                        <TableCell align="center"><strong>משמרות</strong></TableCell>
                        <TableCell align="center"><strong>סה"כ שעות</strong></TableCell>
                        <TableCell><strong>תפקידים שביצע</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {workersReport.map((worker) => (
                        <TableRow key={worker.id} hover>
                            <TableCell>{worker.name}</TableCell>
                            <TableCell>{worker.id === 'unknown' ? 'לא צוין' : worker.id}</TableCell>
                            <TableCell align="center">
                                <Box sx={{ bgcolor: '#eff6ff', py: 0.5, borderRadius: 1, color: 'primary.main', fontWeight: 'bold' }}>
                                    {worker.totalShifts}
                                </Box>
                            </TableCell>
                            <TableCell align="center">
                                <Box sx={{ bgcolor: '#f0fdf4', py: 0.5, borderRadius: 1, color: 'success.dark', fontWeight: 'bold' }}>
                                    {worker.totalHours}
                                </Box>
                            </TableCell>
                            <TableCell>{worker.roles}</TableCell>
                        </TableRow>
                    ))}
                    {workersReport.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} align="center">
                                לא נמצאו נתונים בטווח הנבחר
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
      )}

    </Box>
  );
}