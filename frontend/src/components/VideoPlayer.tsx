import React, { useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import Hls from 'hls.js';

interface VideoPlayerProps {
  src: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  style?: React.CSSProperties;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  autoPlay = true,
  controls = true,
  muted = false,
  style,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>('');

  useEffect(() => {
    if (!videoRef.current || !src) return;

    const video = videoRef.current;
    setLoading(true);
    setError('');

    // HLS.js 지원 여부 확인
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        if (autoPlay) {
          video.play().catch((err) => {
            console.error('Auto-play failed:', err);
          });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network error - attempting to recover');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error - attempting to recover');
              hls.recoverMediaError();
              break;
            default:
              setError('Fatal error - cannot recover');
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
      };
    }
    // Safari용 네이티브 HLS 지원
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        if (autoPlay) {
          video.play().catch((err) => {
            console.error('Auto-play failed:', err);
          });
        }
      });
      video.addEventListener('error', () => {
        setError('Failed to load video');
      });
    } else {
      setError('HLS is not supported in this browser');
      setLoading(false);
    }
  }, [src, autoPlay]);

  if (error) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'black',
          color: 'white',
          ...style,
        }}
      >
        <Typography>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', ...style }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0,0,0,0.7)',
            zIndex: 1,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <video
        ref={videoRef}
        controls={controls}
        muted={muted}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'black',
        }}
      />
    </Box>
  );
};

export default VideoPlayer;
