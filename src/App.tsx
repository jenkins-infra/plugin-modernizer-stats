import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import jenkinsLogo from '/jenkins.svg';

const BASE = import.meta.env.BASE_URL;

function Home() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 3,
        p: 4,
        textAlign: 'center',
        bgcolor: '#15171a',
      }}
    >
      <Box component="img" src={jenkinsLogo} alt="Jenkins" sx={{ width: 250, height: 320 }} />

      <Typography variant="h3" sx={{ fontWeight: 700, color: '#f1f5f9' }}>
        Plugin Modernizer Stats
      </Typography>

      <Typography sx={{ maxWidth: 600, lineHeight: 1.7, fontSize: '1.25rem' }}>
        A visualization dashboard for tracking the modernization &amp; migration progress of the Jenkins plugin
        modernizer tool.
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
        <Box
          component="a"
          href="https://github.com/jenkins-infra/metadata-plugin-modernizer"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: '#60a5fa',
            fontSize: '0.875rem',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          Data Source
        </Box>
        <Box
          component="a"
          href="https://github.com/jenkins-infra/plugin-modernizer-stats"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: '#60a5fa',
            fontSize: '0.875rem',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          GitHub
        </Box>
      </Box>

      <Typography sx={{ fontSize: '1.25rem', mt: 2 }}>
        Work in progress : Dashboard, plugin list and recipe views coming soon ...
      </Typography>
    </Box>
  );
}

function App() {
  return (
    <BrowserRouter basename={BASE}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
