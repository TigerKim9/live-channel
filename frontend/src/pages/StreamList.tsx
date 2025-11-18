import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Container,
  Paper,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import StreamCard from '../components/StreamCard';
import { streamAPI } from '../services/api';

interface Stream {
  id: string;
  title: string;
  description: string;
  status: 'offline' | 'live' | 'error';
  thumbnail_url?: string;
  viewer_count: number;
  created_at: string;
}

const StreamList: React.FC = () => {
  const navigate = useNavigate();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStreams = async () => {
    try {
      setLoading(true);
      const response = await streamAPI.list();
      setStreams(response.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load streams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreams();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this stream?')) {
      return;
    }

    try {
      await streamAPI.delete(id);
      setStreams(streams.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete stream');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          My Streams
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/streams/new')}
          size="large"
        >
          Create Stream
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {streams.length === 0 ? (
        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            bgcolor: 'background.default',
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No streams yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first stream to start broadcasting!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/streams/new')}
          >
            Create First Stream
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {streams.map((stream) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={stream.id}>
              <StreamCard stream={stream} onDelete={handleDelete} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default StreamList;
