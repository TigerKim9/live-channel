import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import {
  PlayArrow,
  Visibility,
  Edit,
  Delete,
  FiberManualRecord,
} from '@mui/icons-material';

interface Stream {
  id: string;
  title: string;
  description: string;
  status: 'offline' | 'live' | 'error';
  thumbnail_url?: string;
  viewer_count: number;
  created_at: string;
}

interface StreamCardProps {
  stream: Stream;
  onDelete?: (id: string) => void;
}

const StreamCard: React.FC<StreamCardProps> = ({ stream, onDelete }) => {
  const navigate = useNavigate();

  const getStatusColor = () => {
    switch (stream.status) {
      case 'live':
        return 'error';
      case 'offline':
        return 'default';
      case 'error':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = () => {
    switch (stream.status) {
      case 'live':
        return 'LIVE';
      case 'offline':
        return 'Offline';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
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
          backgroundImage: stream.thumbnail_url
            ? `url(${stream.thumbnail_url})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            icon={stream.status === 'live' ? <FiberManualRecord /> : undefined}
            label={getStatusLabel()}
            color={getStatusColor()}
            size="small"
            sx={{
              fontWeight: 'bold',
              animation: stream.status === 'live' ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.7 },
              },
            }}
          />
        </Box>
        {stream.status === 'live' && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
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
            <Visibility fontSize="small" />
            <Typography variant="caption" color="white">
              {stream.viewer_count}
            </Typography>
          </Box>
        )}
      </CardMedia>

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom noWrap>
          {stream.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {stream.description || 'No description'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Created: {new Date(stream.created_at).toLocaleDateString()}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button
          size="small"
          variant="contained"
          startIcon={<PlayArrow />}
          onClick={() => navigate(`/streams/${stream.id}`)}
          disabled={stream.status === 'offline'}
        >
          {stream.status === 'live' ? 'Watch' : 'View'}
        </Button>
        <Box>
          <IconButton
            size="small"
            onClick={() => navigate(`/streams/${stream.id}`)}
            color="primary"
          >
            <Edit />
          </IconButton>
          {onDelete && (
            <IconButton
              size="small"
              onClick={() => onDelete(stream.id)}
              color="error"
            >
              <Delete />
            </IconButton>
          )}
        </Box>
      </CardActions>
    </Card>
  );
};

export default StreamCard;
