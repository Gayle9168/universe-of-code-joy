import type { LegalDocument } from "./types";

/**
 * Algora — Privacy Policy Document
 *
 * SPECIFICATION REFERENCES:
 * - S10.7: "Legal pages are real content, not placeholder text."
 * - S6.7: "/privacy page — Real privacy policy explaining local storage usage, zero-cookie tracking."
 * - S5.8, S11.5 (R-9, R-10): Technical integrity, local storage privacy, data portability.
 */
export const PRIVACY_POLICY: LegalDocument = {
  id: "privacy",
  title: "Privacy Policy",
  subtitle:
    "How Algora protects your personal data, honors local-first privacy, and never sells your learning history.",
  version: "2.4.0",
  effectiveDate: "2026-08-01",
  lastUpdated: "2026-08-04",
  summaryMarkdown:
    "Algora is built on a **local-first architecture**. Your algorithm progress, code solutions, streaks, and preferences reside directly in your browser's `localStorage`. We do not deploy third-party advertising trackers, we do not sell your personal data, and we provide one-click full data export and instant erasure at any time.",
  sections: [
    {
      id: "philosophy",
      title: "1. Privacy Philosophy & Local-First Architecture",
      summary: "We believe educational tools should teach computer science, not surveil learners.",
      contentMarkdown:
        "At Algora, we operate under a strict principle of data minimization. Unlike traditional learning platforms that pipe every keystroke and mouse movement to centralized analytics brokers, Algora is engineered with a **local-first runtime**.\n\nYour active algorithm step state, quiz attempts, coding challenge solutions, XP gains, and daily streaks are calculated and stored directly on your device. When you use Algora in guest mode, zero telemetry or personal identifiers ever leave your browser.",
    },
    {
      id: "local-storage",
      title: "2. Browser Storage & Local State Management",
      summary:
        "Detailed disclosure of keys stored in your browser's local storage and their specific purposes.",
      contentMarkdown:
        "To deliver instantaneous visualizer playback, offline study continuity, and personalized learning trajectories, Algora utilizes the following standard browser `localStorage` keys:",
      subsections: [
        {
          id: "storage-progress",
          title: "2.1 `algora-progress` (Core Learning State)",
          contentMarkdown:
            "Stores your current learner level, total XP, algorithm mastery statuses, completed lesson slugs, solved problem challenge IDs, quiz response histories, active streak counts, timezone offsets, and weekly league points. This state is synchronized to our encrypted cloud store only if you explicitly create an account.",
        },
        {
          id: "storage-prefs",
          title: "2.2 `algora-prefs` (User Interface Preferences)",
          contentMarkdown:
            "Stores your local interface configurations including playback speed multiplier (0.5x to 3x), narration toggle, sound effect volume, reduced-motion preferences, quiet hours scheduling, and billing tier cache.",
        },
        {
          id: "storage-auth",
          title: "2.3 `algora-auth` (Authentication Session Token)",
          contentMarkdown:
            "If logged in, stores a secure, short-lived JSON Web Token (JWT) issued over TLS 1.3 to authenticate requests to your cloud backup. Guest users have no auth token stored.",
        },
      ],
    },
    {
      id: "zero-tracking",
      title: "3. Zero Third-Party Advertising & Cookie Policy",
      summary: "No Google Analytics, no Meta pixels, no cross-site advertising networks.",
      contentMarkdown:
        "Algora does not use third-party advertising cookies, behavioral retargeting pixels, or invasive surveillance scripts.\n\n- **No Ad Trackers:** We never embed scripts from ad brokers or behavioral data syndicates.\n- **Essential Cookies Only:** Any cookies set are strictly operational (e.g., CSRF tokens, load balancing, secure session validation).\n- **Do Not Track (DNT) & Global Privacy Control (GPC):** Algora respects browser DNT and GPC header signals natively by default.",
    },
    {
      id: "code-execution",
      title: "4. Code Execution & In-Browser Sandboxing",
      summary:
        "Your code solutions execute locally in your browser's isolated Web Worker environment.",
      contentMarkdown:
        "When you solve coding challenges in Algora's multi-language code runner (JavaScript, TypeScript, Python):\n\n1. **Client-Side Evaluation:** Code execution occurs inside an isolated, unprivileged Web Worker running in your local browser sandbox.\n2. **Zero Code Telemetry:** We do not index, retain, or train artificial intelligence models on your custom code submissions without your explicit consent.\n3. **Ephemeral Test Execution:** Test inputs, runtime metrics, and assertion outputs are evaluated in memory and discarded upon completion of the test suite.",
    },
    {
      id: "account-cloud-data",
      title: "5. Information We Collect If You Create an Account",
      summary: "Transparent accounting of data collected for registered learners.",
      contentMarkdown:
        "If you choose to create an authenticated Algora account or subscribe to a Pro or Campus plan, we collect only the necessary information required to provide cloud synchronization and billing:",
      subsections: [
        {
          id: "account-credentials",
          title: "5.1 Credentials & Profile",
          contentMarkdown:
            "Your email address, hashed and salted password (via Argon2/bcrypt), display name, and optional avatar. We never store plaintext passwords.",
        },
        {
          id: "billing-data",
          title: "5.2 Payment & Billing Information",
          contentMarkdown:
            "Payment transactions are processed directly by our PCI-DSS Level 1 certified payment processor (Stripe). Algora does not store or process raw credit card numbers or bank account details. We retain only a tokenized customer identifier, subscription plan status, and transaction receipts.",
        },
        {
          id: "cloud-sync",
          title: "5.3 Encrypted Cloud Backups",
          contentMarkdown:
            "For registered users, your `algora-progress` state is synchronized periodically to our secure cloud database via TLS 1.3, allowing seamless resumption across desktop and mobile devices.",
        },
      ],
    },
    {
      id: "data-portability",
      title: "6. Data Portability & Complete JSON Export",
      summary:
        "You own your learning data. Export your full history anytime in standard JSON format.",
      contentMarkdown:
        "In compliance with GDPR Article 20 and CCPA guidelines, you have the right to full data portability.\n\nAt any time, from **Settings → Profile & Data**, you can download a complete, unencrypted JSON archive containing:\n- All algorithm mastery records and completion timestamps\n- Full lesson reading history and quiz scoring metrics\n- All saved coding challenge solutions across JS, TS, and Python\n- Complete streak history, XP ledger, and achievement unlock metadata\n\nThis JSON export can also be re-imported into any fresh Algora instance without account lock-in.",
    },
    {
      id: "right-to-erasure",
      title: "7. Right to Erasure & Instant Local Purge",
      summary: "One-click deletion of all local storage and immediate server-side account purging.",
      contentMarkdown:
        "You have the absolute right to be forgotten (GDPR Article 17):\n\n- **Local Purge:** Clicking **Reset All Progress** in your preferences immediately wipes `algora-progress`, `algora-prefs`, and `algora-auth` from your browser's storage engine.\n- **Account Deletion:** Requesting account deletion from **Settings → Danger Zone** immediately purges your cloud record, authentication credentials, and synchronized backups from our production databases within 24 hours.",
    },
    {
      id: "educational-compliance",
      title: "8. Children's Privacy & Educational Compliance (FERPA / COPPA)",
      summary:
        "Safe for university classrooms, K-12 educational environments, and student cohorts.",
      contentMarkdown:
        "Algora is designed to serve university computer science departments, bootcamps, and individual students.\n\n- **COPPA Compliance:** Algora does not knowingly collect personal identifiable information from children under 13 without verified institutional or parental consent.\n- **FERPA Alignment:** When deployed under an Algora Campus institutional license, student roster data is processed strictly as an educational vendor under institutional oversight and is never repurposed for commercial profiling.",
    },
    {
      id: "rights-matrix",
      title: "9. Your Rights Under GDPR, CCPA, and Global Privacy Laws",
      summary:
        "Comprehensive breakdown of your international privacy rights and how to exercise them.",
      contentMarkdown:
        "Depending on your jurisdiction (including the European Economic Area, United Kingdom, and State of California), you hold the following statutory rights:\n\n| Legal Right | What It Means for You | How to Exercise in Algora |\n| :--- | :--- | :--- |\n| **Right of Access** | View all personal and telemetry data associated with your identity | Settings → Profile → Download Data |\n| **Right to Rectification** | Correct inaccurate profile or account details | Settings → Profile → Edit Details |\n| **Right to Erasure** | Permanently delete all local and cloud-stored data | Settings → Danger Zone → Delete Account |\n| **Right to Restriction** | Restrict cloud synchronization while maintaining offline local study | Settings → Preferences → Offline Mode |\n| **Right to Portability** | Receive machine-readable JSON copy of your progress | Settings → Profile → Export JSON |\n| **Right to Object** | Object to automated processing or communications | Account Preferences → Notifications Toggle |",
    },
    {
      id: "security-practices",
      title: "10. Security & Encryption Standards",
      summary:
        "Modern cryptographic safeguards protecting your learning session in transit and at rest.",
      contentMarkdown:
        "We implement industry-standard administrative, physical, and technical safeguards:\n\n- **In Transit:** All communications are encrypted using Transport Layer Security (TLS 1.3) with HSTS enforcement.\n- **At Rest:** Cloud database backups and user authentication tables are encrypted with AES-256 encryption.\n- **Content Security Policy (CSP):** We enforce strict CSP headers prohibiting inline script injection, unauthorized cross-origin connections, and frame-jacking.",
    },
    {
      id: "contact-dpo",
      title: "11. Contact Our Data Protection Officer",
      summary: "Reach out with questions, data requests, or institutional compliance verification.",
      contentMarkdown:
        "If you have inquiries regarding this Privacy Policy, wish to exercise your statutory rights, or require institutional Data Processing Agreements (DPA) for university licensing, please contact our team:\n\n- **Data Protection Officer:** `privacy@algora.io`\n- **Support Desk:** `support@algora.io`\n- **Mailing Address:** Algora Learning Technologies Inc., 100 Montgomery St, Suite 1400, San Francisco, CA 94104\n- **Web Form:** [/contact](/contact)",
    },
  ],
};

