# Getting Started - Live Station Platform

Live Station 플랫폼을 로컬에서 실행하고 개발하기 위한 가이드입니다.

## 사전 요구사항

- Docker 20.10+
- Docker Compose 2.0+
- Git

## 빠른 시작

### 1. 저장소 클론

```bash
git clone <repository-url>
cd live-channel
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어서 필요한 설정을 수정합니다:

```bash
# 중요: JWT_SECRET을 실제 운영 환경에서는 반드시 변경하세요
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# AWS 자격 증명 (로컬 개발 시에는 선택사항)
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=livestation-recordings
```

### 3. 서비스 실행

전체 스택을 Docker Compose로 실행합니다:

```bash
docker-compose up -d
```

서비스가 시작되는데 1-2분 정도 소요됩니다.

### 4. 서비스 확인

```bash
docker-compose ps
```

다음 서비스들이 실행 중이어야 합니다:
- `livestation-postgres`: PostgreSQL 데이터베이스
- `livestation-redis`: Redis 캐시
- `livestation-srs`: SRS 미디어 서버
- `livestation-backend`: Go 백엔드 API
- `livestation-frontend`: React 프론트엔드
- `livestation-nginx`: Nginx 리버스 프록시

### 5. 웹 인터페이스 접속

브라우저에서 다음 URL로 접속합니다:

```
http://localhost
```

또는 개발 중이라면:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8081
- SRS HTTP Server: http://localhost:8080

### 6. 계정 생성

1. "Sign Up" 버튼 클릭
2. 이메일, 사용자명, 비밀번호 입력
3. 회원가입 완료 후 로그인

### 7. 첫 스트림 생성

1. 로그인 후 "New Stream" 버튼 클릭
2. 스트림 제목과 설명 입력
3. 생성된 스트림의 RTMP URL과 Stream Key 확인

## 스트리밍 시작하기

### OBS Studio 설정

1. OBS Studio 다운로드 및 설치: https://obsproject.com/
2. 설정 > 방송으로 이동
3. 다음 정보 입력:
   ```
   서비스: 사용자 지정
   서버: rtmp://localhost:1935/live
   스트림 키: [대시보드에서 확인한 Stream Key]
   ```
4. "방송 시작" 클릭

### FFmpeg으로 테스트 스트리밍

테스트 비디오 파일이 있다면:

```bash
ffmpeg -re -i test-video.mp4 \
  -c:v libx264 -preset veryfast -tune zerolatency \
  -b:v 2500k -maxrate 2500k -bufsize 5000k \
  -g 60 -c:a aac -b:a 128k -ar 44100 \
  -f flv rtmp://localhost:1935/live/[your-stream-key]
```

웹캠으로 테스트 (Linux/Mac):

```bash
ffmpeg -f v4l2 -i /dev/video0 \
  -c:v libx264 -preset veryfast -tune zerolatency \
  -b:v 2500k -c:a aac \
  -f flv rtmp://localhost:1935/live/[your-stream-key]
```

## 스트림 시청하기

### 대시보드에서 시청

스트림이 라이브 상태가 되면 대시보드에서 자동으로 플레이어가 표시됩니다.

### VLC Player로 시청

```
미디어 > 네트워크 스트림 열기
URL: http://localhost:8080/live/[your-stream-key].m3u8
```

### FFplay로 시청

```bash
ffplay http://localhost:8080/live/[your-stream-key].m3u8
```

## 주요 기능 테스트

### 1. 다중 화질 트랜스코딩

스트리밍이 시작되면 자동으로 다음 화질로 트랜스코딩됩니다:
- 1080p (1920x1080, 4000kbps)
- 720p (1280x720, 2500kbps)
- 480p (854x480, 1200kbps)
- 360p (640x360, 800kbps)

HLS URL 예시:
```
http://localhost:8080/live/[stream-key]_1080p.m3u8
http://localhost:8080/live/[stream-key]_720p.m3u8
http://localhost:8080/live/[stream-key]_480p.m3u8
http://localhost:8080/live/[stream-key]_360p.m3u8
```

### 2. 녹화 기능

스트리밍은 자동으로 녹화됩니다:
- 위치: `/var/recordings/live/[stream-key]/`
- 형식: FLV (30초 세그먼트)
- 자동으로 S3에 업로드 (설정 시)

### 3. 타임머신

HLS 세그먼트가 최대 6시간(21,600초) 동안 보관되어 과거 시점으로 되돌려 볼 수 있습니다.

### 4. 실시간 모니터링

SRS HTTP API를 통해 실시간 통계 확인:

```bash
# 서버 정보
curl http://localhost:1985/api/v1/summaries

# 스트림 정보
curl http://localhost:1985/api/v1/streams

# 클라이언트 정보
curl http://localhost:1985/api/v1/clients
```

## 로컬 개발

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

개발 서버가 http://localhost:3000 에서 실행됩니다.

### 데이터베이스 접속

```bash
# PostgreSQL
docker exec -it livestation-postgres psql -U livestation

# Redis
docker exec -it livestation-redis redis-cli
```

## 로그 확인

전체 로그:
```bash
docker-compose logs -f
```

특정 서비스 로그:
```bash
docker-compose logs -f backend
docker-compose logs -f srs
docker-compose logs -f frontend
```

## 문제 해결

### 포트 충돌

다른 서비스가 포트를 사용 중이라면 `.env` 파일에서 포트를 변경하세요.

### 데이터베이스 연결 실패

```bash
# 컨테이너 재시작
docker-compose restart postgres

# 데이터베이스 재생성
docker-compose down -v
docker-compose up -d
```

### SRS 미디어 서버 문제

```bash
# SRS 로그 확인
docker-compose logs -f srs

# SRS 재시작
docker-compose restart srs
```

## 서비스 중지

```bash
# 모든 서비스 중지
docker-compose down

# 볼륨까지 삭제 (주의: 데이터 삭제됨)
docker-compose down -v
```

## 다음 단계

1. [AWS 배포 가이드](infrastructure/docs/AWS_SETUP.md)
2. [API 문서](docs/API.md) (작성 예정)
3. [기능 개발 가이드](docs/DEVELOPMENT.md) (작성 예정)

## 지원

문제가 발생하거나 질문이 있으면:
- GitHub Issues에 등록
- 이메일: support@livestation.example.com

즐거운 개발 되세요! 🎥✨
