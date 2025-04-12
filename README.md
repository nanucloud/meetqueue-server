# MeetQueue Server

NestJS와 TypeORM을 활용한 학생 출석 관리 API 서버입니다. DDD(Domain-Driven Design) 아키텍처를 기반으로 구현되었습니다.

## 기술 스택

- NestJS: 백엔드 프레임워크
- TypeORM: ORM
- MySQL: 데이터베이스
- bcrypt: 비밀번호 해싱

## 설치 및 실행

```bash
# 패키지 설치
$ npm install --legacy-peer-deps

# 개발 모드 실행
$ npm run start:dev

# 프로덕션 모드 실행
$ npm run start:prod
```

## 환경 설정

`.env` 파일을 프로젝트 루트에 생성하고 다음 설정을 추가합니다:

```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=meetqueue
DB_SYNCHRONIZE=true
```

## 데이터베이스 구조

```sql
CREATE TABLE `tbl_user` (
    `UUID` varchar(36) NOT NULL PRIMARY KEY,
    `VARCHAR(50)` varchar(255) NULL,
    `VARCHAR(100)` varchar(255) NULL UNIQUE,
    `VARCHAR` varchar(255) NULL
);

CREATE TABLE `tbl_group` (
    `groupId` varchar(36) NOT NULL PRIMARY KEY,
    `groupName` varchar(255) NULL
);

CREATE TABLE `tbl_group_member` (
    `UUID` varchar(36) NOT NULL,
    `groupId` varchar(36) NOT NULL,
    `isAdmin` boolean DEFAULT false,
    PRIMARY KEY (`UUID`, `groupId`),
    FOREIGN KEY (`UUID`) REFERENCES `tbl_user` (`UUID`),
    FOREIGN KEY (`groupId`) REFERENCES `tbl_group` (`groupId`)
);

CREATE TABLE `tbl_schedule` (
    `scheduleId` varchar(36) NOT NULL PRIMARY KEY,
    `groupId` varchar(36) NOT NULL,
    `scheduleName` varchar(255) NULL,
    `location` varchar(255) NULL,
    `scheduleTime` datetime NULL,
    `detailLocation` varchar(255) NULL,
    `detailLocation2` varchar(255) NULL,
    `locationRange` varchar(255) NULL,
    FOREIGN KEY (`groupId`) REFERENCES `tbl_group` (`groupId`)
);

CREATE TABLE `tbl_attendance` (
    `attendanceId` varchar(36) NOT NULL PRIMARY KEY,
    `scheduleId` varchar(36) NOT NULL,
    `userId` varchar(36) NOT NULL,
    `distanceFromLocation` float NULL,
    `attendanceTime` datetime NULL,
    `status` varchar(20) DEFAULT '미출석',
    FOREIGN KEY (`scheduleId`) REFERENCES `tbl_schedule` (`scheduleId`),
    FOREIGN KEY (`userId`) REFERENCES `tbl_user` (`UUID`)
);

CREATE TABLE `tbl_bus_template` (
    `id` varchar(36) NOT NULL PRIMARY KEY,
    `name` varchar(100) NOT NULL,
    `rows` int NOT NULL,
    `seatsPerRow` int NOT NULL,
    `totalSeats` int NOT NULL,
    `hasAisle` boolean DEFAULT true,
    `description` text NULL
);

CREATE TABLE `tbl_bus_seat` (
    `id` varchar(36) NOT NULL PRIMARY KEY,
    `seatNumber` int NOT NULL,
    `seatLabel` varchar(255) NULL,
    `rowPosition` int NOT NULL,
    `columnPosition` int NOT NULL,
    `busTemplateId` varchar(36) NOT NULL,
    `scheduleId` varchar(36) NULL,
    `userId` varchar(36) NULL,
    `status` varchar(50) NULL,
    FOREIGN KEY (`busTemplateId`) REFERENCES `tbl_bus_template` (`id`),
    FOREIGN KEY (`scheduleId`) REFERENCES `tbl_schedule` (`scheduleId`),
    FOREIGN KEY (`userId`) REFERENCES `tbl_user` (`UUID`)
);
```

## API 명세

### 사용자 관리 API

