import type { Metadata } from "next";

import { LegalDocumentPage } from "../../components/legal-document";
import { cancellationPolicy } from "../../lib/legal-content";

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description: "How to cancel a booking made through Vriddhi Nexus and what determines the charge.",
};

export default function CancellationPolicyPage(): React.JSX.Element {
  return <LegalDocumentPage document={cancellationPolicy} />;
}
