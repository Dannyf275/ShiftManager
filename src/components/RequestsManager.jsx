import { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, 
  ListItemSecondaryAction, IconButton, Typography, Box, Divider 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export default function RequestsManager({ open, onClose }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    // שליפת בקשות בסטטוס pending
    const q = query(collection(db, 'requests'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleAction = async (reqId, newStatus) => {
    try {
      await updateDoc(doc(db, 'requests', reqId), { status: newStatus });
    } catch (error) { console.error(error); }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" dir="rtl">
      <DialogTitle>בקשות שיבוץ ממתינות ({requests.length})</DialogTitle>
      <DialogContent dividers>
        {requests.length === 0 ? (
          <Typography align="center" sx={{ py: 3 }}>אין בקשות חדשות</Typography>
        ) : (
          <List>
            {requests.map((req) => (
              <Box key={req.id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={<Typography fontWeight="bold">{req.workerName} - {req.requestedRole}</Typography>}
                    secondary={<>{req.shiftTitle} <br /> {new Date(req.shiftStart).toLocaleString('he-IL')} | {req.workerPhone}</>}
                  />
                  <ListItemSecondaryAction>
                    <IconButton color="error" onClick={() => handleAction(req.id, 'rejected')}><CancelIcon /></IconButton>
                    <IconButton color="success" onClick={() => handleAction(req.id, 'approved')}><CheckCircleIcon /></IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </Box>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}