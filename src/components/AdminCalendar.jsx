// src/components/AdminCalendar.jsx
import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list'; // התוסף החדש לרשימה
import heLocale from '@fullcalendar/core/locales/he';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Paper, useTheme, useMediaQuery } from '@mui/material';

export default function AdminCalendar({ onEventClick }) {
  const [events, setEvents] = useState([]);
  
  // זיהוי גודל מסך
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // האם זה מובייל?

  useEffect(() => {
    const shiftsCollection = collection(db, 'shifts');
    const unsubscribe = onSnapshot(shiftsCollection, (snapshot) => {
      const shiftsData = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        start: doc.data().start,
        end: doc.data().end,
        extendedProps: { ...doc.data() }
      }));
      setEvents(shiftsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Paper elevation={3} sx={{ p: isMobile ? 1 : 2, height: '100%', minHeight: '60vh' }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        // שינוי תצוגה דינמי לפי גודל מסך
        initialView={isMobile ? "listMonth" : "dayGridMonth"} 
        // עדכון כותרות הלוח שיתאימו למובייל
        headerToolbar={{
          left: isMobile ? 'prev,next' : 'prev,next today',
          center: 'title',
          right: isMobile ? 'listMonth,timeGridDay' : 'dayGridMonth,timeGridWeek'
        }}
        buttonText={{
          today: 'היום',
          month: 'חודש',
          week: 'שבוע',
          day: 'יום',
          list: 'רשימה'
        }}
        locale={heLocale}
        direction="rtl"
        height="100%"
        events={events}
        eventClick={(info) => {
          if (onEventClick) {
            onEventClick(info.event);
          }
        }}
        // במובייל נסתיר את השעות כדי לחסוך מקום, בדסקטופ נציג
        displayEventTime={!isMobile} 
      />
    </Paper>
  );
}