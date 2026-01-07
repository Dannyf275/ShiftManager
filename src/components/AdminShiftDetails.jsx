import { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, Box, Typography, Divider, List, ListItem, ListItemText, Chip 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { db } from '../firebase';
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';

export default function AdminShiftDetails({ shift, open, onClose }) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [approvedWorkers, setApprovedWorkers] = useState([]);

  useEffect(() => {
    if (shift) {
      // אתחול נתונים לעריכה
      setFormData({
        title: shift.title,
        start: shift.startStr || shift.start,
        end: shift.endStr || shift.end,
        description: shift.extendedProps?.description || '',
        roles: shift.extendedProps?.roles || []
      });

      // טעינת עובדים מאושרים למשמרת זו בלבד
      const fetchWorkers = async () => {
        const q = query(
          collection(db, 'requests'), 
          where('shiftId', '==', shift.id), 
          where('status', '==', 'approved')
        );
        const snapshot = await getDocs(q);
        setApprovedWorkers(snapshot.docs.map(d => d.data()));
      };
      fetchWorkers();
    }
  }, [shift, open]);

  const handleSave = async () => {
    try {
      const shiftRef = doc(db, 'shifts', shift.id);
      await updateDoc(shiftRef, {
        title: formData.title,
        start: formData.start,
        end: formData.end,
        description: formData.description,
        roles: formData.roles
      });
      setEditMode(false);
      onClose();
    } catch (error) {
      console.error("Error updating:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('בטוח למחוק? הפעולה אינה הפיכה.')) {
      await deleteDoc(doc(db, 'shifts', shift.id));
      onClose();
    }
  };

  const handleRoleCountChange = (index, newCount) => {
    const newRoles = [...formData.roles];
    newRoles[index].count = parseInt(newCount);
    setFormData({ ...formData, roles: newRoles });
  };

  if (!shift) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" dir="rtl">
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
        {editMode ? 'עריכת משמרת' : shift.title}
        {!editMode && (
          <Button size="small" variant="contained" color="secondary" onClick={() => setEditMode(true)}>
            ערוך
          </Button>
        )}
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {editMode ? (
            /* טופס עריכה */
            <>
              <TextField label="שם" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              <TextField type="datetime-local" label="התחלה" value={formData.start} onChange={(e) => setFormData({...formData, start: e.target.value})} />
              <TextField type="datetime-local" label="סיום" value={formData.end} onChange={(e) => setFormData({...formData, end: e.target.value})} />
              <TextField multiline rows={2} label="תיאור" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
               <Typography variant="subtitle2">עריכת כמויות:</Typography>
               {formData.roles?.map((role, idx) => (
                 <Box key={idx} display="flex" justifyContent="space-between" alignItems="center">
                   <Typography>{role.role}</Typography>
                   <TextField type="number" size="small" sx={{ width: 80 }} value={role.count} onChange={(e) => handleRoleCountChange(idx, e.target.value)} />
                 </Box>
               ))}
            </>
          ) : (
            /* תצוגת פרטים */
            <>
              <Typography variant="body1"><strong>זמן:</strong> {new Date(shift.start).toLocaleString('he-IL')}</Typography>
              <Typography variant="body1"><strong>תיאור:</strong> {shift.extendedProps?.description}</Typography>
              
              <Divider sx={{ my: 2 }}>שיבוצים בפועל</Divider>
              
              <Box>
                {shift.extendedProps?.roles.map((role, idx) => {
                  const workersInRole = approvedWorkers.filter(w => w.requestedRole === role.role);
                  const isFull = workersInRole.length >= role.count;

                  return (
                    <Box key={idx} sx={{ mb: 2, p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography fontWeight="bold">{role.role}</Typography>
                        <Chip label={`${workersInRole.length} / ${role.count}`} color={isFull ? "success" : "warning"} size="small" />
                      </Box>
                      <List dense disablePadding>
                        {workersInRole.map((w, wIdx) => (
                          <ListItem key={wIdx} sx={{ pl: 0 }}>
                            <ListItemText primary={w.workerName} secondary={w.workerPhone} />
                          </ListItem>
                        ))}
                        {workersInRole.length === 0 && <Typography variant="caption" color="text.secondary">עדיין אין משובצים</Typography>}
                      </List>
                    </Box>
                  );
                })}
              </Box>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {editMode ? (
          <>
            <Button onClick={() => setEditMode(false)}>ביטול</Button>
            <Button onClick={handleSave} variant="contained">שמור שינויים</Button>
          </>
        ) : (
          <>
            <Button onClick={handleDelete} color="error" startIcon={<DeleteIcon />}>מחק</Button>
            <Button onClick={onClose}>סגור</Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}