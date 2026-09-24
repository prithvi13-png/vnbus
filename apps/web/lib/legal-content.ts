/**
 * Legal documents issued by Vriddhi Nexus Private Limited, reproduced verbatim.
 *
 * Treat the wording as fixed: these are legal documents, not site copy. They
 * are not edited for style, length or tone. Amendments come from the company,
 * and `lastUpdated` must move with them.
 *
 * The same documents are published on the marketing site; both must be changed
 * together so the two domains never state different terms.
 */

export interface LegalBlock {
  body?: string[];
  bullets?: string[];
}

export interface LegalSubsection extends LegalBlock {
  /** Omitted for a continuation block carrying on from the text above it. */
  heading?: string;
}

export interface LegalSection extends LegalBlock {
  heading: string;
  subsections?: LegalSubsection[];
}

export interface LegalDocument {
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

export const company = {
  legalName: "Vriddhi Nexus Private Limited",
  cin: "U79110TS2026PTC221081",
  gstin: "36AAMCV5800E1ZC",
  website: "www.vriddhinexus.com",
  supportEmail: "support@vriddhinexus.com",
  /** GST place of supply, shown on tax invoices. */
  placeOfSupply: "Telangana (36)",
  address:
    "Lorven Smart Spaces, 2nd Floor, Vaishanavi's Cynosure, Cyber Hills, Gachibowli, R.R. District, Telangana – 500032, India.",
  grievanceOfficer: {
    name: "Mettu Sai Prasad",
    email: "saiprasad@vriddhinexus.com",
    phone: "+91 6364096792",
  },
} as const;

export const privacyPolicy: LegalDocument = {
  title: "Privacy Policy",
  effectiveDate: "22 September 2026",
  lastUpdated: "22 September 2026",
  intro:
    "Vriddhi Nexus Private Limited (“Vriddhi Nexus”, “Vriddhi”, “we”, “us” or “our”) respects your privacy and is committed to protecting personal information collected through our website, associated subdomains, applications and services. This Privacy Policy explains what information we collect, why we collect it, how it may be used or shared, how it is protected and the choices available to users. This Privacy Policy applies to www.vriddhinexus.com, associated Vriddhi Nexus travel booking services and other digital services operated by Vriddhi Nexus.",
  sections: [
    {
      heading: "1. Information We May Collect",
      body: [
        "Depending on how you interact with our platform, we may collect the following information.",
      ],
      subsections: [
        {
          heading: "A. Personal and Contact Information",
          body: ["This may include:"],
          bullets: [
            "name;",
            "mobile number;",
            "email address;",
            "address, where required; and",
            "account or profile information.",
          ],
        },
        {
          heading: "B. Passenger and Booking Information",
          body: ["When you make a travel booking, we may collect information such as:"],
          bullets: [
            "passenger name;",
            "age;",
            "gender, where required;",
            "origin and destination;",
            "boarding and drop-off locations;",
            "journey date and time;",
            "seat information;",
            "booking history;",
            "booking ID or PNR; and",
            "special booking information required by the relevant travel service provider.",
          ],
        },
        {
          body: [
            "Where you make a booking for another passenger, you confirm that you are authorised to provide the information necessary for that booking.",
          ],
        },
        {
          heading: "C. Payment and Transaction Information",
          body: [
            "Payments may be processed through authorised third-party payment gateways, banks, UPI providers and financial institutions. Vriddhi Nexus may receive information such as:",
          ],
          bullets: [
            "payment status;",
            "transaction ID;",
            "payment method;",
            "refund status; and",
            "masked payment information.",
          ],
        },
        {
          body: [
            "Sensitive authentication details such as UPI PINs, CVVs and banking passwords should never be provided directly to Vriddhi Nexus. Payment credentials are generally processed through the relevant authorised payment service provider.",
          ],
        },
        {
          heading: "D. Device and Technical Information",
          body: ["When you access our services, we may automatically receive information such as:"],
          bullets: [
            "IP address;",
            "device type;",
            "browser type;",
            "operating system;",
            "device identifiers;",
            "date and time of access;",
            "pages visited;",
            "referring URLs;",
            "application or website interaction data;",
            "crash information; and",
            "security logs.",
          ],
        },
        {
          heading: "E. Communication Information",
          body: ["When you contact us, we may retain information contained in:"],
          bullets: [
            "emails;",
            "customer support requests;",
            "grievance submissions;",
            "telephone interactions, where recorded in accordance with applicable requirements;",
            "feedback; and",
            "other communications.",
          ],
        },
      ],
    },
    {
      heading: "2. How We Use Personal Information",
      body: ["We may process personal information for purposes including:"],
      bullets: [
        "creating and maintaining user accounts;",
        "searching and displaying travel options;",
        "processing bus and other travel bookings;",
        "issuing booking confirmations and tickets;",
        "communicating booking information;",
        "processing cancellations and refunds;",
        "providing customer support;",
        "resolving complaints and grievances;",
        "processing payments;",
        "detecting and preventing fraud;",
        "maintaining platform security;",
        "improving our services;",
        "maintaining transaction records;",
        "complying with tax, accounting and legal requirements;",
        "responding to lawful requests from authorities;",
        "preventing misuse of the platform; and",
        "sending service-related notifications.",
      ],
      subsections: [
        {
          body: [
            "Where permitted and where appropriate consent or another lawful basis exists, we may also use information for:",
          ],
          bullets: [
            "offers;",
            "promotional communications;",
            "service recommendations; and",
            "marketing campaigns.",
          ],
        },
        {
          body: [
            "Users may opt out of promotional communications through the mechanisms made available by Vriddhi Nexus. Essential transactional communications relating to active bookings, security or account administration may still be sent.",
          ],
        },
      ],
    },
    {
      heading: "3. Legal and Regulatory Framework",
      body: [
        "Vriddhi Nexus processes personal information in accordance with applicable Indian law. This may include, where applicable:",
      ],
      bullets: [
        "the Information Technology Act, 2000;",
        "applicable rules governing reasonable security practices and personal information;",
        "the Digital Personal Data Protection Act, 2023 and rules made under it, as and when the relevant provisions become applicable; and",
        "other applicable Indian laws and regulatory requirements.",
      ],
      subsections: [
        {
          body: [
            "As India's personal-data protection framework continues through its notified implementation schedule, Vriddhi Nexus may update this Privacy Policy and its data-handling practices accordingly.",
          ],
        },
      ],
    },
    {
      heading: "4. Sharing of Information",
      body: [
        "To provide our services, personal information may need to be shared with third parties. These may include:",
      ],
      subsections: [
        {
          heading: "Travel Service Providers",
          body: ["Information necessary for a booking may be shared with:"],
          bullets: [
            "bus operators;",
            "travel operators;",
            "booking aggregators;",
            "API providers; and",
            "other travel service partners.",
          ],
        },
        {
          body: [
            "For example, passenger names and travel details may need to be transmitted to the relevant operator to issue and service a ticket.",
          ],
        },
        {
          heading: "Payment Service Providers",
          body: ["Transaction information may be processed through:"],
          bullets: [
            "payment gateways;",
            "banks;",
            "UPI providers;",
            "card networks; and",
            "other authorised financial service providers.",
          ],
        },
        {
          heading: "Technology and Service Providers",
          body: ["We may use service providers for functions such as:"],
          bullets: [
            "cloud hosting;",
            "database management;",
            "SMS;",
            "email;",
            "WhatsApp or communication services;",
            "analytics;",
            "cybersecurity;",
            "customer support; and",
            "fraud prevention.",
          ],
        },
        {
          body: [
            "Such providers receive information only as reasonably necessary for the services they perform and are expected to handle information in accordance with applicable contractual and legal requirements.",
          ],
        },
      ],
    },
    {
      heading: "5. Disclosure Required by Law",
      body: ["Vriddhi Nexus may disclose information where reasonably necessary to:"],
      bullets: [
        "comply with applicable laws;",
        "comply with court orders;",
        "respond to lawful government requests;",
        "assist law enforcement authorities;",
        "investigate fraud or cybercrime;",
        "protect the safety of users;",
        "protect our legal rights; or",
        "enforce our Terms & Conditions.",
      ],
    },
    {
      heading: "6. Business Transfers",
      body: [
        "If Vriddhi Nexus undergoes a merger, acquisition, restructuring, investment, sale of business or transfer of assets, personal information may be transferred as part of that transaction, subject to applicable law and appropriate safeguards.",
      ],
    },
    {
      heading: "7. Cookies and Similar Technologies",
      body: ["Our website may use cookies and similar technologies to:"],
      bullets: [
        "maintain sessions;",
        "remember preferences;",
        "improve website performance;",
        "understand website usage;",
        "detect suspicious activity;",
        "support analytics; and",
        "improve user experience.",
      ],
      subsections: [
        {
          body: [
            "Some cookies may be necessary for the proper functioning of the website. Where required by applicable law, users will be provided with appropriate choices regarding non-essential cookies. Users may also manage cookies through their browser settings. Disabling certain cookies may affect website functionality.",
          ],
        },
      ],
    },
    {
      heading: "8. Analytics",
      body: [
        "Vriddhi Nexus may use analytics tools to understand how users interact with the website and services. Analytics may include information relating to:",
      ],
      bullets: [
        "page visits;",
        "navigation patterns;",
        "device information;",
        "session duration;",
        "general geographic information derived from technical data; and",
        "interaction with platform features.",
      ],
      subsections: [
        {
          body: [
            "Where possible and appropriate, analytics information may be aggregated or de-identified.",
          ],
        },
      ],
    },
    {
      heading: "9. Data Retention",
      body: [
        "We retain personal information only for as long as reasonably necessary for the purposes for which it was collected or as required by applicable law. Retention periods may depend on factors such as:",
      ],
      bullets: [
        "booking and transaction requirements;",
        "tax and accounting obligations;",
        "fraud prevention;",
        "customer support;",
        "disputes;",
        "legal claims;",
        "statutory record-keeping requirements; and",
        "security requirements.",
      ],
      subsections: [
        {
          body: [
            "When information is no longer reasonably required, it may be securely deleted, anonymised or otherwise disposed of in accordance with applicable requirements.",
          ],
        },
      ],
    },
    {
      heading: "10. Data Security",
      body: [
        "Vriddhi Nexus implements reasonable technical and organisational safeguards designed to protect personal information against risks such as:",
      ],
      bullets: [
        "unauthorised access;",
        "unauthorised disclosure;",
        "alteration;",
        "misuse;",
        "accidental loss; and",
        "destruction.",
      ],
      subsections: [
        {
          body: ["Measures may include, where appropriate:"],
          bullets: [
            "encryption;",
            "restricted access;",
            "authentication controls;",
            "monitoring;",
            "backups;",
            "secure hosting;",
            "cybersecurity controls; and",
            "access management.",
          ],
        },
        {
          body: [
            "However, no internet transmission or electronic storage system can be guaranteed to be completely secure. Users are responsible for maintaining the confidentiality of their account credentials and should notify us promptly if they suspect unauthorised activity.",
          ],
        },
      ],
    },
    {
      heading: "11. Data Breach Management",
      body: [
        "If Vriddhi Nexus becomes aware of a personal-data breach affecting users, we will assess and respond to the incident in accordance with applicable law. Where legally required, affected individuals and/or relevant regulatory authorities will be notified in the prescribed manner.",
      ],
    },
    {
      heading: "12. Children's Privacy",
      body: [
        "Vriddhi Nexus's transactional services are intended to be used by persons legally capable of entering into contracts. A parent, guardian or authorised adult may make travel bookings for children or minors.",
        "Where information relating to a child is required for a booking, it should be provided by or with the authority of the child's parent or lawful guardian. We will implement additional consent and child-data safeguards where required under applicable data-protection law.",
      ],
    },
    {
      heading: "13. Your Privacy Choices and Rights",
      body: [
        "Depending on the law applicable at the relevant time, users may have rights relating to their personal information, including the ability to:",
      ],
      bullets: [
        "request information about personal data being processed;",
        "request correction of inaccurate information;",
        "request completion or updating of information;",
        "request erasure where legally permitted;",
        "withdraw consent where processing is based upon consent;",
        "raise grievances regarding personal-data processing; and",
        "exercise other rights provided by applicable law.",
      ],
      subsections: [
        {
          body: [
            "Withdrawal of consent will not affect processing already lawfully undertaken before withdrawal. Certain information may need to be retained where required for legal, tax, fraud-prevention, accounting, contractual or dispute-resolution purposes.",
            `Requests may be submitted to: Email: ${company.supportEmail}`,
            "We may need to verify the identity of the person making a request before acting on it.",
          ],
        },
      ],
    },
    {
      heading: "14. Cross-Border Processing",
      body: [
        "Some of our technology, cloud or service providers may process information using infrastructure located outside India. Where personal information is transferred or processed outside India, Vriddhi Nexus will take reasonable measures to ensure that such processing is conducted in accordance with applicable Indian law, including any restrictions notified by the Government of India.",
      ],
    },
    {
      heading: "15. Third-Party Websites and Services",
      body: [
        "Our website may contain links to websites or services operated independently by third parties. Those third parties may have their own privacy policies and data-handling practices.",
        "Vriddhi Nexus is not responsible for the independent privacy practices of external websites or services. Users should review the relevant privacy policies before providing information directly to third parties.",
      ],
    },
    {
      heading: "16. Marketing Communications",
      body: ["Where permitted, Vriddhi Nexus may send users information about:"],
      bullets: [
        "offers;",
        "discounts;",
        "new services;",
        "travel promotions; and",
        "other relevant updates.",
      ],
      subsections: [
        {
          body: [
            "Users may unsubscribe from promotional communications using the unsubscribe or preference mechanism provided or by contacting us. Opting out of marketing communications will not prevent us from sending essential transactional, booking, security or legal notifications.",
          ],
        },
      ],
    },
    {
      heading: "17. Changes to This Privacy Policy",
      body: ["We may update this Privacy Policy periodically to reflect:"],
      bullets: [
        "changes to our services;",
        "changes in technology;",
        "regulatory developments;",
        "legal requirements; or",
        "changes in our data-handling practices.",
      ],
      subsections: [
        {
          body: [
            "The revised Privacy Policy will be published on our website with an updated “Last Updated” date. Where required by law, additional notice or consent will be provided.",
          ],
        },
      ],
    },
    {
      heading: "18. Grievance Officer",
      body: [
        "For privacy-related complaints or other grievances, please contact:",
        `Grievance Officer: ${company.grievanceOfficer.name}`,
        `Company: ${company.legalName}`,
        `Email: ${company.grievanceOfficer.email}`,
        `Phone: ${company.grievanceOfficer.phone}`,
        `Address: ${company.address}`,
        "We will address grievances within the timelines required by applicable law.",
      ],
    },
    {
      heading: "19. Contact Us",
      body: [
        "For privacy questions, requests or general assistance:",
        company.legalName,
        `Website: ${company.website}`,
        `Support Email: ${company.supportEmail}`,
        `Address: ${company.address}`,
      ],
    },
  ],
};

export const termsAndConditions: LegalDocument = {
  title: "Terms & Conditions",
  effectiveDate: "22 September 2026",
  lastUpdated: "22 September 2026",
  intro:
    "Welcome to Vriddhi Nexus Private Limited. These Terms & Conditions (\u201cTerms\u201d) govern your access to and use of www.vriddhinexus.com, its associated subdomains, applications, booking interfaces and services operated by Vriddhi Nexus Private Limited (\u201cVriddhi Nexus\u201d, \u201cVriddhi\u201d, \u201cwe\u201d, \u201cus\u201d or \u201cour\u201d). By accessing our website, creating an account, making a booking or using any of our services, you acknowledge that you have read, understood and agreed to these Terms. If you do not agree with these Terms, you should not use our services.",
  sections: [
    {
      heading: "1. About Vriddhi Nexus",
      body: [
        "Vriddhi Nexus Private Limited is a company incorporated under the Companies Act, 2013.",
        `Website: ${company.website}`,
        `CIN: ${company.cin}`,
        `Registered/Business Address: ${company.address}`,
        "Vriddhi Nexus provides technology-enabled services including online travel booking and related digital services. At present, bus booking services may be available through our platform. Additional services such as flight, train, car and other travel-related bookings may be introduced in the future.",
        "Certain IT and technology services displayed on the website may be governed by separate proposals, quotations, service agreements or commercial contracts.",
      ],
    },
    {
      heading: "2. Nature of Our Travel Booking Platform",
      body: [
        "Vriddhi Nexus operates as a technology platform that enables users to search, compare and book travel services made available by bus operators, travel service providers, aggregators, API providers and other third-party partners.",
        "Unless specifically stated otherwise, Vriddhi Nexus:",
      ],
      bullets: [
        "does not own or operate buses;",
        "does not employ drivers or other personnel of transport operators;",
        "does not control the actual operation of a bus service;",
        "does not determine vehicle condition, driver behaviour or operational decisions of transport operators; and",
        "acts primarily as a facilitator of travel reservations between the user and the relevant travel service provider.",
      ],
      subsections: [
        {
          body: [
            "The actual transportation service is provided by the respective operator or service provider.",
          ],
        },
      ],
    },
    {
      heading: "3. Eligibility",
      body: [
        "You must be legally capable of entering into a binding contract under applicable Indian law to independently transact through the platform.",
        "Users below 18 years of age should use the platform only through or under the supervision of a parent or legal guardian. A parent, guardian or other authorised adult may make bookings for minors or other passengers.",
      ],
    },
    {
      heading: "4. User Information",
      body: [
        "You agree to provide accurate and complete information when making a booking, including information such as:",
      ],
      bullets: [
        "passenger name;",
        "age;",
        "gender, where required;",
        "mobile number;",
        "email address;",
        "boarding point;",
        "destination or drop-off point; and",
        "any identification information required by the applicable operator or law.",
      ],
      subsections: [
        {
          body: [
            "Vriddhi Nexus will not be responsible for booking issues arising from incorrect information provided by the user. You are responsible for verifying all passenger and journey information before confirming payment.",
          ],
        },
      ],
    },
    {
      heading: "5. Search Results and Availability",
      body: [
        "Bus routes, schedules, seat availability, fares, boarding locations, amenities and other information displayed on the platform may be obtained from bus operators, aggregators, API providers or other third parties. Availability may change in real time.",
        "Information displayed during a search does not constitute a confirmed reservation. A booking is considered confirmed only after successful completion of the booking process and generation of an appropriate booking confirmation, ticket, booking reference or PNR.",
      ],
    },
    {
      heading: "6. Prices, Taxes and Charges",
      body: ["The total amount payable for a booking may include:"],
      bullets: [
        "base fare;",
        "applicable taxes;",
        "operator charges;",
        "platform or convenience fees;",
        "payment processing charges, where applicable;",
        "insurance or optional services selected by the user; and",
        "other charges clearly disclosed before payment.",
      ],
      subsections: [
        {
          body: [
            "Where applicable, the fare and charges displayed before final payment will constitute the price applicable to that transaction.",
            "Travel fares may be dynamic and may change depending upon availability, demand, operator pricing and other factors. A fare displayed during an earlier search is not guaranteed until the booking is successfully confirmed.",
          ],
        },
      ],
    },
    {
      heading: "7. Payments",
      body: [
        "Payments may be processed through authorised banks, payment gateways, UPI providers or other third-party payment service providers. Users must use valid and legally authorised payment methods.",
        "Vriddhi Nexus is not responsible for failures caused by:",
      ],
      bullets: [
        "banks;",
        "UPI service providers;",
        "card networks;",
        "payment gateways;",
        "telecommunications networks; or",
        "other third-party payment infrastructure.",
      ],
      subsections: [
        {
          body: [
            "If payment is debited but a booking is not confirmed, Vriddhi Nexus will verify the transaction with the relevant payment and booking partners. Where a refund is applicable, it will be initiated in accordance with the applicable payment, banking and refund procedures.",
            "The time required for the refunded amount to appear in a user's account may depend upon the bank, card issuer, UPI provider or payment gateway.",
          ],
        },
      ],
    },
    {
      heading: "8. Booking Confirmation",
      body: [
        "Users should not consider a reservation confirmed merely because payment has been debited.",
        "A reservation is confirmed when a valid booking confirmation, ticket, booking ID or PNR is generated and communicated through the website, email, SMS, WhatsApp or another available communication channel.",
        "Users are responsible for checking the booking details immediately after confirmation. Any discrepancy should be reported to Vriddhi Nexus as soon as reasonably possible.",
      ],
    },
    {
      heading: "9. Boarding and Travel",
      body: ["Passengers are responsible for:"],
      bullets: [
        "reaching the boarding point on time;",
        "carrying the booking confirmation or ticket;",
        "carrying valid identification where required;",
        "complying with operator rules;",
        "complying with baggage restrictions;",
        "maintaining appropriate conduct during the journey; and",
        "following applicable laws and safety instructions.",
      ],
      subsections: [
        {
          body: [
            "Failure to arrive at the boarding point within the time prescribed by the operator may be treated as a no-show and may result in forfeiture of the booking amount in accordance with the operator's policy.",
          ],
        },
      ],
    },
    {
      heading: "10. Cancellation by the User",
      body: ["Cancellation eligibility and charges may vary depending upon:"],
      bullets: [
        "bus operator;",
        "route;",
        "fare type;",
        "time remaining before departure;",
        "promotional conditions; and",
        "other conditions applicable to the booking.",
      ],
      subsections: [
        {
          body: [
            "The applicable cancellation conditions should be displayed during or before booking wherever provided by the operator or booking partner.",
            "Any refund following cancellation will be calculated in accordance with the applicable cancellation policy. Certain platform charges, payment charges, promotional amounts or convenience fees may be non-refundable where permitted by law and where disclosed to the user.",
          ],
        },
      ],
    },
    {
      heading: "11. Cancellation or Modification by the Operator",
      body: [
        "Bus operators may cancel, postpone, reschedule or modify a service because of circumstances including:",
      ],
      bullets: [
        "operational requirements;",
        "vehicle breakdown;",
        "traffic;",
        "road conditions;",
        "government restrictions;",
        "strikes;",
        "weather;",
        "safety concerns;",
        "force majeure events; or",
        "other circumstances beyond Vriddhi Nexus's reasonable control.",
      ],
      subsections: [
        {
          body: [
            "Where an operator cancels a journey and confirms refund eligibility, Vriddhi Nexus will facilitate the applicable refund based on information and funds received or authorised by the relevant operator, aggregator or payment partner.",
            "Where available, alternative services may be offered, but availability cannot be guaranteed.",
          ],
        },
      ],
    },
    {
      heading: "12. Changes in Vehicle, Seat or Boarding Point",
      body: ["Operators may occasionally change:"],
      bullets: [
        "vehicle type;",
        "seat allocation;",
        "boarding point;",
        "departure time;",
        "arrival time;",
        "amenities; or",
        "other operational details.",
      ],
      subsections: [
        {
          body: [
            "Vriddhi Nexus will endeavour to communicate material changes when such information is received from the relevant service provider. Operational decisions remain the responsibility of the relevant transport operator.",
          ],
        },
      ],
    },
    {
      heading: "13. Refunds",
      body: [
        "Refund eligibility is determined based on the circumstances of the booking and the applicable operator, cancellation or payment policy.",
        "Once approved and initiated, refunds will generally be processed back to the original payment method unless another method is required or permitted.",
        "Actual credit timelines depend on banks, payment gateways, card networks and UPI service providers and may therefore vary. Users should contact our support team if an approved refund has not been received within the expected banking or payment-provider timeline.",
      ],
    },
    {
      heading: "14. Offers, Coupons and Promotional Codes",
      body: [
        "Vriddhi Nexus may periodically offer discounts, coupons, cashback or promotional offers. Each promotion may have separate eligibility criteria and terms.",
        "Promotional benefits may:",
      ],
      bullets: [
        "be limited to specified users;",
        "have minimum transaction requirements;",
        "be available for limited periods;",
        "be restricted to specified routes or operators; and",
        "not be transferable or exchangeable for cash.",
      ],
      subsections: [
        {
          body: [
            "Vriddhi Nexus reserves the right to withdraw or modify promotional offers where permitted by law. Fraudulent or abusive use of promotional offers may result in cancellation of the benefit or suspension of the relevant account.",
          ],
        },
      ],
    },
    {
      heading: "15. Third-Party Services",
      body: ["Our platform may rely upon or contain links to third-party services including:"],
      bullets: [
        "bus operators;",
        "travel aggregators;",
        "payment gateways;",
        "banks;",
        "maps;",
        "authentication services;",
        "communication providers;",
        "analytics providers; and",
        "other technology platforms.",
      ],
      subsections: [
        {
          body: [
            "Third-party products and services may be governed by their own terms and privacy policies. Vriddhi Nexus does not control third-party websites or systems and is not responsible for their independent practices.",
          ],
        },
      ],
    },
    {
      heading: "16. User Conduct",
      body: ["Users must not:"],
      bullets: [
        "provide false information;",
        "make fraudulent bookings;",
        "use stolen or unauthorised payment methods;",
        "attempt to gain unauthorised access to the platform;",
        "interfere with platform security;",
        "scrape or extract platform data without authorisation;",
        "reverse engineer the platform;",
        "misuse promotional offers;",
        "transmit malicious software;",
        "impersonate another person; or",
        "use the platform for unlawful activities.",
      ],
      subsections: [
        {
          body: [
            "We may restrict or suspend access where we reasonably believe misuse, fraud or unlawful activity has occurred.",
          ],
        },
      ],
    },
    {
      heading: "17. Intellectual Property",
      body: ["All rights relating to the Vriddhi Nexus platform, including its:"],
      bullets: [
        "brand name;",
        "logo;",
        "website design;",
        "software;",
        "interfaces;",
        "graphics;",
        "databases;",
        "proprietary content; and",
        "technology,",
      ],
      subsections: [
        {
          body: [
            "belong to Vriddhi Nexus or its respective licensors unless otherwise indicated.",
            "Users may not reproduce, distribute, modify or commercially exploit such material without prior written permission. Third-party trademarks and brand names remain the property of their respective owners.",
          ],
        },
      ],
    },
    {
      heading: "18. Disclaimer",
      body: [
        "Vriddhi Nexus endeavours to provide accurate and reliable information. However, certain information is supplied by third-party travel service providers.",
        "To the extent permitted by applicable law, Vriddhi Nexus does not independently guarantee:",
      ],
      bullets: [
        "punctuality of buses;",
        "vehicle condition;",
        "behaviour of operator personnel;",
        "availability of specific amenities;",
        "route changes;",
        "uninterrupted travel;",
        "actual arrival time; or",
        "performance of services controlled by third-party operators.",
      ],
      subsections: [
        {
          body: [
            "Nothing in these Terms excludes any right or remedy available to a consumer that cannot legally be excluded under applicable law.",
          ],
        },
      ],
    },
    {
      heading: "19. Limitation of Liability",
      body: [
        "To the maximum extent permitted by applicable law, Vriddhi Nexus will not be responsible for indirect, incidental or consequential loss arising solely from circumstances outside its reasonable control or from the independent acts or omissions of third-party service providers.",
        "Where liability cannot legally be excluded, Vriddhi Nexus's liability will be determined in accordance with applicable law and the circumstances of the relevant transaction.",
        "Nothing in these Terms limits liability or consumer rights where such limitation is prohibited by law.",
      ],
    },
    {
      heading: "20. Force Majeure",
      body: [
        "Vriddhi Nexus will not be liable for a failure or delay caused by events beyond its reasonable control, including:",
      ],
      bullets: [
        "natural disasters;",
        "floods;",
        "earthquakes;",
        "epidemics or pandemics;",
        "war;",
        "civil unrest;",
        "government restrictions;",
        "strikes;",
        "telecommunications failures;",
        "internet outages;",
        "power failures; or",
        "other comparable circumstances.",
      ],
    },
    {
      heading: "21. Account Suspension and Termination",
      body: [
        "Vriddhi Nexus may suspend or terminate an account where there is reasonable evidence of:",
      ],
      bullets: [
        "fraud;",
        "misuse;",
        "violation of these Terms;",
        "unlawful activity;",
        "payment abuse;",
        "cybersecurity risk; or",
        "conduct that threatens the platform or other users.",
      ],
      subsections: [
        {
          body: [
            "Where appropriate and legally required, users will be informed of relevant action.",
          ],
        },
      ],
    },
    {
      heading: "22. Privacy",
      body: [
        "Personal information collected through the platform will be handled in accordance with our Privacy Policy and applicable Indian law.",
        "By using our platform, you acknowledge that certain personal information must be shared with the relevant bus operator, booking partner, payment provider or service provider for the purpose of completing and servicing your booking.",
      ],
    },
    {
      heading: "23. Grievance Redressal",
      body: [
        "For complaints or grievances relating to services provided through the platform, users may contact:",
        `Grievance Officer: ${company.grievanceOfficer.name}`,
        `Company: ${company.legalName}`,
        `Email: ${company.grievanceOfficer.email}`,
        `Phone: ${company.grievanceOfficer.phone}`,
        `Website: ${company.website}`,
        "We will endeavour to acknowledge consumer grievances within 48 hours and resolve them within the period prescribed under applicable law.",
        `General support queries may be addressed to: Email: ${company.supportEmail}`,
      ],
    },
    {
      heading: "24. Governing Law and Jurisdiction",
      body: [
        "These Terms are governed by the laws of India.",
        "Subject to mandatory consumer protection and other statutory jurisdiction requirements, disputes relating to these Terms or the platform will be subject to the jurisdiction of the competent courts in Hyderabad, Telangana.",
        "Nothing in this provision restricts any statutory right available to a consumer under applicable law.",
      ],
    },
    {
      heading: "25. Changes to These Terms",
      body: ["Vriddhi Nexus may modify these Terms from time to time to reflect:"],
      bullets: [
        "changes in services;",
        "changes in business practices;",
        "legal or regulatory requirements; or",
        "security and operational requirements.",
      ],
      subsections: [
        {
          body: [
            "The revised Terms will be published on the website along with the updated effective or revision date. Continued use of the platform after the revised Terms become effective constitutes acceptance to the extent permitted by applicable law.",
          ],
        },
      ],
    },
    {
      heading: "26. Contact Us",
      body: [
        "For questions regarding these Terms:",
        company.legalName,
        company.address,
        `Website: ${company.website}`,
        `Email: ${company.supportEmail}`,
      ],
    },
  ],
};

/**
 * Cancellation and Refund policies. Unlike the Privacy Policy and Terms above,
 * these were not issued as standalone documents by the company — they restate
 * what the Terms already commit to (sections 9, 10, 11 and 13) so customers can
 * find those rules under the headings they look for.
 *
 * They therefore must not add commitments the Terms do not make. In particular
 * they state no fixed cancellation percentages and no guaranteed refund window,
 * because the Terms leave both to the operator and the payment provider. If the
 * company later issues its own signed documents, replace these wholesale.
 */
export const cancellationPolicy: LegalDocument = {
  title: "Cancellation Policy",
  effectiveDate: "22 September 2026",
  lastUpdated: "22 September 2026",
  intro:
    "How to cancel a booking made through Vriddhi Nexus and what determines the charge. This policy restates the cancellation terms in our Terms & Conditions; where the two differ, the Terms & Conditions prevail.",
  sections: [
    {
      heading: "1. Scope of This Policy",
      body: [
        "This policy covers bookings made through the Vriddhi Nexus platform. It explains how a booking can be cancelled and what determines the amount deducted. How the remaining amount is returned to you is covered in our Refund Policy.",
        "Travel is provided by independent operators. The cancellation conditions applicable to your booking are set by the relevant operator or booking partner and are displayed during or before booking wherever provided.",
      ],
    },
    {
      heading: "2. How to Cancel a Booking",
      body: ["You can cancel from the platform, or by contacting us with your booking ID or PNR."],
      bullets: [
        "Sign in and open Bookings, select the booking, and choose to cancel it.",
        "Guests who booked without an account can use the booking ID or PNR from the confirmation email.",
        `Email ${company.supportEmail} quoting your booking ID or PNR.`,
        "A cancellation takes effect only once we confirm it. A request that has not been confirmed has not been cancelled.",
      ],
    },
    {
      heading: "3. Cancellation Charges",
      body: ["Cancellation eligibility and charges may vary depending upon:"],
      bullets: [
        "bus operator;",
        "route;",
        "fare type;",
        "time remaining before departure;",
        "promotional conditions; and",
        "other conditions applicable to the booking.",
      ],
      subsections: [
        {
          body: [
            "The applicable cancellation conditions should be displayed during or before booking wherever provided by the operator or booking partner. Please check them before confirming payment.",
            "Certain platform charges, payment charges, promotional amounts or convenience fees may be non-refundable where permitted by law and where disclosed to you.",
          ],
        },
      ],
    },
    {
      heading: "4. Cancellation or Modification by the Operator",
      body: [
        "Operators may cancel, postpone, reschedule or modify a service for operational, traffic, weather, regulatory, safety or other reasons beyond our reasonable control.",
        "Where an operator cancels a journey and confirms refund eligibility, Vriddhi Nexus will facilitate the applicable refund based on information and funds received or authorised by the relevant operator, aggregator or payment partner. Where available, alternative services may be offered, but availability cannot be guaranteed.",
      ],
    },
    {
      heading: "5. No-Show",
      body: [
        "Failure to arrive at the boarding point within the time prescribed by the operator may be treated as a no-show and may result in forfeiture of the booking amount in accordance with the operator's policy.",
        "Please reach the boarding point on time and carry your ticket together with valid identification where required.",
      ],
    },
    {
      heading: "6. Refunds Following Cancellation",
      body: [
        "Any refund following cancellation will be calculated in accordance with the applicable cancellation policy and processed as described in our Refund Policy.",
      ],
    },
    {
      heading: "7. Changes to This Policy",
      body: [
        "We may update this policy from time to time. The version published when you make a booking is the one that applies to that booking.",
      ],
    },
    {
      heading: "8. Contact Us",
      body: [
        "For cancellation queries:",
        company.legalName,
        `Email: ${company.supportEmail}`,
        `Website: ${company.website}`,
      ],
    },
  ],
};

export const refundPolicy: LegalDocument = {
  title: "Refund Policy",
  effectiveDate: "22 September 2026",
  lastUpdated: "22 September 2026",
  intro:
    "How refunds are determined and processed for bookings made through Vriddhi Nexus. This policy restates the refund terms in our Terms & Conditions; where the two differ, the Terms & Conditions prevail.",
  sections: [
    {
      heading: "1. Scope of This Policy",
      body: [
        "This policy explains how money is returned to you after a booking made through the Vriddhi Nexus platform is cancelled, or where a payment did not result in a confirmed booking. What it costs to cancel is covered in our Cancellation Policy.",
      ],
    },
    {
      heading: "2. How a Refund Is Determined",
      body: [
        "Refund eligibility is determined based on the circumstances of the booking and the applicable operator, cancellation or payment policy.",
        "Certain platform charges, payment charges, promotional amounts or convenience fees may be non-refundable where permitted by law and where disclosed to you.",
      ],
    },
    {
      heading: "3. Refund Processing",
      body: [
        "Once approved and initiated, refunds will generally be processed back to the original payment method unless another method is required or permitted.",
      ],
    },
    {
      heading: "4. Refund Timelines",
      body: [
        "Actual credit timelines depend on banks, payment gateways, card networks and UPI service providers and may therefore vary. Once we have initiated a refund, the time taken for it to appear in your account is controlled by those providers rather than by us.",
        "Please contact our support team if an approved refund has not been received within the expected banking or payment-provider timeline.",
      ],
    },
    {
      heading: "5. Payment Debited but Booking Not Confirmed",
      body: [
        "You should not consider a reservation confirmed merely because payment has been debited. A reservation is confirmed when a valid booking confirmation, ticket, booking ID or PNR is generated and communicated to you.",
        "If payment is debited but a booking is not confirmed, Vriddhi Nexus will verify the transaction with the relevant payment and booking partners. Where a refund is applicable, it will be initiated in accordance with the applicable payment, banking and refund procedures.",
      ],
    },
    {
      heading: "6. Where the Operator Cancels",
      body: [
        "Where an operator cancels a journey and confirms refund eligibility, Vriddhi Nexus will facilitate the applicable refund based on information and funds received or authorised by the relevant operator, aggregator or payment partner.",
      ],
    },
    {
      heading: "7. How to Raise a Refund Query",
      body: [
        `Write to ${company.supportEmail} with your booking ID or PNR and the date of cancellation. We will tell you the status of the refund and the reference under which it was processed.`,
        "Consumer grievances may also be raised with our Grievance Officer, whose details appear in our Terms & Conditions.",
      ],
    },
    {
      heading: "8. Changes to This Policy",
      body: [
        "We may update this policy from time to time. The version published when you make a booking is the one that applies to that booking.",
      ],
    },
    {
      heading: "9. Contact Us",
      body: [
        "For refund queries:",
        company.legalName,
        `Email: ${company.supportEmail}`,
        `Website: ${company.website}`,
      ],
    },
  ],
};
