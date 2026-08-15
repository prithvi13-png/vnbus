"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BookingFareSummary, BookingRecord, Money } from "@vnbus/types";

export type InvoiceSource = "CUSTOMER_BOOKING" | "ADMIN_MANUAL" | "BULK_UPLOAD";
export type InvoiceStatus = "UPLOADED" | "DOWNLOADED";

export interface InvoiceLineItem {
  description: string;
  amount: Money;
}

export interface InvoiceRecord {
  invoiceId: string;
  invoiceNumber: string;
  bookingId: string;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  route: string;
  operatorName: string;
  journeyDate: string;
  seats: string[];
  passengerCount: number;
  lineItems: InvoiceLineItem[];
  total: Money;
  status: InvoiceStatus;
  source: InvoiceSource;
  generatedBy: string;
  generatedAt: string;
  uploadedAt: string;
  downloadedAt?: string | null;
  storagePath: string;
  uploadBatchId?: string | null;
}

export interface BulkBookingRecord {
  bookingId: string;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  route: string;
  operatorName: string;
  journeyDate: string;
  seats: string[];
  amount: Money;
  status: "CONFIRMED";
  uploadedAt: string;
  uploadBatchId: string;
  invoiceId: string;
}

export interface BulkInvoiceUploadBatch {
  batchId: string;
  fileName: string;
  bookingCount: number;
  invoiceCount: number;
  uploadedAt: string;
}

export interface InvoiceInput {
  bookingId: string;
  bookingReference: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  route: string;
  operatorName: string;
  journeyDate: string;
  seats: string[];
  passengerCount: number;
  fare: BookingFareSummary;
}

interface ParsedBulkBookingInput extends InvoiceInput {
  rawRowNumber: number;
}

interface BulkUploadResult {
  batch: BulkInvoiceUploadBatch;
  bookings: BulkBookingRecord[];
  invoices: InvoiceRecord[];
}

interface InvoiceState {
  invoices: InvoiceRecord[];
  bulkBookings: BulkBookingRecord[];
  uploadBatches: BulkInvoiceUploadBatch[];
  ensureInvoiceForBooking: (
    booking: BookingRecord,
    source?: InvoiceSource,
    generatedBy?: string,
  ) => InvoiceRecord;
  generateInvoiceFromInput: (
    input: InvoiceInput,
    source?: InvoiceSource,
    generatedBy?: string,
    uploadBatchId?: string | null,
  ) => InvoiceRecord;
  uploadBulkBookingFile: (file: File, generatedBy?: string) => Promise<BulkUploadResult>;
  markInvoiceDownloaded: (invoiceId: string) => void;
}

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set, get) => ({
      invoices: [],
      bulkBookings: [],
      uploadBatches: [],
      ensureInvoiceForBooking: (
        booking,
        source = "CUSTOMER_BOOKING",
        generatedBy = "Booking flow",
      ) => {
        const input = invoiceInputFromBooking(booking);
        const existing = get().invoices.find((invoice) => invoice.bookingId === input.bookingId);

        if (existing) {
          return existing;
        }

        const invoice = createInvoice(input, source, generatedBy);
        set((state) => ({
          invoices: upsertById(state.invoices, invoice, (item) => item.invoiceId).slice(0, 200),
        }));

        return invoice;
      },
      generateInvoiceFromInput: (
        input,
        source = "ADMIN_MANUAL",
        generatedBy = "Admin",
        uploadBatchId = null,
      ) => {
        const invoice = createInvoice(input, source, generatedBy, uploadBatchId);
        set((state) => ({
          invoices: upsertById(state.invoices, invoice, (item) => item.invoiceId).slice(0, 200),
        }));

        return invoice;
      },
      uploadBulkBookingFile: async (file, generatedBy = "Admin bulk upload") => {
        const rows = await parseBulkBookingFile(file);
        const uploadedAt = new Date().toISOString();
        const batchId = createStableId("BATCH", `${file.name}|${uploadedAt}|${rows.length}`);
        const invoices = rows.map((row) =>
          createInvoice(row, "BULK_UPLOAD", generatedBy, batchId, uploadedAt),
        );
        const bookings = rows.map<BulkBookingRecord>((row, index) => ({
          bookingId: row.bookingId,
          bookingReference: row.bookingReference,
          customerName: row.customerName,
          customerEmail: row.customerEmail ?? "",
          customerPhone: row.customerPhone ?? "",
          route: row.route,
          operatorName: row.operatorName,
          journeyDate: row.journeyDate,
          seats: row.seats,
          amount: row.fare.grandTotal,
          status: "CONFIRMED",
          uploadedAt,
          uploadBatchId: batchId,
          invoiceId: invoices[index]?.invoiceId ?? "",
        }));
        const batch: BulkInvoiceUploadBatch = {
          batchId,
          fileName: file.name,
          bookingCount: bookings.length,
          invoiceCount: invoices.length,
          uploadedAt,
        };

        set((state) => ({
          bulkBookings: upsertManyById(
            state.bulkBookings,
            bookings,
            (item) => item.bookingId,
          ).slice(0, 200),
          invoices: upsertManyById(state.invoices, invoices, (item) => item.invoiceId).slice(
            0,
            200,
          ),
          uploadBatches: upsertById(state.uploadBatches, batch, (item) => item.batchId).slice(
            0,
            25,
          ),
        }));

        return { batch, bookings, invoices };
      },
      markInvoiceDownloaded: (invoiceId) =>
        set((state) => ({
          invoices: state.invoices.map((invoice) =>
            invoice.invoiceId === invoiceId
              ? { ...invoice, status: "DOWNLOADED", downloadedAt: new Date().toISOString() }
              : invoice,
          ),
        })),
    }),
    {
      name: "vnbus-invoices",
      partialize: (state) => ({
        bulkBookings: state.bulkBookings,
        invoices: state.invoices,
        uploadBatches: state.uploadBatches,
      }),
    },
  ),
);

