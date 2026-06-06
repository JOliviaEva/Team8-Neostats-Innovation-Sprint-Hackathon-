import React, { useState, useRef } from 'react';
import { Box, TextField, IconButton, Tooltip, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useApp } from '../context/AppContext';

const ChatInput: React.FC = () => {
  const { sendMessage, uploadDoc, isLoading } = useApp();
  const [input, setInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!input.trim() || isLoading || uploading) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadStatus('');
    try {
      const result = await uploadDoc(file);
      setUploadStatus(`✅ ${file.name} ready — ${result.chunk_count} chunks indexed`);
      setTimeout(() => setUploadStatus(''), 5000);
    } catch {
      setUploadStatus('❌ Upload failed — check file and try again');
      setTimeout(() => setUploadStatus(''), 4000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isSuccess = uploadStatus.startsWith('✅');

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        py: 1.5,
        bgcolor: '#ffffff',
        borderTop: '2px solid #e3eaf5',
        flexShrink: 0,
      }}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {uploadStatus && (
          <Typography
            sx={{
              fontSize: 12,
              color: isSuccess ? '#2e7d32' : '#c62828',
              mb: 0.75,
              px: 0.5,
            }}
          >
            {uploadStatus}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <Tooltip title={uploading ? 'Indexing document…' : 'Attach PDF for document Q&A'}>
            <span>
              <IconButton
                onClick={() => { setUploadStatus(''); fileInputRef.current?.click(); }}
                disabled={uploading || isLoading}
                sx={{
                  color: '#1565c0',
                  mb: 0.25,
                  '&:hover': { bgcolor: '#e3f2fd' },
                  '&.Mui-disabled': { color: '#b0bec5' },
                }}
              >
                <AttachFileIcon />
              </IconButton>
            </span>
          </Tooltip>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder={uploading ? 'Indexing document…' : 'Ask NeoPulse anything…'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading || uploading}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: '#f8faff',
                '& fieldset': { borderColor: '#1565c0', borderWidth: 2 },
                '&:hover fieldset': { borderColor: '#1976d2' },
                '&.Mui-focused fieldset': { borderColor: '#1565c0' },
              },
              '& .MuiInputBase-input': { fontSize: 14, color: '#0d1b2a' },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!input.trim() || isLoading || uploading}
            sx={{
              bgcolor: '#1565c0',
              color: '#ffffff',
              mb: 0.25,
              '&:hover': { bgcolor: '#1976d2' },
              '&.Mui-disabled': { bgcolor: '#e0e0e0' },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatInput;
