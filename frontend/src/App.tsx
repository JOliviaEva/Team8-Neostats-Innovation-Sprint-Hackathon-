import { Box, Typography } from '@mui/material';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import WelcomeScreen from './components/WelcomeScreen';
import ChatInput from './components/ChatInput';

function ChatLayout() {
  const { messages, currentDocName } = useApp();

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#ffffff', overflow: 'hidden' }}>
      <Sidebar />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: { xs: 2, md: 4 },
            py: 1.5,
            borderBottom: '2px solid #e3eaf5',
            bgcolor: '#ffffff',
            flexShrink: 0,
          }}
        >
          <Typography sx={{ flex: 1, fontSize: 20, fontWeight: 700, color: '#0d47a1' }}>
            NeoPulse AI
          </Typography>
          {currentDocName && (
            <Typography sx={{ fontSize: 13, color: '#1565c0', mr: 2 }}>
              📄 RAG mode: {currentDocName}
            </Typography>
          )}
          <img
            src="/cu-logo.png"
            alt="Christ University"
            style={{ height: 40, objectFit: 'contain' }}
            onError={e => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </Box>

        {/* Content area */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#1565c0', borderRadius: 3 },
          }}
        >
          {messages.length === 0 ? <WelcomeScreen /> : <ChatArea />}
        </Box>

        {/* Input */}
        <ChatInput />
      </Box>
    </Box>
  );
}

function App() {
  return (
    <AppProvider>
      <ChatLayout />
    </AppProvider>
  );
}

export default App;