export function invoiceInputFromBooking(booking: BookingRecord): InvoiceInput {
  const primaryPassenger = booking.passengers[0];

  return {
    bookingId: booking.bookingId,
    bookingReference: booking.bookingReference,
    customerName: primaryPassenger
      ? `${primaryPassenger.firstName} ${primaryPassenger.lastName}`
      : "Vriddhi Nexus Customer",
    ...(primaryPassenger?.email ? { customerEmail: primaryPassenger.email } : {}),
    ...(primaryPassenger?.phone ? { customerPhone: primaryPassenger.phone } : {}),
    route: `${booking.trip.sourceCity} to ${booking.trip.destinationCity}`,
    operatorName: booking.trip.operatorName,
    journeyDate: booking.trip.departureTime.slice(0, 10),
    seats: booking.selectedSeats,
    passengerCount: booking.passengers.length,
    fare: booking.fare,
  };
}

export function createInvoice(
  input: InvoiceInput,
  source: InvoiceSource,
  generatedBy: string,
  uploadBatchId: string | null = null,
  issuedAt = new Date().toISOString(),
): InvoiceRecord {
  const invoiceId = createStableId("INV", input.bookingId);
  const invoiceNumber = `VNI-${input.bookingReference.replace(/^VNB-/u, "")}`;

  return {
    invoiceId,
    invoiceNumber,
    bookingId: input.bookingId,
    bookingReference: input.bookingReference,
    customerName: input.customerName,
    customerEmail: input.customerEmail ?? "",
    customerPhone: input.customerPhone ?? "",
    route: input.route,
    operatorName: input.operatorName,
    journeyDate: input.journeyDate,
    seats: input.seats,
    passengerCount: input.passengerCount,
    lineItems: fareToLineItems(input.fare),
    total: input.fare.grandTotal,
    status: "UPLOADED",
    source,
    generatedBy,
    generatedAt: issuedAt,
    uploadedAt: issuedAt,
    downloadedAt: null,
    storagePath: `mock://invoices/${invoiceNumber}.html`,
    uploadBatchId,
  };
}

