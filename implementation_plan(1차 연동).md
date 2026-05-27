# 프론트엔드 전체 수정 — 백엔드 연동 완성

Gap analysis 문서의 모든 CAUTION, WARNING, 미연동 항목을 해결합니다.

## Proposed Changes

### Phase 1: 인증/보안 기반 (모든 API 호출의 전제조건)

#### [MODIFY] [api.ts](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/store/api.ts)
- 401 response interceptor 추가: Access Token 만료 시 `/api/auth/refresh` 자동 호출 후 원래 요청 재시도
- refresh 실패 시 로그아웃 처리

#### [MODIFY] [authSlice.ts](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/store/authSlice.ts)
- `logout` action에서 `POST /api/auth/logout` API 호출 추가 (서버 refresh_token 삭제 + cookie 삭제)

#### [MODIFY] [MainPage.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/MainPage.tsx)
- 로그인 URL 오타 수정 (`api/auth/login` → `/api/auth/login`)
- `SignUpModal`에 비밀번호 복잡도 클라이언트 검증 추가 (8자 이상 + 숫자 + 영문자)

---

### Phase 2: URL 오타 및 body 버그 수정 (즉시 기능 복구)

#### [MODIFY] [Announcements.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Announcements.tsx)
- L37: `/api/teams/${team_id}/notice` → `/api/teams/${team_id}/notices`
- L68: `/api/teams/${team_id}/notice` → `/api/teams/${team_id}/notices`
- L85: `/api/teams/notices/${notice_id}` → `/api/notices/${notice_id}`
- 공지 목록에서 클릭 시 상세 조회 UI 추가

#### [MODIFY] [Evaluation.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Evaluation.tsx)
- L53: `GET /api/teams/${team_id}/evaluations` → `GET /api/teams/${team_id}/members/eval-status`

#### [MODIFY] [Profile.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Profile.tsx)
- L45: `api.patch('/api/users/me')` → `api.patch('/api/users/me', info)` (body 전송)

#### [MODIFY] [Schedule.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Schedule.tsx)
- L197: `data.sessionId` → `data.id` (백엔드 응답 필드명 일치)
- AI 일정 기각 버튼 추가 → `POST /api/ai-sessions/{id}/reject` 호출

#### [MODIFY] [Chat.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Chat.tsx)
- L81: `{ message }` → `{ message_content }` (body 필드명 수정)
- 채팅방 생성 모달: selectedMembers onChange 핸들러 추가
- WebSocket 실시간 채팅 연동 (`ws://host/ws/chat-rooms/{room_id}?user_id=`)

#### [MODIFY] [Tasks.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Tasks.tsx)
- DELETE 호출 제거 (백엔드에 해당 엔드포인트 없음) — 삭제 버튼 숨기거나 PATCH 상태 변경으로 대체

---

### Phase 3: 미연동 기능 신규 구현

#### [MODIFY] [Dashboard.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/Dashboard.tsx)
- 존재하지 않는 URL들 제거
- `GET /api/teams/{team_id}` API 활용으로 전면 수정
- 팀 상태 변경 버튼 추가 (`PATCH /api/teams/{team_id}/status`) — 팀장일 때만 표시

#### [MODIFY] [FileStorage.tsx](file:///Users/jeongsupyo/Downloads/KHU/term_project/CloudComputing/CollaborativeSoftwareProject/src/app/pages/FileStorage.tsx)
- `/api/teams/{id}/files` → `/api/teams/{id}/references` 로 전면 변경
- FormData 업로드 → `{ file_name, file_url }` JSON 전송 방식으로 변경
- DELETE: `/api/files/{id}` → `/api/references/{id}`

## Open Questions

> [!IMPORTANT]
> **WebSocket JWT 인증**: 백엔드 WebSocket은 현재 `?user_id=` 쿼리 파라미터로 인증합니다. 이 커밋 메시지에 "JWT 추가 후 코드 수정 필요"라고 명시되어 있어 아직 JWT 인증이 적용되지 않은 상태입니다. 현재 백엔드가 지원하는 `?user_id=` 방식으로 먼저 연동하겠습니다.

## Verification Plan

### Manual Verification
- 각 파일 수정 후 TypeScript 컴파일 에러가 없는지 확인
- `npm run build`로 전체 빌드 검증
