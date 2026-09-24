import type { Metadata } from "next";

import { LegalDocumentPage } from "../../components/legal-document";
import { termsAndConditions } from "../../lib/legal-content";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms governing access to and use of the Vriddhi Nexus website, booking interfaces and services.",
};

export default function TermsPage(): React.JSX.Element {
  return <LegalDocumentPage document={termsAndConditions} />;
}