/**
 * Algora — Terms of Service Document
 *
 * SPECIFICATION REFERENCES:
 * - S10.7: "Legal pages are real content, not placeholder text."
 * - S6.7: "/terms page — Real terms of service for educational usage."
 * - S10.4, R-10: Trust, billing transparency, educational integrity, 14-day refund guarantee.
 */
export const TERMS_OF_SERVICE: LegalDocument = {
  id: "terms",
  title: "Terms of Service",
  subtitle:
    "Clear, transparent terms governing the educational use of the Algora algorithm visualizer and learning platform.",
  version: "2.4.0",
  effectiveDate: "2026-08-01",
  lastUpdated: "2026-08-04",
  summaryMarkdown:
    "These Terms of Service govern your access to and use of Algora. Algora provides interactive algorithm visualizers, coding challenges, and structured computer science curricula for educational purposes. You retain 100% ownership of your code submissions, and we offer a transparent 14-day money-back guarantee on Pro subscriptions.",
  sections: [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      summary: "By accessing or using Algora, you agree to be bound by these Terms of Service.",
      contentMarkdown:
        "By accessing our website ([algora.io](https://algora.io)), utilizing our interactive visualizers, participating in coding challenges, or subscribing to paid services, you confirm that you have read, understood, and agreed to be bound by these Terms of Service and our [Privacy Policy](/privacy).\n\nIf you are accessing Algora on behalf of a university, school, or enterprise organization under a Campus license, you represent that you possess the authority to bind that entity to these terms.",
    },
    {
      id: "educational-scope",
      title: "2. Educational Purpose & Algorithmic Simulation Scope",
      summary:
        "Algora is an educational simulator designed to teach computer science and interview concepts.",
      contentMarkdown:
        "Algora provides interactive step-by-step visualizations of classical and modern computer science algorithms (such as Dijkstra, Quicksort, BFS/DFS, Kadane, Binary Search, and Dynamic Programming).\n\n- **Simulation Models:** Visualizer execution models, timeline states, and memory layouts are designed for instructional clarity and cognitive comprehension. Real-world machine implementations (e.g., CPU caching, compiler optimizations, kernel scheduling) may exhibit differing micro-architectural characteristics.\n- **No Warranty on Interview Outcomes:** While our curricula are curated to optimize technical interview readiness, Algora makes no express or implied guarantees regarding employment, hiring offers, or academic exam grades.",
    },
    {
      id: "intellectual-property",
      title: "3. Intellectual Property Rights & Code Ownership",
      summary:
        "Algora owns the visualization engine and lesson content; you retain 100% ownership of the code you write.",
      contentMarkdown: "We maintain clear boundaries regarding intellectual property:",
      subsections: [
        {
          id: "algora-ip",
          title: "3.1 Algora Platform Materials",
          contentMarkdown:
            "The Algora logo, brand assets, step-builder runtime engine, interactive SVG visualizer renderers, curriculum roadmaps, lesson notes, and custom illustration assets are the proprietary property of Algora Learning Technologies Inc. and are protected under international copyright and trademark laws.",
        },
        {
          id: "user-code-ownership",
          title: "3.2 Your Code & Solution Ownership",
          contentMarkdown:
            "**You retain full, exclusive ownership of all code, algorithms, solutions, and notes you write in Algora's code editor.** We claim zero proprietary rights, patent rights, or commercial licenses over your submitted challenge solutions.",
        },
      ],
    },
    {
      id: "user-accounts",
      title: "4. User Accounts & Security Responsibilities",
      summary: "Keep your credentials secure. Individual accounts are non-transferable.",
      contentMarkdown:
        "When registering an account:\n\n1. **Accurate Information:** You agree to provide accurate, current, and complete registration information.\n2. **Credential Confidentiality:** You are solely responsible for maintaining the confidentiality of your authentication credentials. Notify `security@algora.io` immediately if you suspect unauthorized account access.\n3. **Single-Learner Access:** Individual Pro subscriptions are non-transferable and may not be shared across multiple concurrent learners. Multi-student access requires an authorized [Campus License](/campus).",
    },
    {
      id: "acceptable-use",
      title: "5. Acceptable Use Policy & Anti-Abuse Rules",
      summary: "Respect the platform, other learners, and the sandboxed execution environment.",
      contentMarkdown:
        "You agree **not** to engage in any of the following prohibited activities:\n\n- **Platform Interference:** Attempting to disrupt, degrade, or overburden our infrastructure or content delivery network.\n- **Malicious Code Execution:** Attempting to escape the browser Web Worker sandbox, execute arbitrary host filesystem operations, or exploit browser vulnerabilities.\n- **Commercial Cloning & Automated Scraping:** Systematically scraping, copying, or bulk-exporting proprietary visualizer state definitions or curriculum roadmaps for incorporation into competing commercial products.\n- **Leaderboard Manipulation:** Using automated bots, artificial latency simulators, or fraudulent score submissions to distort weekly League standings or Quest XP rewards.",
    },
    {
      id: "subscriptions-billing",
      title: "6. Subscriptions, Pricing & Campus Licensing",
      summary: "Clear pricing, transparent recurring billing, and self-serve management.",
      contentMarkdown:
        "Algora offers both free educational tiers and premium paid tiers (Algora Pro and Algora Campus):\n\n- **Billing Cadence:** Pro subscriptions are billed on a recurring monthly or annual basis as selected upon checkout.\n- **Price Changes:** Any subscription price changes will be communicated at least 30 days in advance via email. Your continued subscription after the effective date constitutes acceptance.\n- **Self-Serve Cancellation:** You may cancel your subscription at any time directly in **Settings → Billing**. Upon cancellation, you will retain Pro access through the end of your current paid billing period.",
    },
    {
      id: "refund-policy",
      title: "7. 14-Day Money-Back Guarantee",
      summary: "Hassle-free 100% refund policy within 14 days of initial Pro subscription.",
      contentMarkdown:
        "We want you to be completely confident in your learning experience with Algora.\n\nIf you are not fully satisfied with Algora Pro, you are eligible for a **100% full refund within 14 calendar days** of your initial subscription purchase. No complex questionnaires or retention obstacles.\n\nTo request a refund:\n1. Email `billing@algora.io` with your account email address, or\n2. Open a refund request via [/contact](/contact).\n\nRefunds are processed to your original payment method within 3 to 5 business days.",
    },
    {
      id: "service-availability",
      title: "8. Local-First Resilience & Service Availability",
      summary:
        "Offline-first capability ensures you can continue studying even without internet connectivity.",
      contentMarkdown:
        "Because Algora executes on client-side Web Workers and persists state in `localStorage`, primary visualization, lesson reading, and problem solving features remain fully accessible offline once loaded.\n\nFor cloud-dependent services (account synchronization, real-time weekly League updates, global leaderboards), we target a **99.9% uptime** service level objective, excluding scheduled maintenance announced in advance.",
    },
    {
      id: "liability-disclaimer",
      title: "9. Limitation of Liability & Warranty Disclaimers",
      summary: "Standard commercial legal protections for educational software platforms.",
      contentMarkdown:
        'TO THE MAXIMUM EXTENT PERMITTED UNDER APPLICABLE LAW, ALGORA AND ITS AFFILIATES PROVIDE THE PLATFORM AND ALL CONTENT ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.\n\nIN NO EVENT SHALL ALGORA BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR ACCESS TO OR USE OF (OR INABILITY TO ACCESS OR USE) THE PLATFORM. ALGORA\'S AGGREGATE LIABILITY SHALL NOT EXCEED THE TOTAL AMOUNT ACTUALLY PAID BY YOU TO ALGORA IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.',
    },
    {
      id: "termination",
      title: "10. Termination & Account Deletion",
      summary:
        "You may terminate your account at any time. We reserve rights to suspend abusive users.",
      contentMarkdown:
        "You may terminate your account and these terms at any time by deleting your account via **Settings → Danger Zone**.\n\nAlgora reserves the right to suspend or terminate accounts that repeatedly violate our Acceptable Use Policy, engage in payment fraud, or harass other community members in collaborative features.",
    },
    {
      id: "governing-law",
      title: "11. Governing Law & Dispute Resolution",
      summary: "Constructive informal dispute resolution followed by binding arbitration.",
      contentMarkdown:
        "These Terms of Service are governed by the laws of the State of California, United States, without regard to its conflict of law provisions.\n\nIn the event of any controversy or dispute, the parties agree to first seek good-faith informal resolution by contacting `legal@algora.io`. If a dispute cannot be resolved informally within 30 days, it shall be settled by binding individual arbitration under the American Arbitration Association (AAA) rules.",
    },
    {
      id: "modifications",
      title: "12. Modifications to Terms",
      summary: "We will notify you of material changes 30 days prior to their effective date.",
      contentMarkdown:
        "We may update these Terms of Service from time to time to reflect new platform capabilities, regulatory requirements, or service improvements.\n\nWhen material changes occur, we will provide at least 30 days' advance notice via an in-app notification banner or email to registered users. The current version and effective date will always be visible at the top of this document.",
    },
    {
      id: "contact-legal",
      title: "13. Legal Inquiries & Contact Information",
      summary: "Direct channel for legal, institutional, and compliance notices.",
      contentMarkdown:
        "For legal inquiries, copyright notices (DMCA), or contractual communications:\n\n- **Legal Team:** `legal@algora.io`\n- **Compliance & Billing:** `billing@algora.io`\n- **Postal Address:** Algora Learning Technologies Inc., 100 Montgomery St, Suite 1400, San Francisco, CA 94104\n- **Web Form:** [/contact](/contact)",
    },
  ],
};

export const LEGAL_DOCUMENTS: Record<"privacy" | "terms", LegalDocument> = {
  privacy: PRIVACY_POLICY,
  terms: TERMS_OF_SERVICE,
};
