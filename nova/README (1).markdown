# NOVA — AI Education Platform

**NOVA** is a full-stack, AI-native education ecosystem: a Next.js/TypeScript web app, a Kotlin + Spring Boot backend, and a native Kotlin + Jetpack Compose Android app, unified by personalized learning, an AI tutor, a sandboxed coding playground, adaptive quizzes/exams, gamification and analytics.

This repository is a complete, working **foundation** for that product — real routing, real UI, real domain logic (spaced repetition, quiz scoring, JWT auth, RBAC, next-study-session calculation, offline sync) — built to be extended module by module rather than a static mockup. Large subsystems that normally take a team months (video transcoding pipelines, production RAG indexing at scale, payment processing, live classes) are scaffolded with clear extension points instead of being faked.

---

## Table of contents
- [English](#english)
- [فارسی](#فارسی)
- [中文](#中文)

---

## English

### ✨ Key features
- **Personalized learning path** that adapts from quiz/exam results, coding exercises and study behavior.
- **Role-based dashboards**: Student, Teacher, Course Creator, Moderator, Admin.
- **Course platform**: sections → chapters → lessons (video/text/audio/PDF/code/quiz/assignment/project/final exam), with resume-exactly-where-you-left-off progress tracking.
- **Video learning system**: speed control, quality, captions, transcript, bookmarks, timestamped notes, Picture-in-Picture, keyboard shortcuts.
- **Quiz engine**: 8 question types, timers, randomization, question pools, detailed result analysis.
- **Exam system**: teacher-authored exams, question banks, scheduling, auto-grading.
- **AI Tutor** with a retrieval-augmented generation (RAG) pipeline grounded in each course's actual content — explain, summarize, generate examples/quizzes/flashcards, review mistakes, Socratic mode.
- **AI Code Tutor & sandboxed Coding Playground**: Python, JavaScript, TypeScript, Java, Kotlin, C++, C#, Go, Rust — isolated, resource-limited execution.
- **Flashcards with real SM-2 spaced repetition**, AI-generated or manual.
- **Study Planner with a live availability widget**: you tell NOVA your free time windows for the week, and it shows in real time whether a study session is open right now — and a live countdown to the next one (or to when the current one closes) — fully editable by the user, synced to your account.
- **Gamification**: XP, levels, streaks, badges, leaderboards.
- **Analytics** for students (accuracy, velocity, retention, weak/strong topics) and teachers (enrollment, completion, drop-off, engagement).
- **Offline-first Android app**: downloaded courses, videos, quizzes and flashcards work with no connection; a sync engine reconciles local and server state with last-write-wins conflict resolution once you're back online.
- **Four Windows 11 Fluent themes**: Light (Windows default), Dark, Red, Blue — plus full English / Persian (RTL) / Chinese localization, correctly mirroring direction and typography per language.
- **Security**: JWT access/refresh tokens, BCrypt password hashing, role-based access control, standardized error responses, input validation.

### 🏗️ Architecture
```
nova/
├── web/        Next.js 14 + TypeScript + Tailwind CSS — student/teacher/admin web app
├── backend/    Kotlin + Spring Boot — REST API, WebSocket, AI/RAG, sandboxed code execution
├── android/    Kotlin + Jetpack Compose — native offline-first Android app
└── docker-compose.yml
```
- **Web ↔ Backend ↔ Android** communicate over a versioned REST API (`/api/v1`) and WebSocket (`/ws`) for real-time features.
- **PostgreSQL** is the system of record; **Redis** backs caching and real-time/session support; large media (video, PDF) is designed for object storage (S3-compatible), not the database.
- Heavy work (video processing, AI indexing, certificate generation, notifications, code execution) runs on a background worker pool so API threads are never blocked.

### 🚀 Getting started

**Prerequisites:** Docker & Docker Compose (easiest path), or locally: Node.js 20+, JDK 21, Android Studio (Koala+), PostgreSQL 16, Redis 7.

#### Option A — Run everything with Docker Compose
```bash
docker compose up --build
```
This starts PostgreSQL, Redis, the backend API (port 8080) and the web app (port 3000).

#### Option B — Run services individually

**1. Backend (Kotlin + Spring Boot)**
```bash
cd backend
cp src/main/resources/application.yml src/main/resources/application-local.yml   # optional: customize locally
./gradlew bootRun
```
Set these environment variables as needed (defaults shown in `application.yml`):
```
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
REDIS_HOST, REDIS_PORT
JWT_SECRET
AI_PROVIDER      # anthropic | openai | local
AI_API_KEY
AI_MODEL
CORS_ALLOWED_ORIGINS
```
API docs are served at `http://localhost:8080/docs` once running.

**2. Web app (Next.js + TypeScript)**
```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```
Open `http://localhost:3000`.

**3. Android app (Kotlin + Jetpack Compose)**
```bash
cd android
```
Open the `android/` folder in Android Studio, let Gradle sync, and run on an emulator or device. By default the app points at `http://10.0.2.2:8080/api/v1` (the Android emulator's alias for your host machine) — update `NetworkModule.kt` for a physical device or a deployed backend URL.

### 🧪 Tests
```bash
cd web && npm test        # Vitest: utils + spaced-repetition logic
cd backend && ./gradlew test   # JUnit 5: study planner + domain services
```

### 📦 Tech stack summary
| Layer | Technology |
|---|---|
| Web | TypeScript, Next.js, React, Tailwind CSS |
| Backend | Kotlin, Spring Boot, Spring Security, Spring Data JPA, PostgreSQL, Redis |
| Android | Kotlin, Jetpack Compose, Material 3, Room, Retrofit, Hilt, WorkManager |
| Real-time | WebSocket (STOMP) |
| AI | Pluggable provider client (Anthropic / OpenAI / local) + RAG retrieval layer |

### 🗺️ Roadmap / extension points
The following are architected with clear seams but intentionally left for you to wire up to your infrastructure, since they depend on credentials, scale targets and vendor choices only you can make: production vector search (pgvector) at scale, video transcoding pipeline, container-runtime wiring for the code sandbox (Docker/Firecracker/gVisor), payments/subscriptions, live classes (WebRTC), and push notification delivery (FCM/APNs).

---

## فارسی

### ✨ ویژگی‌های کلیدی
- **مسیر یادگیری شخصی‌سازی‌شده** که بر اساس نتایج آزمون‌ها، تمرین‌های کدنویسی و رفتار مطالعه‌ی کاربر تغییر می‌کند.
- **داشبوردهای نقش‌محور**: دانش‌آموز، استاد، سازنده دوره، ناظر، مدیر.
- **پلتفرم دوره**: بخش ← فصل ← درس (ویدیو/متن/صوت/PDF/کد/آزمون/تکلیف/پروژه/امتحان نهایی) با قابلیت ادامه‌ی دقیق از همان نقطه‌ای که متوقف شده‌اید.
- **سیستم یادگیری ویدیویی**: سرعت پخش، کیفیت، زیرنویس، رونوشت، بوکمارک، یادداشت زمان‌دار، تصویر در تصویر، میانبرهای صفحه‌کلید.
- **موتور آزمون**: هشت نوع سؤال، تایمر، تصادفی‌سازی، بانک سؤال، تحلیل دقیق نتایج.
- **سیستم امتحان**: امتحان‌سازی توسط استاد، بانک سؤال، زمان‌بندی، تصحیح خودکار.
- **معلم هوشمند (AI Tutor)** با معماری RAG که پاسخ‌ها را بر اساس محتوای واقعی همان دوره ارائه می‌دهد — توضیح، خلاصه‌سازی، تولید مثال/آزمون/فلش‌کارت، بررسی اشتباهات، حالت سقراطی.
- **معلم هوشمند کدنویسی و محیط برنامه‌نویسی ایزوله**: پایتون، جاوااسکریپت، تایپ‌اسکریپت، جاوا، کاتلین، ++C، #C، Go، Rust — اجرای محدود و ایزوله.
- **فلش‌کارت با الگوریتم واقعی SM-2** برای تکرار فاصله‌دار، دستی یا تولیدشده با هوش مصنوعی.
- **برنامه‌ریز مطالعه با ابزار زمان‌های آزاد زنده**: زمان‌های آزاد هفتگی خود را وارد می‌کنید و سیستم به‌صورت لحظه‌ای نشان می‌دهد که آیا الان در یک بازه مطالعه هستید یا نه — همراه با شمارش معکوس زنده تا شروع بازه بعدی (یا تا پایان بازه فعلی) — کاملاً قابل ویرایش توسط کاربر و همگام با حساب کاربری.
- **گیمیفیکیشن**: امتیاز تجربه (XP)، سطح، استریک روزانه، نشان‌ها، جدول امتیازات.
- **تحلیل داده** برای دانش‌آموز (دقت، سرعت یادگیری، ماندگاری، نقاط قوت/ضعف) و برای استاد (ثبت‌نام، تکمیل، افت دانشجو، تعامل).
- **اپلیکیشن اندروید آفلاین‌محور**: دوره‌ها، ویدیوها، آزمون‌ها و فلش‌کارت‌های دانلودشده بدون اینترنت کار می‌کنند؛ موتور همگام‌سازی وضعیت محلی و سرور را با استراتژی «آخرین نگارش برنده است» هماهنگ می‌کند.
- **چهار تم Fluent ویندوز ۱۱**: روشن (پیش‌فرض ویندوز)، تاریک، قرمز، آبی — همراه با بومی‌سازی کامل انگلیسی / فارسی (راست‌چین) / چینی، با رعایت صحیح جهت و تایپوگرافی هر زبان.
- **امنیت**: توکن‌های JWT (دسترسی/تازه‌سازی)، هش‌کردن رمز عبور با BCrypt، کنترل دسترسی مبتنی بر نقش، پاسخ‌های خطای استاندارد، اعتبارسنجی ورودی.

### 🏗️ معماری
```
nova/
├── web/        Next.js 14 + TypeScript + Tailwind CSS — وب‌اپ دانش‌آموز/استاد/مدیر
├── backend/    Kotlin + Spring Boot — REST API، وب‌سوکت، هوش مصنوعی/RAG، اجرای ایزوله کد
├── android/    Kotlin + Jetpack Compose — اپلیکیشن Native آفلاین‌محور اندروید
└── docker-compose.yml
```
- ارتباط **وب ↔ بک‌اند ↔ اندروید** از طریق REST API نسخه‌بندی‌شده (`/api/v1`) و WebSocket (`/ws`) برای قابلیت‌های بلادرنگ انجام می‌شود.
- **PostgreSQL** پایگاه‌داده اصلی، **Redis** پشتیبان کش و جلسات/بلادرنگ است؛ فایل‌های حجیم (ویدیو، PDF) برای Object Storage سازگار با S3 طراحی شده‌اند، نه پایگاه‌داده.
- عملیات سنگین (پردازش ویدیو، ایندکس‌گذاری هوش مصنوعی، صدور گواهی، اعلان‌ها، اجرای کد) روی یک استخر Worker پس‌زمینه اجرا می‌شود تا Threadهای API هرگز بلاک نشوند.

### 🚀 شروع به کار

**پیش‌نیازها:** Docker و Docker Compose (ساده‌ترین راه)، یا به‌صورت محلی: Node.js نسخه ۲۰ به بالا، JDK 21، Android Studio، PostgreSQL 16، Redis 7.

#### روش الف — اجرای کامل با Docker Compose
```bash
docker compose up --build
```
این دستور PostgreSQL، Redis، بک‌اند (پورت ۸۰۸۰) و وب‌اپ (پورت ۳۰۰۰) را اجرا می‌کند.

#### روش ب — اجرای جداگانه هر بخش

**۱. بک‌اند (Kotlin + Spring Boot)**
```bash
cd backend
./gradlew bootRun
```
در صورت نیاز متغیرهای محیطی زیر را تنظیم کنید (مقادیر پیش‌فرض در `application.yml`):
```
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
REDIS_HOST, REDIS_PORT
JWT_SECRET
AI_PROVIDER      # anthropic | openai | local
AI_API_KEY
AI_MODEL
CORS_ALLOWED_ORIGINS
```
مستندات API پس از اجرا در آدرس `http://localhost:8080/docs` در دسترس است.

**۲. وب‌اپ (Next.js + TypeScript)**
```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```
آدرس `http://localhost:3000` را باز کنید.

**۳. اپلیکیشن اندروید (Kotlin + Jetpack Compose)**
پوشه‌ی `android/` را در Android Studio باز کنید، اجازه دهید Gradle همگام‌سازی شود و روی شبیه‌ساز یا دستگاه واقعی اجرا کنید. به‌طور پیش‌فرض اپ به آدرس `http://10.0.2.2:8080/api/v1` (نام مستعار شبیه‌ساز اندروید برای دستگاه میزبان) متصل می‌شود — برای دستگاه فیزیکی یا بک‌اند مستقر شده، آدرس را در `NetworkModule.kt` به‌روزرسانی کنید.

### 🧪 تست‌ها
```bash
cd web && npm test              # Vitest: توابع کمکی و منطق تکرار فاصله‌دار
cd backend && ./gradlew test    # JUnit 5: برنامه‌ریز مطالعه و سرویس‌های دامنه
```

### 🗺️ نقشه راه / نقاط توسعه
موارد زیر با نقاط اتصال مشخص طراحی شده‌اند اما عمداً برای اتصال به زیرساخت شما باقی مانده‌اند، چون به اعتبارنامه‌ها، مقیاس هدف و انتخاب فروشنده‌ای بستگی دارند که فقط خودتان می‌توانید تعیین کنید: جستجوی برداری در مقیاس تولید (pgvector)، خط پردازش ویدیو، اتصال Runtime کانتینر برای محیط ایزوله کد (Docker/Firecracker/gVisor)، پرداخت/اشتراک، کلاس زنده (WebRTC) و ارسال Push Notification (FCM/APNs).

---

## 中文

### ✨ 核心功能
- **个性化学习路径**：根据测验/考试结果、编程练习和学习行为持续调整。
- **基于角色的仪表盘**：学生、教师、课程创建者、版主、管理员。
- **课程平台**：章节 → 小节 → 课时（视频/文本/音频/PDF/代码/测验/作业/项目/期末考试），并精确记录学习进度，支持断点续学。
- **视频学习系统**：倍速播放、清晰度切换、字幕、文字转录、书签、带时间戳的笔记、画中画、键盘快捷键。
- **测验引擎**：支持 8 种题型、计时器、随机化、题库抽取、详细成绩分析。
- **考试系统**：教师自建考试、题库管理、排期、自动评分。
- **AI 导师**：采用检索增强生成（RAG）架构，回答内容基于该课程的真实资料 —— 讲解、总结、生成示例/测验/闪卡、分析错误、苏格拉底式引导。
- **AI 代码导师与沙箱编程练习场**：支持 Python、JavaScript、TypeScript、Java、Kotlin、C++、C#、Go、Rust —— 隔离且资源受限的执行环境。
- **闪卡系统**，采用真实的 SM-2 间隔重复算法，支持手动或 AI 自动生成。
- **学习计划与实时空闲时段小组件**：填写你每周的空闲时间段，系统会实时显示当前是否处于开放的学习时段，并提供到下一个时段（或当前时段结束）的实时倒计时 —— 用户可自由编辑，并与账户同步。
- **游戏化机制**：经验值（XP）、等级、连续打卡、徽章、排行榜。
- **数据分析**：面向学生（正确率、学习速度、知识保持率、强弱项）与面向教师（报名情况、完成率、流失率、参与度）。
- **离线优先的 Android 应用**：已下载的课程、视频、测验和闪卡可在无网络时使用；同步引擎在恢复联网后，以"最后写入优先"的策略协调本地与服务器状态。
- **四套 Windows 11 Fluent 主题**：浅色（Windows 默认）、深色、红色、蓝色 —— 并完整支持英语／波斯语（从右到左）／中文本地化，正确处理各语言的排版方向与字体。
- **安全性**：JWT 访问/刷新令牌、BCrypt 密码哈希、基于角色的访问控制、统一的错误响应格式、输入校验。

### 🏗️ 架构
```
nova/
├── web/        Next.js 14 + TypeScript + Tailwind CSS —— 学生/教师/管理员 Web 应用
├── backend/    Kotlin + Spring Boot —— REST API、WebSocket、AI/RAG、沙箱代码执行
├── android/    Kotlin + Jetpack Compose —— 离线优先的原生 Android 应用
└── docker-compose.yml
```
- **Web ↔ 后端 ↔ Android** 之间通过带版本号的 REST API（`/api/v1`）通信，实时功能则通过 WebSocket（`/ws`）实现。
- **PostgreSQL** 作为主数据存储，**Redis** 支撑缓存与实时/会话能力；大体积媒体文件（视频、PDF）按对象存储（兼容 S3）设计，而非存入数据库。
- 重负载任务（视频处理、AI 索引构建、证书生成、通知、代码执行）运行在后台工作线程池中，确保 API 请求线程不被阻塞。

### 🚀 快速开始

**前置要求：** Docker 与 Docker Compose（最简单的方式），或本地安装 Node.js 20+、JDK 21、Android Studio、PostgreSQL 16、Redis 7。

#### 方式一 — 使用 Docker Compose 一键运行
```bash
docker compose up --build
```
将同时启动 PostgreSQL、Redis、后端 API（8080 端口）和 Web 应用（3000 端口）。

#### 方式二 — 分别启动各服务

**1. 后端（Kotlin + Spring Boot）**
```bash
cd backend
./gradlew bootRun
```
按需设置以下环境变量（默认值见 `application.yml`）：
```
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
REDIS_HOST, REDIS_PORT
JWT_SECRET
AI_PROVIDER      # anthropic | openai | local
AI_API_KEY
AI_MODEL
CORS_ALLOWED_ORIGINS
```
启动后可在 `http://localhost:8080/docs` 查看 API 文档。

**2. Web 应用（Next.js + TypeScript）**
```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```
打开 `http://localhost:3000`。

**3. Android 应用（Kotlin + Jetpack Compose）**
在 Android Studio 中打开 `android/` 目录，等待 Gradle 同步完成后，在模拟器或真机上运行。应用默认连接 `http://10.0.2.2:8080/api/v1`（Android 模拟器访问宿主机的别名地址）——如需连接真机或已部署的后端，请修改 `NetworkModule.kt` 中的地址。

### 🧪 测试
```bash
cd web && npm test              # Vitest：工具函数与间隔重复算法
cd backend && ./gradlew test    # JUnit 5：学习计划与领域服务
```

### 🗺️ 路线图 / 可扩展接口
以下部分已预留清晰的扩展接口，但有意留给你根据自身基础设施进行对接，因为它们依赖于只有你才能决定的凭证、规模目标和技术选型：生产级向量检索（pgvector）、视频转码流水线、代码沙箱的容器运行时对接（Docker/Firecracker/gVisor）、支付/订阅、直播课堂（WebRTC），以及推送通知投递（FCM/APNs）。

---

**License:** Provided as a foundation for your own product — add the license of your choice before distribution.
