import type { Metadata } from "next";

import { LegalDocumentPage } from "../../components/legal-document";
import { refundPolicy } from "../../lib/legal-content";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "How refunds are determined and processed for bookings made through Vriddhi Nexus.",
};

export default function RefundPolicyPage(): React.JSX.Element {
  return <LegalDocumentPage document={refundPolicy} />;
}
