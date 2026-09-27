import { company } from "./legal-content";

/**
 * Customer FAQ, supplied by Vriddhi Nexus. Grouped exactly as issued, and the
 * wording is theirs — several answers are deliberate commitments about payment
 * and refund handling, so treat them like the policy documents rather than
 * site copy and take amendments from the company.
 */

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface FaqGroup {
  title: string;
  entries: FaqEntry[];
}

export const faqGroups: FaqGroup[] = [
  {
    title: "Bus Booking",
    entries: [
      {
        question: "How can I book a bus ticket on Vriddhi Nexus?",
        answer:
          "Search for buses by entering your departure city, destination, and travel date. Select your preferred bus, choose the available seat(s), enter passenger details, complete the payment, and your booking will be confirmed once the transaction and reservation are successfully processed.",
      },
      {
        question: "Can I choose my preferred seat?",
        answer:
          "Yes. You can select from the available seats displayed during the booking process. Seat availability is subject to the bus operator's live inventory.",
      },
      {
        question: "When is my bus ticket confirmed?",
        answer:
          "Your ticket is confirmed only after successful payment and confirmation from the bus operator. Once confirmed, your booking details and ticket/PNR will be displayed and/or sent to your registered contact details.",
      },
      {
        question: "What should I do if my payment is successful but my ticket is not confirmed?",
        answer:
          "Do not make another payment immediately. Check your booking status first. If the payment has been received but the booking has failed, the transaction will be reviewed and the applicable refund process will be initiated.",
      },
      {
        question: "Can the bus fare change while I am booking?",
        answer:
          "Yes. Bus fares and seat availability are controlled by the respective bus operators and may change before the booking is successfully completed.",
      },
      {
        question: "Why did my selected seat become unavailable?",
        answer:
          "Bus inventory is updated in real time. A seat may become unavailable if another customer books it before your transaction is completed.",
      },
      {
        question: "Can I book tickets for more than one passenger?",
        answer:
          "Yes. You can book multiple passengers in a single booking, subject to the maximum passenger limit and seat availability permitted by the respective bus operator.",
      },
      {
        question: "What details should I enter while booking?",
        answer:
          "Please provide accurate passenger information and valid contact details as requested during checkout. Incorrect information may affect your booking or communication regarding your journey.",
      },
      {
        question: "Where can I find my booking details?",
        answer:
          "After a successful booking, your booking ID, bus details, passenger information, boarding details, and ticket/PNR will be available on the booking confirmation page and/or sent through the available communication channels.",
      },
      {
        question: "Can I cancel my bus ticket?",
        answer:
          "Yes, if cancellation is permitted by the respective bus operator. Cancellation eligibility, charges, and refund amount depend on the operator's cancellation policy and the time remaining before departure.",
      },
      {
        question: "Can I partially cancel a booking with multiple passengers?",
        answer:
          "Partial cancellation may be available depending on the bus operator's policy and the booking conditions.",
      },
      {
        question: "Can I change my travel date or seat after booking?",
        answer:
          "Generally, confirmed bookings cannot be directly modified. Depending on the operator's rules, you may need to cancel the existing ticket and make a new booking.",
      },
      {
        question: "What happens if the bus operator cancels the service?",
        answer:
          "If the operator cancels the bus, the booking will be handled according to the operator's cancellation and refund policy. Eligible refunds will be processed to the applicable payment source/method.",
      },
    ],
  },
  {
    title: "Payments",
    entries: [
      {
        question: "What payment methods are accepted?",
        answer:
          "Available payment options will be displayed on the payment page. Depending on the payment facility enabled by Vriddhi Nexus, customers may be able to pay through UPI/QR or other supported methods.",
      },
      {
        question: "How do I pay using a QR code?",
        answer:
          "When the QR payment option is available, scan the QR displayed on the payment page using a supported UPI application, verify the recipient and amount, and complete the payment.",
      },
      {
        question: "Should I refresh or close the page after making the payment?",
        answer:
          "No. After completing the payment, keep the booking page open while the system verifies your transaction and processes the bus booking.",
      },
      {
        question: "Should I pay again if the payment page is taking time to confirm?",
        answer:
          "No. If the amount has already been debited, do not make another payment for the same booking until the status of the original transaction has been verified.",
      },
      {
        question: "My money was debited, but the payment shows as pending. What should I do?",
        answer:
          "Payment confirmation can occasionally be delayed by the bank or UPI network. Please wait for the transaction status to be updated. Avoid making a duplicate payment while the original transaction is being verified.",
      },
      {
        question: "What happens if my payment fails?",
        answer:
          "If the payment fails and no amount is debited, you can try the payment again. If your account was debited despite the transaction showing as failed, the amount may be reversed by your bank/payment provider according to their applicable timelines.",
      },
      {
        question: "What happens if payment succeeds but the bus booking fails?",
        answer:
          "If payment is successfully received but the bus ticket cannot be booked, the transaction will be identified as a failed booking and the eligible amount will be processed for refund in accordance with the applicable refund process.",
      },
      {
        question: "How will I know whether my payment was successful?",
        answer:
          "The booking/payment page will display the transaction status after verification. A successful payment alone does not constitute a confirmed bus ticket; the booking must also be successfully confirmed by the bus operator.",
      },
      {
        question: "Is a payment screenshot considered proof of a successful booking?",
        answer:
          "No. A screenshot of a UPI or bank transaction does not constitute confirmation of a bus booking. Vriddhi Nexus will consider the payment and booking statuses recorded by the applicable systems while processing the reservation.",
      },
      {
        question: "What if I accidentally make the payment twice?",
        answer:
          "If duplicate payments are identified for the same booking, the additional transaction will be reviewed and, where applicable, processed for refund after verification.",
      },
    ],
  },
  {
    title: "Refunds & Cancellations",
    entries: [
      {
        question: "How is my refund amount calculated after cancellation?",
        answer:
          "The refund depends on the bus operator's cancellation policy. Applicable operator cancellation charges and any other disclosed non-refundable charges may be deducted from the amount paid.",
      },
      {
        question: "How long does a refund take?",
        answer:
          "Once a refund is successfully initiated, the time required for the amount to reflect in your account depends on the bank, UPI/payment provider, and applicable banking timelines.",
      },
      {
        question: "Where will my refund be credited?",
        answer:
          "Where technically supported, refunds are generally processed back through the applicable/original payment method. The exact refund mechanism may depend on the payment channel used for the transaction.",
      },
      {
        question: "What if I haven't received my refund?",
        answer:
          "If the applicable refund processing period has passed, contact Vriddhi Nexus support with your Booking ID and payment reference/UTR so the transaction can be checked.",
      },
    ],
  },
  {
    title: "Booking & Payment Safety",
    entries: [
      {
        question: "How can I make sure I am paying Vriddhi Nexus securely?",
        answer:
          "Always make payments through the payment option displayed on the official Vriddhi Nexus website. Verify the payment details shown in your UPI application before authorising the transaction.",
      },
      {
        question: "Will Vriddhi Nexus ask for my UPI PIN or OTP?",
        answer:
          "No. Never share your UPI PIN, OTP, debit/credit card PIN, banking password, or other confidential banking credentials with anyone claiming to represent Vriddhi Nexus.",
      },
      {
        question:
          "What information should I provide when contacting support about a booking or payment?",
        answer:
          "Keep your Vriddhi Nexus Booking/Order ID, registered mobile number/email, travel details, payment amount, transaction date, and UTR/payment reference ready. Never share your UPI PIN, OTP, CVV, or banking password.",
      },
    ],
  },
];

export const faqHelp = {
  title: "Need Help?",
  body: "For assistance regarding a bus booking, payment, cancellation, or refund, contact:",
  legalName: company.legalName,
  website: company.website,
  supportEmail: company.supportEmail,
  note: "When contacting us, please mention your Booking/Order ID so we can locate your transaction quickly.",
};

/** The homepage shows a short selection; the full list lives on /faq. */
export const homepageFaqs: FaqEntry[] = [
  faqGroups[0]!.entries[0]!,
  faqGroups[0]!.entries[2]!,
  faqGroups[0]!.entries[9]!,
  faqGroups[1]!.entries[0]!,
  faqGroups[1]!.entries[4]!,
];