export function downloadInvoiceDocument(invoice: InvoiceRecord): void {
  const blob = new Blob([renderInvoiceHtml(invoice)], { type: "text/html;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `${invoice.invoiceNumber}.html`;
  link.click();
  URL.revokeObjectURL(href);
}

export function downloadBulkBookingTemplate(): void {
  const headers = [
    "bookingReference",
    "customerName",
    "customerEmail",
    "customerPhone",
    "route",
    "operatorName",
    "journeyDate",
    "seats",
    "baseFare",
    "taxes",
    "discount",
    "convenienceFee",
    "total",
  ];
  const sample = [
    "VNB-BULK-001",
    "Aarav Sharma",
    "aarav@example.com",
    "+919876543210",
    "Bangalore to Hyderabad",
    "Eastern Travels",
    "2026-08-20",
    "A1,A2",
    "1500",
    "75",
    "0",
    "50",
    "1625",
  ];
  const csv = `${headers.join(",")}\n${sample.join(",")}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = "bulk-booking-invoice-template.csv";
  link.click();
  URL.revokeObjectURL(href);
}

async function parseBulkBookingFile(file: File): Promise<ParsedBulkBookingInput[]> {
  const rows = await readBulkBookingRows(file);

  if (!rows.length) {
    throw new Error("The uploaded sheet does not contain booking rows.");
  }

  return rows.map((row, index) => parseBulkBookingRow(row, index + 2));
}

async function readBulkBookingRows(file: File): Promise<Record<string, unknown>[]> {
  if (isCsvFile(file)) {
    return parseCsvRows(await file.text());
  }

  if (!isXlsxFile(file)) {
    throw new Error("Upload a .xlsx or .csv booking file.");
  }

  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new Error("The uploaded sheet does not contain any worksheets.");
  }

  const headers = rowValuesToStrings(worksheet.getRow(1).values).map(normalizeKey);
  const rows: Record<string, unknown>[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }

    const values = rowValuesToStrings(row.values);
    const record = headers.reduce<Record<string, unknown>>((current, header, index) => {
      if (header) {
        current[header] = values[index] ?? "";
      }

      return current;
    }, {});

    if (Object.values(record).some((value) => String(value).trim())) {
      rows.push(record);
    }
  });

  return rows;
}

function isCsvFile(file: File): boolean {
  return file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");
}

function isXlsxFile(file: File): boolean {
  return file.name.toLowerCase().endsWith(".xlsx");
}

function rowValuesToStrings(values: unknown[] | { [key: string]: unknown }): string[] {
  return Array.from(values as unknown[])
    .slice(1)
    .map(stringifyCellValue);
}

function parseCsvRows(text: string): Record<string, unknown>[] {
  const table = parseCsvTable(text);
  const [headerRow, ...dataRows] = table;
  const headers = (headerRow ?? []).map(normalizeKey);

  return dataRows
    .filter((row) => row.some((value) => value.trim()))
    .map((row) =>
      headers.reduce<Record<string, unknown>>((current, header, index) => {
        if (header) {
          current[header] = row[index] ?? "";
        }

        return current;
      }, {}),
    );
}

function parseCsvTable(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (character === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      quoted = !quoted;
      continue;
    }

    if (character === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += character;
  }

  row.push(cell.trim());
  rows.push(row);

  return rows.filter((cells) => cells.some(Boolean));
}

function parseBulkBookingRow(
  row: Record<string, unknown>,
  rawRowNumber: number,
): ParsedBulkBookingInput {
  const normalized = normalizeRow(row);
  const customerName = readRequired(normalized, rawRowNumber, "customerName", [
    "customername",
    "customer",
    "name",
  ]);
  const route = readRequired(normalized, rawRowNumber, "route", [
    "route",
    "sector",
    "sourceanddestination",
  ]);
  const total = readMoney(normalized, ["total", "grandtotal", "amount", "fare"]);
  if (total === null) {
    throw new Error(`Row ${rawRowNumber} is missing total.`);
  }

  const baseFare =
    readMoney(normalized, ["basefare", "baseamount", "subtotal"], false) ??
    Math.max(total - (total > 0 ? Math.round(total * 0.05) : 0), 0);
  const taxes =
    readMoney(normalized, ["taxes", "tax", "gst"], false) ?? Math.max(total - baseFare, 0);
  const discount = readMoney(normalized, ["discount"], false) ?? 0;
  const convenienceFee = readMoney(normalized, ["conveniencefee", "fee"], false) ?? 0;
  const bookingReference =
    readValue(normalized, ["bookingreference", "reference", "bookingref"]) ??
    createStableId("VNB-BULK", `${customerName}|${route}|${rawRowNumber}`);

  return {
    rawRowNumber,
    bookingId:
      readValue(normalized, ["bookingid", "id"]) ??
      createStableId("BKG-BULK", `${bookingReference}|${rawRowNumber}`),
    bookingReference,
    customerName,
    customerEmail: readValue(normalized, ["customeremail", "email"]) ?? "",
    customerPhone: readValue(normalized, ["customerphone", "phone", "mobile"]) ?? "",
    route,
    operatorName:
      readValue(normalized, ["operatorname", "operator", "busoperator"]) ?? "Vriddhi Nexus",
    journeyDate:
      readValue(normalized, ["journeydate", "date", "traveldate"]) ??
      new Date().toISOString().slice(0, 10),
    seats: splitSeats(readValue(normalized, ["seats", "seatnumbers", "seat"]) ?? ""),
    passengerCount: Number(readValue(normalized, ["passengercount", "passengers"]) ?? 1),
    fare: {
      baseFare: money(baseFare),
      taxes: money(taxes),
      discount: money(discount),
      convenienceFee: money(convenienceFee),
      grandTotal: money(total),
    },
  };
}

function normalizeRow(row: Record<string, unknown>): Record<string, string> {
  return Object.entries(row).reduce<Record<string, string>>((current, [key, value]) => {
    current[normalizeKey(key)] = stringifyCellValue(value).trim();

    return current;
  }, {});
}

function stringifyCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return "";
}

function readRequired(
  row: Record<string, string>,
  rawRowNumber: number,
  label: string,
  aliases: string[],
): string {
  const value = readValue(row, aliases);

  if (!value) {
    throw new Error(`Row ${rawRowNumber} is missing ${label}.`);
  }

  return value;
}

function readValue(row: Record<string, string>, aliases: string[]): string | null {
  for (const alias of aliases) {
    const value = row[alias];

    if (value) {
      return value;
    }
  }

  return null;
}

function readMoney(row: Record<string, string>, aliases: string[], required = true): number | null {
  const value = readValue(row, aliases);

  if (!value) {
    if (required) {
      throw new Error(`Bulk upload is missing ${aliases[0] ?? "amount"}.`);
    }

    return null;
  }

  const amount = Number(value.replace(/[^0-9.-]/gu, ""));

  if (!Number.isFinite(amount)) {
    throw new Error(`Invalid amount "${value}" in bulk upload.`);
  }

  return amount;
}

function fareToLineItems(fare: BookingFareSummary): InvoiceLineItem[] {
  return [
    { description: "Base fare", amount: fare.baseFare },
    { description: "Taxes", amount: fare.taxes },
    { description: "Convenience fee", amount: fare.convenienceFee },
    { description: "Discount", amount: money(-Math.abs(fare.discount.amount)) },
  ].filter((item) => item.amount.amount !== 0);
}

function splitSeats(value: string): string[] {
  const seats = value
    .split(/[,\s]+/u)
    .map((seat) => seat.trim())
    .filter(Boolean);

  return seats.length ? seats : ["AUTO"];
}

function money(amount: number): Money {
  return { amount, currency: "INR" };
}

function createStableId(prefix: string, value: string): string {
  const hash = [...value].reduce((current, character) => {
    return (current * 31 + character.charCodeAt(0)) >>> 0;
  }, 2166136261);

  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8, "0")}`;
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/gu, "");
}

function upsertById<T>(items: T[], next: T, getId: (item: T) => string): T[] {
  return [next, ...items.filter((item) => getId(item) !== getId(next))];
}

function upsertManyById<T>(items: T[], next: T[], getId: (item: T) => string): T[] {
  return next.reduce((current, item) => upsertById(current, item, getId), items);
}

function renderInvoiceHtml(invoice: InvoiceRecord): string {
  const rows = invoice.lineItems
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.description)}</td>
          <td>${formatMoney(item.amount)}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(invoice.invoiceNumber)}</title>
    <style>
      body { color: #111827; font-family: Arial, sans-serif; margin: 0; padding: 32px; }
      .invoice { border: 1px solid #e5e7eb; margin: 0 auto; max-width: 760px; padding: 32px; }
      .header { align-items: flex-start; display: flex; justify-content: space-between; gap: 24px; }
      h1 { color: #02553E; font-size: 28px; margin: 0; }
      h2 { color: #02553E; font-size: 18px; margin: 28px 0 12px; }
      p { line-height: 1.5; margin: 4px 0; }
      table { border-collapse: collapse; margin-top: 12px; width: 100%; }
      th, td { border-bottom: 1px solid #e5e7eb; padding: 12px; text-align: left; }
      th:last-child, td:last-child { text-align: right; }
      .badge { background: #FFF8EA; border: 1px solid #E4C083; color: #02553E; display: inline-block; font-weight: 700; padding: 6px 10px; }
      .total { color: #02553E; font-size: 22px; font-weight: 700; text-align: right; }
      .muted { color: #6b7280; }
    </style>
  </head>
  <body>
    <main class="invoice">
      <section class="header">
        <div>
          <span class="badge">Vriddhi Nexus Pvt Ltd</span>
          <h1>Tax Invoice</h1>
          <p class="muted">Invoice ${escapeHtml(invoice.invoiceNumber)}</p>
        </div>
        <div>
          <p><strong>Status:</strong> ${escapeHtml(invoice.status)}</p>
          <p><strong>Generated:</strong> ${formatDate(invoice.generatedAt)}</p>
          <p><strong>Booking:</strong> ${escapeHtml(invoice.bookingReference)}</p>
        </div>
      </section>
      <h2>Customer</h2>
      <p><strong>${escapeHtml(invoice.customerName)}</strong></p>
      <p>${escapeHtml(invoice.customerEmail || "Email not provided")}</p>
      <p>${escapeHtml(invoice.customerPhone || "Phone not provided")}</p>
      <h2>Journey</h2>
      <p><strong>${escapeHtml(invoice.route)}</strong></p>
      <p>${escapeHtml(invoice.operatorName)} on ${escapeHtml(invoice.journeyDate)}</p>
      <p>Seats: ${escapeHtml(invoice.seats.join(", "))}</p>
      <h2>Charges</h2>
      <table>
        <thead><tr><th>Description</th><th>Amount</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="total">Total ${formatMoney(invoice.total)}</p>
      <p class="muted">Uploaded to ${escapeHtml(invoice.storagePath)}</p>
    </main>
  </body>
</html>`;
}

function formatMoney(value: Money): string {
  return `${value.currency} ${value.amount.toLocaleString("en-IN")}`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
