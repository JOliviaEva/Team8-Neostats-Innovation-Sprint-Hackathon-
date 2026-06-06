import React from 'react';
import { Box, Typography, Grid, Card, CardActionArea, CardContent } from '@mui/material';
import { useApp } from '../context/AppContext';

const SUGGESTIONS = [
  { icon: '🧠', title: 'General Knowledge', prompt: 'Explain machine learning in simple terms' },
  { icon: '🌐', title: 'Web Search', prompt: 'Latest AI news and trends today' },
  { icon: '📄', title: 'Document Q&A', prompt: 'What is the leave policy for students?' },
  { icon: '🎓', title: 'University Info', prompt: 'Explain the Christ University code of conduct' },
  { icon: '💻', title: 'Coding Help', prompt: 'Write a Python function to sort a list' },
  { icon: '📊', title: 'Assessment Rules', prompt: 'How are CIA and ESE marks calculated?' },
];

const WelcomeScreen: React.FC = () => {
  const { sendMessage } = useApp();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        px: 4,
        pb: 8,
        pt: 4,
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: 36, md: 52 },
          fontWeight: 800,
          background: 'linear-gradient(135deg, #0d47a1, #1976d2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1,
          textAlign: 'center',
        }}
      >
        NeoPulse
      </Typography>
      <Typography sx={{ fontSize: 18, color: '#546e7a', mb: 5, textAlign: 'center' }}>
        Your intelligent university assistant — ask anything
      </Typography>

      <Grid container spacing={2} sx={{ maxWidth: 720, width: '100%' }}>
        {SUGGESTIONS.map((s, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card
              sx={{
                bgcolor: '#f0f4ff',
                border: '1px solid #c5cae9',
                borderRadius: 3,
                height: '100%',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: '0 4px 16px rgba(21,101,192,0.12)' },
              }}
            >
              <CardActionArea onClick={() => sendMessage(s.prompt)} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography sx={{ fontSize: 24, mb: 1 }}>{s.icon}</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1565c0' }}>
                    {s.title}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#78909c', mt: 0.5 }}>
                    {s.prompt}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default WelcomeScreen;
