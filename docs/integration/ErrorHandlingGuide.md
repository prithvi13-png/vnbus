# Integration Error Handling Guide

Standard supplier errors:

- `SupplierUnavailableError`
- `SupplierTimeoutError`
- `SupplierValidationError`
- `SupplierBookingFailedError`
- `SupplierSeatUnavailableError`
- `SupplierNotConfiguredError`

Standard payment errors:

- `PaymentFailedError`
- `PaymentTimeoutError`
- `PaymentProviderUnavailableError`

Standard idempotency errors:

- `DuplicateBookingError`
- `IdempotencyConflictError`

Milestone 10 maps supplier failures into normalized application responses. Search can return partial results when one supplier fails. Booking-confirmation style operations are not blindly retried.
