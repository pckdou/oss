# Feature Flags 및 점진적 배포 실습 (11주차)

| GitHub 레포 | https://github.com/pckdou/feature-flags-lab |

Feature Flag 기반 기능 제어, A/B 테스트, Canary 롤아웃 및 자동 롤백을 Node.js로 구현한 실습 프로젝트입니다. 외부 라이브러리 없이 Node.js 내장 모듈만 사용합니다.

> 모든 사용자, 트래픽, 전환율, 장애 지표는 **시뮬레이션 데이터**입니다.

## 구현 내용

| 구분 | 내용 | 위치 |
|------|------|------|
| Feature Flag 3개 | 환경 변수 / 대상 사용자 / 대상 그룹 / 환경별 퍼센트 제어 | `src/flags/`, `config/rollout.json` |
| A/B 테스트 | 2개 variant, 해시 기반 일관된 할당, 이벤트 추적 | `src/experiments/` |
| Canary 롤아웃 (선택) | 1% → 10% → 50% → 100%, 헬스체크 기반 자동 롤백 | `src/canary/`, `config/canary.json` |

## 폴더 구조

```
feature-flags-lab/
├── config/
│   ├── rollout.json        # 플래그 및 A/B 실험 설정
│   └── canary.json         # Canary 단계, 임계값, 시나리오
├── src/
│   ├── flags/
│   │   ├── flags.js        # 플래그 평가 로직
│   │   └── rollout.js      # 해시 버킷 기반 점진 배포
│   ├── experiments/
│   │   ├── assignment.js   # A/B variant 할당
│   │   └── tracking.js     # 이벤트 추적 (JSON Lines)
│   ├── canary/
│   │   ├── healthcheck.js  # 지표 시뮬레이션 및 헬스체크 판정
│   │   ├── controller.js   # 단계 승급 / 자동 롤백
│   │   └── run-canary.js   # 시나리오 실행
│   ├── index.js            # 플래그 + A/B 시뮬레이션 실행
│   └── report.js           # A/B 결과 리포트
├── logs/
│   ├── experiment-log.md   # 실험 로그
│   ├── events.jsonl        # A/B 이벤트 기록 (자동 생성)
│   └── canary-log.jsonl    # Canary 판정 기록 (자동 생성)
└── .env.example
```

## 1. Feature Flag

### 도입한 플래그

| 플래그 | 설명 | development | staging | production | 대상 사용자 / 그룹 |
|--------|------|:-----------:|:-------:|:----------:|--------------------|
| `new_checkout` | 새 결제 화면 | 100% | 50% | 10% | user-0001, beta 그룹 |
| `dark_mode` | 다크 모드 UI | 100% | 100% | 30% | employee 그룹 |
| `recommendation_v2` | 추천 알고리즘 v2 | 100% | 20% | 0% | user-0002 |

### 평가 우선순위

1. **환경 변수 강제 설정**: `FLAG_<플래그명>=on | off`
2. **대상 사용자**: `allowUsers`에 포함되면 활성화
3. **대상 그룹**: `allowGroups`에 포함되면 활성화
4. **환경별 퍼센트**: `APP_ENV` 값에 따른 롤아웃 비율

### 점진 배포 방식

`sha256(플래그명:사용자ID)`를 0~99 버킷으로 변환하고, 버킷이 롤아웃 퍼센트보다 작으면 활성화합니다. 같은 사용자는 항상 같은 버킷이므로 퍼센트를 올려도 기존 활성 사용자가 뒤집히지 않습니다.

## 2. A/B 테스트

- 실험: `checkout_button_color` (결제 버튼 색상)
- Variant: `control` 50% / `treatment` 50%
- **할당 일관성**: `sha256(실험명:사용자ID)` 해시로 variant를 결정하므로 DB 없이도 같은 사용자는 항상 같은 variant를 받습니다. 실행 시 같은 사용자에게 두 번 할당해 불일치 건수를 검증합니다.
- **이벤트 추적**: `exposure`(노출)와 `conversion`(전환) 이벤트를 `logs/events.jsonl`에 한 줄씩 기록하고, `npm run report`로 variant별 전환율을 집계합니다.

## 3. Canary 롤아웃 및 자동 롤백 (선택과제)

- 대상 플래그: `new_checkout`
- 단계: 1% → 10% → 50% → 100% (단계마다 헬스체크 3회 통과 시 승급)
- 롤백 기준 (하나라도 해당하면 즉시 0%로 롤백)
  - 에러율 3% 초과
  - p95 응답 지연 400ms 초과
  - 샘플 수 50 미만
- 시드를 고정해 결과가 재현됩니다.

| 시나리오 | 설명 | 결과 | 실패 단계 | 롤백 사유 |
|----------|------|------|:---------:|-----------|
| healthy | 모든 단계 정상 | COMPLETED (100%) | - | - |
| error_spike | 10%부터 에러율 급증 | ROLLED_BACK | 10% | 에러율 7.7% > 3.0% |
| latency_regression | 50%부터 지연 악화 | ROLLED_BACK | 50% | p95 1162ms > 400ms |

장애가 소수의 사용자 비율에서 먼저 감지되어 전체 사용자에게 영향이 가기 전에 자동 롤백되는 것을 확인했습니다.

## 실행 방법

```bash
# 환경 변수 설정 (선택)
cp .env.example .env

# 플래그 + A/B 시뮬레이션 (APP_ENV: development | staging | production)
APP_ENV=production npm start

# A/B 결과 리포트
npm run report

# Canary 롤아웃 + 자동 롤백 시나리오
npm run canary
```

Windows PowerShell:

```powershell
$env:APP_ENV="production"; npm start
$env:APP_ENV="production"; $env:FLAG_NEW_CHECKOUT="off"; npm start
```

## 실행 결과 요약

### Feature Flag (총 1000명 중 활성 사용자 수)

| 환경 | new_checkout | dark_mode | recommendation_v2 |
|------|:------------:|:---------:|:-----------------:|
| development | 1000 | 1000 | 1000 |
| staging | 557 | 1000 | 198 |
| production | 186 | 409 | 1 |
| production + `FLAG_NEW_CHECKOUT=off` | 0 | 409 | 1 |

- 환경이 development → staging → production으로 갈수록 활성 사용자가 줄어드는 점진 배포를 확인했습니다.
- 설정 퍼센트보다 활성 사용자가 조금 많은 것은 대상 사용자/그룹이 퍼센트와 별개로 강제 활성화되기 때문입니다.
- `recommendation_v2`는 production 롤아웃이 0%이지만, 대상 사용자 `user-0002` 1명만 활성화되어 사용자 타겟팅이 동작함을 확인했습니다.
- `FLAG_NEW_CHECKOUT=off` 설정 시 `new_checkout`이 0명이 되어 환경 변수 킬 스위치가 동작함을 확인했습니다.

### A/B 테스트 (checkout_button_color)

| Variant | 노출 | 전환 | 전환율 |
|---------|:----:|:----:|:------:|
| control | 490 | 54 | 11.0% |
| treatment | 510 | 80 | 15.7% |

- 할당 불일치: **0건** (실행 4회 모두)
- 할당 비율: 490 : 510 (목표 50:50)
- 전환율은 가정값(control 10%, treatment 14%)에서 난수로 생성한 시뮬레이션 값이므로, 실제 효과 검증이 아니라 할당/이벤트 추적 파이프라인이 동작함을 검증한 결과입니다.