# AWS 인프라 구성 가이드

Live Station 플랫폼을 AWS에 배포하기 위한 상세 가이드입니다.

## 목차

1. [필요한 AWS 서비스](#필요한-aws-서비스)
2. [아키텍처 구성](#아키텍처-구성)
3. [단계별 설정](#단계별-설정)
4. [비용 예측](#비용-예측)

## 필요한 AWS 서비스

### 핵심 서비스

- **EC2**: 미디어 서버 (SRS), 백엔드 API 호스팅
- **RDS**: PostgreSQL 데이터베이스
- **ElastiCache**: Redis 캐싱
- **S3**: 녹화 파일 저장
- **CloudFront**: CDN을 통한 전 세계 HLS 스트리밍 배포
- **ECS/EKS**: 컨테이너 오케스트레이션 (선택사항)
- **ALB**: 로드 밸런서
- **Route53**: DNS 관리
- **VPC**: 네트워크 구성

### 추가 서비스 (선택사항)

- **MediaLive + MediaPackage**: 고급 라이브 스트리밍 파이프라인
- **CloudWatch**: 모니터링 및 로깅
- **Lambda**: 서버리스 트랜스코딩, 썸네일 생성
- **SNS/SQS**: 이벤트 알림 및 메시지 큐

## 아키텍처 구성

```
┌─────────────────────────────────────────────────────────────┐
│                      CloudFront (CDN)                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                   Application Load Balancer                  │
└───────────┬─────────────────────────┬───────────────────────┘
            │                         │
    ┌───────▼────────┐        ┌──────▼──────┐
    │   Frontend     │        │   Backend   │
    │   (ECS/EC2)    │        │   (ECS/EC2) │
    └────────────────┘        └─────┬───────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼─────┐  ┌─────▼─────┐  ┌─────▼──────┐
            │ SRS Media   │  │    RDS    │  │ElastiCache │
            │   Server    │  │(PostgreSQL)│  │  (Redis)   │
            │   (EC2)     │  └───────────┘  └────────────┘
            └──────┬──────┘
                   │
            ┌──────▼──────┐
            │     S3      │
            │ (Recordings)│
            └─────────────┘
```

## 단계별 설정

### 1. VPC 설정

```bash
# VPC 생성
VPC CIDR: 10.0.0.0/16

# 서브넷 생성
Public Subnet 1: 10.0.1.0/24 (ap-northeast-2a)
Public Subnet 2: 10.0.2.0/24 (ap-northeast-2c)
Private Subnet 1: 10.0.11.0/24 (ap-northeast-2a)
Private Subnet 2: 10.0.12.0/24 (ap-northeast-2c)
```

### 2. 보안 그룹 설정

#### ALB 보안 그룹
```
Inbound:
  - HTTP (80) from 0.0.0.0/0
  - HTTPS (443) from 0.0.0.0/0
```

#### Backend/Frontend 보안 그룹
```
Inbound:
  - HTTP (8080) from ALB Security Group
  - HTTP (3000) from ALB Security Group
```

#### SRS Media Server 보안 그룹
```
Inbound:
  - RTMP (1935) from 0.0.0.0/0
  - HTTP (8080) from Backend Security Group
  - HTTP API (1985) from Backend Security Group
```

#### RDS 보안 그룹
```
Inbound:
  - PostgreSQL (5432) from Backend Security Group
```

#### ElastiCache 보안 그룹
```
Inbound:
  - Redis (6379) from Backend Security Group
```

### 3. EC2 인스턴스 설정 (SRS Media Server)

```bash
# Instance Type: c5.2xlarge (8 vCPU, 16GB RAM) - 트랜스코딩을 위한 충분한 CPU
# AMI: Amazon Linux 2
# Storage: 100GB gp3 (녹화 임시 저장용)

# User Data Script
#!/bin/bash
yum update -y
yum install -y docker
systemctl start docker
systemctl enable docker

# SRS 설치
docker pull ossrs/srs:5
docker run -d --name srs \
  -p 1935:1935 \
  -p 1985:1985 \
  -p 8080:8080 \
  -v /home/ec2-user/srs.conf:/usr/local/srs/conf/srs.conf \
  -v /mnt/recordings:/var/recordings \
  -v /mnt/hls:/var/hls \
  ossrs/srs:5
```

### 4. RDS 설정

```bash
# Engine: PostgreSQL 15
# Instance Class: db.t3.medium
# Storage: 100GB gp3
# Multi-AZ: Yes (프로덕션)
# Backup Retention: 7 days

# Parameter Group 설정
max_connections = 200
shared_buffers = 1GB
```

### 5. ElastiCache 설정

```bash
# Engine: Redis 7.x
# Node Type: cache.t3.medium
# Number of Replicas: 1
# Multi-AZ: Yes
```

### 6. S3 버킷 설정

```bash
# 버킷 생성
aws s3 mb s3://livestation-recordings-${AWS_ACCOUNT_ID}

# Lifecycle Policy 설정 (비용 최적화)
{
  "Rules": [
    {
      "Id": "MoveToIA",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}

# CORS 설정
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### 7. CloudFront 설정

```bash
# Origin: S3 버킷 또는 ALB
# Price Class: Use All Edge Locations (전 세계)
# Viewer Protocol Policy: Redirect HTTP to HTTPS
# Allowed HTTP Methods: GET, HEAD, OPTIONS

# Custom Error Responses
404 -> 200 (SPA를 위해)

# Cache Behavior for HLS
Path Pattern: *.m3u8
TTL: Min=0, Max=60, Default=10

Path Pattern: *.ts
TTL: Min=3600, Max=86400, Default=86400
```

### 8. ECS 배포 (Container 방식)

#### Task Definition (Backend)

```json
{
  "family": "livestation-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/livestation-backend:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "POSTGRES_HOST",
          "value": "${RDS_ENDPOINT}"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/livestation-backend",
          "awslogs-region": "ap-northeast-2",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### 9. Auto Scaling 설정

```bash
# Target Tracking Scaling Policy
Metric: CPU Utilization
Target Value: 70%
Scale-in Cooldown: 300 seconds
Scale-out Cooldown: 60 seconds

# Min Capacity: 2
# Max Capacity: 10
```

### 10. CloudWatch 모니터링

```bash
# 알람 설정
- CPU Utilization > 80%
- Memory Utilization > 80%
- RDS CPU > 80%
- SRS Media Server Health Check Failed
- S3 Bucket Size Alert
```

## Terraform 자동화

```bash
cd infrastructure/terraform

# 초기화
terraform init

# 계획 확인
terraform plan

# 배포
terraform apply

# 리소스 정리
terraform destroy
```

## 비용 예측 (월간)

### 기본 구성

| 서비스 | 사양 | 예상 비용 (USD) |
|--------|------|-----------------|
| EC2 (SRS) | c5.2xlarge | $250 |
| RDS | db.t3.medium | $150 |
| ElastiCache | cache.t3.medium | $100 |
| S3 | 1TB 저장 | $23 |
| CloudFront | 1TB 전송 | $85 |
| ALB | - | $20 |
| ECS Fargate | 2 tasks | $80 |
| **총계** | | **~$708/월** |

### 확장 구성 (고트래픽)

| 서비스 | 사양 | 예상 비용 (USD) |
|--------|------|-----------------|
| EC2 (SRS) x3 | c5.4xlarge | $1,500 |
| RDS | db.m5.xlarge | $400 |
| ElastiCache | cache.r5.large | $250 |
| S3 | 10TB 저장 | $230 |
| CloudFront | 10TB 전송 | $500 |
| ECS Fargate | 10 tasks | $400 |
| **총계** | | **~$3,280/월** |

## 보안 Best Practices

1. **IAM Roles**: EC2/ECS에 최소 권한 부여
2. **Security Groups**: 최소 필요한 포트만 개방
3. **KMS**: S3 암호화 활성화
4. **WAF**: CloudFront에 WAF 적용 (DDoS 방어)
5. **VPC Flow Logs**: 네트워크 트래픽 모니터링
6. **AWS Secrets Manager**: 데이터베이스 자격 증명 관리

## 재해 복구 (DR)

1. **RDS 자동 백업**: 7일 보존
2. **S3 Cross-Region Replication**: 중요 녹화 파일 복제
3. **CloudFormation/Terraform**: 인프라 코드로 관리
4. **Multi-AZ 배포**: 고가용성 보장

## 다음 단계

1. 기본 인프라 구축
2. CI/CD 파이프라인 설정 (GitHub Actions + ECR)
3. 모니터링 대시보드 구성
4. 부하 테스트 수행
5. 프로덕션 배포

---

문의사항이나 이슈가 있으면 GitHub Issues에 등록해주세요.
