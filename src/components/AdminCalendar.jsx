import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import heLocale from '@fullcalendar/core/locales/he'; // עברית
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Paper } from '@mui/material';

export default function AdminCalendar({ onEventClick }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // האזנה בזמן אמת לשינויים באוסף 'shifts'
    const shiftsCollection = collection(db, 'shifts');
    const unsubscribe = onSnapshot(shiftsCollection, (snapshot) => {
      const shiftsData = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        start: doc.data().start,
        end: doc.data().end,
        extendedProps: { ...doc.data() } // שמירת כל שאר המידע
      }));
      setEvents(shiftsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', minHeight: '70vh' }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek'
        }}
        locale={heLocale}
        direction="rtl"
        height="100%"
        events={events}
        eventClick={(info) => {
          // הפעלת הפונקציה שהועברה מבחוץ (אם הועברה)
          if (onEventClick) {
            onEventClick(info.event);
          }
        }}
      />
    </Paper>
  );
}