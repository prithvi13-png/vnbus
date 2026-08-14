export type SystemUserRole = "CUSTOMER" | "TRAVEL_AGENT" | "ADMIN";
export type UserRole = SystemUserRole | (string & {});

export type BookingStatus =
  | "DRAFT"
  | "SEAT_HELD"
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "TICKET_GENERATED"
  | "CANCELLATION_REQUESTED"
  | "CANCELLED"
  | "REFUND_PENDING"
  | "EXPIRED"
  | "FAILED"
  | "RESCHEDULED";

export type TicketStatus = "GENERATED" | "DOWNLOADED" | "EMAIL_SENT" | "CANCELLED" | "REFUNDED";

export type BookingTimelineEventType =
  | "BOOKING_CREATED"
  | "SEAT_RESERVED"
  | "PAYMENT_PENDING"
  | "PAYMENT_CONFIRMED"
  | "TICKET_GENERATED"
  | "TICKET_DOWNLOADED"
  | "EMAIL_SENT"
  | "EMAIL_RETRY_SCHEDULED"
  | "JOURNEY_COMPLETED"
  | "CANCELLATION_REQUESTED"
  | "CANCELLED"
  | "REFUND_PENDING"
  | "RESCHEDULE_REQUESTED"
  | "RESCHEDULED";

export type NotificationType =
  | "BOOKING_CREATED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELLED"
  | "BOOKING_RESCHEDULED"
  | "JOURNEY_REMINDER"
  | "PASSWORD_CHANGED"
  | "WELCOME"
  | "ADMIN_ANNOUNCEMENT"
  | "AGENT_ANNOUNCEMENT"
  | "BOOKING_UPDATE"
  | "CANCELLATION_UPDATE"
  | "RESCHEDULE_UPDATE"
  | "EMAIL_HISTORY"
  | "AGENT_BOOKING_CREATED"
  | "AGENT_BOOKING_CANCELLED"
  | "AGENT_JOURNEY_REMINDER"
  | "AGENT_SYSTEM"
  | "ADMIN_BROADCAST"
  | "ADMIN_CUSTOMER_MESSAGE"
  | "ADMIN_AGENT_MESSAGE"
  | "ADMIN_SYSTEM";

export type NotificationReadStatus = "UNREAD" | "READ" | "ARCHIVED";

export type NotificationChannel = "IN_APP" | "EMAIL" | "SMS" | "WHATSAPP" | "PUSH";

export type EmailDeliveryStatus = "QUEUED" | "SENT" | "FAILED" | "RETRY_SCHEDULED";

export type TicketDownloadStatus = "READY" | "DOWNLOADED" | "FAILED";

export interface AuthenticatedUser {
  id: string;
  email: string;
  roles: UserRole[];
  permissions: string[];
}

export interface TripSearchQuery {
  sourceCity: string;
  destinationCity: string;
  journeyDate: string;
  passengerCount: number;
}

export type BusType =
  | "AC Sleeper"
  | "Non AC Sleeper"
  | "Seater"
  | "Semi Sleeper"
  | "Volvo"
  | "Mercedes"
  | "Luxury"
  | "Electric";

export type BusAmenity =
  | "WiFi"
  | "Charging Point"
  | "Blanket"
  | "Water Bottle"
  | "GPS"
  | "Reading Light"
  | "CCTV"
  | "Emergency Exit"
  | "USB Charger"
  | "Live Tracking";

export type SearchSortOption =
  | "PRICE_ASC"
  | "PRICE_DESC"
  | "DEPARTURE_ASC"
  | "ARRIVAL_ASC"
  | "FASTEST"
  | "DURATION_ASC"
  | "RATING_DESC"
  | "POPULARITY_DESC";

export type SearchTimeWindow = "BEFORE_6" | "MORNING" | "AFTERNOON" | "EVENING";

export interface SearchFilterCriteria {
  minPrice?: number;
  maxPrice?: number;
  departureWindows?: SearchTimeWindow[];
  arrivalWindows?: SearchTimeWindow[];
  busTypes?: BusType[];
  operators?: string[];
  amenities?: BusAmenity[];
  ac?: boolean;
  nonAc?: boolean;
  sleeper?: boolean;
  seater?: boolean;
  minAvailableSeats?: number;
  minRating?: number;
  liveTracking?: boolean;
}

export interface SearchPaginationRequest {
  page?: number;
  pageSize?: number;
}

export interface BusSearchRequest
  extends TripSearchQuery, SearchFilterCriteria, SearchPaginationRequest {
  sortBy?: SearchSortOption;
}

