import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Divider,
  Tooltip,
  IconButton,
  Collapse,
  ListItemButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useApp } from '../context/AppContext';
import AuthPanel from './AuthPanel';

const SIDEBAR_WIDTH = 264;

const Sidebar: React.FC = () => {
  const {
    auth,
    sessions,
    sessionId,
    currentDocName,
    newChat,
    switchSession,
    deleteSession,
    uploadDoc,
    clearDoc,
    logout,
  } = useApp();

  const [showAuth, setShowAuth] = useState(false);
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg('');
    try {
      const result = await uploadDoc(file);
      setUploadMsg(`✅ Indexed ${result.chunk_count} chunks`);
    } catch {
      setUploadMsg('❌ Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const dividerColor = 'rgba(26, 74, 138, 0.65)';
  const mutedText = '#7986cb';

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        bgcolor: '#0a1f3c',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        borderRight: '2px solid #1a4a8a',
        overflow: 'hidden',
      }}
    >
      {/* Branding */}
      <Box sx={{ textAlign: 'center', py: 2.5, px: 2 }}>
        <Typography
          sx={{ fontSize: 26, fontWeight: 800, color: '#90caf9', letterSpacing: '0.04em' }}
        >
          NeoPulse
        </Typography>
        <Typography
          sx={{ fontSize: 11, color: mutedText, letterSpacing: '0.08em', mt: 0.25 }}
        >
          INTELLIGENT AI ASSISTANT
        </Typography>
      </Box>

      <Divider sx={{ borderColor: dividerColor }} />

      {/* New Chat */}
      <Box sx={{ px: 1.5, pt: 1.5, pb: 0.5 }}>
        <Button
          fullWidth
          startIcon={<AddIcon />}
          onClick={newChat}
          sx={{
            bgcolor: '#1565c0',
            color: '#ffffff',
            borderRadius: 2,
            py: 1.25,
            fontWeight: 600,
            '&:hover': { bgcolor: '#1976d2' },
          }}
        >
          New Chat
        </Button>
      </Box>

      {/* Document Upload */}
      <Box sx={{ px: 1.5, pt: 0.5 }}>
        <Button
          fullWidth
          startIcon={<AttachFileIcon />}
          endIcon={
            <ExpandMoreIcon
              sx={{
                transform: showDocUpload ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.2s',
                fontSize: 18,
              }}
            />
          }
          onClick={() => setShowDocUpload(v => !v)}
          sx={{
            color: '#c5cae9',
            justifyContent: 'flex-start',
            fontSize: 13,
            px: 1.5,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
          }}
        >
          Upload Document (RAG)
        </Button>
        <Collapse in={showDocUpload}>
          <Box sx={{ px: 0.5, pb: 1.5 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Button
              fullWidth
              size="small"
              onClick={() => { setUploadMsg(''); fileInputRef.current?.click(); }}
              disabled={uploading}
              sx={{
                color: '#90caf9',
                border: '1px dashed rgba(144,202,249,0.4)',
                borderRadius: 1.5,
                mb: 1,
                fontSize: 12,
                '&:hover': { borderColor: '#90caf9', bgcolor: 'rgba(144,202,249,0.05)' },
              }}
            >
              {uploading ? 'Indexing…' : '+ Choose PDF'}
            </Button>
            {uploadMsg && (
              <Typography sx={{ fontSize: 11, color: '#90caf9', mb: 0.5, px: 0.5 }}>
                {uploadMsg}
              </Typography>
            )}
            {currentDocName && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.5 }}>
                <Typography
                  noWrap
                  sx={{ fontSize: 11, color: '#90caf9', flex: 1 }}
                >
                  📄 {currentDocName}
                </Typography>
                <Tooltip title="Clear document">
                  <IconButton
                    size="small"
                    onClick={clearDoc}
                    sx={{ color: mutedText, p: 0.5, '&:hover': { color: '#ef5350' } }}
                  >
                    <DeleteIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Collapse>
      </Box>

      <Divider sx={{ borderColor: dividerColor, mx: 1.5 }} />

      {/* Chat History */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Typography
          sx={{
            fontSize: 11,
            color: mutedText,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            px: 2.5,
            py: 1,
          }}
        >
          Chat History
        </Typography>
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: 1,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#1565c0', borderRadius: 2 },
          }}
        >
          {sessions.length === 0 ? (
            <Typography sx={{ fontSize: 12, color: '#546e7a', px: 1.5, py: 0.5 }}>
              {auth.username ? 'No history yet. Start chatting!' : 'Login to see history.'}
            </Typography>
          ) : (
            sessions.slice(0, 30).map(s => (
              <Box
                key={s.session_id}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.25, mb: 0.25 }}
              >
                <ListItemButton
                  selected={s.session_id === sessionId}
                  onClick={() => switchSession(s.session_id)}
                  sx={{
                    flex: 1,
                    borderRadius: 1.5,
                    py: 0.75,
                    px: 1.5,
                    minHeight: 0,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(21,101,192,0.5)',
                      '&:hover': { bgcolor: 'rgba(21,101,192,0.6)' },
                    },
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' },
                  }}
                >
                  <Typography noWrap sx={{ fontSize: 13, color: '#c5cae9' }}>
                    {s.session_id === sessionId ? '▸ ' : ''}
                    {s.title || 'New Chat'}
                    {s.doc_name ? ' 📄' : ''}
                  </Typography>
                </ListItemButton>
                <Tooltip title="Delete session">
                  <IconButton
                    size="small"
                    onClick={() => deleteSession(s.session_id)}
                    sx={{
                      color: '#546e7a',
                      p: 0.5,
                      '&:hover': { color: '#ef5350' },
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            ))
          )}
        </Box>
      </Box>

      <Divider sx={{ borderColor: dividerColor }} />

      {/* User Section */}
      <Box sx={{ px: 1.5, py: 1.5 }}>
        {auth.username ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#90caf9' }}>
              👤 {auth.username}
            </Typography>
            <Tooltip title="Logout">
              <IconButton
                size="small"
                onClick={logout}
                sx={{ color: mutedText, '&:hover': { color: '#ffffff' } }}
              >
                <LogoutIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <>
            <Button
              fullWidth
              onClick={() => setShowAuth(v => !v)}
              sx={{
                color: '#c5cae9',
                bgcolor: 'rgba(255,255,255,0.05)',
                borderRadius: 2,
                fontSize: 13,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              🔑 Login / Register
            </Button>
            <Collapse in={showAuth}>
              <AuthPanel />
            </Collapse>
            {!showAuth && (
              <Typography
                sx={{ fontSize: 11, color: mutedText, textAlign: 'center', mt: 0.5 }}
              >
                Guest mode — history not saved
              </Typography>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Sidebar;
