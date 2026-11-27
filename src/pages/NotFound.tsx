import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { colors } from '../theme';

const NOT_FOUND_TITLE = 'Page Not Found | Jenkins Plugin Modernizer Stats';

export default function NotFound() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = NOT_FOUND_TITLE;
    return () => {
      if (document.title === NOT_FOUND_TITLE) {
        document.title = previousTitle;
      }
    };
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: '60vh',
        px: 2,
        py: 6,
      }}
    >
      <Box
        component="img"
        src={`${import.meta.env.BASE_URL}fire-jenkins.svg`}
        alt="Jenkins page not found"
        sx={{ width: 260, height: 'auto', mb: 4 }}
      />
      <Typography
        variant="h4"
        sx={{
          color: colors.text.dark,
          fontWeight: 700,
          mb: 2,
          fontSize: { xs: '1.5rem', sm: '2rem' },
        }}
      >
        The page you requested could not be found.
      </Typography>
      <Typography
        component={Link}
        to="/"
        sx={{
          color: colors.primary.light,
          fontSize: '1.1rem',
          fontWeight: 600,
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        Back to homepage
      </Typography>
    </Box>
  );
}
