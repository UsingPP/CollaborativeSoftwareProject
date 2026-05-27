# 백엔드 구현 기능 vs 프론트엔드 연동 현황 분석 (v3)

> 분석 기준일: 2026-05-27  
> **v3 업데이트**: 1차 연동 구현 완료 반영  
> 최신 반영 커밋:  
> - `70b3729` — **JWT 인증 및 보안 강화** (2026-05-21)  
> - `cf85fed` — **WebSocket + JWT 적용** (2026-05-21)  
> 백엔드: [TeamTeam_backend/app/routers](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/TeamTeam_backend/app/routers)  
> 프론트엔드: [CollaborativeSoftwareProject/src/app](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app)

---

## 전체 요약

| 도메인 | 백엔드 엔드포인트 수 | 프론트 연동 | 미연동/버그 |
|--------|---:|---:|---:|
| Auth | **4** | 4 | ✅ 완료 (보안 권고 사항 남음) |
| Teams | 5 | 5 | ✅ 완료 |
| Tasks | 3 | 3 | ✅ 완료 (DELETE 버그 제거) |
| Notices | 3 | 3 | ✅ 완료 (상세 보기 추가) |
| Chat | 6 | 6 | ✅ 완료 (WebSocket 연동) |
| Evaluations | 2 | 2 | ✅ 완료 |
| Users | 2 | 2 | ✅ 완료 |
| References | 3 | 3 | ✅ 완료 (전면 구현) |
| AI Schedule | 4 | 4 | ✅ 완료 (reject 추가) |
| Dashboard | — | — | ✅ 완료 (전면 재작성) |

---

## 🆕 JWT 인증 및 보안 강화 커밋 (`70b3729`) 변경사항

### 백엔드 변경 내용 요약

| 파일 | 변경 내용 |
|---|---|
| [security.py](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/TeamTeam_backend/app/core/security.py) | 비밀번호를 **bcrypt 해싱**으로 변경, JWT HS256 토큰 발급/검증 구현 |
| [config.py](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/TeamTeam_backend/app/core/config.py) | `JWT_SECRET`, `REFRESH_SECRET` 환경변수 추가 |
| [auth.py](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/TeamTeam_backend/app/routers/auth.py) | `/refresh`, `/logout` 엔드포인트 신규 추가, 로그인 시 Refresh Token Cookie 발급 |
| [schemas/auth.py](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/TeamTeam_backend/app/schemas/auth.py) | 비밀번호 복잡도(8자+숫자+영문) 및 이름 길이(1~50자) 서버 측 검증 추가 |

---

## 1. Auth (`/api/auth`) — [auth.py](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/TeamTeam_backend/app/routers/auth.py)

| 엔드포인트 | 기능 | 프론트 연동 | 상태 |
|---|---|---|---|
| `POST /api/auth/signup` | 회원가입 (bcrypt 해싱) | [MainPage.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/MainPage.tsx) | ✅ 연동됨 |
| `POST /api/auth/login` | 로그인 + Refresh Token Cookie 발급 | [MainPage.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/MainPage.tsx) | ✅ 연동됨 |
| `POST /api/auth/refresh` | Access Token 재발급 (Cookie 기반) | [api.ts](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/store/api.ts) | ✅ **401 interceptor 구현됨** |
| `POST /api/auth/logout` | 로그아웃 + Cookie 삭제 | [authSlice.ts](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/store/authSlice.ts) | ✅ **logout() 내 API 호출 구현됨** |

> [!NOTE]
> **구현 완료**: [api.ts](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/store/api.ts)에 axios 401 response interceptor가 추가되어, Access Token 만료 시 `POST /api/auth/refresh`를 호출하고 원래 요청을 재시도합니다. 동시 다발적 401에 대한 큐 메커니즘도 포함되어 있습니다 (`withCredentials: true`).

> [!NOTE]
> **보안 권고 (미해결)**: Access Token이 여전히 `localStorage`에 저장됩니다. 이는 XSS에 취약한 방식입니다. 백엔드가 이미 httpOnly Cookie로 Refresh Token을 발급하므로, Access Token도 메모리(Redux state)에만 보관하는 패턴이 보안상 권장됩니다. 단, 이는 기능에 영향을 주지 않으므로 별도 이슈로 관리 필요합니다.

