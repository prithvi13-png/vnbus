# Milestone 10 Integration Architecture

Milestone 10 adds the production integration layer without connecting real suppliers or payment gateways.

```mermaid
flowchart TD
  UI["Customer, Agent, Admin UI"] --> API["Booking and Search API"]
  API --> Manager["SupplierManagerService"]
  Manager --> Router["Priority Router and Failover"]
  Router --> Mock["MockSupplierAdapter"]
  Router --> BCI["BCIAdapter"]
  Router --> Abhi["AbhiBusAdapter"]
  Router --> RedBus["RedBusAdapter"]
  Router --> TBO["TBOAdapter"]
  Router --> Custom["CustomApiAdapter"]
  Manager --> Norm["NormalizationService"]
  Manager --> Logs["SupplierRequestLogService"]
  Manager --> Health["SupplierHealthService"]
  Manager --> Circuit["CircuitBreakerService"]
```

The frontend never talks to suppliers. It receives existing normalized search, seat, booking, ticket, and dashboard contracts.

Core rules:

- `SUPPLIER_MODE=mock` keeps `MockSupplierAdapter` active.
- `SUPPLIER_MODE=production` is supported by configuration, but live suppliers remain disabled until API URLs and secret references exist.
- Supplier failures are normalized into application-level statuses: `SUPPLIER_UNAVAILABLE`, `SEARCH_PARTIALLY_AVAILABLE`, and `NO_SUPPLIER_AVAILABLE`.
- Request logs record request IDs, correlation IDs, trace IDs, supplier code, operation, duration, outcome, and redacted metadata.
- Circuit breakers support `CLOSED`, `OPEN`, and `HALF_OPEN`.

Payment flow:

```mermaid
flowchart TD
  Booking["Booking"] --> Intent["Payment Intent"]
  Intent --> Provider["PaymentService Provider Router"]
  Provider --> MockPay["MockPaymentAdapter"]
  Provider --> Razorpay["RazorpayAdapter"]
  Provider --> Cashfree["CashfreeAdapter"]
  Provider --> PhonePe["PhonePeAdapter"]
  Provider --> Stripe["StripeAdapter"]
  Provider --> CustomPay["CustomPaymentAdapter"]
  Provider --> Result["Payment Result"]
  Result --> Confirm["Booking Confirmation"]
```

No payment gateway dependency is installed in Milestone 10.
