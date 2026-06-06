import React, { useEffect, useRef } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useApp } from '../context/AppContext';
import MessageBubble from './MessageBubble';

const ChatArea: React.FC = () => {
  const { messages, isLoading } = useApp();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 800, px: { xs: 2, md: 3 } }}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, alignItems: 'flex-start' }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: '#1565c0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              🤖
            </Box>
            <Box
              sx={{
                bgcolor: '#f0f4ff',
                border: '1px solid #c5cae9',
                borderRadius: 2.5,
                borderTopLeftRadius: 0.5,
                px: 2,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <CircularProgress size={16} sx={{ color: '#1565c0' }} />
            </Box>
          </Box>
        )}
        <div ref={endRef} />
      </Box>
    </Box>
  );
};

export default ChatArea;
