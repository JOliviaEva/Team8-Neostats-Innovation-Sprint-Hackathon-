import React, { useState } from 'react';
import { Box, TextField, Button, Alert } from '@mui/material';
import { useApp } from '../context/AppContext';

const AuthPanel: React.FC = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    try {
      await login(username, password);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      setError(detail || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
      '&.Mui-focused fieldset': { borderColor: '#90caf9' },
    },
    '& .MuiInputBase-input': { color: '#e8f0fe', fontSize: 13 },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.45)', fontSize: 13 },
    '& .MuiInputLabel-root.Mui-focused': { color: '#90caf9' },
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {error && (
          <Alert severity="error" sx={{ py: 0, fontSize: 11 }}>
            {error}
          </Alert>
        )}
        <TextField
          label="Username"
          size="small"
          value={username}
          onChange={e => setUsername(e.target.value)}
          sx={fieldSx}
        />
        <TextField
          label="Password"
          type="password"
          size="small"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          sx={fieldSx}
        />
        <Button
          fullWidth
          onClick={handleSubmit}
          disabled={loading || !username.trim() || !password.trim()}
          sx={{
            bgcolor: '#1565c0',
            color: '#ffffff',
            borderRadius: 2,
            fontSize: 13,
            '&:hover': { bgcolor: '#1976d2' },
            '&.Mui-disabled': {
              bgcolor: 'rgba(21,101,192,0.35)',
              color: 'rgba(255,255,255,0.4)',
            },
          }}
        >
          Login
        </Button>
      </Box>
    </Box>
  );
};

export default AuthPanel;
