# Project Structure

This document contains the complete folder structure of the project, excluding node_modules, dist, and other build artifacts.

```
.
├── .gitignore
├── nodemon.json
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json
│
├── src/
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── config/
│   │   ├── cloudinary.ts
│   │   ├── dbConfig.ts
│   │   ├── jwtConfig.ts
│   │   ├── nodemailerConfig.ts
│   │   └── redisConfig.ts
│   │
│   ├── constants/
│   │   ├── file.constants.ts
│   │   ├── http-status.constants.ts
│   │   │
│   │   └── errors/
│   │       ├── auth.errors.ts
│   │       ├── common.erros.ts
│   │       ├── file.errors.ts
│   │       └── profile.errors.ts
│   │
│   ├── controllers/
│   │   ├── admin/
│   │   │
│   │   ├── auth/
│   │   │   └── AuthController.ts
│   │   │
│   │   ├── file/
│   │   │   └── FileController.ts
│   │   │
│   │   ├── match/
│   │   │   └── MatchController.ts
│   │   │
│   │   └── profile/
│   │       └── ProfileController.ts
│   │
│   ├── di/
│   │   ├── controller.bindings.ts
│   │   ├── index.ts
│   │   ├── repository.bindings.ts
│   │   ├── service.bindings.ts
│   │   └── types.ts
│   │
│   ├── dto/
│   │   ├── internal/
│   │   │   └── profile-completion-check.dto.ts
│   │   │
│   │   ├── request/
│   │   │   ├── auth/
│   │   │   │   ├── forgot-password-verify-otp.dto.ts
│   │   │   │   ├── forgot-password.dto.ts
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── register.dto.ts
│   │   │   │   ├── reset-password.dto.ts
│   │   │   │   └── verify-otp.dto.ts
│   │   │   │
│   │   │   └── profile/
│   │   │       └── complete-profile.dto.ts
│   │   │
│   │   └── response/
│   │       ├── auth/
│   │       │   ├── login-response.dto.ts
│   │       │   └── user-response.dto.ts
│   │       │
│   │       └── profile/
│   │           └── profile-response.dto.ts
│   │
│   ├── mapper/
│   │   └── auth/
│   │       ├── auth.mapper.ts
│   │       ├── profile.mapper.ts
│   │       └── user.mapper.ts
│   │
│   ├── middlewares/
│   │   ├── errorHandler.ts
│   │   ├── profileCompleteGuard.ts
│   │   │
│   │   └── auth/
│   │       ├── authMiddleware.ts
│   │       └── roleMiddleware.ts
│   │
│   ├── models/
│   │   ├── match-action.ts
│   │   ├── profile.ts
│   │   └── user.ts
│   │
│   ├── repositories/
│   │   ├── base/
│   │   │   ├── BaseRepository.ts
│   │   │   └── IBaseRepository.ts
│   │   │
│   │   ├── match/
│   │   │   ├── IMatchRepository.ts
│   │   │   └── MatchRepository.ts
│   │   │
│   │   ├── otp/
│   │   │   ├── IOtpRepository.ts
│   │   │   └── OtpRepository.ts
│   │   │
│   │   ├── profile/
│   │   │   ├── IProfileRepository.ts
│   │   │   └── ProfileRepository.ts
│   │   │
│   │   └── user/
│   │       ├── IUserRepository.ts
│   │       └── UserRepository.ts
│   │
│   ├── routes/
│   │   ├── route.ts
│   │   │
│   │   └── v1/
│   │       ├── fileRoutes.ts
│   │       ├── index.ts
│   │       │
│   │       ├── admin/
│   │       │
│   │       ├── auth/
│   │       │   └── auth.routes.ts
│   │       │
│   │       ├── match/
│   │       │   └── match.routes.ts
│   │       │
│   │       └── profile/
│   │           └── profile.routes.ts
│   │
│   ├── seeds/
│   │   └── admin.seed.ts
│   │
│   ├── service/
│   │   ├── admin/
│   │   │
│   │   ├── auth/
│   │   │   ├── AuthService.ts
│   │   │   └── IAuthService.ts
│   │   │
│   │   ├── file/
│   │   │   ├── FileService.ts
│   │   │   └── IFileService.ts
│   │   │
│   │   ├── match/
│   │   │   ├── IMatchService.ts
│   │   │   └── MatchService.ts
│   │   │
│   │   └── profile/
│   │       ├── IProfileService.ts
│   │       └── ProfileService.ts
│   │
│   ├── types/
│   │   └── app.d.ts
│   │
│   └── utils/
│       ├── AppError.ts
│       ├── generate-otp.ts
│       ├── jwtHelper.ts
│       ├── password.ts
│       └── sendEmail.ts
```

## Summary

**Total Directories:** 36
**Total Files:** 77

### Main Directories:
- **src/config/** - Configuration files (Cloudinary, DB, JWT, Nodemailer, Redis)
- **src/constants/** - Application constants and error messages
- **src/controllers/** - API controllers (Auth, File, Match, Profile, Admin)
- **src/di/** - Dependency injection bindings
- **src/dto/** - Data Transfer Objects (Request/Response/Internal)
- **src/mapper/** - Data mappers for transforming entities
- **src/middlewares/** - Express middlewares (Auth, Error handling)
- **src/models/** - Database models (User, Profile, Match-Action)
- **src/repositories/** - Data access layer with base repository pattern
- **src/routes/** - API route definitions (v1 structure)
- **src/seeds/** - Database seed files
- **src/service/** - Business logic layer
- **src/types/** - TypeScript type definitions
- **src/utils/** - Utility functions (JWT, Password, Email, OTP)

### Excluded:
- node_modules/
- dist/
- .env
- build artifacts
- log files
