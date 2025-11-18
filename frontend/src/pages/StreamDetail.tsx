import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  TextField,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  ContentCopy,
  Visibility,
  FiberManualRecord,
  VideoLibrary,
} from '@mui/icons-material';
import VideoPlayer from '../components/VideoPlayer';
import { streamAPI } from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const StreamDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stream, setStream] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const fetchStream = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await streamAPI.get(id);
      setStream(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load stream');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStream();
    const interval = setInterval(fetchStream, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const handleStartStream = async () => {
    if (!id) return;
    try {
      await streamAPI.start(id);
      await fetchStream();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to start stream');
    }
  };

  const handleStopStream = async () => {
    if (!id) return;
    try {
      await streamAPI.stop(id);
      await fetchStream();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to stop stream');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !stream) {
    return (
      <Box>
        <Alert severity="error">{error || 'Stream not found'}</Alert>
        <Button onClick={() => navigate('/streams')} sx={{ mt: 2 }}>
          Back to Streams
        </Button>
      </Box>
    );
  }

  const qualities = ['1080p', '720p', '480p', '360p'];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {stream.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              icon={stream.status === 'live' ? <FiberManualRecord /> : undefined}
              label={stream.status.toUpperCase()}
              color={stream.status === 'live' ? 'error' : 'default'}
              size="small"
            />
            {stream.status === 'live' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Visibility fontSize="small" />
                <Typography variant="body2">{stream.viewer_count} viewers</Typography>
              </Box>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {stream.status === 'live' ? (
            <Button variant="contained" color="error" startIcon={<Stop />} onClick={handleStopStream}>
              Stop Stream
            </Button>
          ) : (
            <Button variant="contained" color="success" startIcon={<PlayArrow />} onClick={handleStartStream}>
              Start Stream
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 0, overflow: 'hidden', bgcolor: 'black' }}>
            {stream.status === 'live' ? (
              <Box sx={{ aspectRatio: '16/9' }}>
                <VideoPlayer src={stream.hls_url} />
              </Box>
            ) : (
              <Box
                sx={{
                  aspectRatio: '16/9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.900',
                  color: 'white',
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <VideoLibrary sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6">Stream is offline</Typography>
                  <Typography variant="body2" color="grey.500">
                    Start streaming to see video here
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>

          {stream.status === 'live' && stream.transcoding_enabled && (
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Quality Options
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {qualities.map((quality) => (
                  <Chip key={quality} label={quality} variant="outlined" />
                ))}
              </Box>
            </Paper>
          )}

          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stream.description || 'No description provided'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
              <Tab label="Settings" />
              <Tab label="Stats" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Box sx={{ px: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Stream Key
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={stream.stream_key}
                    type="password"
                    InputProps={{ readOnly: true }}
                  />
                  <IconButton size="small" onClick={() => copyToClipboard(stream.stream_key)}>
                    <ContentCopy />
                  </IconButton>
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  RTMP URL
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={stream.rtmp_url}
                    InputProps={{ readOnly: true }}
                  />
                  <IconButton size="small" onClick={() => copyToClipboard(stream.rtmp_url)}>
                    <ContentCopy />
                  </IconButton>
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  HLS Playback URL
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={stream.hls_url}
                    InputProps={{ readOnly: true }}
                  />
                  <IconButton size="small" onClick={() => copyToClipboard(stream.hls_url)}>
                    <ContentCopy />
                  </IconButton>
                </Box>

                <Divider sx={{ my: 2 }} />

                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Recording"
                      secondary={stream.recording_enabled ? 'Enabled' : 'Disabled'}
                    />
                    <Chip
                      label={stream.recording_enabled ? 'ON' : 'OFF'}
                      color={stream.recording_enabled ? 'success' : 'default'}
                      size="small"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Transcoding"
                      secondary={stream.transcoding_enabled ? 'Multi-quality' : 'Original only'}
                    />
                    <Chip
                      label={stream.transcoding_enabled ? 'ON' : 'OFF'}
                      color={stream.transcoding_enabled ? 'success' : 'default'}
                      size="small"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Time Machine"
                      secondary={`${(stream.time_machine_duration || 21600) / 3600}h buffer`}
                    />
                    <Chip
                      label={stream.time_machine_enabled ? 'ON' : 'OFF'}
                      color={stream.time_machine_enabled ? 'success' : 'default'}
                      size="small"
                    />
                  </ListItem>
                </List>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ px: 2 }}>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Status" secondary={stream.status} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Viewers" secondary={stream.viewer_count} />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Created"
                      secondary={new Date(stream.created_at).toLocaleString()}
                    />
                  </ListItem>
                  {stream.started_at && (
                    <ListItem>
                      <ListItemText
                        primary="Started At"
                        secondary={new Date(stream.started_at).toLocaleString()}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            </TabPanel>
          </Paper>

          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              OBS Studio Setup
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              1. Open OBS Studio
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              2. Go to Settings → Stream
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              3. Select "Custom" as Service
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              4. Copy the RTMP URL and Stream Key above
            </Typography>
            <Typography variant="body2" color="text.secondary">
              5. Click "Start Streaming"
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StreamDetail;