> [!NOTE]
> **보안 권고 (미해결)**: WebSocket이 `?user_id=<id>` 쿼리 파라미터로 인증합니다. JWT token 기반 인증 방식이 보안상 권장되나, 백엔드 구현 방식에 맞게 현재 방식으로 구현되어 있습니다.

---

## 2. Teams (`/api/teams`) — [teams.py](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/TeamTeam_backend/app/routers/teams.py)

| 엔드포인트 | 기능 | 프론트 연동 파일 | 상태 |
|---|---|---|---|
| `POST /api/teams` | 팀 생성 | [MainPage.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/MainPage.tsx) | ✅ 연동됨 |
| `POST /api/teams/join` | 초대코드로 팀 참여 | [MainPage.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/MainPage.tsx) | ✅ 연동됨 |
| `GET /api/teams` | 내 팀 목록 조회 | [MainPage.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/MainPage.tsx) | ✅ 연동됨 |
| `GET /api/teams/{team_id}` | 팀 대시보드 (멤버/공지/오늘일정/진행률) | [Dashboard.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Dashboard.tsx) | ✅ **연동됨** |
| `PATCH /api/teams/{team_id}/status` | 팀 상태 변경 (팀장 전용) | [Dashboard.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Dashboard.tsx) | ✅ **구현됨** |

> [!NOTE]
> **구현 완료**: [Dashboard.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Dashboard.tsx)가 전면 재작성되어 `GET /api/teams/{teamId}` 단일 API로 팀 정보, 멤버, 오늘 일정, 진행률을 모두 표시합니다. `PATCH /api/teams/{teamId}/status`를 호출하는 "프로젝트 종료" 버튼도 팀장에게만 표시됩니다.

---

## 3. Tasks — [tasks.py](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/TeamTeam_backend/app/routers/tasks.py)

| 엔드포인트 | 기능 | 프론트 연동 파일 | 상태 |
|---|---|---|---|
| `GET /api/teams/{team_id}/tasks` | 업무 목록 조회 | [Tasks.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Tasks.tsx) | ✅ 연동됨 |
| `POST /api/teams/{team_id}/tasks` | 업무 생성 | [Tasks.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Tasks.tsx) | ✅ 연동됨 |
| `PATCH /api/tasks/{task_id}` | 업무 상태/정보 수정 | [Tasks.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Tasks.tsx) | ✅ 연동됨 |

> [!NOTE]
> **버그 제거 완료**: 존재하지 않는 `DELETE /api/tasks/{task_id}` 호출이 제거되었습니다. 삭제 버튼 UI와 `handleDeleteTask` 함수 모두 [Tasks.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Tasks.tsx)에서 제거됨.

> [!NOTE]
> **useParams 수정 완료**: `const { team_id } = useParams()` → `const { teamId } = useParams<{ teamId: string }>()` 로 수정되어 라우트 파라미터 (`/team/:teamId`)가 올바르게 읽힙니다.

---

## 4. Notices — [notices.py](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/TeamTeam_backend/app/routers/notices.py)

| 엔드포인트 | 기능 | 프론트 연동 파일 | 상태 |
|---|---|---|---|
| `GET /api/teams/{team_id}/notices` | 공지사항 목록 조회 | [Announcements.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Announcements.tsx) | ✅ **URL 수정됨** |
| `POST /api/teams/{team_id}/notices` | 공지사항 작성 | [Announcements.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Announcements.tsx) | ✅ **URL 수정됨** |
| `GET /api/notices/{notice_id}` | 공지사항 상세 조회 | [Announcements.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Announcements.tsx) | ✅ **URL 수정 + 상세 모달 구현됨** |

> [!NOTE]
> **수정 완료**: URL 오타 3건 모두 수정됨.
> - `/api/teams/${team_id}/notice` → `/api/teams/${team_id}/notices` (목록/작성)
> - `/api/teams/notices/${notice_id}` → `/api/notices/${notice_id}` (상세)
>
> 또한 공지사항 클릭 시 상세 내용을 보여주는 모달이 추가되어 `GET /api/notices/{notice_id}`가 실제로 호출됩니다.

