import { createTheme } from '@mui/material/styles';

/**
 * הגדרת ערכת הנושא (Theme) של האפליקציה.
 * כאן אנחנו קובעים את הצבעים, הפונטים ועיצוב הרכיבים.
 */
const theme = createTheme({
  direction: 'rtl', // תמיכה מלאה בעברית
  
  palette: {
    primary: {
      main: '#2563eb', // כחול מודרני בולט
      light: '#60a5fa',
      dark: '#1e40af',
    },
    secondary: {
      main: '#10b981', // ירוק אמרלד (להצלחות ואישורים)
    },
    background: {
      default: '#f3f4f6',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937', // אפור כהה לקריאות נוחה
      secondary: '#6b7280',
    },
  },

  typography: {
    fontFamily: 'Rubik, Arial, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    button: { fontWeight: 600 },
  },

  // דריסת עיצוב ברירת מחדל של רכיבי MUI
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12, // כפתורים עגולים יותר
          padding: '8px 22px',
          textTransform: 'none', // ביטול אותיות גדולות באנגלית
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(37, 99, 235, 0.2)', // צללית בריחוף
            transform: 'translateY(-2px)', // הרמה קלה בריחוף
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16, // כרטיסיות עגולות
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', // צללית רכה
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20, // חלונות קופצים עגולים
        },
      },
    },
  },
});

export default theme;