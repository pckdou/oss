# Week 07. GitHub Actions CI/CD 파이프라인 구축

## 과제 내용

- Node.js 프로젝트에 CI 워크플로우를 구성해 Lint/Test를 자동 실행한다.
- Matrix 전략으로 버전/OS 조합 테스트를 적용하고 Secrets로 민감정보를 안전하게 주입한다.
- Build → Test → Deploy 의존성과 아티팩트 업로드/다운로드를 포함한 복합 워크플로우를 완성한다.

## 제출 링크

| 항목 | 링크 |
|---|---|
| 실습 레포지토리 | [pckdou/cicd](https://github.com/pckdou/cicd) |
| Workflow yml | [ci.yml](https://github.com/pckdou/cicd/blob/main/.github/workflows/ci.yml) |
| Actions 실행 내역 | [Actions](https://github.com/pckdou/cicd/actions) |
| 성공한 실행 (run) | [Run 42558639448](https://github.com/pckdou/cicd/actions/runs/42558639448) |

## 요구사항 충족 내용

| 요구사항 | 구현 |
|---|---|
| Lint/Test 자동 실행 | `lint`(ESLint), `test`(Jest) job이 push/PR 시 자동 실행 |
| Matrix 전략 | ubuntu/windows × Node 20/22/24 = 6개 조합 |
| Secrets 주입 | `${{ secrets.DEPLOY_TOKEN }}`로 주입, 로그에는 길이만 출력 |
| Build → Test → Deploy 의존성 | `needs`로 `lint → test → build → deploy` 연결 |
| 아티팩트 업로드/다운로드 | build job에서 `upload-artifact`, deploy job에서 `download-artifact` (`build-output`) |