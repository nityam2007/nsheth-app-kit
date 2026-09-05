# Privacy and Data Protection

Last reviewed: 3 September 2026.

This document is an implementation guide for applications built from NSheth App Kit. It is not a public privacy notice, legal advice, or a certification of compliance. Each deploying organization remains responsible for determining whether it is a controller, processor, Data Fiduciary, or Data Processor and for meeting the obligations that apply to its actual processing.

## Legal Scope

| Framework      | When it may apply                                                                                                                                                                                   | Current status                                                                                                                                                                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EU GDPR        | Processing by an EU/EEA establishment, or offering goods or services to or monitoring people in the EU/EEA. It covers automated processing and non-automated processing in a filing system.         | Applicable since 25 May 2018.                                                                                                                                                                                                                      |
| India DPDP Act | Processing digital personal data in India, including data collected offline and later digitized, and certain processing outside India connected with offering goods or services to people in India. | Final Rules were notified on 13 November 2025 with phased commencement. Consent Manager provisions commence 13 November 2026; most operational notice, consent, rights, security, breach, child-data, and erasure provisions commence 13 May 2027. |

Other privacy, employment, consumer, communications, and sector-specific laws may also apply.

## Current Data Inventory

### Implemented in 0.6

GitHub sign-in now stores a provider identifier and verified email. Booking, reservation, and order records contain contact data; orders also store a delivery address. The cart stores only product display data and quantities in browser local storage. `/account` provides an authenticated activity export. `/privacy` accepts operator-reviewed requests; `/admin/privacy` tracks triage. The maintenance command removes expired/revoked session records, expired OAuth attempts, and throttle buckets. Business-record erasure, operator-specific retention, and legal review remain deployment responsibilities; triage does not itself fulfil a deletion request.

The repository currently implements a development playground, not a production service.

| Area             | Data in the application                                                           | Current behavior                                                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Users            | UUID, email address, optional name, creation/update dates, roles, and permissions | Stored in PostgreSQL and visible only through a permission-protected admin server function.                                                         |
| Sessions         | User ID, SHA-256 token hash, creation/expiry dates, and optional revocation date  | The raw token is held in an HTTP-only cookie; sessions expire after eight hours. Expired and revoked database records are not automatically erased. |
| Content          | Post title, slug, excerpt, body, state, and dates                                 | Not inherently personal data, but operators can enter personal data in free text. Drafts remain behind server authorization.                        |
| Products         | Product name, slug, summary, description, state, and dates                        | Not inherently personal data. Drafts remain behind server authorization and cannot receive public enquiries.                                        |
| RFQ enquiries    | Product, name, email address, quantity, message, and submission date              | Stored in PostgreSQL to respond to the request. No automated retention or admin enquiry interface is implemented.                                   |
| Request metadata | Potential IP addresses, user agents, and request logs                             | Not deliberately persisted by application code. Hosting, proxy, database, observability, and backup services may process them.                      |

The code sets one necessary authentication cookie after the development-only identity bootstrap. No advertising, analytics, fingerprinting, or other non-essential tracking is implemented. A production authentication provider is not included.

## Implemented Safeguards

- Session tokens use cryptographic platform randomness, and only their SHA-256 hashes are stored.
- Production cookies use the `__Host-` prefix with `Secure`, `HttpOnly`, `SameSite=Lax`, and root-path restrictions.
- Session middleware verifies expiry and revocation before loading the minimum principal fields needed for authorization.
- Roles and permissions are enforced again inside protected server functions; route visibility is not treated as security.
- State-changing server functions use input validation and same-origin checks.
- Public RFQs accept only published product IDs and do not deliberately store IP addresses or user agents.
- User deletion cascades to sessions and role assignments at the database relationship level.
- Local PostgreSQL exposes its development port only on loopback.
- No optional tracker is present that would justify adding a consent banner to the current demo.

These controls are useful security and minimization defaults, but they do not make a deployed application compliant by themselves.

## Production Compliance Gate

Complete these items before processing real personal data in a jurisdiction where GDPR or DPDP applies:

1. Identify the operator, privacy contact, processing roles, purposes, data categories, recipients, retention periods, and affected people. Minimize each collection and default, and maintain a data map and GDPR records of processing where required.
2. Select and document a GDPR lawful basis for each purpose. Under DPDP, document valid consent or the applicable legitimate use. Do not reuse data for incompatible or undisclosed purposes.
3. Publish a deployment-specific notice at or before collection. Include the GDPR Article 13/14 information and the DPDP itemized data, specific purposes, rights, withdrawal, grievance, and Board-complaint information in clear, accessible language.
4. Where consent is used, make it specific and affirmative, retain evidence, separate purposes, and make withdrawal as easy as consent. Add a consent interface only if optional processing exists. If using a DPDP Consent Manager, verify its registration and Rule 4 obligations.
5. Implement authenticated workflows for access, correction, completion, erasure, consent withdrawal, objection, restriction, portability, grievances, and DPDP nomination where applicable. Track GDPR deadlines, generally one month, and publish a DPDP grievance period no longer than 90 days.
6. Adopt and enforce a retention schedule. Erase or anonymize users, expired/revoked sessions, content, products, enquiries, logs, and backups when no longer needed, subject to documented legal holds and applicable DPDP pre-erasure notice rules.
7. Complete production security controls: real authentication and logout, session rotation, rate limiting, least-privilege administration, transport and storage encryption, secret management, access monitoring, audit records, tested backups, dependency maintenance, and incident detection. Retain relevant security logs for at least one year where DPDP Rule 6 applies.
8. Inventory every host and vendor. Sign required processor contracts, restrict their instructions and access, document sub-processors, and assess international transfers. Use a valid GDPR transfer mechanism where required and monitor any Indian transfer restrictions.
9. Maintain a tested breach process. GDPR supervisory-authority notification may be due within 72 hours after awareness. Once operational, DPDP requires notice to affected Data Principals and the Board without delay, followed by prescribed Board details within 72 hours unless extended.
10. Do not launch child-directed processing without an age strategy and required parental consent. Account for the GDPR member-state consent age and DPDP protections for people under 18, including restrictions on tracking, behavioral monitoring, targeted advertising, and detrimental processing.
11. Assess whether a GDPR representative, DPO, DPIA, or prior consultation is required and whether Indian Significant Data Fiduciary duties apply. Obtain legal review for the actual deployment and retain evidence that every applicable control was tested.

## Compliance Status

| Target                           | Status                                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Local development playground     | Privacy-aware technical baseline; no real personal data should be used.                                             |
| Production GDPR processing       | Not ready until the production compliance gate is completed for the deployment.                                     |
| Production India DPDP processing | Not ready until the production compliance gate and applicable phased requirements are completed for the deployment. |

## Official Sources

- [Regulation (EU) 2016/679 (GDPR), official text](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng)
- [European Commission: legal framework of EU data protection](https://commission.europa.eu/law/law-topic/data-protection/legal-framework-eu-data-protection_en)
- [India DPDP commencement notification, G.S.R. 843(E), 13 November 2025](https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf)
- [Digital Personal Data Protection Rules, 2025, G.S.R. 846(E)](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf)
- [Correction to the DPDP Rules, G.S.R. 892(E), 4 December 2025](https://www.meity.gov.in/static/uploads/2025/12/3c7ebbae0e5456f493f486e6845df86b.pdf)

Recheck these sources before each production release because guidance, delegated acts, notifications, and enforcement expectations can change.
