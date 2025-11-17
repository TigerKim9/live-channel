import React from 'react';
import { Typography, Box } from '@mui/material';

const Recordings: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Recordings
      </Typography>
      <Typography>No recordings available.</Typography>
    </Box>
  );
};

export default Recordings;
