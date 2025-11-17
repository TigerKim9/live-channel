import React from 'react';
import { Typography, Box } from '@mui/material';

const StreamList: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Streams
      </Typography>
      <Typography>No streams yet. Create your first stream!</Typography>
    </Box>
  );
};

export default StreamList;
