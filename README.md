# Live Station Platform

실시간 라이브 방송 서비스 플랫폼

## 주요 기능

- 🎥 **실시간 라이브 트랜스코딩**: 고화질 영상을 다양한 화질로 실시간 변환
- ⏱️ **타임머신**: 최대 6시간 이전 구간 재생 기능
- 📹 **무제한 녹화**: 라이브 방송 자동 녹화 및 VOD 변환
- 🎬 **Live Short Clip**: 실시간 하이라이트 클립 생성
- 📡 **Re-Stream**: 다양한 플랫폼으로 동시 송출
- 🎭 **Live Curtain**: 실시간 영상 관제 및 제어
- 📊 **모니터링**: 실시간 방송 상태 모니터링 대시보드
- 🌏 **글로벌 송출**: 해외 안정적 송출을 위한 CDN 연동

## 기술 스택

### Backend
- **Language**: Go 1.21+
- **Framework**: Gin, gRPC
- **Database**: PostgreSQL, Redis
- **Storage**: AWS S3
- **Message Queue**: AWS SQS / RabbitMQ

### Frontend
- **Framework**: React 18+
- **UI Library**: Material-UI / Ant Design
- **State Management**: Redux Toolkit
- **Video Player**: Video.js / HLS.js

### Media Server
- **Streaming Server**: SRS (Simple Realtime Server) - MIT License
- **Transcoding**: FFmpeg
- **Protocols**: RTMP, HLS, WebRTC, RTSP

### Infrastructure
- **Container**: Docker, Docker Compose
- **Cloud**: AWS (EC2, S3, CloudFront, MediaLive)
- **Orchestration**: Kubernetes (선택사항)
- **Monitoring**: Prometheus, Grafana

## 프로젝트 구조

```
live-channel/
├── backend/                 # Go 백엔드 서버
│   ├── cmd/                # 실행 파일
│   ├── internal/           # 내부 패키지
│   ├── pkg/                # 공개 패키지
│   ├── api/                # API 정의 (REST, gRPC)
│   └── configs/            # 설정 파일
├── frontend/               # React 프론트엔드
│   ├── src/
│   │   ├── components/    # React 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── services/      # API 서비스
│   │   └── utils/         # 유틸리티
│   └── public/
├── media-server/           # 미디어 서버 설정
│   ├── srs/               # SRS 설정
│   └── ffmpeg/            # FFmpeg 스크립트
├── docker/                 # Docker 설정
│   ├── backend/
│   ├── frontend/
│   └── media-server/
├── infrastructure/         # AWS 인프라 설정
│   ├── terraform/         # Terraform IaC
│   └── docs/              # 인프라 문서
├── scripts/                # 유틸리티 스크립트
└── docker-compose.yml      # 로컬 개발 환경
```

## 빠른 시작

### 사전 요구사항

- Docker 20.10+
- Docker Compose 2.0+
- Go 1.21+ (로컬 개발 시)
- Node.js 18+ (로컬 개발 시)

### 로컬 실행

```bash
# 저장소 클론
git clone <repository-url>
cd live-channel

# 환경 변수 설정
cp .env.example .env

# Docker Compose로 전체 서비스 실행
docker-compose up -d

# 서비스 확인
docker-compose ps
```

### 접속 정보

- Frontend Dashboard: http://localhost:3000
- Backend API: http://localhost:8080
- SRS Media Server: rtmp://localhost:1935/live
- SRS HTTP API: http://localhost:1985

## 스트리밍 테스트

### OBS Studio 설정
```
Server: rtmp://localhost:1935/live
Stream Key: your-stream-key
```

### FFmpeg으로 테스트
```bash
ffmpeg -re -i input.mp4 -c:v libx264 -c:a aac -f flv rtmp://localhost:1935/live/test
```

### HLS 재생
```
http://localhost:8080/live/test.m3u8
```

## 개발 가이드

### Backend 개발

```bash
cd backend
go mod download
go run cmd/server/main.go
```

### Frontend 개발

```bash
cd frontend
npm install
npm start
```

## 라이선스

MIT License

## 기여

Pull Request를 환영합니다!

## 로드맵

- [x] 프로젝트 초기 설정
- [ ] 기본 RTMP 수신 및 HLS 송출
- [ ] 사용자 인증 및 스트림 관리 API
- [ ] 실시간 트랜스코딩 (다중 화질)
- [ ] 녹화 기능 (S3 저장)
- [ ] 타임머신 기능 (6시간)
- [ ] Re-Stream 기능
- [ ] 모니터링 대시보드
- [ ] Live Curtain
- [ ] Short Clip 생성
- [ ] AWS 프로덕션 배포
- [ ] 글로벌 CDN 연동
