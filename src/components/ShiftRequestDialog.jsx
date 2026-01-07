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
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) { setName(''); setPhone(''); setSelectedRole(''); setSuccess(false); }
  }, [open]);

  const handleSubmit = async () => {
    if (!name || !phone || !selectedRole) return alert('חסרים פרטים');
    setLoading(true);
    try {
      await addDoc(collection(db, 'requests'), {
        shiftId: shift.id,
        shiftTitle: shift.title,
        shiftStart: shift.startStr,
        workerName: name,
        workerPhone: phone,
        requestedRole: selectedRole,
        status: 'pending',
        createdAt: new Date()
      });
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (error) { console.error(error); }
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
            <TextField label="שם מלא" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            <TextField label="טלפון" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
            <FormControl fullWidth>
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