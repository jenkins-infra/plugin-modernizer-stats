import { useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import ViewListOutlined from '@mui/icons-material/ViewListOutlined';
import ScienceOutlined from '@mui/icons-material/ScienceOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const navItems = [
  { label: 'Dashboard', path: '/', icon: <DashboardOutlined /> },
  { label: 'Plugins', path: '/plugins', icon: <ViewListOutlined /> },
  { label: 'Recipes', path: '/recipes', icon: <ScienceOutlined /> },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const location = useLocation();

  const handleNavClick = () => {
    if (!isDesktop) setMobileOpen(false);
  };

  const sidebar = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ px: 2.5, pt: 3, pb: 2, position: 'relative' }}>
        {!isDesktop && (
          <IconButton
            aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8, color: 'text.secondary' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src={`${import.meta.env.BASE_URL}jenkins.svg`}
            alt="Jenkins"
            sx={{ width: 80, height: 110, flexShrink: 0 }}
          />
          <Box sx={{ fontWeight: 800, fontSize: '1.3rem', color: 'text.primary', lineHeight: 1.2 }}>
            Jenkins Plugin Modernizer Statistics
          </Box>
        </Box>
        <Box sx={{ fontSize: '0.90rem', color: 'text.secondary', mt: 5, lineHeight: 1.4 }}>
          A visualization dashboard for tracking the modernization progress of the Jenkins plugin modernizer tool.
        </Box>
      </Box>

      <List
        component="nav"
        aria-label="Primary navigation"
        sx={{ flex: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}
      >
        {navItems.map((item) => {
          const isIndex = item.path === '/';
          const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
          const isExactMatch = normalizedPath === item.path;
          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              end={isIndex}
              aria-current={isExactMatch ? 'page' : 'true'}
              onClick={handleNavClick}
              sx={{
                mx: 1,
                borderRadius: 1,
                mb: 0.5,
                color: 'text.secondary',
                bgcolor: 'transparent',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                '&.active': {
                  color: 'common.white',
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontSize: '0.875rem' } } }} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Box component="header" sx={{ position: 'sticky', top: 0, zIndex: 1100, flexShrink: 0 }}>
        <jio-navbar property="https://plugins.jenkins.io/" theme="dark" />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flex: 1, overflow: 'hidden' }}>
        {isDesktop ? (
          <Box
            sx={{
              width: 240,
              flexShrink: 0,
              overflowY: 'auto',
            }}
          >
            {sidebar}
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1,
                bgcolor: 'background.paper',
                borderBottom: 1,
                borderColor: 'divider',
                flexShrink: 0,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  component="img"
                  src={`${import.meta.env.BASE_URL}jenkins.svg`}
                  alt="Jenkins"
                  sx={{ width: 32, height: 40 }}
                />
                <Box sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary' }}>Plugin Modernizer Stats</Box>
              </Box>
              <IconButton
                aria-label="Open navigation menu"
                onClick={(e) => {
                  (e.currentTarget as HTMLElement).blur();
                  setMobileOpen(true);
                }}
                sx={{ color: 'text.primary' }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={() => setMobileOpen(false)}
              ModalProps={{ keepMounted: true }}
              sx={{ '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box' } }}
            >
              {sidebar}
            </Drawer>
          </>
        )}

        <Box component="main" sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 } }}>
          {children}
          <Box sx={{ mt: 3 }}>
            <jio-footer
              property="https://plugins.jenkins.io/"
              githubRepo="jenkins-infra/plugin-modernizer-stats"
              githubBranch="main"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
