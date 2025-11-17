import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';
import { streamAPI } from '../services/api';

const CreateStream: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await streamAPI.create(title, description);
      navigate('/streams');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create stream');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Create New Stream
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Stream Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" size="large">
            Create Stream
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateStream;
