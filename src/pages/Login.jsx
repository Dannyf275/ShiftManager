import { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Alert, Paper, InputAdornment } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import LoginIcon from '@mui/icons-material/Login';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PageContainer from '../components/PageContainer';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err) {
      setError('פרטי ההתחברות שגויים, נסה שנית.');
    }
    setLoading(false);
  };

  return (
    <PageContainer>
      <Box 
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2563eb 0%, #f3f4f6 100%)', // רקע מדורג
        }}
      >
        <Container maxWidth="xs">
          <Paper 
            elevation={24}
            sx={{ 
              p: 4, 
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.9)', // שקיפות זכוכית
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box sx={{ m: 1, bgcolor: 'primary.main', color: 'white', p: 2, borderRadius: '50%' }}>
              <LockIcon fontSize="large" />
            </Box>
            
            <Typography component="h1" variant="h4" fontWeight="bold" color="primary" sx={{ mb: 3 }}>
              כניסת מנהל
            </Typography>
            
            {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal" required fullWidth label="אימייל"
                value={email} onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><EmailIcon /></InputAdornment>),
                }}
              />
              <TextField
                margin="normal" required fullWidth label="סיסמה" type="password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><LockIcon /></InputAdornment>),
                }}
              />
              
              <Button
                type="submit" fullWidth variant="contained" size="large"
                disabled={loading} endIcon={<LoginIcon />}
                sx={{ mt: 4, mb: 2, height: 50 }}
              >
                {loading ? 'מתחבר...' : 'התחבר למערכת'}
              </Button>

              <Button
                fullWidth variant="text" color="secondary" startIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/')}
              >
                חזרה ללוח המשמרות הציבורי
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </PageContainer>
  );
}