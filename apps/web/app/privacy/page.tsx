import type { Metadata } from "next";

import { LegalDocumentPage } from "../../components/legal-document";
import { privacyPolicy } from "../../lib/legal-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What personal information Vriddhi Nexus collects, why we collect it, how it is shared and protected, and the choices available to users.",
};

export default function PrivacyPage(): React.JSX.Element {
  return <LegalDocumentPage document={privacyPolicy} />;
}
