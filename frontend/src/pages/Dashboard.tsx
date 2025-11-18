import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Grid,
  Paper,
  Box,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Avatar,
  Chip,
} from '@mui/material';
import {
  VideoLibrary,
  PlayCircle,
  Movie,
  TrendingUp,
  Add,
} from '@mui/icons-material';
import { streamAPI, recordingAPI } from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStreams: 0,
    liveStreams: 0,
    totalRecordings: 0,
    totalViewers: 0,
  });
  const [recentStreams, setRecentStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [streamsRes, recordingsRes] = await Promise.all([
          streamAPI.list(),
          recordingAPI.list(),
        ]);

        const streams = streamsRes.data || [];
        const recordings = recordingsRes.data || [];

        const liveCount = streams.filter((s: any) => s.status === 'live').length;
        const totalViewers = streams.reduce((sum: number, s: any) => sum + (s.viewer_count || 0), 0);

        setStats({
          totalStreams: streams.length,
          liveStreams: liveCount,
          totalRecordings: recordings.length,
          totalViewers,
        });

        setRecentStreams(streams.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/streams/new')}
        >
          Create Stream
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Streams
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>
                    {stats.totalStreams}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 56, height: 56 }}>
                  <VideoLibrary fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Live Now
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>
                    {stats.liveStreams}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 56, height: 56 }}>
                  <PlayCircle fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Recordings
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>
                    {stats.totalRecordings}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 56, height: 56 }}>
                  <Movie fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Viewers
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>
                    {stats.totalViewers}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', width: 56, height: 56 }}>
                  <TrendingUp fontSize="large" />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Streams */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Recent Streams</Typography>
          <Button size="small" onClick={() => navigate('/streams')}>
            View All
          </Button>
        </Box>

        {recentStreams.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary" gutterBottom>
              No streams yet
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/streams/new')}
              sx={{ mt: 2 }}
            >
              Create Your First Stream
            </Button>
          </Box>
        ) : (
          <Box>
            {recentStreams.map((stream) => (
              <Box
                key={stream.id}
                sx={{
                  py: 2,
                  px: 2,
                  mb: 1,
                  borderRadius: 1,
                  bgcolor: 'background.default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    cursor: 'pointer',
                  },
                }}
                onClick={() => navigate(`/streams/${stream.id}`)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: stream.status === 'live' ? 'error.main' : 'grey.700',
                      width: 48,
                      height: 48,
                    }}
                  >
                    <VideoLibrary />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                      {stream.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(stream.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                  <Chip
                    label={stream.status === 'live' ? 'LIVE' : stream.status.toUpperCase()}
                    color={stream.status === 'live' ? 'error' : 'default'}
                    size="small"
                  />
                  {stream.status === 'live' && (
                    <Typography variant="body2" color="text.secondary">
                      {stream.viewer_count} viewers
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Dashboard;
