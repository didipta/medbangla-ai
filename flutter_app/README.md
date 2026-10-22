# 📱 MedBangla AI Mobile App (Flutter — Clean Architecture)

A production-ready, clinical-grade mobile application for **MedBangla AI**, engineered with Flutter & Dart following **Clean Architecture**, **BLoC Pattern**, **GetIt Service Locator**, **Dio**, **GoRouter**, and **Equatable** as specified in `flutter_clean_architecture_master_prompt.md`.

---

## 🏛️ Clean Architecture & Feature-First Structure

The application strictly separates **Presentation**, **Domain**, and **Data** layers with unidirectional data flow:

```text
Presentation (Page/Widget) ──► BLoC Event ──► BLoC State
                                   │
                                   ▼
                             Domain (Use Cases)
                                   │
                                   ▼
                       Domain (Repository Contract)
                                   ▲
                                   │ implements
                          Data (Repository Impl)
                                   │
                                   ▼
                          Data (Data Sources)
                                   │
                                   ▼
                       Core (DioClient / Local Cache)
```

### Complete Folder Structure

```text
flutter_app/
├── lib/
│   ├── app.dart                    # App root, MultiBlocProvider, MaterialApp.router
│   ├── main.dart                   # DI initialization (GetIt) & AppBlocObserver
│   ├── di/
│   │   └── injection.dart          # Central GetIt dependency locator (Storage -> Dio -> DS -> Repo -> UC -> BLoC)
│   ├── core/
│   │   ├── config/                 # AppConfig (Base URL, platform-aware networking, timeouts)
│   │   ├── constants/              # AppColors design system
│   │   ├── error/                  # Domain Failures & Data Exceptions
│   │   ├── localization/           # LanguageProvider (Bilingual Bengali & English)
│   │   ├── network/                # ApiEndpoints & centralized DioClient with interceptors
│   │   ├── router/                 # AppRouter (GoRouter with deep-linking & Shell routes)
│   │   ├── storage/                # SecureStorageService (FlutterSecureStorage)
│   │   ├── theme/                  # AppTheme (Hind Siliguri Bengali typography & Material 3)
│   │   ├── utils/                  # AppBlocObserver (BLoC transition & error logger)
│   │   └── widgets/                # Reusable widgets (LoadingView, ErrorView, EmptyView)
│   └── features/
│       ├── dashboard/              # Home dashboard with clinical accuracy metrics & quick actions
│       ├── medicines/              # 17,589+ BD Medicines directory (DGDA aligned)
│       │   ├── data/               # RemoteDataSource, MedicineDto, RepositoryImpl
│       │   ├── domain/             # MedicineEntity, MedicineRepository, SearchMedicinesUseCase
│       │   └── presentation/       # MedicineBloc, MedicinesPage, MedicineCardWidget, DetailModal
│       ├── prescription_scanner/   # AI OCR Bengali handwriting prescription analysis
│       │   ├── data/               # ScannerRemoteDataSource, ScannerRepositoryImpl
│       │   ├── domain/             # PrescriptionScanEntity, ScanPrescriptionUseCase
│       │   └── presentation/       # ScannerBloc, ScannerPage, DetectedMedicineCard
│       ├── drug_interactions/      # Multi-drug contraindication triage engine
│       │   ├── data/               # InteractionRemoteDataSource, InteractionRepositoryImpl
│       │   ├── domain/             # InteractionEntity, CheckInteractionsUseCase
│       │   └── presentation/       # InteractionBloc, InteractionPage, InteractionCardWidget
│       └── clinical_chat/          # Bengali clinical assistant grounded in DGDA monographs
│           ├── data/               # ChatRemoteDataSource, ChatRepositoryImpl
│           ├── domain/             # ChatMessageEntity, SendChatMessageUseCase
│           └── presentation/       # ChatBloc, ChatPage, ChatBubbleWidget
└── test/
    ├── widget_test.dart
    └── features/
        ├── medicines/medicine_bloc_test.dart
        ├── drug_interactions/interaction_bloc_test.dart
        ├── prescription_scanner/scanner_bloc_test.dart
        └── clinical_chat/chat_bloc_test.dart
```

---

## 🚀 Quality Verification & Testing

### Static Code Analysis
```bash
flutter analyze
```
*Result*: **0 issues found** (All code strictly complies with Flutter lints).

### Code Formatting
```bash
dart format .
```

### Automated Unit & BLoC Test Suite
```bash
flutter test
```
*Result*: **11/11 tests passed** (covering BLoCs, use cases, events, and states using `bloc_test` and `mocktail`).

---

## 🛠️ Technology Stack & Dependencies

- **Framework**: Flutter 3.44.8 / Dart 3.12.2
- **State Management**: `flutter_bloc` (^9.1.1) + `equatable` (^3.0.0)
- **Dependency Injection**: `get_it` (^9.3.0)
- **Networking**: `dio` (^5.11.1) with custom auth interceptor and timeout configuration
- **Routing**: `go_router` (^17.5.0)
- **Security & Storage**: `flutter_secure_storage` (^11.2.0) & `shared_preferences`
- **Testing**: `bloc_test` (^10.0.0) & `mocktail` (^1.0.5)
- **Typography**: Google Fonts (`Hind Siliguri` & `Inter`)
