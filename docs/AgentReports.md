# Agent Report Architecture

Milestone 7 report generation uses mock data and local projections. It does not call third-party analytics, supplier, payment, or storage APIs.

## Reports

- Daily bookings.
- Weekly bookings.
- Monthly bookings.
- Top routes.
- Top customers.
- Booking trends.
- Revenue trends.
- Cancellation trends.
- Journey distribution.

## Frontend

Agent reports use Recharts for visualizations and the shared enterprise `DataTable` for tabular exports. The table supports search, sorting, pagination, column visibility, CSV export, and print/PDF export.

## Backend

`agent-report` composes booking and customer records into chart-ready series. The response includes export metadata:

```json
{
  "exports": {
    "csvFileName": "agent-booking-report.csv",
    "pdfFileName": "agent-booking-report.pdf",
    "generatedAt": "2026-08-08T09:00:00.000Z"
  }
}
```

## Future Integration Strategy

Future production reports can persist generated files in object storage and run asynchronously through BullMQ. The API shape should remain chart-ready and supplier-independent.