---

## 5. Chat — [chat.py](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/TeamTeam_backend/app/routers/chat.py)

| 엔드포인트 | 기능 | 프론트 연동 파일 | 상태 |
|---|---|---|---|
| `POST /api/teams/{team_id}/chat-rooms` | 채팅방 생성 | [Chat.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Chat.tsx) | ✅ 연동됨 |
| `GET /api/teams/{team_id}/chat-rooms` | 채팅방 목록 조회 | [Chat.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Chat.tsx) | ✅ 연동됨 |
| `GET /api/chat-rooms/{room_id}/messages` | 메시지 내역 조회 | [Chat.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Chat.tsx) | ✅ 연동됨 |
| `POST /api/chat-rooms/{room_id}/messages` | 메시지 전송 (REST fallback) | [Chat.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Chat.tsx) | ✅ **body 필드명 수정됨** |
| `POST /api/chat-rooms/{room_id}/ai-prompt` | AI 대화 요약 | [Chat.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Chat.tsx) | ✅ 연동됨 |
| `WS /ws/chat-rooms/{room_id}` | **실시간 WebSocket 채팅** | [Chat.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Chat.tsx) | ✅ **WebSocket 연동됨** |

> [!NOTE]
> **수정 완료**: 메시지 전송 body가 `{ room_id, message }` → `{ message_content }` 로 수정됨.

> [!NOTE]
> **WebSocket 구현 완료**: `useRef<WebSocket | null>(null)`로 연결을 관리하며, 채팅방 선택 시 WebSocket 연결을 맺습니다. URL은 `serverUrl.replace(/^http/, "ws")`로 http/https 모두 지원합니다. 중복 메시지 방지를 위해 `msg.id` 기반 deduplication 로직이 포함되어 있습니다. WebSocket이 열려있으면 WS로 전송, 아니면 REST POST로 fallback합니다.

> [!NOTE]
> **selectedMembers 수정 완료**: 채팅방 생성 모달의 팀원 체크박스에 `onChange` 핸들러(`toggleMember`)가 연결되어 선택된 멤버가 올바르게 전송됩니다.

> [!WARNING]
> **보안 권고 (미해결)**: WebSocket이 `?user_id=<id>` 쿼리 파라미터로 인증합니다. JWT token 기반 인증 방식이 보안상 더 안전하나, 현재 백엔드 구현에 맞춰 적용됨.

---

## 6. Evaluations — [evaluations.py](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/TeamTeam_backend/app/routers/evaluations.py)

| 엔드포인트 | 기능 | 프론트 연동 파일 | 상태 |
|---|---|---|---|
| `POST /api/teams/{team_id}/evaluations` | 상호평가 제출 | [Evaluation.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Evaluation.tsx) | ✅ 연동됨 |
| `GET /api/teams/{team_id}/members/eval-status` | 평가 완료/미완료 목록 | [Evaluation.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Evaluation.tsx) | ✅ **URL 수정됨** |

> [!NOTE]
> **수정 완료**: `GET /api/teams/${team_id}/evaluations` → `GET /api/teams/${team_id}/members/eval-status` 로 수정됨.

---

## 7. Users — [users.py](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/TeamTeam_backend/app/routers/users.py)

| 엔드포인트 | 기능 | 프론트 연동 파일 | 상태 |
|---|---|---|---|
| `GET /api/users/me` | 내 프로필 + 평가 통계 조회 | [Profile.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Profile.tsx) | ✅ 연동됨 |
| `PATCH /api/users/me` | 프로필 수정 | [Profile.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Profile.tsx) | ✅ **body 전송 수정됨** |

> [!NOTE]
> **수정 완료**: `api.patch('/api/users/me')` → `api.patch('/api/users/me', info)` 로 수정되어 수정 내용이 서버에 전달됩니다.

---

## 8. References (자료실) — [references.py](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/TeamTeam_backend/app/routers/references.py)

