# 🛒 Modern Full-stack E-Commerce Platform

실제 운영 가능한 수준의 아키텍처를 지향하는 풀스택 쇼핑몰 프로젝트입니다. 
강력한 인증 시스템, 클라우드 데이터베이스 연동, 그리고 인프라 최적화에 중점을 두었습니다.

## 🔗 Project Links
- **Frontend (Vercel)**: [https://shoppingmall-hamjoong.vercel.app/](https://shoppingmall-hamjoong.vercel.app/)
- **Backend (Render)**: [https://shoppingmall-agke.onrender.com/](https://shoppingmall-agke.onrender.com/)

## 🏗 System Architecture
```text
[Frontend: Next.js] <---> [Backend: Spring Boot] <---> [Database: Supabase (PostgreSQL)]
       |                         |
 (Vercel Deploy)           (Render Deploy / Docker)
```

## 🚀 Key Features
- **Stateless Authentication**: Spring Security와 JWT를 활용한 무상태(Stateless) 보안 시스템 구축.
- **Cloud Database**: `Supabase(PostgreSQL)`를 연동하여 실시간 데이터 영속성 확보.
- **S3 Image Handling**: 서버 부하 최소화를 위한 `AWS S3 Presigned URL` 발급 및 업로드 전략 구현.
- **Responsive UI**: Tailwind CSS를 사용한 모던하고 직관적인 이커머스 인터페이스.
- **Dockerized Backend**: Docker 다단계 빌드(Multi-stage build)를 통한 이미지 최적화 및 배포 시간 단축.

## 🛠 Tech Stack
### Frontend
- Next.js 15 (App Router), TypeScript, Tailwind CSS
- Zustand (State Management), TanStack Query (Data Fetching)

### Backend
- Java 21, Spring Boot 3.4
- Spring Data JPA, Spring Security, Hibernate
- AWS SDK v2 (S3, KMS), Lombok

### Infrastructure & DevOps
- **Database**: PostgreSQL (Supabase)
- **Deployment**: Vercel (Frontend), Render (Backend)
- **Container**: Docker (Customized Layers for Cache)
- **CI/CD**: GitHub Actions

## ⚙️ Local Development
로컬 환경에서는 데이터 오염 방지를 위해 `mock` 프로필(H2 인메모리 DB)을 사용하도록 설계되었습니다.

```bash
# Backend 실행
cd shoppingmall/backend
./start_backend.sh

# Frontend 실행
cd shoppingmall/frontend
npm install
npm run dev
```
