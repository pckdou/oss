# Week 04: GitHub Flow 및 코드리뷰 협업 실습

## 1. 실습 목표
- Feature 브랜치 전략으로 작업한다.
- Conventional Commits 형식으로 커밋하고 PR을 생성한다.
- 최소 3건 이상의 PR 리뷰를 수행하며 `[MUST]`/`[SHOULD]` 태그로 구조화된 피드백을 남긴다.

## 2. Feature 브랜치 전략
`main`에서 직접 작업하지 않고, 작업 단위마다 브랜치를 만들어 작업한다.

| 브랜치 | 목적 |
|---|---|
| `feature/add-readme-guide` | README 표에 4주차 항목 추가 |
| `docs/add-contributing-guide` | CONTRIBUTING 가이드 추가 |
| `fix/readme-typo` | README 표기 오류 수정 |

작업 흐름:

    main → 브랜치 생성 → 수정 → 커밋 → push → PR 생성 → 리뷰 → 머지

## 3. Conventional Commits 적용
형식: `<type>(<scope>): <설명>`

| type | 용도 | 이번 실습 예시 |
|---|---|---|
| `docs` | 문서 추가/수정 | `docs: add week04 entry to README table` |
| `fix` | 오류 수정 | `fix: correct typo in README` |

## 4. 생성한 PR

| PR | 제목 | 브랜치 |
|---|---|---|
| [#17](https://github.com/pckdou/oss/pull/17) | docs: add week04 entry to README table | `feature/add-readme-guide` |
| [#18](https://github.com/pckdou/oss/pull/18) | docs: add CONTRIBUTING guide | `docs/add-contributing-guide` |
| [#19](https://github.com/pckdou/oss/pull/19) | fix: correct typo in README | `fix/readme-typo` |

## 5. 코드리뷰 기록
리뷰는 태그로 중요도를 구분해 남겼다.

| 태그 | 의미 | 머지 전 |
|---|---|---|
| `[MUST]` | 반드시 수정해야 하는 문제 (오류, 형식 깨짐) | 필수 반영 |
| `[SHOULD]` | 수정하면 좋은 개선 사항 | 권장 |

| PR | 태그 | 피드백 요약 |
|---|---|---|
| #17 | `[SHOULD]` | 4번 행 링크 표기 일관성 확인 |
| #18 | `[MUST]` | 8행 내용 오류로 표 형식 깨짐 |
| #19 | `[MUST]` | 8행 내용 오류로 표 형식 깨짐 |