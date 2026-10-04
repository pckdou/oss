# Week 03. 칸반 기반 GitHub Project 및 스프린트 백로그 구성

칸반 기반 GitHub Project를 생성하고, 이슈 템플릿, 라벨 체계, 마일스톤을 구성해 스프린트 운영이 가능한 백로그를 만들었습니다.

## 제출 링크

| 요구사항 | 링크 |
|---|---|
| GitHub Project (칸반 보드) | https://github.com/users/pckdou/projects/1 |
| 이슈 목록 (12개) | https://github.com/pckdou/oss/issues |
| 이슈 템플릿 (Bug/Feature) | https://github.com/pckdou/oss/issues/new/choose |
| 라벨 | https://github.com/pckdou/oss/labels |
| 마일스톤 (Sprint 1, 2) | https://github.com/pckdou/oss/milestones |
| 템플릿 파일 | [.github/ISSUE_TEMPLATE](../.github/ISSUE_TEMPLATE) |

## 1. 칸반 보드

상태 컬럼: **Backlog → To Do → In Progress → Review → Done**

![kanban](images/kanban.png)

- Sprint 1 이슈 6개: To Do
- Sprint 2 이슈 6개: Backlog
- 스프린트별 뷰(Sprint 1, Sprint 2)와 자동화 Workflow 설정

## 2. 라벨 체계

| 축 | 라벨 |
|---|---|
| type | bug, feature, chore, docs |
| priority | high, mid, low |
| area | frontend, backend, infra |

## 3. 이슈 템플릿

- Bug: 현상, 재현 방법, 기대 동작, 환경, 심각도
- Feature: 배경, 제안 내용, 완료 조건

## 4. 마일스톤

| 마일스톤 | 기간 | 목표 |
|---|---|---|
| Sprint 1 | ~ 2026-10-19 | 기반 구축 (이슈 6개) |
| Sprint 2 | ~ 2026-11-02 | 핵심 기능 (이슈 6개) |

## 5. 이슈 현황

총 12개 (type, priority, area 라벨과 마일스톤 지정 완료)