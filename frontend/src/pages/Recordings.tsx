import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  PlayArrow,
  Download,
  Delete,
  AccessTime,
  Storage,
} from '@mui/icons-material';
import { recordingAPI } from '../services/api';

interface Recording {
  id: string;
  filename: string;
  file_path: string;
  s3_url: string;
  duration: number;
  file_size: number;
  status: 'processing' | 'completed' | 'failed';
  thumbnail_url?: string;
  started_at: string;
  stream?: {
    title: string;
  };
}

const Recordings: React.FC = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const response = await recordingAPI.list();
      setRecordings(response.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load recordings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this recording?')) {
      return;
    }

    try {
      await recordingAPI.delete(id);
      setRecordings(recordings.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete recording');
    }
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Recordings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {recordings.length === 0 ? (
        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            bgcolor: 'background.default',
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No recordings yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start streaming to automatically create recordings
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {recordings.map((recording) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={recording.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardMedia
                  component="div"
                  sx={{
                    height: 180,
                    bgcolor: 'grey.900',
                    position: 'relative',
                    backgroundImage: recording.thumbnail_url
                      ? `url(${recording.thumbnail_url})`
                      : 'linear-gradient(135deg, #434343 0%, #000000 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                    }}
                  >
                    <Chip
                      label={recording.status.toUpperCase()}
                      color={
                        recording.status === 'completed'
                          ? 'success'
                          : recording.status === 'processing'
                          ? 'warning'
                          : 'error'
                      }
                      size="small"
                    />
                  </Box>
                  {recording.duration > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <AccessTime fontSize="small" sx={{ color: 'white' }} />
                      <Typography variant="caption" color="white">
                        {formatDuration(recording.duration)}
                      </Typography>
                    </Box>
                  )}
                </CardMedia>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" gutterBottom noWrap>
                    {recording.stream?.title || recording.filename}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {new Date(recording.started_at).toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Storage fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(recording.file_size)}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<PlayArrow />}
                    disabled={recording.status !== 'completed'}
                  >
                    Play
                  </Button>
                  <Box>
                    {recording.s3_url && (
                      <IconButton
                        size="small"
                        href={recording.s3_url}
                        download
                        color="primary"
                      >
                        <Download />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(recording.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Recordings;
