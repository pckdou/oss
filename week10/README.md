# 10주차: 멀티 플랫폼 배포 자동화

## 제출 링크

| 항목 | 링크 |
|---|---|
| GitHub 레포 | https://github.com/pckdou/multi-platform-deploy |
| 프런트엔드 라이브 URL (Vercel) | https://multi-platform-deploy.vercel.app |
| 백엔드 라이브 URL (GCP Cloud Run) | https://demo-api-n4aoz6efbq-du.a.run.app |
| 헬스체크 | https://demo-api-n4aoz6efbq-du.a.run.app/health |
| PR 프리뷰 증빙 | https://github.com/pckdou/multi-platform-deploy/pull/1 |

## 배포 워크플로우

- [ci.yml](https://github.com/pckdou/multi-platform-deploy/blob/main/.github/workflows/ci.yml): PR 시 백엔드/프런트 빌드, Docker 빌드, 컨테이너 스모크 테스트
- [backend-deploy.yml](https://github.com/pckdou/multi-platform-deploy/blob/main/.github/workflows/backend-deploy.yml): main 푸시 시 Docker 이미지 빌드, Artifact Registry 푸시, Cloud Run 배포, 헬스체크

## 과제 요건별 구현 내용

### 1. 프런트엔드 자동 배포 및 PR 프리뷰
- Vercel과 GitHub 레포를 연동 (Root Directory: `frontend`, Vite)
- `main` 푸시 시 Production 자동 배포
- PR 생성 시 Preview URL 자동 생성 (PR #1에서 확인)
- 환경변수 `VITE_API_URL`로 백엔드 주소 연결 (Production/Preview/Development 적용)

### 2. Docker 기반 배포 파이프라인 전략

```
PR 생성 → CI 검증 (빌드 + Docker 빌드 + 스모크 테스트)
        → Vercel Preview 배포
merge to main
        → Docker 빌드 (태그: git SHA)
        → Artifact Registry 푸시
        → Cloud Run 배포 (새 리비전)
        → /health 스모크 테스트
```

설계 포인트:
- 멀티스테이지 빌드, 비루트(`USER node`) 실행으로 이미지 경량화 및 보안 강화
- 이미지 태그를 `latest`가 아닌 커밋 SHA로 지정해 추적과 롤백 용이
- PR에서는 검증만 하고 배포는 main에서만 수행
- 시크릿(`GCP_SA_KEY`, `GCP_PROJECT_ID`)은 GitHub Secrets로 관리
- 롤백: Cloud Run 리비전 기능으로 이전 리비전에 트래픽 전환 (`gcloud run services update-traffic`)

### 3. 클라우드 배포 자동화 (GCP Cloud Run)
- 플랫폼: GCP (리전: asia-northeast3), 컨테이너 기반 서버리스
- GitHub Actions에서 서비스 계정으로 인증 후 빌드, 푸시, 배포 자동화
- 최소 인스턴스 0, 최대 2로 비용 제어

### 4. 헬스체크 및 모니터링
- 애플리케이션 `/health` 엔드포인트
- Dockerfile `HEALTHCHECK`
- 배포 직후 스모크 테스트 (최대 5회 재시도)
- Cloud Monitoring Uptime Check (1분 주기, 4개 지역) + 이메일 알림

## 구성도

```
개발자 → GitHub ─┬─ (PR/main) → Vercel ───────→ Frontend (React)
                  │                                  │ VITE_API_URL
                  └─ (main) → GitHub Actions         ▼
                              └─ Docker build → Artifact Registry
                                   └─ Cloud Run → Backend (Express) ← Uptime Check
```