export interface SearchPagination {
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SearchFilterOption {
  label: string;
  value: string;
  count: number;
}

export interface SearchFilterRange {
  min: number;
  max: number;
}

export interface SearchFilterMetadata {
  price: SearchFilterRange;
  departureWindows: SearchFilterOption[];
  arrivalWindows: SearchFilterOption[];
  busTypes: SearchFilterOption[];
  operators: SearchFilterOption[];
  amenities: SearchFilterOption[];
  availableSeats: SearchFilterRange;
  ratings: SearchFilterOption[];
}

export interface RoutePreview {
  from: GeoPoint;
  to: GeoPoint;
  distanceKm: number;
  mapBounds: [number, number, number, number];
}

export interface GeoPoint {
  city: string;
  latitude: number;
  longitude: number;
}

export interface BusPoint {
  id: string;
  name: string;
  city: string;
  address: string;
  time: string;
  latitude: number;
  longitude: number;
}

export interface SeatLayoutPreview {
  totalSeats: number;
  availableSeats: number;
  decks: number;
  layoutType: "SEATER" | "SLEEPER" | "MIXED";
}

export interface ReviewSummary {
  rating: number;
  reviewCount: number;
  positiveTags: string[];
}

export interface TripSummary {
  supplierCode: string;
  tripId: string;
  operatorName: string;
  busType: string;
  sourceCity: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  availableSeats: number;
  fare: Money;
}

export interface BusSearchResult extends TripSummary {
  routeId: string;
  operatorId: string;
  operatorLogoUrl: string;
  busImageUrl: string;
  amenities: BusAmenity[];
  boardingPoints: BusPoint[];
  droppingPoints: BusPoint[];
  rating: number;
  reviewCount: number;
  reviews: ReviewSummary;
  discountLabel: string | null;
  discountAmount: number;
  liveTracking: boolean;
  popularityScore: number;
  routePreview: RoutePreview;
  seatLayout: SeatLayoutPreview;
}

export interface BusSearchResponse {
  success: boolean;
  totalResults: number;
  buses: BusSearchResult[];
  filters: SearchFilterMetadata;
  pagination: SearchPagination;
}

export type SeatDeck = "LOWER" | "UPPER";

export type SeatStatus = "AVAILABLE" | "BOOKED" | "LADIES" | "RESERVED" | "BLOCKED";

export type SeatKind = "SEATER" | "SLEEPER" | "SEMI_SLEEPER";

export type VehicleLayoutType =
  | "2+2 Seater"
  | "2+1 Sleeper"
  | "Semi Sleeper"
  | "Volvo"
  | "Mercedes"
  | "Double Axle"
  | "Single Axle";

export interface SeatMapSeat {
  seatNumber: string;
  deck: SeatDeck;
  row: number;
  column: number;
  kind: SeatKind;
  status: SeatStatus;
  fare: Money;
  isWindow: boolean;
  isEmergencyExit: boolean;
  hasExtraLegroom: boolean;
  genderRestriction: "LADIES" | null;
}

export interface SeatDeckLayout {
  deck: SeatDeck;
  label: string;
  rows: number;
  columns: number;
  aisleAfterColumn: number;
  seats: SeatMapSeat[];
}

export interface BoardingDroppingPoint extends BusPoint {
  landmark: string;
}

export interface SeatLayoutDetails {
  supplierCode: string;
  tripId: string;
  maxSelectableSeats: number;
  holdDurationSeconds: number;
  operatorName: string;
  busType: string;
  vehicleLayout: VehicleLayoutType;
  axleType: "Single Axle" | "Double Axle";
  sourceCity: string;
  destinationCity: string;
  journeyDate: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  routePreview: RoutePreview;
  boardingPoints: BoardingDroppingPoint[];
  droppingPoints: BoardingDroppingPoint[];
  decks: SeatDeckLayout[];
}

export interface SeatHoldRequest {
  supplierCode: string;
  tripId: string;
  journeyDate: string;
  seatNumbers: string[];
}

export interface SeatHoldResponse {
  reservationId: string;
  status: BookingStatus;
  heldSeats: string[];
  expiresAt: string;
  holdDurationSeconds: number;
  fare: BookingFareSummary;
}

export interface SeatReleaseRequest {
  reservationId: string;
}

export interface SeatReleaseResponse {
  reservationId: string;
  released: boolean;
  status: BookingStatus;
}

export interface BookingPassengerInput {
  seatNumber: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  phone: string;
  email: string;
  emergencyContact?: string;
}

export interface BookingFareSummary {
  baseFare: Money;
  taxes: Money;
  discount: Money;
  convenienceFee: Money;
  grandTotal: Money;
}

export interface CreateBookingRequest {
  reservationId: string;
  supplierCode: string;
  tripId: string;
  journeyDate: string;
  selectedSeats: string[];
  boardingPointId: string;
  droppingPointId: string;
  passengers: BookingPassengerInput[];
  emergencyContact?: string;
}

export interface BookingRecord {
  bookingId: string;
  bookingReference: string;
  channel?: "CUSTOMER" | "AGENT";
  agentId?: string | null;
  customerId?: string | null;
  supplierCode: string;
  supplierBookingId: string | null;
  pnr: string | null;
  ticketNumber: string | null;
  status: BookingStatus;
  trip: BusSearchResult;
  selectedSeats: string[];
  boardingPoint: BoardingDroppingPoint;
  droppingPoint: BoardingDroppingPoint;
  passengers: BookingPassengerInput[];
  fare: BookingFareSummary;
  reservationId: string;
  createdAt: string;
  expiresAt: string | null;
  confirmedAt: string | null;
  cancelledAt?: string | null;
  rescheduledAt?: string | null;
  newJourneyDate?: string | null;
  emailPrepared: boolean;
}

export interface ConfirmBookingRequest {
  bookingId: string;
  paymentReference: string;
}

export interface BookingConfirmationResponse {
  booking: BookingRecord;
  ticket: TicketRecord;
}

export interface TicketRecord {
  ticketId: string;
  bookingId: string;
  bookingReference: string;
  ticketNumber: string;
  status: TicketStatus;
  pnr: string;
  journeyDate: string;
  operatorName: string;
  busType: string;
  busNumber: string;
  route: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  passengers: BookingPassengerInput[];
  seatNumbers: string[];
  boardingPoint: BoardingDroppingPoint;
  droppingPoint: BoardingDroppingPoint;
  fare: BookingFareSummary;
  bookingDate: string;
  bookingStatus: BookingStatus;
  qrCode: TicketQrCode;
  qrPayload: string;
  trackingStatus: "COMING_SOON";
  terms: string[];
  emergencyContact: string;
  supportContact: TicketSupportContact;
  issuedAt: string;
  lastDownloadedAt?: string | null;
  lastEmailedAt?: string | null;
}

export interface TicketPdfResponse {
  ticketId?: string;
  fileName: string;
  mimeType: "application/pdf";
  base64: string;
  downloadStatus?: TicketDownloadStatus;
  downloadedAt?: string;
}

export interface TicketQrPayload {
  bookingId: string;
  pnr: string;
  journeyDate: string;
  passengerCount: number;
  verificationUrl: string;
}

export interface TicketQrCode {
  payload: TicketQrPayload;
  data: string;
  svg: string;
  dataUrl: string;
}

export interface TicketSupportContact {
  phone: string;
  email: string;
  hours: string;
}

export interface TicketEmailRequest {
  bookingId: string;
  to?: string;
}

export interface TicketEmailResponse {
  bookingId: string;
  ticketId: string;
  queued: boolean;
  emailLogId: string;
  status: EmailDeliveryStatus;
}

export interface BookingTimelineEvent {
  id: string;
  bookingId: string;
  type: BookingTimelineEventType;
  title: string;
  description: string;
  occurredAt: string;
  tone: "neutral" | "info" | "success" | "warning" | "danger";
}

export interface BookingHistoryResponse {
  bookings: BookingRecord[];
  timeline: BookingTimelineEvent[];
}

export interface CancelBookingRequest {
  bookingId: string;
  reason?: string;
}

export interface CancelBookingResponse {
  booking: BookingRecord;
  timeline: BookingTimelineEvent[];
  refundStatus: "REFUND_PENDING";
}

export interface RescheduleBookingRequest {
  bookingId: string;
  newJourneyDate: string;
  newTripId?: string;
}

export interface RescheduleBookingResponse {
  booking: BookingRecord;
  timeline: BookingTimelineEvent[];
  status: "RESCHEDULED";
}

export interface NotificationRecord {
  id: string;
  type: NotificationType;
  readStatus: NotificationReadStatus;
  title: string;
  body: string;
  channel?: NotificationChannel;
  bookingId?: string;
  emailLogId?: string;
  createdAt: string;
  readAt: string | null;
  archivedAt?: string | null;
  deletedAt?: string | null;
}

export interface NotificationCenterResponse {
  unread: NotificationRecord[];
  read: NotificationRecord[];
  archived: NotificationRecord[];
  history: NotificationRecord[];
  counts: {
    unread: number;
    read: number;
    archived: number;
    total: number;
  };
}

export interface NotificationDeliveryChannelRecord {
  channel: NotificationChannel;
  status: "ACTIVE" | "FUTURE_READY";
  provider: "INTERNAL" | "PLACEHOLDER";
  supportsRetry: boolean;
}

export type AgentCustomerStatus = "ACTIVE" | "INACTIVE" | "VIP" | "BLOCKED";

export type AgentReportPeriod = "DAILY" | "WEEKLY" | "MONTHLY";

export interface AgentProfileRecord {
  agentId: string;
  agencyName: string;
  agencyAddress: string;
  contactName: string;
  email: string;
  phone: string;
  logoUrl: string | null;
  status: "ACTIVE" | "PENDING_REVIEW" | "SUSPENDED";
  commissionRate: number;
  emailPreferences: {
    bookingConfirmation: boolean;
    cancellation: boolean;
    reschedule: boolean;
    journeyReminder: boolean;
  };
  notificationPreferences: {
    inApp: boolean;
    email: boolean;
    system: boolean;
  };
}

export interface AgentCustomerNote {
  noteId: string;
  customerId: string;
  body: string;
  createdBy: string;
  createdAt: string;
}

export interface AgentCustomerTag {
  tagId: string;
  customerId: string;
  label: string;
  color: string;
}

export interface AgentCustomerRecord {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: string | null;
  emergencyContact: string | null;
  preferredRoutes: string[];
  notes: AgentCustomerNote[];
  tags: AgentCustomerTag[];
  status: AgentCustomerStatus;
  bookingCount: number;
  upcomingTrips: number;
  lifetimeValue: Money;
  lastBookedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentCustomerListQuery {
  search?: string;
  tag?: string;
  status?: AgentCustomerStatus;
  page?: number;
  pageSize?: number;
}

export interface AgentCustomerListResponse {
  customers: AgentCustomerRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateAgentCustomerRequest {
  name: string;
  email: string;
  phone: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth?: string;
  emergencyContact?: string;
  preferredRoutes?: string[];
  notes?: string;
  tags?: string[];
}

export interface UpdateAgentCustomerRequest {
  name?: string;
  email?: string;
  phone?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth?: string | null;
  emergencyContact?: string | null;
  preferredRoutes?: string[];
  notes?: string;
  tags?: string[];
  status?: AgentCustomerStatus;
}

export interface AgentCustomerDetailsResponse {
  customer: AgentCustomerRecord;
  bookingHistory: BookingRecord[];
  upcomingTrips: BookingRecord[];
}

export interface AgentActivityLogRecord {
  id: string;
  type:
    | "BOOKING_CREATED"
    | "CUSTOMER_CREATED"
    | "CUSTOMER_UPDATED"
    | "TICKET_EMAILED"
    | "REPORT_EXPORTED"
    | "SYSTEM";
  title: string;
  description: string;
  occurredAt: string;
  actor: string;
}

export interface AgentDashboardMetric {
  label: string;
  value: string;
  trend: string;
}

export interface AgentRouteMetric {
  route: string;
  bookings: number;
  revenue: Money;
}

export interface AgentStatusSummary {
  status: BookingStatus;
  count: number;
}

export interface AgentDashboardResponse {
  profile: AgentProfileRecord;
  metrics: {
    todaysBookings: number;
    upcomingJourneys: number;
    todaysRevenue: Money;
    cancelledBookings: number;
  };
  recentCustomers: AgentCustomerRecord[];
  recentActivity: AgentActivityLogRecord[];
  quickBookingRoutes: AgentRouteMetric[];
  popularRoutes: AgentRouteMetric[];
  bookingStatusSummary: AgentStatusSummary[];
  notifications: NotificationRecord[];
}

export interface AgentBookingListQuery {
  search?: string;
  journeyDate?: string;
  operator?: string;
  status?: BookingStatus;
  source?: string;
  destination?: string;
  bookingId?: string;
  customerName?: string;
  phoneNumber?: string;
  sortBy?: "createdAt" | "journeyDate" | "amount" | "status";
  sortDirection?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface AgentBookingRecord {
  booking: BookingRecord;
  customer: AgentCustomerRecord | null;
  ticket: TicketRecord | null;
  channel: "AGENT";
}

export interface AgentBookingListResponse {
  bookings: AgentBookingRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateAgentBookingRequest extends CreateBookingRequest {
  customerId: string;
  paymentReference?: string;
  emailTicket?: boolean;
}

export interface CreateAgentBookingResponse {
  booking: BookingRecord;
  ticket: TicketRecord;
  customer: AgentCustomerRecord;
  emailLogId?: string;
}

export interface AgentEmailTicketRequest extends TicketEmailRequest {
  agentId?: string;
}

export interface AgentReportPoint {
  label: string;
  bookings: number;
  revenue: number;
  cancellations?: number;
}

export interface AgentReportRecord {
  reportId: string;
  name: string;
  period: AgentReportPeriod;
  status: "READY" | "PROCESSING" | "FAILED";
  generatedAt: string;
  rows: AgentReportPoint[];
}

export interface AgentReportsResponse {
  dailyBookings: AgentReportRecord;
  weeklyBookings: AgentReportRecord;
  monthlyBookings: AgentReportRecord;
  topRoutes: AgentRouteMetric[];
  topCustomers: Array<{
    customerId: string;
    name: string;
    bookings: number;
    revenue: Money;
  }>;
  bookingTrends: AgentReportPoint[];
  revenueTrends: AgentReportPoint[];
  cancellationTrends: AgentReportPoint[];
  journeyDistribution: AgentReportPoint[];
  exports: {
    csvFileName: string;
    pdfFileName: string;
    generatedAt: string;
  };
}

export type AdminEntityStatus = "ACTIVE" | "INACTIVE" | "DRAFT" | "SCHEDULED" | "PUBLISHED";

export type AdminHealthStatus = "HEALTHY" | "DEGRADED" | "DOWN" | "DISABLED";

export type AdminReportPeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export type AdminReportType =
  | "BOOKINGS"
  | "REVENUE"
  | "CUSTOMER_GROWTH"
  | "AGENT_PERFORMANCE"
  | "POPULAR_ROUTES"
  | "CANCELLATION_RATE";

export interface AdminMetricRecord {
  label: string;
  value: string;
  change: string;
  tone: "success" | "warning" | "danger" | "neutral";
}

export interface AdminChartPoint {
  label: string;
  bookings: number;
  revenue: number;
  users?: number;
  cancellations?: number;
}

export interface AdminRouteMetric {
  route: string;
  bookings: number;
  revenue: Money;
  cancellationRate: number;
}

export interface AdminOperatorMetric {
  operatorId: string;
  operatorName: string;
  bookings: number;
  revenue: Money;
  rating: number;
  status: AdminHealthStatus;
}

export interface AdminCustomerMetric {
  customerId: string;
  name: string;
  bookings: number;
  revenue: Money;
  lastBookedAt: string;
}

export interface AdminActivityRecord {
  activityId: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string | null;
  ipAddress: string;
  device: string;
  browser: string;
  occurredAt: string;
}

export interface AdminAuditLogRecord {
  auditId: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string | null;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AdminQueueStatusRecord {
  name: string;
  queued: number;
  sent: number;
  failed: number;
  retryScheduled: number;
}

export interface AdminSystemHealthRecord {
  component: string;
  status: AdminHealthStatus;
  latencyMs: number;
  uptimePercentage: number;
  message: string;
  sampledAt: string;
}

export interface AdminDashboardResponse {
  metrics: {
    todaysBookings: number;
    weeklyBookings: number;
    monthlyBookings: number;
    revenue: Money;
    users: number;
    travelAgents: number;
    upcomingJourneys: number;
    cancelledBookings: number;
  };
  cards: AdminMetricRecord[];
  bookingTrends: AdminChartPoint[];
  popularRoutes: AdminRouteMetric[];
  topOperators: AdminOperatorMetric[];
  mostActiveCustomers: AdminCustomerMetric[];
  recentActivities: AdminActivityRecord[];
  systemHealth: AdminSystemHealthRecord[];
  emailQueueStatus: AdminQueueStatusRecord;
  notificationQueueStatus: AdminQueueStatusRecord;
}

export interface AdminBookingListQuery {
  search?: string;
  bookingId?: string;
  pnr?: string;
  customer?: string;
  agent?: string;
  journeyDate?: string;
  operator?: string;
  source?: string;
  destination?: string;
  status?: BookingStatus;
  page?: number;
  pageSize?: number;
}

export interface AdminBookingRecord {
  booking: BookingRecord;
  customerName: string;
  agentName: string | null;
  ticket: TicketRecord | null;
  timelineCount: number;
}

export interface AdminBookingListResponse {
  bookings: AdminBookingRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminUserManagementRecord {
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
  lastLoginAt: string | null;
  bookingCount: number;
  activityCount: number;
  createdAt: string;
}

export interface AdminPermissionRecord {
  permissionId: string;
  code: string;
  description: string;
  group: string;
}

export interface AdminRoleRecord {
  roleId: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminRoleRequest {
  code: string;
  name: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateAdminRoleRequest {
  name?: string;
  description?: string | null;
}

export interface UpdateRolePermissionsRequest {
  permissionCodes: string[];
}

export interface CmsPageRecord {
  pageId: string;
  key: string;
  title: string;
  section:
    | "HOME_BANNER"
    | "ABOUT_US"
    | "PRIVACY_POLICY"
    | "TERMS"
    | "REFUND_POLICY"
    | "FAQ"
    | "CONTACT"
    | "BLOG"
    | "SEO";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  content: string;
  seoTitle: string;
  seoDescription: string;
  updatedBy: string;
  publishedAt: string | null;
  updatedAt: string;
}

export interface CreateCmsPageRequest {
  key: string;
  title: string;
  section: CmsPageRecord["section"];
  content: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateCmsPageRequest {
  title?: string;
  content?: string;
  seoTitle?: string;
  seoDescription?: string;
  status?: CmsPageRecord["status"];
}

export interface AdminCouponRecord {
  couponId: string;
  code: string;
  type: "PERCENTAGE" | "FLAT";
  discountValue: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  minimumBookingAmount: Money;
  maximumDiscount: Money;
  status: "ACTIVE" | "INACTIVE" | "SCHEDULED" | "EXPIRED";
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminCouponRequest {
  code: string;
  type: AdminCouponRecord["type"];
  discountValue: number;
  usageLimit: number;
  expiresAt: string;
  minimumBookingAmount: number;
  maximumDiscount: number;
  status?: AdminCouponRecord["status"];
}

export interface UpdateAdminCouponRequest {
  discountValue?: number;
  usageLimit?: number;
  expiresAt?: string;
  minimumBookingAmount?: number;
  maximumDiscount?: number;
  status?: AdminCouponRecord["status"];
}

export interface AdminOfferRecord {
  offerId: string;
  title: string;
  placement: "OFFER_BANNER" | "FEATURED_ROUTES" | "SEASONAL" | "HOME_PROMOTION" | "POPUP";
  route: string | null;
  status: "ACTIVE" | "INACTIVE" | "SCHEDULED" | "DRAFT";
  startsAt: string;
  endsAt: string;
  priority: number;
  impressions: number;
  conversions: number;
}

export interface CreateAdminOfferRequest {
  title: string;
  placement: AdminOfferRecord["placement"];
  route?: string | null;
  startsAt: string;
  endsAt: string;
  priority?: number;
  status?: AdminOfferRecord["status"];
}

export interface UpdateAdminOfferRequest {
  title?: string;
  route?: string | null;
  startsAt?: string;
  endsAt?: string;
  priority?: number;
  status?: AdminOfferRecord["status"];
}

export interface AdminNotificationTemplateRecord {
  templateId: string;
  name: string;
  audience: "CUSTOMER" | "AGENT" | "BROADCAST";
  channel: NotificationChannel;
  variables: string[];
  status: "ACTIVE" | "DRAFT";
}

export interface SendAdminNotificationRequest {
  audience: "CUSTOMER" | "AGENT" | "BROADCAST";
  title: string;
  body: string;
  templateId?: string;
}

export interface AdminNotificationCenterResponse {
  history: NotificationRecord[];
  templates: AdminNotificationTemplateRecord[];
  queue: AdminQueueStatusRecord;
}

export interface AdminEmailTemplateRecord {
  templateId: string;
  key: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  variables: string[];
  isActive: boolean;
  version: number;
  versionHistory: Array<{
    version: number;
    changedBy: string;
    changedAt: string;
  }>;
  updatedAt: string;
}

export interface UpdateAdminEmailTemplateRequest {
  subject?: string;
  htmlBody?: string;
  textBody?: string;
  variables?: string[];
  isActive?: boolean;
}

export interface AdminEmailTemplatePreviewRequest {
  variables: Record<string, string>;
}

export interface AdminEmailTemplatePreviewResponse {
  subject: string;
  html: string;
  text: string;
}

export interface AdminReportRecord {
  reportId: string;
  name: string;
  type: AdminReportType;
  period: AdminReportPeriod;
  status: "READY" | "PROCESSING" | "FAILED";
  generatedAt: string;
  rows: AdminChartPoint[];
  csvFileName: string;
  pdfFileName: string;
}

export interface CreateAdminReportRequest {
  type: AdminReportType;
  period: AdminReportPeriod;
  filters?: Record<string, unknown>;
}

export interface AdminReportsResponse {
  reports: AdminReportRecord[];
  topRoutes: AdminRouteMetric[];
  agentPerformance: Array<{
    agentId: string;
    agencyName: string;
    bookings: number;
    revenue: Money;
    commission: Money;
  }>;
  cancellationRate: number;
}

export interface AdminAnalyticsResponse {
  revenue: AdminChartPoint[];
  bookings: AdminChartPoint[];
  users: AdminChartPoint[];
  routes: AdminRouteMetric[];
  journeyTrends: AdminChartPoint[];
  operatorTrends: AdminOperatorMetric[];
  customerGrowth: AdminChartPoint[];
  retention: AdminChartPoint[];
  cancellation: AdminChartPoint[];
}

export interface AdminFeatureFlagRecord {
  flagId: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  owner: string;
  updatedAt: string;
}

export interface UpdateAdminFeatureFlagRequest {
  enabled?: boolean;
  rolloutPercentage?: number;
  description?: string;
}

export interface AdminPlatformSettingRecord {
  settingId: string;
  key: string;
  category: "GENERAL" | "BRAND" | "FINANCE" | "BOOKING" | "SUPPORT" | "POLICY";
  label: string;
  value: string;
  description: string;
  isSecretReference: boolean;
  updatedAt: string;
}

export interface AdminPlatformSettingsResponse {
  settings: AdminPlatformSettingRecord[];
  general: {
    brandName: string;
    logoUrl: string;
    supportEmail: string;
    supportPhone: string;
    timezone: string;
    currency: "INR";
    taxPercentage: number;
    bookingFee: Money;
    cancellationPolicy: string;
  };
}

export interface UpdateAdminPlatformSettingRequest {
  value: string;
}

export type SupplierCode = "MOCK" | "BCI" | "REDBUS" | "ABHIBUS" | "TBO" | "CUSTOM";

export type SupplierEnvironment = "MOCK" | "SANDBOX_PLACEHOLDER" | "PRODUCTION_PLACEHOLDER";

export type SupplierHealthStatus = "AVAILABLE" | "UNAVAILABLE" | "DEGRADED" | "UNKNOWN";

export type SupplierSearchStatus =
  "AVAILABLE" | "SEARCH_PARTIALLY_AVAILABLE" | "SUPPLIER_UNAVAILABLE" | "NO_SUPPLIER_AVAILABLE";

export type SupplierOperation =
  | "SEARCH_TRIPS"
  | "GET_TRIP_DETAILS"
  | "GET_SEAT_LAYOUT"
  | "HOLD_SEATS"
  | "RELEASE_SEATS"
  | "CONFIRM_BOOKING"
  | "GET_BOOKING_STATUS"
  | "CANCEL_BOOKING"
  | "RESCHEDULE_BOOKING"
  | "GET_TICKET"
  | "TRACK_BUS"
  | "GET_CANCELLATION_POLICY"
  | "GET_BOARDING_POINTS"
  | "GET_DROPPING_POINTS"
  | "HEALTH_CHECK";

export type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface SupplierTimeoutPolicy {
  connectionTimeoutMs: number;
  requestTimeoutMs: number;
  retryCount: number;
  retryDelayMs: number;
  circuitBreakerThreshold: number;
  circuitBreakerCooldownMs: number;
}

export interface SupplierIntegrationConfig {
  code: SupplierCode;
  name: string;
  enabled: boolean;
  priority: number;
  environment: SupplierEnvironment;
  baseUrl: string | null;
  credentialReference: string | null;
  healthStatus: SupplierHealthStatus;
  timeout: SupplierTimeoutPolicy;
}

export interface TripSearchRequest extends BusSearchRequest {
  correlationId?: string;
  requestId?: string;
}

export interface Operator {
  operatorId: string;
  name: string;
  logoUrl: string;
  rating: number;
}

export interface Bus {
  busType: string;
  vehicleLayout?: VehicleLayoutType;
  amenities: BusAmenity[];
  imageUrl?: string;
}

export interface Trip extends BusSearchResult {
  safeTripRef: string;
  supplierTripId: string;
  supplierOperatorId: string;
  duplicateGroupId?: string | null;
}

export type Seat = SeatMapSeat;
export type SeatLayout = SeatLayoutDetails;
export type BoardingPoint = BoardingDroppingPoint;
export type DroppingPoint = BoardingDroppingPoint;
export type Passenger = BookingPassengerInput;
export type Booking = BookingRecord;
export type Ticket = TicketRecord;
export type Fare = BookingFareSummary;

export interface BookingResponse {
  booking: BookingRecord;
  supplierBookingId: string;
  status: BookingStatus;
}

export interface Cancellation {
  bookingId: string;
  supplierBookingId?: string | null;
  status: "REQUESTED" | "CONFIRMED" | "FAILED";
  refundStatus: "NOT_APPLICABLE" | "PENDING" | "REFUNDED";
  penalty: Money;
}

export interface Reschedule {
  bookingId: string;
  newTripId: string;
  newJourneyDate: string;
  fareDifference: Money;
  status: "REQUESTED" | "CONFIRMED" | "FAILED";
}

export interface Tracking {
  supplierCode: SupplierCode;
  tripId: string;
  status: "AVAILABLE" | "COMING_SOON" | "UNAVAILABLE";
  latitude?: number;
  longitude?: number;
  speedKmph?: number;
  capturedAt?: string;
}

export interface CancellationPolicySlab {
  beforeDepartureHours: number;
  refundPercentage: number;
  description: string;
}

export interface CancellationPolicy {
  supplierCode: SupplierCode;
  tripId: string;
  slabs: CancellationPolicySlab[];
  terms: string[];
}

export interface SupplierError {
  supplierCode: SupplierCode;
  operation: SupplierOperation;
  code:
    | "SUPPLIER_NOT_CONFIGURED"
    | "SUPPLIER_UNAVAILABLE"
    | "SUPPLIER_TIMEOUT"
    | "SUPPLIER_VALIDATION"
    | "SUPPLIER_BOOKING_FAILED"
    | "SUPPLIER_SEAT_UNAVAILABLE"
    | "NOT_IMPLEMENTED";
  message: string;
  retryable: boolean;
}

export interface SupplierHealth {
  supplierCode: SupplierCode;
  status: SupplierHealthStatus;
  responseTimeMs: number;
  successRate: number;
  failureRate: number;
  lastSuccessfulRequestAt: string | null;
  lastFailureAt: string | null;
  checkedAt: string;
  message: string;
}

export interface SupplierResultSummary {
  supplierCode: SupplierCode;
  status: "SUCCESS" | "FAILED" | "SKIPPED";
  resultCount: number;
  durationMs: number;
  errorCode?: SupplierError["code"];
}

export interface DuplicateTripGroup {
  duplicateGroupId: string;
  confidence: number;
  reason: string;
  tripRefs: string[];
}

export interface TripSearchResponse {
  success: boolean;
  status: SupplierSearchStatus;
  trips: BusSearchResult[];
  supplierResults: SupplierResultSummary[];
  errors: SupplierError[];
  duplicateGroups: DuplicateTripGroup[];
  requestId: string;
  correlationId: string;
}

export interface SupplierRequestLogRecord {
  requestId: string;
  supplierCode: SupplierCode;
  operation: SupplierOperation;
  timestamp: string;
  durationMs: number;
  httpStatus: number | null;
  success: boolean;
  errorCode: string | null;
  correlationId: string;
  traceId: string;
}

export interface SupplierCircuitStateRecord {
  supplierCode: SupplierCode;
  state: CircuitBreakerState;
  failureCount: number;
  openedAt: string | null;
  nextRetryAt: string | null;
}

export interface IntegrationDashboardResponse {
  supplierMode: "mock" | "production";
  suppliers: SupplierIntegrationConfig[];
  health: SupplierHealth[];
  requestLogs: SupplierRequestLogRecord[];
  circuits: SupplierCircuitStateRecord[];
  duplicateStrategy: string;
  security: {
    frontendSupplierAccess: "NEVER";
    credentialStorage: "SECRET_REFERENCES_ONLY";
    credentialLogging: "REDACTED";
  };
}

export type PaymentProviderCode =
  "MOCK" | "RAZORPAY" | "CASHFREE" | "PHONEPE" | "STRIPE" | "CUSTOM";

export type PaymentStatus =
  | "CREATED"
  | "PENDING"
  | "AUTHORIZED"
  | "CAPTURED"
  | "FAILED"
  | "CANCELLED"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type RefundStatus = "CREATED" | "PENDING" | "PROCESSED" | "FAILED" | "CANCELLED";

export interface PaymentProviderConfig {
  code: PaymentProviderCode;
  name: string;
  enabled: boolean;
  environment: "MOCK" | "SANDBOX_PLACEHOLDER" | "PRODUCTION_PLACEHOLDER";
  currency: "INR" | "USD";
  credentialReference: string | null;
  configuration: Record<string, string | number | boolean | null>;
}

export interface PaymentIntent {
  paymentIntentId: string;
  providerCode: PaymentProviderCode;
  bookingId: string;
  amount: Money;
  currency: "INR" | "USD";
  status: PaymentStatus;
  idempotencyKey: string;
  clientSecret: string | null;
  createdAt: string;
  expiresAt: string;
}

export interface PaymentResult {
  paymentIntentId: string;
  transactionId: string;
  providerCode: PaymentProviderCode;
  status: PaymentStatus;
  amount: Money;
  providerReference: string | null;
  capturedAt: string | null;
  failureCode: string | null;
  failureMessage: string | null;
}

export interface Refund {
  refundId: string;
  paymentIntentId: string;
  transactionId: string;
  amount: Money;
  status: RefundStatus;
  reason: string;
  providerReference: string | null;
  createdAt: string;
}

export interface PaymentTransaction {
  transactionId: string;
  paymentIntentId: string;
  providerCode: PaymentProviderCode;
  status: PaymentStatus;
  amount: Money;
  providerReference: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentWebhook {
  webhookId: string;
  providerCode: PaymentProviderCode;
  eventId: string;
  eventType: string;
  receivedAt: string;
  processedAt: string | null;
  status: "RECEIVED" | "DUPLICATE" | "PROCESSED" | "FAILED";
}

export interface CreatePaymentIntentRequest {
  bookingId: string;
  amount: Money;
  currency?: "INR" | "USD";
  providerCode?: PaymentProviderCode;
  idempotencyKey?: string;
}

export interface CapturePaymentRequest {
  paymentIntentId: string;
  providerReference?: string;
  idempotencyKey?: string;
}

export interface PaymentWebhookResult {
  accepted: boolean;
  duplicate: boolean;
  providerCode: PaymentProviderCode;
  eventId: string;
  status: PaymentWebhook["status"];
}

export interface AdminSupplierConfigurationRecord {
  supplierId: string;
  code: SupplierCode;
  name: string;
  enabled: boolean;
  priority: number;
  healthStatus: AdminHealthStatus;
  environment: SupplierEnvironment;
  apiKeySecretRef: string;
  updatedAt: string;
}

export interface UpdateAdminSupplierConfigurationRequest {
  enabled?: boolean;
  priority?: number;
  environment?: AdminSupplierConfigurationRecord["environment"];
}

export interface AdminMonitoringResponse {
  components: AdminSystemHealthRecord[];
  cpu: number;
  memory: number;
  storage: number;
  queueDepth: number;
  sampledAt: string;
}

export type RecommendationType =
  | "CHEAPEST_ROUTE"
  | "FASTEST_ROUTE"
  | "POPULAR_ROUTE"
  | "BEST_RATED_OPERATOR"
  | "WEEKEND_SUGGESTION"
  | "NEARBY_DESTINATION"
  | "FREQUENTLY_BOOKED_ROUTE"
  | "RECENTLY_VIEWED_ROUTE"
  | "TRENDING_ROUTE"
  | "RECENTLY_BOOKED_AGAIN";

export interface TripRecommendationRecord {
  recommendationId: string;
  type: RecommendationType;
  title: string;
  route: string;
  sourceCity: string;
  destinationCity: string;
  reason: string;
  confidenceScore: number;
  fare: Money;
  durationMinutes: number;
  operatorName: string;
  rating: number;
  tags: string[];
  generatedAt: string;
}

export interface RecommendationEngineResponse {
  engine: "MOCK_RULES" | "LLM_READY";
  generatedAt: string;
  recommendations: TripRecommendationRecord[];
  recentlyViewed: TripRecommendationRecord[];
  trendingRoutes: TripRecommendationRecord[];
  architecture: {
    modelProvider: "NONE";
    futureLlmPort: string;
    safetyPolicy: string;
  };
}

export interface RecentlyViewedRouteRequest {
  sourceCity: string;
  destinationCity: string;
  viewedAt?: string;
}

export type CacheNamespace =
  | "POPULAR_ROUTES"
  | "SEARCH_RESULTS"
  | "AUTOCOMPLETE"
  | "POPULAR_SEARCHES"
  | "RECENT_SEARCHES"
  | "OPERATORS"
  | "BUS_TYPES"
  | "SETTINGS"
  | "FEATURE_FLAGS"
  | "ANALYTICS"
  | "DASHBOARD_WIDGETS";

export interface CacheEntryRecord {
  key: string;
  namespace: CacheNamespace;
  status: "HIT" | "MISS" | "WARMED" | "STALE";
  ttlSeconds: number;
  sizeBytes: number;
  lastAccessedAt: string;
}

export interface CacheDashboardResponse {
  provider: "REDIS";
  status: AdminHealthStatus;
  hitRate: number;
  entries: CacheEntryRecord[];
  warmedNamespaces: CacheNamespace[];
  strategy: Array<{
    namespace: CacheNamespace;
    ttlSeconds: number;
    invalidation: string;
  }>;
}

export interface WarmCacheRequest {
  namespaces: CacheNamespace[];
}

export type PlatformQueueName =
  | "EMAIL_QUEUE"
  | "NOTIFICATION_QUEUE"
  | "PDF_QUEUE"
  | "ANALYTICS_QUEUE"
  | "AI_QUEUE"
  | "RESERVATION_CLEANUP_QUEUE"
  | "SUPPLIER_REQUEST_QUEUE"
  | "PAYMENT_EVENT_QUEUE"
  | "SCHEDULER_QUEUE"
  | "DEAD_LETTER_QUEUE";

export interface QueueStatusRecord {
  queue: PlatformQueueName;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  retryScheduled: number;
  deadLettered: number;
  status: AdminHealthStatus;
}

export interface QueueDashboardResponse {
  driver: "BULLMQ";
  redis: AdminHealthStatus;
  queues: QueueStatusRecord[];
  retryStrategy: {
    attempts: number;
    backoff: "EXPONENTIAL";
    deadLetterQueue: PlatformQueueName;
  };
}

export interface EnqueueJobRequest {
  queue: PlatformQueueName;
  jobName: string;
  payload?: Record<string, unknown>;
}

export interface BackgroundJobRecord {
  jobId: string;
  name: string;
  queue: PlatformQueueName;
  schedule: "EVERY_5_MINUTES" | "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";
  status: "SCHEDULED" | "RUNNING" | "COMPLETED" | "FAILED";
  lastRunAt: string | null;
  nextRunAt: string;
  description: string;
}

export interface SchedulerDashboardResponse {
  jobs: BackgroundJobRecord[];
  schedulerQueue: QueueStatusRecord;
}

export interface HealthCheckComponent {
  component: "DATABASE" | "REDIS" | "QUEUE" | "STORAGE" | "API" | "EMAIL" | "SUPPLIER" | "PAYMENT";
  status: AdminHealthStatus;
  latencyMs: number;
  message: string;
}

export interface MaintenanceModeStatus {
  enabled: boolean;
  message: string;
  updatedAt: string | null;
}

export interface UpdateMaintenanceModeRequest {
  enabled?: boolean;
  message?: string;
}

export interface HealthCheckResponse {
  status: AdminHealthStatus;
  checkedAt: string;
  components: HealthCheckComponent[];
}

export interface MetricsResponse {
  requestCount: number;
  apiResponseTimeMs: number;
  errorRate: number;
  queueStatus: QueueStatusRecord[];
  cacheStatus: CacheDashboardResponse;
  memoryUsageMb: number;
  cpuUsagePercent: number;
  storageUsagePercent: number;
  sampledAt: string;
}

export interface SearchSuggestionRecord {
  label: string;
  sourceCity: string;
  destinationCity: string;
  searchCount: number;
}

export interface SearchInsightsResponse {
  popularRoutes: SearchSuggestionRecord[];
  popularCities: Array<{
    city: string;
    searchCount: number;
  }>;
  noResultSearches: SearchSuggestionRecord[];
  averageBookingTimeSeconds: number;
  abandonedBookings: number;
  recentSearches: SearchSuggestionRecord[];
  autocompleteCache: SearchSuggestionRecord[];
}

export interface RecordRecentSearchRequest {
  sourceCity: string;
  destinationCity: string;
}

export interface SeoMetadataRecord {
  path: string;
  title: string;
  description: string;
  canonicalUrl: string;
  openGraph: {
    title: string;
    description: string;
    image: string;
  };
  twitterCard: {
    card: "summary_large_image";
    title: string;
    description: string;
  };
  jsonLd: Record<string, unknown>;
  breadcrumbs: Array<{
    name: string;
    item: string;
  }>;
}

export interface SeoSitemapResponse {
  routes: SeoMetadataRecord[];
  robots: string;
  generatedAt: string;
}

export interface EmailLogRecord {
  id: string;
  to: string;
  templateKey: string;
  subject: string;
  status: EmailDeliveryStatus;
  attempts: number;
  maxAttempts: number;
  queuedAt: string;
  sentAt: string | null;
  failedAt: string | null;
  nextRetryAt: string | null;
  errorMessage: string | null;
}

export interface EmailQueueRecord extends EmailLogRecord {
  htmlBody: string;
  textBody?: string;
}

export interface Money {
  amount: number;
  currency: "INR";
}

export interface PassengerInput {
  fullName: string;
  age: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  seatNumber: string;
}

export interface BookingDraft {
  tripId: string;
  supplierCode: string;
  passengers: PassengerInput[];
  contactEmail: string;
  contactPhone: string;
}
