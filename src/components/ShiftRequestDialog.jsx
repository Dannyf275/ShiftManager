// src/components/ShiftRequestDialog.jsx
import { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, Box, Typography, MenuItem, Select, InputLabel, FormControl, Alert 
} from '@mui/material';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function ShiftRequestDialog({ open, onClose, shift }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [workerId, setWorkerId] = useState(''); // שדה חדש לת"ז
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
      setPhone('');
      setWorkerId('');
      setSelectedRole('');
      setSuccess(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!name || !phone || !selectedRole || !workerId) {
      alert('נא למלא את כל הפרטים כולל תעודת זהות');
      return;
    }

    // בדיקה בסיסית לתקינות ת"ז (אופציונלי: אפשר להוסיף ולידציה מורכבת יותר)
    if (workerId.length < 9) {
      alert('נא להזין מספר תעודת זהות תקין (9 ספרות)');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'requests'), {
        shiftId: shift.id,
        shiftTitle: shift.title,
        shiftStart: shift.startStr,
        workerName: name,
        workerPhone: phone,
        workerId: workerId, // שמירת הת"ז
        requestedRole: selectedRole,
        status: 'pending',
        createdAt: new Date()
      });
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error(error);
      alert("שגיאה בשליחת הבקשה");
    }
    setLoading(false);
  };

  if (!shift) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" dir="rtl">
      <DialogTitle>בקשת שיבוץ: {shift.title}</DialogTitle>
      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ mt: 2 }}>הבקשה נשלחה בהצלחה!</Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant="body2">זמן: {new Date(shift.start).toLocaleString('he-IL')}</Typography>
            
            <TextField 
              label="שם מלא" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              fullWidth 
              required
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                label="תעודת זהות" 
                value={workerId} 
                onChange={(e) => setWorkerId(e.target.value)} 
                fullWidth 
                required
                type="number" // מקלדת מספרים במובייל
                placeholder="לצורך מעקב שעות בלבד"
              />
              <TextField 
                label="טלפון" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                fullWidth 
                required
                type="tel"
              />
            </Box>

            <FormControl fullWidth required>
              <InputLabel>תפקיד מבוקש</InputLabel>
              <Select value={selectedRole} label="תפקיד מבוקש" onChange={(e) => setSelectedRole(e.target.value)}>
                {shift.extendedProps?.roles.map((r, i) => (
                  <MenuItem key={i} value={r.role}>{r.role} (תקן: {r.count})</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {!success && (
          <>
            <Button onClick={onClose}>ביטול</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>שלח בקשה</Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}