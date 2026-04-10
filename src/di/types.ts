
export const DI_TYPES = {
    REPOSITORIES: {
        USER_REPOSITORY: Symbol.for('UserRepository'),
        OTP_REPOSITORY: Symbol.for('otpRepository'),
        PROFILE_REPOSITORY: Symbol.for('ProfileRepository'),
        MATCH_REPOSITORY: Symbol.for('MatchRepository'),
        MATCHED_USERS_REPOSITORY: Symbol.for('MatchedUsersRepository'),
        MESSAGE_REPOSITORY: Symbol.for('MessageRepository'),
        NOTIFICATION_REPOSITORY: Symbol.for('NotificationRepository'),
        INTEREST_REPOSITORY: Symbol.for('InterestRepository'),
        INTEREST_CATEGORY_REPOSITORY: Symbol.for('InterestCategoryRepository'),
        REPORT_REPOSITORY: Symbol.for('ReportRepository'),
        PROFILE_VIEW_REPOSITORY: Symbol.for('ProfileViewRepository'),
        SUBSCRIPTION_REPOSITORY: Symbol.for('SubscriptionRepository'),
        USER_SUBSCRIPTION_REPOSITORY: Symbol.for('UserSubscriptionRepository'),
        DASHBOARD_REPOSITORY: Symbol.for('DashboardRepository'),
        PLACES_REPOSITORY: Symbol.for('PlacesRepository')
    },
    SERVICES: {
        AUTH_SERVICE: Symbol.for('AuthService'),
        PROFILE_SERVICE: Symbol.for('ProfileService'),
        FILE_SERVICE: Symbol.for('FileService'),
        MATCH_SERVICE: Symbol.for('MatchService'),
        MESSAGE_SERVICE: Symbol.for('MessageService'),
        NOTIFICATION_SERVICE: Symbol.for('NotificationService'),
        ADMIN_SERVICE: Symbol.for('AdminService'),
        INTEREST_SERVICE: Symbol.for('InterestService'),
        SOCKET_SERVICE: Symbol.for('SocketService'),
        REPORT_SERVICE: Symbol.for('ReportService'),
        PROFILE_VIEW_SERVICE: Symbol.for('ProfileViewService'),
        SUBSCRIPTION_SERVICE: Symbol.for('SubscriptionService'),
        USER_SUBSCRIPTION_SERVICE: Symbol.for('UserSubscriptionService'),
        PAYMENT_SERVICE: Symbol.for('PaymentService'),
        DATE_SUGGESTION_SERVICE: Symbol.for('DateSuggestionService')
    },
    CONTROLLERS: {
        AUTH_CONTROLLER: Symbol.for('AuthController'),
        PROFILE_CONTROLLER: Symbol.for('ProfileController'),
        FILE_CONTROLLER: Symbol.for('FileController'),
        MATCH_CONTROLLER: Symbol.for('MatchController'),
        MESSAGE_CONTROLLER: Symbol.for('MessageController'),
        NOTIFICATION_CONTROLLER: Symbol.for('NotificationController'),
        ADMIN_CONTROLLER: Symbol.for('AdminController'),
        INTEREST_CONTROLLER: Symbol.for('InterestController'),
        REPORT_CONTROLLER: Symbol.for('ReportController'),
        SUBSCRIPTION_CONTROLLER: Symbol.for('SubscriptionController'),
        USER_SUBSCRIPTION_CONTROLLER: Symbol.for('UserSubscriptionController'),
        PAYMENT_CONTROLLER: Symbol.for('PaymentController')
    },

    External: {
        REDIS: Symbol.for('RedisClient'),
        GOOGLE_CLIENT: Symbol.for('GoogleClient')
    },
    PROVIDERS: {
        STORAGE_PROVIDER: Symbol.for('StorageProvider')
    },
    JOBS: {
        SUBSCRIPTION_CLEANUP_JOB: Symbol.for('SubscriptionCleanupJob')
    }
}