#### 회원가입
- **URL**: `/users/register`
- **Method**: `POST`
- **요청 본문**:
  ```json
  {
    "username": "홍길동",
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **응답**:
  ```json
  {
    "message": "회원가입이 완료되었습니다."
  }
  ```
- **설명**: 새로운 사용자를 시스템에 등록합니다.

#### 사용자 프로필 조회
- **URL**: `/users/profile`
- **Method**: `GET`
- **인증 필요**: 예 (액세스 토큰)
- **설명**: 현재 로그인한 사용자의 프로필 정보를 반환합니다.

#### 사용자 정보 수정
- **URL**: `/users/profile`
- **Method**: `PUT`
- **인증 필요**: 예 (액세스 토큰)
- **요청 본문**:
  ```json
  {
    "username": "새이름",
    "email": "new-email@example.com",
    "password": "newpassword123"
  }
  ```
- **설명**: 현재 로그인한 사용자의 정보를 수정합니다.

#### 회원탈퇴
- **URL**: `/users/withdraw`
- **Method**: `DELETE`
- **인증 필요**: 예 (액세스 토큰)
- **응답**:
  ```json
  {
    "message": "회원탈퇴가 완료되었습니다."
  }
  ```
- **설명**: 현재 로그인한 사용자의 계정을 삭제합니다.

### 그룹 관리 API

#### 모든 그룹 조회
- **URL**: `/groups`
- **Method**: `GET`
- **설명**: 시스템에 등록된 모든 그룹 목록을 반환합니다.

#### 특정 그룹 조회
- **URL**: `/groups/:id`
- **Method**: `GET`
- **설명**: 특정 ID를 가진 그룹 정보를 반환합니다.

#### 그룹 생성
- **URL**: `/groups`
- **Method**: `POST`
- **요청 본문**:
  ```json
  {
    "groupName": "수학 특강반"
  }
  ```

#### 그룹 정보 수정
- **URL**: `/groups/:id`
- **Method**: `PUT`

#### 그룹 삭제
- **URL**: `/groups/:id`
- **Method**: `DELETE`

### 그룹 멤버 관리 API

#### 모든 그룹 멤버 조회
- **URL**: `/group-members`
- **Method**: `GET`

#### 특정 그룹의 멤버 조회
- **URL**: `/group-members/group/:groupId`
- **Method**: `GET`

#### 특정 사용자의 그룹 멤버십 조회
- **URL**: `/group-members/user/:userId`
- **Method**: `GET`

#### 그룹 멤버 추가
- **URL**: `/group-members`
- **Method**: `POST`
- **요청 본문**:
  ```json
  {
    "userId": "user-uuid",
    "groupId": "group-id",
    "isAdmin": false
  }
  ```

#### 그룹 멤버 정보 수정
- **URL**: `/group-members/:userId/:groupId`
- **Method**: `PUT`

#### 그룹 멤버 제거
- **URL**: `/group-members/:userId/:groupId`
- **Method**: `DELETE`

### 스케줄 관리 API

#### 모든 스케줄 조회
- **URL**: `/schedules`
- **Method**: `GET`

#### 특정 스케줄 조회
- **URL**: `/schedules/:id`
- **Method**: `GET`

#### 특정 그룹의 스케줄 조회
- **URL**: `/schedules/group/:groupId`
- **Method**: `GET`

#### 스케줄 생성
- **URL**: `/schedules`
- **Method**: `POST`
- **요청 본문**:
  ```json
  {
    "groupId": "group-id",
    "scheduleName": "수학 시험",
    "location": "강의실 303호",
    "scheduleTime": "2025-04-15T14:00:00Z",
    "detailLocation": "공학관 3층",
    "detailLocation2": "좌측 복도 끝",
    "locationRange": "50"
  }
  ```

#### 스케줄 정보 수정
- **URL**: `/schedules/:id`
- **Method**: `PUT`

#### 스케줄 삭제
- **URL**: `/schedules/:id`
- **Method**: `DELETE`

### 출석 관리 API

#### 모든 출석 기록 조회
- **URL**: `/attendances`
- **Method**: `GET`

#### 특정 출석 기록 조회
- **URL**: `/attendances/:id`
- **Method**: `GET`

#### 특정 스케줄의 출석 기록 조회
- **URL**: `/attendances/schedule/:scheduleId`
- **Method**: `GET`

#### 특정 사용자의 출석 기록 조회
- **URL**: `/attendances/user/:userId`
- **Method**: `GET`

#### 출석 기록 추가
- **URL**: `/attendances`
- **Method**: `POST`
- **요청 본문**:
  ```json
  {
    "scheduleId": "schedule-id",
    "userId": "user-id",
    "distanceFromLocation": 10.5,
    "attendanceTime": "2025-04-15T14:05:30Z"
  }
  ```

#### 출석 체크
- **URL**: `/attendances/check`
- **Method**: `POST`
- **요청 본문**:
  ```json
  {
    "scheduleId": "schedule-id",
    "userId": "user-id",
    "distance": 10.5
  }
  ```
- **설명**: 사용자의 현재 위치를 기반으로 출석 상태를 자동으로 결정합니다.

#### 출석 정보 수정
- **URL**: `/attendances/:id`
- **Method**: `PUT`

#### 출석 기록 삭제
- **URL**: `/attendances/:id`
- **Method**: `DELETE`

### 버스 템플릿 관리 API

#### 모든 버스 템플릿 조회
- **URL**: `/bus-templates`
- **Method**: `GET`
- **인증 필요**: 예 (액세스 토큰)
- **설명**: 등록된 모든 버스 템플릿 목록을 반환합니다.

#### 특정 버스 템플릿 조회
- **URL**: `/bus-templates/:id`
- **Method**: `GET`
- **인증 필요**: 예 (액세스 토큰)
- **설명**: 특정 ID를 가진 버스 템플릿 정보를 반환합니다.

#### 버스 템플릿 생성
- **URL**: `/bus-templates`
- **Method**: `POST`
- **인증 필요**: 예 (액세스 토큰, ADMIN 역할)
- **요청 본문**:
  ```json
  {
    "name": "1번 버스",
    "rows": 5,
    "seatsPerRow": 4,
    "totalSeats": 20,
    "hasAisle": true,
    "description": "소형 버스 레이아웃 - 통로 있음"
  }
  ```
- **설명**: 새로운 버스 템플릿을 생성합니다.

#### 버스 템플릿 수정
- **URL**: `/bus-templates/:id`
- **Method**: `PUT`
- **인증 필요**: 예 (액세스 토큰, ADMIN 역할)
- **설명**: 특정 ID를 가진 버스 템플릿 정보를 수정합니다.

#### 버스 템플릿 삭제
- **URL**: `/bus-templates/:id`
- **Method**: `DELETE`
- **인증 필요**: 예 (액세스 토큰, ADMIN 역할)
- **설명**: 특정 ID를 가진 버스 템플릿을 삭제합니다.

### 버스 좌석 관리 API

#### 좌석 조회
- **URL**: `/bus-seats`
- **Method**: `GET`
- **인증 필요**: 예 (액세스 토큰)
- **쿼리 파라미터**: `scheduleId`, `busTemplateId`, `userId` (선택적)
- **설명**: 조건에 따라 좌석 정보를 조회합니다. 모든 파라미터는 선택적입니다.

#### 특정 좌석 조회
- **URL**: `/bus-seats/:id`
- **Method**: `GET`
- **인증 필요**: 예 (액세스 토큰)
- **설명**: 특정 ID를 가진 좌석 정보를 반환합니다.

#### 사용자-스케줄 좌석 조회
- **URL**: `/bus-seats/user-schedule`
- **Method**: `GET`
- **인증 필요**: 예 (액세스 토큰)
- **쿼리 파라미터**: `userId`, `scheduleId` (필수)
- **설명**: 특정 사용자가 특정 스케줄에서 배정받은 좌석 정보를 반환합니다.

#### 단일 좌석 생성
- **URL**: `/bus-seats`
- **Method**: `POST`
- **인증 필요**: 예 (액세스 토큰, ADMIN 역할)
- **요청 본문**:
  ```json
  {
    "seatNumber": 1,
    "seatLabel": "좌석 1",
    "rowPosition": 0,
    "columnPosition": 0,
    "busTemplateId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "scheduleId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "status": "empty"
  }
  ```
- **설명**: 새로운 좌석을 생성합니다.

#### 일괄 좌석 생성
- **URL**: `/bus-seats/batch`
- **Method**: `POST`
- **인증 필요**: 예 (액세스 토큰, ADMIN 역할)
- **요청 본문**:
  ```json
  {
    "busTemplateId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "scheduleId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "rows": 5,
    "seatsPerRow": 4,
    "hasAisle": true
  }
  ```
- **설명**: 선택한 버스 템플릿과 스케줄에 대해 좌석을 일괄 생성합니다. 기존에 같은 템플릿과 스케줄 조합으로 생성된 좌석이 있다면 먼저 삭제합니다.

#### 좌석 배정
- **URL**: `/bus-seats/assign`
- **Method**: `POST`
- **인증 필요**: 예 (액세스 토큰, ADMIN 역할)
- **요청 본문**:
  ```json
  {
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "seatId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "busTemplateId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
  ```
- **설명**: 특정 사용자를 특정 좌석에 배정합니다. 사용자가 이미 같은 스케줄에 다른 좌석을 배정받은 경우, 기존 좌석 배정은 해제됩니다.

#### 좌석 정보 수정
- **URL**: `/bus-seats/:id`
- **Method**: `PUT`
- **인증 필요**: 예 (액세스 토큰, ADMIN 역할)
- **설명**: 좌석 정보를 수정합니다.

#### 좌석 삭제
- **URL**: `/bus-seats/:id`
- **Method**: `DELETE`
- **인증 필요**: 예 (액세스 토큰, ADMIN 역할)
- **설명**: 특정 좌석을 삭제합니다.

#### 스케줄별 좌석 일괄 삭제
- **URL**: `/bus-seats/schedule/:scheduleId`
- **Method**: `DELETE`
- **인증 필요**: 예 (액세스 토큰, ADMIN 역할)
- **설명**: 특정 스케줄에 배정된 모든 좌석을 삭제합니다.

#### 버스 템플릿별 좌석 일괄 삭제
- **URL**: `/bus-seats/bus-template/:busTemplateId`
- **Method**: `DELETE`
- **인증 필요**: 예 (액세스 토큰, ADMIN 역할)
- **설명**: 특정 버스 템플릿에 속한 모든 좌석을 삭제합니다.

### 인증 관리 API

#### 로그인
- **URL**: `/auth/login`
- **Method**: `POST`
- **요청 본문**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **응답**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **설명**: 이메일과 비밀번호로 로그인하고 JWT 토큰을 발급받습니다.

#### 로그아웃
- **URL**: `/auth/logout`
- **Method**: `GET`
- **인증 필요**: 예 (액세스 토큰)
- **응답**:
  ```json
  {
    "loggedOut": true
  }
  ```
- **설명**: 현재 로그인한 사용자의 리프레시 토큰을 무효화합니다.

#### 토큰 갱신
- **URL**: `/auth/refresh`
- **Method**: `GET`
- **인증 필요**: 예 (리프레시 토큰)
- **응답**:
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **설명**: 리프레시 토큰을 사용하여 새로운 액세스 토큰과 리프레시 토큰을 발급받습니다.

## 인증 및 인가 시스템

### JWT 기반 인증

본 시스템은 JSON Web Token(JWT)을 사용한 인증 방식을 채택하고 있습니다.

- **Access Token**: 모든 API 요청에 사용되며, 기본 만료 기간은 7일입니다.
- **Refresh Token**: Access Token이 만료되었을 때 새로운 토큰을 발급받기 위해 사용되며, 만료 기간은 1년입니다.

### 인증 흐름

1. 사용자가 로그인 API(`/auth/login`)를 호출하여 인증 정보(이메일, 비밀번호)를 제출합니다.
2. 서버는 인증 정보를 검증하고, 유효한 경우 Access Token과 Refresh Token을 발급합니다.
3. 클라이언트는 Access Token을 모든 인증이 필요한 API 요청의 헤더에 포함시켜야 합니다.
   ```
   Authorization: Bearer {accessToken}
   ```
4. Access Token이 만료되면, 클라이언트는 Refresh Token을 사용하여 새로운 토큰 쌍을 요청할 수 있습니다(`/auth/refresh`).

### 역할 기반 접근 제어(RBAC)

시스템은 다음과 같은 사용자 역할을 지원합니다:

- **USER**: 기본 사용자 역할로, 인증된 모든 사용자에게 부여됩니다.
- **ADMIN**: 특정 그룹의 관리자 역할로, 그룹 관련 관리 작업을 수행할 수 있습니다.
- **TEACHER**: 교사 역할 (추가 기능 구현 예정)
- **STUDENT**: 학생 역할 (추가 기능 구현 예정)

각 API 엔드포인트에는 특정 역할에 대한 접근 제한이 설정될 수 있으며, `RolesGuard`를 통해 이를 강제합니다.

### 보안 관련 설정

- **비밀번호 해싱**: 모든 사용자 비밀번호는 `bcrypt`를 사용하여 해싱되어 저장됩니다.
- **Refresh Token**: 사용자 테이블에 해싱되어 저장되며, 로그아웃 시 무효화됩니다.
- **JWT 시크릿 키**: 환경 변수 `JWT_ACCESS_SECRET`와 `JWT_REFRESH_SECRET`를 통해 설정할 수 있습니다.

## 도메인 기반 설계 (DDD)

프로젝트는 다음 계층으로 구성되어 있습니다:

- **도메인 계층**: 핵심 비즈니스 로직 및 엔티티
  - User, Group, GroupMember, Schedule, Attendance 등의 엔티티
  - 도메인 관련 인터페이스

- **애플리케이션 계층**: 유스케이스 구현
  - 각 도메인의 서비스 클래스
  - DTO 클래스

- **인프라 계층**: 데이터베이스 접근 구현
  - TypeORM 리포지토리

- **인터페이스 계층**: API 컨트롤러