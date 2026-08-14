import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { parseServerEnv } from "@vnbus/config";

import { AuthModule } from "./modules/auth/auth.module";
import { AdminModule } from "./modules/admin/admin.module";
import { AgentModule } from "./modules/agent/agent.module";
import { AiModule } from "./modules/ai/ai.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { AuditModule } from "./modules/audit/audit.module";
import { ActivityModule } from "./modules/activity/activity.module";
import { AgentBookingModule } from "./modules/agent-booking/agent-booking.module";
import { AgentNotificationModule } from "./modules/agent-notification/agent-notification.module";
import { AgentReportModule } from "./modules/agent-report/agent-report.module";
import { BookingHistoryModule } from "./modules/booking-history/booking-history.module";
import { BookingModule } from "./modules/booking/booking.module";
import { CacheModule } from "./modules/cache/cache.module";
import { CmsModule } from "./modules/cms/cms.module";
import { CouponsModule } from "./modules/coupons/coupons.module";
import { CustomerModule } from "./modules/customer/customer.module";
import { FeatureFlagModule } from "./modules/feature-flag/feature-flag.module";
import { HealthModule } from "./modules/health/health.module";
import { IntegrationModule } from "./modules/integration/integration.module";
import { MaintenanceModule } from "./modules/maintenance/maintenance.module";
import { MetricsModule } from "./modules/metrics/metrics.module";
import { MonitoringModule } from "./modules/monitoring/monitoring.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { OffersModule } from "./modules/offers/offers.module";
import { PassengerModule } from "./modules/passenger/passenger.module";
import { PaymentModule } from "./modules/payment/payment.module";
import { PermissionModule } from "./modules/permission/permission.module";
import { PlatformSettingsModule } from "./modules/platform-settings/platform-settings.module";
import { ProfileModule } from "./modules/profile/profile.module";
import { QueueSystemModule } from "./modules/queue-system/queue-system.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { ReservationModule } from "./modules/reservation/reservation.module";
import { RoleModule } from "./modules/role/role.module";
import { SearchModule } from "./modules/search/search.module";
import { SchedulerModule } from "./modules/scheduler/scheduler.module";
import { SeatModule } from "./modules/seat/seat.module";
import { SeoModule } from "./modules/seo/seo.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { SupplierConfigurationModule } from "./modules/supplier-configuration/supplier-configuration.module";
import { SupplierModule } from "./modules/supplier/supplier.module";
import { TicketModule } from "./modules/ticket/ticket.module";
import { TimelineModule } from "./modules/timeline/timeline.module";
import { TrackingModule } from "./modules/tracking/tracking.module";
import { UserModule } from "./modules/user/user.module";
import { PrismaModule } from "./shared/prisma/prisma.module";
import { EmailModule } from "./shared/email/email.module";
import { ActivityLoggingInterceptor } from "./shared/interceptors/activity-logging.interceptor";
import { MaintenanceGuard } from "./modules/maintenance/guards/maintenance.guard";
import { RolesGuard } from "./shared/security/guards/roles.guard";
import { JwtAccessGuard } from "./shared/security/guards/jwt-access.guard";
import { PermissionsGuard } from "./shared/security/guards/permissions.guard";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: (env) => parseServerEnv(env),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: Number(process.env.RATE_LIMIT_PUBLIC_PER_MINUTE ?? 120),
      },
    ]),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.getOrThrow<string>("REDIS_URL"),
        },
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: "exponential",
            delay: 1_000,
          },
          removeOnComplete: {
            age: 86_400,
            count: 1_000,
          },
          removeOnFail: {
            age: 604_800,
            count: 5_000,
          },
        },
      }),
    }),
    PrismaModule,
    EmailModule,
    AuthModule,
    ActivityModule,
    PermissionModule,
    RoleModule,
    ProfileModule,
    UserModule,
    CustomerModule,
    CacheModule,
    QueueSystemModule,
    SchedulerModule,
    HealthModule,
    MaintenanceModule,
    MetricsModule,
    IntegrationModule,
    PaymentModule,
    AgentModule,
    AgentBookingModule,
    AgentReportModule,
    AgentNotificationModule,
    AdminModule,
    BookingModule,
    BookingHistoryModule,
    ReservationModule,
    PassengerModule,
    SearchModule,
    SeoModule,
    TicketModule,
    TimelineModule,
    SeatModule,
    TrackingModule,
    NotificationModule,
    AnalyticsModule,
    CmsModule,
    OffersModule,
    CouponsModule,
    SupplierModule,
    AiModule,
    SettingsModule,
    PlatformSettingsModule,
    FeatureFlagModule,
    SupplierConfigurationModule,
    MonitoringModule,
    ReportsModule,
    AuditModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: MaintenanceGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAccessGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityLoggingInterceptor,
    },
  ],
})
export class AppModule {}