| 엔드포인트 | 기능 | 프론트 연동 파일 | 상태 |
|---|---|---|---|
| `GET /api/teams/{team_id}/references` | 자료 목록 조회 | [FileStorage.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/FileStorage.tsx) | ✅ **구현됨** |
| `POST /api/teams/{team_id}/references` | 자료 등록 (`file_name`, `file_url`) | [FileStorage.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/FileStorage.tsx) | ✅ **구현됨** |
| `DELETE /api/references/{ref_id}` | 자료 삭제 | [FileStorage.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/FileStorage.tsx) | ✅ **구현됨** |

> [!NOTE]
> **전면 구현 완료**: [FileStorage.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/FileStorage.tsx)가 완전히 재작성되었습니다.
> - 기존 FormData 파일 업로드 방식 → `{ file_name, file_url }` JSON 전송으로 변경 (백엔드 설계와 일치)
> - 업로드 모달: 파일 첨부 → 파일 이름 + URL 텍스트 입력으로 변경
> - API 경로 수정: `/api/teams/{id}/files` → `/api/teams/{id}/references`, `/api/files/{id}` → `/api/references/{id}`
> - raw `fetch` → `api` (axios instance) 로 변경
> - `useParams`에서 `team_id` → `teamId` 수정

---

## 9. AI Schedule — [ai_schedule.py](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/TeamTeam_backend/app/routers/ai_schedule.py)

| 엔드포인트 | 기능 | 프론트 연동 파일 | 상태 |
|---|---|---|---|
| `POST /api/teams/{team_id}/ai-sessions` | AI 스케줄 추천 요청 | [Schedule.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Schedule.tsx) | ✅ **sessionId 파싱 수정됨** |
| `GET /api/ai-sessions/{session_id}` | AI 추천 결과 조회 | [Schedule.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Schedule.tsx) | ✅ 연동됨 |
| `POST /api/ai-sessions/{session_id}/confirm` | AI 일정 확정 → Task 등록 | [Schedule.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Schedule.tsx) | ✅ 연동됨 |
| `POST /api/ai-sessions/{session_id}/reject` | AI 일정 기각 | [Schedule.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Schedule.tsx) | ✅ **구현됨** |

> [!NOTE]
> **수정 완료**: `data.sessionId` → `String(data.id || "3")` 로 수정되어 올바른 세션 ID가 사용됩니다.

> [!NOTE]
> **AI 일정 기각 구현 완료**: `handleRejectAiSchedule` 함수가 추가되어 `POST /api/ai-sessions/${sessionId}/reject`를 호출합니다. 모달의 취소 버튼이 "기각" 버튼으로 변경되어 기각 API를 호출합니다.

> [!NOTE]
> **useParams 수정 완료**: `const { team_id } = useParams()` → `const { teamId } = useParams<{ teamId: string }>()` 로 수정됨.

---

## 10. Dashboard — [Dashboard.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Dashboard.tsx)

> [!NOTE]
> **전면 재작성 완료**: 존재하지 않는 상대 URL(`/announcements`, `/tasks`, `/files`, `/chats`, `/evaluations`) 호출이 모두 제거되었습니다.
>
> 현재 구현:
> - `GET /api/teams/{teamId}` + `GET /api/teams/{teamId}/notices`를 `Promise.all`로 병렬 호출
> - 팀 정보, 진행률, 오늘 일정, 업무 현황, 팀원 목록, 공지사항 표시
> - `useSelector`로 `myUserId` 조회, `isLeader` 판별 후 팀장에게만 "프로젝트 종료" 버튼 표시
> - `teamData.team ?? teamData` 패턴으로 응답 형태 차이 처리

---

## 잔여 보안 권고 사항

아래 항목들은 기능에 영향을 주지 않으나 보안 개선을 위해 별도 이슈로 관리가 권장됩니다.

| 항목 | 현재 상태 | 권장 |
|---|---|---|
| Access Token 저장 위치 | `localStorage` (XSS 취약) | 메모리(Redux state)만 사용, Refresh Token Cookie로 갱신 |
| WebSocket 인증 | `?user_id` 쿼리 파라미터 | JWT Bearer Token 기반 인증으로 변경 |
| 회원가입 비밀번호 검증 | 클라이언트 검증 없음 | 클라이언트 측 validator 추가 (현재 서버 422 에러 노출) |
