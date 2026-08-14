# Booking History

Milestone 6 adds customer booking history buckets and details:

- Upcoming Trips
- Past Trips
- Cancelled Trips
- Booking Details
- Ticket Download
- Email Ticket Again
- Cancel Booking
- Reschedule Booking

## APIs

```text
GET  /api/v1/bookings/history
GET  /api/v1/bookings/upcoming
GET  /api/v1/bookings/past
GET  /api/v1/bookings/cancelled
POST /api/v1/bookings/cancel
POST /api/v1/bookings/reschedule
GET  /api/v1/bookings/:bookingId/timeline
```

## Timeline Events

Booking details render lifecycle events from `BookingTimelineEvent`, including booking created, seat reserved, payment pending, payment confirmed, ticket generated, ticket downloaded, email sent, cancellation requested, cancelled, refund pending, reschedule requested, and rescheduled.

## Reschedule Boundary

The reschedule UI reuses the existing search module to find mock buses for a new date. It records the selected bus/date and updates booking status to `RESCHEDULED`. Fare-difference payment capture is deferred.
