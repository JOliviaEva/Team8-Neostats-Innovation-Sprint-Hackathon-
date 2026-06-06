import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import type { Message } from '../types';

const MODE_CONFIG = {
  general: { icon: '🧠', label: 'General', bg: '#e3f2fd', color: '#1565c0' },
  web_search: { icon: '🌐', label: 'Web Search', bg: '#e8f5e9', color: '#2e7d32' },
  rag: { icon: '📄', label: 'Document', bg: '#fff3e0', color: '#e65100' },
};

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';
  const mode = message.mode ? MODE_CONFIG[message.mode] : null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        mb: 2.5,
        gap: 1.5,
        alignItems: 'flex-start',
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          bgcolor: isUser ? '#e3f2fd' : '#1565c0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        {isUser ? '👤' : '🤖'}
      </Box>

      <Box
        sx={{
          maxWidth: '72%',
          background: isUser ? 'linear-gradient(135deg, #1565c0, #1976d2)' : '#f0f4ff',
          border: isUser ? 'none' : '1px solid #c5cae9',
          borderRadius: 2.5,
          borderTopRightRadius: isUser ? 0.5 : 2.5,
          borderTopLeftRadius: isUser ? 2.5 : 0.5,
          px: 2,
          py: 1.5,
        }}
      >
        <Typography
          sx={{
            color: isUser ? '#ffffff' : '#0d1b2a',
            fontSize: 14,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {message.content}
        </Typography>
        {!isUser && mode && (
          <Chip
            label={`${mode.icon} ${mode.label}`}
            size="small"
            sx={{
              mt: 0.75,
              bgcolor: mode.bg,
              color: mode.color,
              fontSize: 10,
              fontWeight: 700,
              height: 20,
              '& .MuiChip-label': { px: 1 },
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default MessageBubble;
