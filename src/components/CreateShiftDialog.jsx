import { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, Box, IconButton, Typography, Divider 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function CreateShiftDialog({ open, onClose }) {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [description, setDescription] = useState('');
  const [roles, setRoles] = useState([{ role: '', count: 1 }]);
  const [loading, setLoading] = useState(false);

  const handleAddRole = () => setRoles([...roles, { role: '', count: 1 }]);
  
  const handleRemoveRole = (index) => {
    const newRoles = roles.filter((_, i) => i !== index);
    setRoles(newRoles);
  };

  const handleRoleChange = (index, field, value) => {
    const newRoles = [...roles];
    newRoles[index][field] = value;
    setRoles(newRoles);
  };

  const handleSave = async () => {
    if (!title || !start || !end) return alert('חובה למלא שדות ראשיים');
    setLoading(true);
    try {
      await addDoc(collection(db, 'shifts'), {
        title, start, end, description, roles, createdAt: new Date()
      });
      setTitle(''); setStart(''); setEnd(''); setDescription(''); setRoles([{ role: '', count: 1 }]);
      onClose();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" dir="rtl">
      <DialogTitle>יצירת משמרת חדשה</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="שם האירוע" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="התחלה" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} value={start} onChange={(e) => setStart(e.target.value)} required />
            <TextField label="סיום" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} value={end} onChange={(e) => setEnd(e.target.value)} required />
          </Box>
          <TextField label="תיאור" multiline rows={2} fullWidth value={description} onChange={(e) => setDescription(e.target.value)} />
          
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">דרישות כוח אדם</Typography>
            <Button startIcon={<AddCircleIcon />} onClick={handleAddRole}>הוסף</Button>
          </Box>
          {roles.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1 }}>
              <TextField label="תפקיד" value={item.role} onChange={(e) => handleRoleChange(index, 'role', e.target.value)} fullWidth />
              <TextField label="כמות" type="number" value={item.count} onChange={(e) => handleRoleChange(index, 'count', e.target.value)} sx={{ width: '100px' }} />
              <IconButton onClick={() => handleRemoveRole(index)} color="error"><DeleteIcon /></IconButton>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ביטול</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>צור משמרת</Button>
      </DialogActions>
    </Dialog>
  );
}