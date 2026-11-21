# 12주차: Shift-Left 테스트 자동화

## 제출 링크
- GitHub 레포: https://github.com/pckdou/shift-left-testing
- CI 결과: https://github.com/pckdou/shift-left-testing/actions

## 요약
- Jest 단위 테스트 56개, 커버리지 Statements/Functions/Lines 100%, Branches 98.24% (기준 80% 이상)
- TDD(Red-Green-Refactor) 핵심 기능 5개: capitalize, isPalindrome, sum, average, clamp
- GitHub Actions CI 자동 실행 및 커버리지 리포트 아티팩트 저장
- (선택) Playwright E2E 1개, 실패 시 스크린샷 아티팩트 저장 검증
- (선택) 레거시 코드 characterization test 작성 후 리팩토링, 테스트 수정 없이 통과