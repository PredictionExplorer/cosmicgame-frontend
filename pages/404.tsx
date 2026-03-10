import { Typography, Box, Button } from '@mui/material';
import Link from 'next/link';

import { MainWrapper } from '../components/styled';

const NotFoundPage = () => {
  return (
    <MainWrapper>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1" color="primary" sx={{ textAlign: 'center' }}>
          404 - Page Not Found
        </Typography>
        <Button
          component={Link}
          href="/"
          variant="outlined"
          color="primary"
          sx={{
            mt: 2,
          }}
        >
          Return Home
        </Button>
      </Box>
    </MainWrapper>
  );
};

export default NotFoundPage;
