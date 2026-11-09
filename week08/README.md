# 8주차: 워크플로우 실행 최적화 (재사용/캐싱/조건부)

## 제출 링크

- 실습 레포: https://github.com/pckdou/workflow
- 📄 **최적화 전후 비교 리포트: https://github.com/pckdou/workflow/blob/main/docs/REPORT.md**

## 과제 요구사항과 결과

| 요구사항 | 구현 | 증빙 |
|---|---|---|
| Matrix 확장 테스트 | Ubuntu(Node 18/20/22) + Windows(Node 20/22) = 5조합 × 2프로젝트 = 10 job | [PR #1 Checks](https://github.com/pckdou/workflow/pull/1/checks) |
| 중복 제거 | Composite Action + Reusable Workflow (중복 job 2개 → 0개) | [리포트 1장](https://github.com/pckdou/workflow/blob/main/docs/REPORT.md#1-구조-개선-중복-제거) |
| 캐싱 전후 실행 시간 측정 | npm 캐시 ON/OFF 비교, 의존성 단계 중앙값 **13.8%** 단축 (전체 10.5%) | [리포트 2장](https://github.com/pckdou/workflow/blob/main/docs/REPORT.md#2-캐싱-전후-측정) |
| 브랜치/PR 조건 + 변경 파일 감지 배포 | main → production, develop → staging, PR은 배포 없음, 변경된 폴더만 배포 | [리포트 3장](https://github.com/pckdou/workflow/blob/main/docs/REPORT.md#3-조건부-배포-파이프라인) |

## 핵심 결과 요약

### 캐싱 (의존성 확장 후, 각 5회)

| 지표 | 캐시 OFF | 캐시 ON | 개선율 |
|---|---|---|---|
| 의존성 단계 중앙값 | 29.0초 | 25.0초 | 13.8% |
| 전체 시간 중앙값 | 38.0초 | 34.0초 | 10.5% |

표본이 작아 경향 수준으로 해석했고, 의존성이 작을 때는 효과가 5.9% 수준으로 러너 편차에 묻혔습니다.

### 조건부 배포 검증

| # | 시나리오 | 결과 |
|---|---|---|
| 1 | frontend 수정 PR | 배포 skipped |
| 2 | 위 PR merge (develop) | frontend만 staging 배포 |
| 3 | backend 수정 merge | backend만 배포 (수정 후) |
| 4 | docs만 수정 | CI 미실행, 배포 skipped |
| 5 | develop → main | frontend, backend 모두 production 배포 |

### 문제 발견과 해결

시나리오 3에서 backend만 수정했는데 frontend까지 배포되는 문제가 있었습니다. 로그에서 `paths-filter`가 push 이벤트에서도 main과의 누적 차이를 비교한다는 점을 확인했고, `base: ${{ github.event.before }}`를 지정해 해결했습니다.

## 구조

```
.github/
├─ actions/setup-node-deps/action.yml   # Composite Action
└─ workflows/
   ├─ 01-baseline.yml                   # 최적화 전
   ├─ 02-cache-benchmark.yml            # 캐시 측정용
   ├─ _reusable-test.yml                # Reusable Workflow + Matrix
   ├─ ci.yml                            # 최적화 후 CI
   └─ deploy.yml                        # 조건부 배포
```