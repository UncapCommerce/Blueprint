// Cloudflare Worker entry point. Routes the portal, admin, discovery, and
// blueprint APIs, then falls through to Workers Static Assets. Blueprint
// viewing sessions are minted from the admin or portal cookie via
// /api/admin/bp-token (see the Gate in each blueprint's index.html) — the
// old per-blueprint email passcode was retired when the portal shipped.
//
//   POST /api/auth/sign  →  { token, name, title }
//     Records an Approve & kickoff signature. Persists a record to KV
//     under signature:<blueprintId>:<token> with a 1-year TTL, and emails
//     denis@uncap.com with the signer's name, title, email, timestamp,
//     IP, and user-agent. Admin sessions skip both the KV write and the
//     email; self-test sessions (logged-in email = NOTIFY_EMAIL) write
//     the record but skip the email.
//
//   POST /api/auth/my-signature  →  { token }
//     Returns the caller's own signature record, if any, keyed by their
//     exact session token — lets a client who just signed download their
//     own signed copy without needing admin/self-test privileges.

import { EmailMessage } from "cloudflare:email";
import { buildDiscoveryProfile, buildDiscoveryProfileWithAI, STOCK_SEARCH_TOKEN } from "./discovery-profile.js";
import { prefillAnswersFromDoc, b64ToBytes } from "./discovery-prefill.js";
import { buildBlueprintContent } from "./blueprint-content.js";

const CODE_TTL_SECONDS       = 10 * 60;             // 10 minutes
const SESSION_TTL_SECONDS    = 2 * 60 * 60;         // 2 hours (client blueprint sessions)
const ACCESS_LOG_TTL_SECONDS = 180 * 24 * 60 * 60;  // 180 days (access-log PII: email/IP/geo/UA)
const SIGNATURE_TTL_SECONDS  = 365 * 24 * 60 * 60;  // 1 year (signature = legal audit trail)
const MAX_CODE_ATTEMPTS      = 5;                   // wrong-code guesses before a code is burned

// The master Terms of Service template every newly created blueprint
// seeds from (see handleAdminCreateBlueprint). Edited the same way as any
// other blueprint's TOS, via the dashboard's TOS button.
const TOS_TEMPLATE_BLUEPRINT_ID = 'anatomywarehouse';

// Blueprints whose live sign modal/print MSA already renders with custom
// clause text (hardcoded in that blueprint's own BPApproveButton via
// UncapMSA's `terms` prop) that ISN'T reflected in DEFAULT_MSA_SECTIONS
// below. The dashboard TOS editor warns before overwriting these, since
// the generic default text doesn't match what's actually live for them.
const BLUEPRINTS_WITH_HARDCODED_TERMS = ['elevateoralcare'];

// Standard MSA clauses 1-25 as plain-text sections, matching UncapMSA.jsx's
// MSA_BODY_HTML with every `terms` override at its default value. This is
// what the dashboard's TOS editor pre-fills for a blueprint that has never
// had a custom TOS saved — so admins always see full, real content to
// edit, never a blank box. Saving writes these (edited or not) as that
// blueprint's explicit override; until saved, nothing about the live site
// changes; each blueprint keeps rendering its own terms exactly as today.
// Each section's `items` breaks out every lettered/numbered sub-point
// (2.1, (a), (b), ...) as its own independently editable entry, instead
// of one big blob of text per section. `label` is blank for a section
// that's just a single paragraph with no sub-points.
const DEFAULT_MSA_SECTIONS = [
  { num: '1', title: 'Services', items: [
    { label: '', body: 'Service Provider shall provide to Customer the services (the "Services") set out in one or more statements of work to be issued by Customer and accepted by Service Provider (each, a "Statement of Work"). The initial accepted Statement of Work is attached hereto as Exhibit A. Additional Statements of Work shall be deemed issued and accepted only if signed by the Service Provider Contract Manager and the Customer Contract Manager, appointed pursuant to Section 2.1(a) and Section 3.1, respectively.' },
  ] },
  { num: '2', title: 'Service Provider Obligations', items: [
    { label: '', body: 'Service Provider shall:' },
    { label: '2.1', body: 'Designate employees or contractors that it determines, in its sole discretion, to be capable of filling the following positions:' },
    { label: '(a)', body: 'A primary contact to act as its authorized representative with respect to all matters pertaining to this Agreement (the "Service Provider Contract Manager").' },
    { label: '(b)', body: 'A number of employees or contractors that it deems sufficient to perform the Services set out in each Statement of Work (collectively, with the Service Provider Contract Manager, "Provider Representatives").' },
  ] },
  { num: '3', title: 'Customer Obligations', items: [
    { label: '', body: 'Customer shall:' },
    { label: '3.1', body: 'Designate one of its employees or agents to serve as its primary contact with respect to this Agreement and to act as its authorized representative with respect to matters pertaining to this Agreement (the "Customer Contract Manager"), with such designation to remain in force unless and until a successor Customer Contract Manager is appointed.' },
    { label: '3.2', body: 'Require that the Customer Contract Manager respond promptly to any reasonable requests from Service Provider for instructions, information, or approvals required by Service Provider to provide the Services.' },
    { label: '3.3', body: 'Cooperate with Service Provider in its performance of the Services as required to enable Service Provider to provide the Services.' },
    { label: '3.4', body: 'Take all steps necessary, including obtaining any required licenses or consents, to prevent Customer caused delays in Service Provider\'s provision of the Services.' },
  ] },
  { num: '4', title: 'Fees and Expenses', items: [
    { label: '4.1', body: 'In consideration of the provision of the Services by the Service Provider and the rights granted to Customer under this Agreement, Customer shall pay the fees set out in the applicable Statement of Work. Payment to Service Provider of such fees and the reimbursement of expenses pursuant to this Section 4 shall constitute payment in full for the performance of the Services. Unless otherwise provided in the applicable Statement of Work, said fee will be payable upon receipt by the Customer of an invoice from Service Provider but in no event more than ten (10) days after completion of the Services performed pursuant to the applicable Statement of Work.' },
    { label: '4.2', body: 'Customer shall reimburse Service Provider for all reasonable expenses incurred in accordance with the Statement of Work upon receipt by the Customer of an invoice from Service Provider accompanied by receipts and reasonable supporting documentation.' },
    { label: '4.3', body: 'Customer shall be responsible for all sales, use, and excise taxes, and any other similar taxes, duties, and charges of any kind imposed by any federal, state, or local governmental entity on any amounts payable by Customer hereunder; provided, that in no event shall Customer pay or be responsible for any taxes imposed on, or with respect to, Service Provider\'s income, revenues, gross receipts, personnel, or real or personal property, or other assets.' },
    { label: '4.4', body: 'Except for invoiced payments that the Customer has successfully disputed, all late payments shall bear interest at the lesser of (a) the rate of 1.5% per month and (b) the highest rate permissible under applicable law, calculated daily and compounded monthly. Customer shall also reimburse Service Provider for all costs incurred in collecting any late payments, including, without limitation, attorneys\' fees and costs. In addition to all other remedies available under this Agreement or at law (which Service Provider does not waive by the exercise of any rights hereunder), Service Provider shall be entitled to suspend the provision of any Services if the Customer fails to pay any invoices when due hereunder and such failure continues for ten (10) days following written notice thereof.' },
    { label: '4.5', body: 'All rights and ownership to all documents, work product, and other materials that are delivered to Customer under this Agreement or prepared by or on behalf of the Service Provider in the course of performing the Services (collectively, the "Deliverables") shall be transferred to Customer only after Customer has paid off all payments, fees, and expenses under this Agreement.' },
  ] },
  { num: '5', title: 'Limited Warranty and Limitation of Liability', items: [
    { label: '5.1', body: 'Service Provider warrants that it shall perform the Services:' },
    { label: '(a)', body: 'In accordance with the terms and subject to the conditions set out in the respective Statement of Work and this Agreement.' },
    { label: '(b)', body: 'Using personnel of commercially reasonable skill, experience, and qualifications.' },
    { label: '(c)', body: 'In a timely, workmanlike, and professional manner in accordance with generally recognized industry standards for similar services.' },
    { label: '5.2', body: 'Service Provider\'s sole and exclusive liability and Customer\'s sole and exclusive remedy for breach of this warranty shall be as follows:' },
    { label: '(a)', body: 'Service Provider shall use reasonable commercial efforts to promptly cure any such breach; provided, that if Service Provider cannot cure such breach within a reasonable time, but no more than thirty (30) days after Customer\'s written notice of such breach, Customer may, at its option, terminate the Agreement by serving written notice of termination in accordance with Section 8.2.' },
    { label: '(b)', body: 'In the event the Agreement is terminated pursuant to Section 5.2 above, Service Provider shall within thirty (30) days after the effective date of termination, refund to Customer any fees paid by the Customer as of the date of termination for the Services or Deliverables (as defined in Section 6 below), less a deduction equal to the fees for receipt or use of such Deliverables or Services up to and including the date of termination on a pro rated basis.' },
    { label: '(c)', body: 'The foregoing remedy shall not be available unless Customer provides written notice of such breach within ten (10) days after delivery of such Services or Deliverables to Customer.' },
    { label: '5.3', body: 'SERVICE PROVIDER MAKES NO WARRANTIES EXCEPT FOR THAT PROVIDED IN SECTION 5.1, ABOVE. ALL OTHER WARRANTIES, EXPRESS AND IMPLIED, ARE EXPRESSLY DISCLAIMED.' },
  ] },
  { num: '6', title: 'Intellectual Property', items: [
    { label: '', body: 'All intellectual property rights, including copyrights, patents, patent disclosures, and inventions (whether patentable or not), trademarks, service marks, trade secrets, know how, and other confidential information, trade dress, trade names, logos, corporate names, and domain names, together with all of the goodwill associated therewith, derivative works, and all other rights (collectively, "Intellectual Property Rights") (except for any Confidential Information of Customer or customer materials) shall be owned by Customer. Customer hereby grants Service Provider a license to use all Intellectual Property Rights in the Deliverables free of additional charge and on a non exclusive, non transferable, non sublicensable, fully paid up, royalty free, and perpetual basis to the extent necessary to enable Service Provider to make reasonable use of the Deliverables and the Services for the sole purpose of reproducing, publishing, and displaying the Deliverables in Service Provider\'s portfolios and websites, in galleries, design periodicals, and other media or exhibits for the purposes of recognition of creative excellence or professional advancement, and to be credited with authorship of the Deliverables in connection with such uses.' },
  ] },
  { num: '7', title: 'Confidentiality', items: [
    { label: '', body: 'From time to time during the Term of this Agreement, either Party (as the "Disclosing Party") may disclose or make available to the other Party (as the "Receiving Party"), non public, proprietary, and confidential information of Disclosing Party that, if disclosed in writing or other tangible form is clearly labeled as "confidential," or if disclosed orally, is identified as confidential when disclosed and within ten (10) days thereafter, is summarized in writing and confirmed as confidential ("Confidential Information"); provided, however, that Confidential Information does not include any information that: (a) is or becomes generally available to the public other than as a result of Receiving Party\'s breach of this Section 7; (b) is or becomes available to the Receiving Party on a non confidential basis from a third party source, provided that such third party is not and was not prohibited from disclosing such Confidential Information; (c) was in Receiving Party\'s possession prior to Disclosing Party\'s disclosure hereunder; or (d) was or is independently developed by Receiving Party without using any Confidential Information. The Receiving Party shall: (x) protect and safeguard the confidentiality of the Disclosing Party\'s Confidential Information with at least the same degree of care as the Receiving Party would use to protect its own Confidential Information, but in no event with less than a commercially reasonable degree of care; (y) not use the Disclosing Party\'s Confidential Information, or permit it to be accessed or used, for any purpose other than to exercise its rights or perform its obligations under this Agreement; and (z) not disclose any such Confidential Information to any person or entity, except to the Receiving Party\'s Group who need to know the Confidential Information to assist the Receiving Party, or act on its behalf, to exercise its rights or perform its obligations under this Agreement.' },
    { label: '', body: 'If the Receiving Party is required by applicable law or legal process to disclose any Confidential Information, it shall, prior to making such disclosure, use commercially reasonable efforts to notify Disclosing Party of such requirements to afford Disclosing Party the opportunity to seek, at Disclosing Party\'s sole cost and expense, a protective order or other remedy. For purposes of this Section 7 and Section 8.4 only, Receiving Party\'s Group shall mean the Receiving Party\'s affiliates and its or their employees, officers, directors, shareholders, partners, members, managers, agents, independent contractors, service providers, sublicensees, subcontractors, attorneys, accountants, and financial advisors.' },
  ] },
  { num: '8', title: 'Term, Termination, and Survival', items: [
    { label: '8.1', body: 'This Agreement shall commence as of the Effective Date and shall continue thereafter until the completion of the Services under all Statements of Work, unless sooner terminated pursuant to Section 8.2 or Section 8.3.' },
    { label: '8.2', body: 'Either Party may terminate this Agreement, effective upon written notice to the other Party (the "Defaulting Party"), if the Defaulting Party:' },
    { label: '(a)', body: 'Materially breaches this Agreement, and such breach is incapable of cure, or with respect to a breach capable of cure, the Defaulting Party does not cure such breach within ten (10) days after receipt of written notice of such breach.' },
    { label: '(b)', body: 'Becomes insolvent or admits its inability to pay its debts generally as they become due.' },
    { label: '(c)', body: 'Becomes subject, voluntarily or involuntarily, to any proceeding under any domestic or foreign bankruptcy or insolvency law, which is not fully stayed within seven (7) business days or is not dismissed or vacated within forty five (45) business days after filing.' },
    { label: '(d)', body: 'Is dissolved or liquidated or takes any corporate action for such purpose.' },
    { label: '(e)', body: 'Makes a general assignment for the benefit of creditors.' },
    { label: '(f)', body: 'Has a receiver, trustee, custodian, or similar agent appointed by order of any court of competent jurisdiction to take charge of or sell any material portion of its property or business.' },
    { label: '8.3', body: 'Notwithstanding anything to the contrary in Section 8.2(a), Service Provider may terminate this Agreement before the expiration date of the Term on written notice if Customer fails to pay any amount when due hereunder and such failure continues for three (3) days after Customer\'s receipt of written notice of nonpayment.' },
    { label: '8.4', body: 'Notwithstanding anything to the contrary in Sections 8.2(a) and 8.3, either party may terminate this Agreement at any time and for any reason on thirty (30) days prior written notice to the other Party. If Customer terminates this Agreement under this Section 8.4, Customer shall within three (3) days pay Service Provider for all service performed through the date of termination. Service Provider shall have no obligation to continue performing any service pursuant to this Agreement or any Statement of Work upon receipt of notice from Customer pursuant to this Section 8.4.' },
    { label: '8.5', body: 'Service Provider shall, at Customer\'s reasonable discretion, complete any work assigned or scheduled during the notice period in accordance with the terms and conditions of this Agreement.' },
    { label: '8.6', body: 'If Service Provider determines that Customer\'s personnel or contractors are not completing Customer\'s responsibilities as described in the applicable Statement of Work timely or accurately, Service Provider shall promptly notify the Customer Contract Manager for such Statement of Work, but in no event more than thirty (30) calendar days from the date of such determination. Service Provider shall bear no liability or otherwise be responsible for delays in the provision of the Services or Deliverables occasioned by Customer\'s failure to complete Customer\'s responsibilities or adhere to a Customer schedule which were brought to the attention of the Customer Contract Manager on a timely basis. In the event of any delay in Customer\'s performance of any of the obligations set forth in this Agreement or any Statement of Work or any other delays caused by Customer, Service Provider reserves the right to adjust, as reasonably necessary to accommodate such delays, the milestones, fees, and date(s) set forth in this Agreement or any Statement of Work or elect to terminate this Agreement pursuant to Section 8.' },
  ] },
  { num: '9', title: 'Limitation of Liability', items: [
    { label: '9.1', body: 'IN NO EVENT SHALL SERVICE PROVIDER BE LIABLE TO CUSTOMER OR TO ANY THIRD PARTY FOR ANY LOSS OF USE, REVENUE, OR PROFIT OR LOSS OF DATA OR DIMINUTION IN VALUE, OR FOR ANY CONSEQUENTIAL, INCIDENTAL, INDIRECT, EXEMPLARY, SPECIAL, OR PUNITIVE DAMAGES WHETHER ARISING OUT OF BREACH OF CONTRACT, TORT (INCLUDING NEGLIGENCE), OR OTHERWISE, REGARDLESS OF WHETHER SUCH DAMAGE WAS FORESEEABLE AND WHETHER OR NOT SERVICE PROVIDER HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES, AND NOTWITHSTANDING THE FAILURE OF ANY AGREED OR OTHER REMEDY OF ITS ESSENTIAL PURPOSE.' },
    { label: '9.2', body: 'IN NO EVENT SHALL SERVICE PROVIDER\'S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT, WHETHER ARISING OUT OF OR RELATED TO BREACH OF CONTRACT, TORT (INCLUDING NEGLIGENCE), OR OTHERWISE, EXCEED TWO (2) TIMES THE AGGREGATE AMOUNTS PAID OR PAYABLE TO SERVICE PROVIDER PURSUANT TO THE APPLICABLE STATEMENT OF WORK PERIOD PRECEDING THE EVENT GIVING RISE TO THE CLAIM.' },
  ] },
  { num: '10', title: 'Indemnity', items: [
    { label: '', body: 'Customer hereby agrees to defend, indemnify, and hold Service Provider and its members, managers, officers, employees, and agents harmless from and against any and all claims, demands, losses, damages, costs, liabilities, claims, or other charges, absolute or contingent, matured or unmatured, known or unknown, and any and all expenses incurred (including, but not limited to, attorney\'s fees and court costs) by such party in connection with or arising out of (i) Customer\'s breach of this Agreement or alleged breach of any Statement of Work and (ii) any action, suit, or proceeding by a third party relating to the subject matter of this Agreement.' },
  ] },
  { num: '11', title: "Attorney's Fees and Costs", items: [
    { label: '', body: "Service Provider shall be entitled to recover from Customer all costs and expenses, including without limitation, reasonable attorneys' fees and paralegals' fees, incurred by Service Provider in connection with Service Provider's enforcing any of its rights and remedies under this Agreement and any Statement of Work." },
  ] },
  { num: '12', title: 'Entire Agreement', items: [
    { label: '', body: 'This Agreement, including and together with any related Statements of Work, exhibits, schedules, attachments, and appendices, constitutes the sole and entire agreement of the Parties with respect to the subject matter contained herein, and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, both written and oral, regarding such subject matter. The parties acknowledge and agree that if there is any conflict between the terms and conditions of this Agreement and the terms and conditions of any Statement of Work, the terms and conditions of this Agreement shall supersede and control.' },
  ] },
  { num: '13', title: 'Notices', items: [
    { label: '', body: 'All notices, requests, consents, claims, demands, waivers, and other communications under this Agreement (each, a "Notice", and with the correlative meaning "Notify") must be in writing and addressed to the other Party at its address set forth below (or to such other address that the receiving Party may designate from time to time in accordance with this Section). Unless otherwise agreed herein, all Notices must be delivered by personal delivery, nationally recognized overnight courier, or certified or registered mail (in each case, return receipt requested, postage prepaid) and electronic mail. Except as otherwise provided in this Agreement, a Notice is effective only (a) on receipt by the receiving Party; and (b) if the Party giving the Notice has complied with the requirements of this Section 13.' },
    { label: 'Notice to Customer', body: 'At the address set forth for Customer in the accompanying Statement of Work.' },
    { label: 'Notice to Service Provider', body: 'Uncap, Inc, c/o Denis Dyli, 8770 West Bryn Mawr Ave, Suite 1300, Chicago, IL 60631.' },
    { label: 'With a copy to', body: 'Genc Arifi, E: info@gencarifi.com, P: (630) 636-1955.' },
  ] },
  { num: '14', title: 'Non Solicitation of Employees', items: [
    { label: '', body: 'The Customer understands and acknowledges that the Service Provider has expended and continues to expend significant time and expense in recruiting and training its employees and that the loss of employees would cause significant and irreparable harm to the Service Provider. The Customer agrees and covenants not to directly or indirectly solicit, hire, or recruit for their own benefit or the benefit of any other person, or so attempt to solicit, hire, or recruit, any employee of the Service Provider ("Covered Employee"), or induce any Covered Employee to terminate their employment for 24 months immediately following the termination of this Agreement, regardless of the reason for the termination, whether voluntary or involuntary ("Restricted Period").' },
    { label: '', body: 'This non solicitation provision explicitly covers all forms of oral, written, or electronic communication, including, but not limited to, communications by email, regular mail, express mail, telephone, fax, instant message, and social media, including, but not limited to, Facebook, LinkedIn, Instagram, and X, and any other social media platform, whether or not in existence at the time of entering into this Agreement.' },
  ] },
  { num: '15', title: 'Severability', items: [
    { label: '', body: 'If any term or provision of this Agreement is found by a court of competent jurisdiction to be invalid, illegal, or unenforceable in any jurisdiction, such invalidity, illegality, or unenforceability shall not affect any other term or provision of this Agreement or invalidate or render unenforceable such term or provision in any other jurisdiction.' },
  ] },
  { num: '16', title: 'Amendments', items: [
    { label: '', body: 'No amendment to or modification of or rescission, termination, or discharge of this Agreement is effective unless it is in writing, identified as an amendment to or rescission, termination, or discharge of this Agreement, and signed by an authorized representative of each Party.' },
  ] },
  { num: '17', title: 'Waiver', items: [
    { label: '', body: 'No waiver by any Party of any of the provisions of this Agreement shall be effective unless explicitly set forth in writing and signed by the Party so waiving. Except as otherwise set forth in this Agreement, no failure to exercise, or delay in exercising, any right, remedy, power, or privilege arising from this Agreement shall operate or be construed as a waiver thereof, nor shall any single or partial exercise of any right, remedy, power, or privilege hereunder preclude any other or further exercise thereof or the exercise of any other right, remedy, power, or privilege.' },
  ] },
  { num: '18', title: 'Assignment', items: [
    { label: '', body: 'Customer shall not assign, transfer, delegate, or subcontract any of its rights or delegate any of its obligations under this Agreement without the prior written consent of Service Provider. Any purported assignment or delegation in violation of this Section 18 shall be null and void. No assignment or delegation shall relieve the Customer of any of its obligations under this Agreement. Service Provider may assign any of its rights or delegate any of its obligations to any affiliate or to any person acquiring all or substantially all of Service Provider\'s assets without Customer\'s consent.' },
  ] },
  { num: '19', title: 'Successors and Assigns', items: [
    { label: '', body: 'This Agreement is binding on and inures to the benefit of the Parties to this Agreement and their respective permitted successors and permitted assigns.' },
  ] },
  { num: '20', title: 'Relationship of the Parties', items: [
    { label: '', body: 'The relationship between the Parties is that of independent contractors. The details of the method and manner for performance of the Services by Service Provider shall be under its own control, Customer being interested only in the results thereof. The Service Provider shall be solely responsible for supervising, controlling, and directing the details and manner of the completion of the Services. Nothing in this Agreement shall give the Customer the right to instruct, supervise, control, or direct the details and manner of the completion of the Services. The Services must meet the Customer\'s final approval and shall be subject to the Customer\'s general right of inspection throughout the performance of the Services and to secure satisfactory final completion. Nothing contained in this Agreement shall be construed as creating any agency, partnership, joint venture, or other form of joint enterprise, employment, or fiduciary relationship between the Parties, and neither Party shall have authority to contract for or bind the other Party in any manner whatsoever.' },
  ] },
  { num: '21', title: 'No Third Party Beneficiaries', items: [
    { label: '', body: 'This Agreement benefits solely the Parties to this Agreement and their respective permitted successors and assigns and nothing in this Agreement, express or implied, confers on any other person or entity any legal or equitable right, benefit, or remedy of any nature whatsoever under or by reason of this Agreement.' },
  ] },
  { num: '22', title: 'Choice of Law', items: [
    { label: '', body: 'This Agreement and all related documents including all exhibits attached hereto, and all matters arising out of or relating to this Agreement, whether sounding in contract, tort, or statute, are governed by, and construed in accordance with, the laws of the State of Illinois, United States of America, without giving effect to the conflict of laws provisions thereof to the extent such principles or rules would require or permit the application of the laws of any jurisdiction other than those of the State of Illinois.' },
  ] },
  { num: '23', title: 'Choice of Forum', items: [
    { label: '', body: 'Each Party irrevocably and unconditionally agrees that it will not commence any action, litigation, or proceeding of any kind whatsoever against the other Party in any way arising from or relating to this Agreement, including all exhibits, schedules, attachments, and appendices attached to this Agreement, and all contemplated transactions, including, but not limited to, contract, equity, tort, fraud, and statutory claims, in any forum other than in courts having situs within Cook County, Illinois, and any local, state, or federal court located within Cook County, Illinois. Each Party irrevocably and unconditionally submits to the exclusive jurisdiction of such courts and agrees to bring any such action, litigation, or proceeding only in courts having situs in Cook County, Illinois. Each Party further waives any right it may have to transfer venue of any such action or proceeding. Each Party agrees that a final judgment in any such action, litigation, or proceeding is conclusive and may be enforced in other jurisdictions by suit on the judgment or in any other manner provided by law.' },
  ] },
  { num: '24', title: 'Waiver of Jury Trial', items: [
    { label: '', body: 'EACH PARTY ACKNOWLEDGES THAT ANY CONTROVERSY THAT MAY ARISE UNDER THIS AGREEMENT, INCLUDING EXHIBITS, SCHEDULES, ATTACHMENTS, AND APPENDICES ATTACHED TO THIS AGREEMENT, IS LIKELY TO INVOLVE COMPLICATED AND DIFFICULT ISSUES AND, THEREFORE, EACH SUCH PARTY IRREVOCABLY AND UNCONDITIONALLY WAIVES ANY RIGHT IT MAY HAVE TO A TRIAL BY JURY IN RESPECT OF ANY LEGAL ACTION ARISING OUT OF OR RELATING TO THIS AGREEMENT, INCLUDING ANY EXHIBITS, SCHEDULES, ATTACHMENTS, OR APPENDICES ATTACHED TO THIS AGREEMENT, OR THE TRANSACTIONS CONTEMPLATED HEREBY.' },
  ] },
  { num: '25', title: 'Counterparts', items: [
    { label: '', body: 'This Agreement may be executed in counterparts, each of which is deemed an original, but all of which together are deemed to be one and the same agreement.' },
  ] },
];

// The one true domain going forward. blueprint.uncap.com stays attached
// to this same Worker (see wrangler.toml) purely so old links — some
// already signed by real clients — 301 to their new home here instead of
// breaking.
const GO_HOST = 'go.uncap.com';

// Old blueprint links were bare /<Brand>/... (e.g. /Mitutoyo/). New ones
// are /blueprint/<id>/... (e.g. /blueprint/mitutoyo/). Returns the new
// path if `pathname` matches a known blueprint's old dir, else null.
function legacyBlueprintRedirectPath(pathname) {
  const m = pathname.match(/^\/([A-Za-z0-9-]+)(\/.*)?$/);
  if (!m) return null;
  const entry = BLUEPRINT_REGISTRY.find((b) => b.dir === m[1]);
  if (!entry) return null;
  return `/blueprint/${entry.id}${m[2] || '/'}`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Redirect anything hitting the old domain, and any old-style bare
    // /<Brand>/ path even if it somehow reaches the new domain, to their
    // go.uncap.com home — new-style /blueprint/<id>/ for blueprint pages,
    // same path otherwise (admin dashboard, /build, etc. all live here
    // unchanged, just under the new host).
    if (request.method === 'GET' || request.method === 'HEAD') {
      const legacyPath = legacyBlueprintRedirectPath(url.pathname);
      if (url.hostname !== GO_HOST || legacyPath) {
        const dest = new URL(url.toString());
        dest.protocol = 'https:';
        dest.hostname = GO_HOST;
        dest.port = '';
        if (legacyPath) dest.pathname = legacyPath;
        if (dest.toString() !== url.toString()) {
          return Response.redirect(dest.toString(), 301);
        }
      }
    }

    if (url.pathname === '/api/auth/sign' && request.method === 'POST') {
      return handleSign(request, env, ctx);
    }
    if (url.pathname === '/api/auth/session' && request.method === 'POST') {
      return handleSession(request, env);
    }
    if (url.pathname === '/api/auth/admin/access-log' && request.method === 'POST') {
      return handleAccessLog(request, env);
    }
    if (url.pathname === '/api/auth/my-signature' && request.method === 'POST') {
      return handleMySignature(request, env);
    }

    // ── Admin application API (Google-authenticated Uncap team) ──────────
    if (url.pathname === '/api/admin/config' && request.method === 'GET') {
      return handleAdminConfig(env);
    }
    if (url.pathname === '/api/admin/google-login' && request.method === 'POST') {
      return handleGoogleLogin(request, env);
    }
    if (url.pathname === '/api/admin/me' && request.method === 'GET') {
      return handleAdminMe(request, env);
    }
    if (url.pathname === '/api/admin/logout' && request.method === 'POST') {
      return handleAdminLogout(request, env);
    }

    // Shopify OAuth (one-time install). install is admin-gated inside its
    // handler; callback is validated by state nonce + HMAC (not the admin gate,
    // since Shopify is the caller).
    if (url.pathname === '/api/shopify/install' && (request.method === 'GET' || request.method === 'HEAD')) {
      return handleShopifyInstall(request, env);
    }
    if (url.pathname === '/api/shopify/callback' && (request.method === 'GET' || request.method === 'HEAD')) {
      return handleShopifyCallback(request, env);
    }
    if (url.pathname === '/api/qbo/install' && (request.method === 'GET' || request.method === 'HEAD')) {
      return handleQboInstall(request, env);
    }
    if (url.pathname === '/api/qbo/callback' && (request.method === 'GET' || request.method === 'HEAD')) {
      return handleQboCallback(request, env);
    }

    // Admin approval gate: every other /api/admin/* endpoint requires an
    // APPROVED @uncap.com user. Unapproved users can only check their status
    // (me), sign out, and read config. bp-token is exempt — it has its own
    // dual admin/portal auth and is called by signed-in portal customers.
    if (url.pathname.startsWith('/api/admin/') && url.pathname !== '/api/admin/bp-token') {
      const gate = await getAdminSession(request, env);
      if (!gate) return json(401, { ok: false, error: 'Not signed in' });
      if (!(await adminIsApproved(env, gate.email))) {
        return json(403, { ok: false, error: 'Your account is pending approval from denis@uncap.com.' });
      }
      // Revenue is Admin-only for now.
      if (url.pathname.startsWith('/api/admin/revenue/') && !isSuperAdmin(gate.email)) {
        return json(403, { ok: false, error: 'Revenue is restricted to the Admin.' });
      }
    }

    if (url.pathname === '/api/admin/users' && request.method === 'GET') {
      return handleAdminListUsers(request, env);
    }
    if (url.pathname === '/api/admin/users/approve' && request.method === 'POST') {
      return handleAdminApproveUser(request, env);
    }
    if (url.pathname === '/api/admin/blueprints' && request.method === 'GET') {
      return handleAdminBlueprints(request, env);
    }
    if (url.pathname === '/api/admin/blueprints' && request.method === 'POST') {
      return handleAdminCreateBlueprint(request, env, ctx);
    }
    if (url.pathname === '/api/admin/blueprint/delete' && request.method === 'POST') {
      return handleAdminDeleteBlueprint(request, env);
    }
    if (url.pathname === '/api/admin/blueprint/content' && request.method === 'POST') {
      return handleAdminSaveBlueprintContent(request, env);
    }
    if (url.pathname === '/api/admin/blueprint/generate' && request.method === 'POST') {
      return handleAdminGenerateBlueprint(request, env);
    }
    if (url.pathname === '/api/admin/blueprint-meta' && request.method === 'POST') {
      return handleAdminBlueprintMeta(request, env);
    }
    if (url.pathname === '/api/admin/access-log' && request.method === 'GET') {
      return handleAdminAccessLog(request, env);
    }
    if (url.pathname === '/api/admin/bp-token' && request.method === 'POST') {
      return handleAdminBpToken(request, env);
    }
    if (url.pathname === '/api/admin/revenue/recurring' && request.method === 'GET') {
      return revenueCached(request, env, ctx, () => handleAdminRecurringRevenue(request, env));
    }
    if (url.pathname === '/api/admin/revenue/fixed' && request.method === 'GET') {
      return revenueCached(request, env, ctx, () => handleAdminFixedRevenue(request, env));
    }
    if (url.pathname === '/api/admin/revenue/apps' && request.method === 'GET') {
      return revenueCached(request, env, ctx, () => handleAdminAppsRevenue(request, env));
    }
    if (url.pathname === '/api/admin/revenue/referrals' && request.method === 'GET') {
      return revenueCached(request, env, ctx, () => handleAdminReferralsRevenue(request, env));
    }
    if (url.pathname === '/api/admin/revenue/summary' && request.method === 'GET') {
      return revenueCached(request, env, ctx, () => handleAdminRevenueSummary(request, env));
    }
    if (url.pathname === '/api/admin/discoveries' && request.method === 'GET') {
      return handleAdminListDiscoveries(request, env);
    }
    if (url.pathname === '/api/admin/activity' && request.method === 'GET') {
      return handleAdminActivity(request, env);
    }
    if (url.pathname === '/api/admin/discovery/submission' && request.method === 'GET') {
      return handleAdminDiscoverySubmission(request, env);
    }
    if (url.pathname === '/api/admin/discovery/delete' && request.method === 'POST') {
      return handleAdminDeleteDiscovery(request, env);
    }
    if (url.pathname === '/api/admin/discovery/prefill' && request.method === 'POST') {
      return handleAdminDiscoveryPrefill(request, env);
    }
    if (url.pathname === '/api/discovery/logo' && request.method === 'GET') {
      return handleDiscoveryLogo(request, env);
    }

    // ── Discovery experience (public /discovery/<handle>/) ───────────────
    if (url.pathname === '/api/discovery/meta' && request.method === 'GET') {
      return handleDiscoveryMeta(request, env);
    }
    if (url.pathname === '/api/discovery/request-code' && request.method === 'POST') {
      return handleDiscoveryRequestCode(request, env);
    }
    if (url.pathname === '/api/discovery/verify' && request.method === 'POST') {
      return handleDiscoveryVerify(request, env);
    }
    if (url.pathname === '/api/discovery/answers' && request.method === 'GET') {
      return handleDiscoveryGetAnswers(request, env);
    }
    if (url.pathname === '/api/discovery/answers' && request.method === 'POST') {
      return handleDiscoverySaveAnswers(request, env);
    }
    if (url.pathname === '/api/discovery/submit' && request.method === 'POST') {
      return handleDiscoverySubmit(request, env);
    }
    if (url.pathname === '/api/admin/discoveries' && request.method === 'POST') {
      return handleAdminCreateDiscovery(request, env, ctx);
    }
    if (url.pathname === '/api/admin/attio/companies' && request.method === 'GET') {
      return handleAdminAttioSearchCompanies(request, env);
    }
    if (url.pathname === '/api/admin/attio/people' && request.method === 'GET') {
      return handleAdminAttioSearchPeople(request, env);
    }
    if (url.pathname === '/api/admin/attio/company-people' && request.method === 'GET') {
      return handleAdminAttioCompanyPeople(request, env);
    }
    if (url.pathname === '/api/admin/blueprint-tos' && request.method === 'GET') {
      return handleAdminGetTos(request, env);
    }
    if (url.pathname === '/api/admin/blueprint-tos' && request.method === 'POST') {
      return handleAdminSaveTos(request, env);
    }
    // Public read so a blueprint page itself (sign modal, print modes) can
    // pull the current custom Terms of Service text — not sensitive, just
    // legal copy, so no session is required here.
    if (url.pathname === '/api/blueprint-tos' && request.method === 'GET') {
      return handlePublicTos(request, env);
    }
    // Manual override backing the admin dashboard's status dropdown, for
    // marking a blueprint signed when the client signed a physical/paper
    // copy instead of using the digital flow (or clearing that record).
    if (url.pathname === '/api/admin/companies' && request.method === 'GET') {
      return handleAdminListCompanies(request, env);
    }
    if (url.pathname === '/api/admin/companies' && request.method === 'POST') {
      return handleAdminCreateCompany(request, env);
    }
    if (url.pathname === '/api/admin/company/update' && request.method === 'POST') {
      return handleAdminUpdateCompany(request, env);
    }
    if (url.pathname === '/api/admin/company/delete' && request.method === 'POST') {
      return handleAdminDeleteCompany(request, env);
    }
    if (url.pathname === '/api/admin/company/invite' && request.method === 'POST') {
      return handleAdminCompanyInvite(request, env);
    }
    if (url.pathname === '/api/admin/company/file' && request.method === 'POST') {
      return handleAdminCompanyFileUpload(request, env);
    }
    if (url.pathname === '/api/admin/company/file-delete' && request.method === 'POST') {
      return handleAdminCompanyFileDelete(request, env);
    }
    if (url.pathname === '/api/admin/company/file' && request.method === 'GET') {
      return handleAdminCompanyFileGet(request, env);
    }
    if (url.pathname === '/api/company/logo' && request.method === 'GET') {
      return handleCompanyLogo(request, env);
    }
    if (url.pathname === '/api/blueprint/content' && request.method === 'GET') {
      return handleBlueprintContent(request, env);
    }
    if (url.pathname === '/api/portal/request-code' && request.method === 'POST') {
      return handlePortalRequestCode(request, env);
    }
    if (url.pathname === '/api/portal/verify' && request.method === 'POST') {
      return handlePortalVerify(request, env);
    }
    if (url.pathname === '/api/portal/me' && request.method === 'GET') {
      return handlePortalMe(request, env);
    }
    if (url.pathname === '/api/portal/file' && request.method === 'GET') {
      return handlePortalFile(request, env);
    }
    if (url.pathname === '/api/portal/logout' && request.method === 'POST') {
      return handlePortalLogout(request, env);
    }
    if (url.pathname === '/api/admin/mark-signed' && request.method === 'POST') {
      return handleAdminMarkSigned(request, env);
    }

    // /discovery/<handle>/ is the single discovery experience app, served
    // for any handle. The app reads the handle from location.pathname and
    // loads its data over /api/discovery/*. Handles are dot-free slugs, so
    // real assets under /discovery/ (index.html, *.jsx, *.js — all with a
    // dot) never match here and are served normally by Static Assets.
    // Clean URLs for the static legal pages: /legal/privacy and /legal/terms
    // map to their .html assets (html_handling is off, so we route explicitly).
    const legalMatch = url.pathname.match(/^\/legal\/(privacy|terms)\/?$/);
    if (legalMatch && (request.method === 'GET' || request.method === 'HEAD')) {
      const assetUrl = new URL(url.toString());
      assetUrl.pathname = `/legal/${legalMatch[1]}.html`;
      return withSecurityHeaders(await env.ASSETS.fetch(new Request(assetUrl.toString(), request)));
    }

    // The admin dashboard lives at /admin (client-side routes /admin/
    // discoveries|blueprints|companies and the company profile page
    // /admin/company/<id> included); the root is the portal.
    if (/^\/admin(\/(discoveries|blueprints|companies|users|projects|retainers|dashboard|revenues(\/(fixed|recurring|apps|referrals))?|company\/[a-z0-9-]+|blueprint\/[a-z0-9-]+))?\/?$/.test(url.pathname) && (request.method === 'GET' || request.method === 'HEAD')) {
      const assetUrl = new URL(url.toString());
      assetUrl.pathname = '/admin/index.html';
      return withSecurityHeaders(await env.ASSETS.fetch(new Request(assetUrl.toString(), request)));
    }

    // ── Per-company portal folders ───────────────────────────────────────
    // Every company lives at /<companyId>/ (id = its store domain label):
    //   /<id>/company   → portal shell (profile, team, documents)
    //   /<id>/discovery → the discovery experience (or portal fallback)
    //   /<id>/blueprint → the blueprint proposal (or portal fallback)
    //   /<id>/delivery, /<id>/growth → portal shell placeholders
    // Future portal functions keep extending this folder structure.
    if (request.method === 'GET' || request.method === 'HEAD') {
      // Embedded experience documents: the portal shell keeps its toolbar
      // and loads the real discovery / blueprint page in a frame from
      // /<id>/<tab>/app. Relative blueprint assets resolve against
      // /<id>/blueprint/ and are mapped below.
      const coApp = url.pathname.match(/^\/([a-z0-9-]{2,60})\/(discovery|blueprint)\/app(\/?)$/);
      if (coApp && !PORTAL_RESERVED.has(coApp[1])) {
        if (coApp[3]) return Response.redirect(`${url.origin}/${coApp[1]}/${coApp[2]}/app`, 301);
        const co = await getCompany(env, coApp[1]);
        if (co) {
          if (coApp[2] === 'discovery' && co.discoveryHandle) {
            const assetUrl = new URL(url.toString());
            assetUrl.pathname = '/discovery/index.html';
            return withSecurityHeaders(await env.ASSETS.fetch(new Request(assetUrl.toString(), request)));
          }
          if (coApp[2] === 'blueprint' && co.blueprintId) {
            // Bespoke shipped page wins; else the dynamic templated page when
            // the draft's content is ready.
            const entry = BLUEPRINT_REGISTRY.find((b) => b.id === co.blueprintId);
            if (entry) {
              const assetUrl = new URL(url.toString());
              assetUrl.pathname = `/${entry.dir}/index.html`;
              return withSecurityHeaders(await env.ASSETS.fetch(new Request(assetUrl.toString(), request)));
            }
            if (await blueprintIsViewable(env, co.blueprintId)) {
              const assetUrl = new URL(url.toString());
              assetUrl.pathname = '/blueprint-template/index.html';
              return withSecurityHeaders(await env.ASSETS.fetch(new Request(assetUrl.toString(), request)));
            }
          }
        }
      }
      // Tab pages always render the portal shell — the toolbar never
      // disappears; the shell embeds the experience below it.
      const coMatch = url.pathname.match(/^\/([a-z0-9-]{2,60})(?:\/(company|discovery|blueprint|delivery|growth))?\/?$/);
      if (coMatch && !PORTAL_RESERVED.has(coMatch[1])) {
        const co = await getCompany(env, coMatch[1]);
        if (co) {
          if (!coMatch[2]) return Response.redirect(`${url.origin}/${co.id}/company`, 302);
          const assetUrl = new URL(url.toString());
          assetUrl.pathname = '/index.html';
          return withSecurityHeaders(await env.ASSETS.fetch(new Request(assetUrl.toString(), request)));
        }
      }
      // Blueprint sub-assets under the company folder: /<id>/blueprint/<rest>
      const coBpSub = url.pathname.match(/^\/([a-z0-9-]{2,60})\/blueprint\/(.+)$/);
      if (coBpSub && !PORTAL_RESERVED.has(coBpSub[1]) && coBpSub[2] !== 'app') {
        const co = await getCompany(env, coBpSub[1]);
        const entry = co && co.blueprintId ? BLUEPRINT_REGISTRY.find((b) => b.id === co.blueprintId) : null;
        if (entry) {
          const assetUrl = new URL(url.toString());
          assetUrl.pathname = `/${entry.dir}/${coBpSub[2]}`;
          return withSecurityHeaders(await env.ASSETS.fetch(new Request(assetUrl.toString(), request)));
        }
      }
    }

    const discMatch = url.pathname.match(/^\/discovery\/([a-z0-9-]+)\/?$/);
    if (discMatch && (request.method === 'GET' || request.method === 'HEAD')) {
      // Old-style discovery URL: send it to the company folder when one
      // owns this discovery, so every client lands on the new experience.
      // Admins previewing from the dashboard get the raw page (no redirect)
      // so it can render framed inside the admin shell.
      const owner = await findCompanyByDiscoveryHandle(env, discMatch[1]);
      if (owner && !(await getAdminSession(request, env))) {
        return Response.redirect(`${url.origin}/${owner.id}/discovery`, 301);
      }
      const assetUrl = new URL(url.toString());
      assetUrl.pathname = '/discovery/index.html';
      return withSecurityHeaders(await env.ASSETS.fetch(new Request(assetUrl.toString(), request)));
    }

    // /blueprint/<id>/<rest> is a transparent alias for the blueprint's
    // actual static files at /<dir>/<rest> — no files moved, this Worker
    // just rewrites the request before handing it to Static Assets. Every
    // sub-resource (CSS/JS/images) the page requests relatively also
    // passes back through this same fetch handler, so the whole page
    // resolves correctly under its new URL without touching any of the
    // per-blueprint HTML/JS.
    const bpMatch = url.pathname.match(/^\/blueprint\/([a-z0-9-]+)(\/.*)?$/);
    if (bpMatch) {
      const entry = BLUEPRINT_REGISTRY.find((b) => b.id === bpMatch[1]);
      if (entry) {
        // Disabled blueprints: block the page document itself for anyone
        // without an admin session. Only the index path, so regular
        // sub-asset traffic (CSS/JS/images) never pays the KV lookup.
        const rest = bpMatch[2] || '/';
        if (request.method === 'GET' && (rest === '/' || rest === '/index.html')) {
          // Old-style blueprint URL: redirect the document to its company
          // folder; sub-assets keep serving from here untouched. Admins
          // previewing from the dashboard get the raw page (no redirect) so
          // it can render framed inside the admin shell.
          const owner = await findCompanyByBlueprintId(env, entry.id);
          if (owner && !(await getAdminSession(request, env))) {
            return Response.redirect(`${url.origin}/${owner.id}/blueprint/`, 301);
          }
          const meta = await getBpMeta(env, entry.id);
          if (meta.disabled) {
            const adminSess = await getAdminSession(request, env);
            if (!adminSess) return disabledBlueprintPage();
          }
        }
        // Resolve the directory-index case ourselves rather than relying
        // on Static Assets' automatic index.html-for-trailing-slash
        // behavior, which may not apply the same way to a synthetically
        // constructed Request as it does to the original incoming one.
        const assetPath = rest === '/' ? '/index.html' : rest;
        const assetUrl = new URL(url.toString());
        assetUrl.pathname = `/${entry.dir}${assetPath}`;
        return withSecurityHeaders(await env.ASSETS.fetch(new Request(assetUrl.toString(), request)));
      }
      // Not in the registry: an admin previewing a templated draft gets the
      // dynamic page here (even before it's marked ready), so the editor's
      // Preview shows work-in-progress. Non-admins never reach a draft this
      // way — its real URL is the company folder, gated by the portal.
      const rest = bpMatch[2] || '/';
      if (request.method === 'GET' && (rest === '/' || rest === '/index.html')) {
        const draft = await blueprintDraft(env, bpMatch[1]);
        if (draft && draft.content && await getAdminSession(request, env)) {
          const assetUrl = new URL(url.toString());
          assetUrl.pathname = '/blueprint-template/index.html';
          return withSecurityHeaders(await env.ASSETS.fetch(new Request(assetUrl.toString(), request)));
        }
      }
      // Unknown slug under /blueprint/ — fall through to the normal
      // static-asset/SPA-fallback handling below (same as any other 404).
    }

    return withSecurityHeaders(await env.ASSETS.fetch(request));
  },
};

function disabledBlueprintPage() {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex,nofollow"/><title>Uncap Blueprint</title>
<style>html,body{margin:0;height:100%;background:#F2EFE7;-webkit-font-smoothing:antialiased}
body{display:flex;align-items:center;justify-content:center;font-family:Inter,-apple-system,sans-serif;color:#0A0A0A}
.card{max-width:420px;padding:40px 32px;text-align:center}
.eyebrow{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#8A8780;margin-bottom:14px}
h1{font-size:24px;letter-spacing:-.02em;margin:0 0 10px}p{font-size:14.5px;line-height:1.55;color:#4A4A4A;margin:0}</style>
</head><body><div class="card"><div class="eyebrow">Uncap Blueprint</div>
<h1>This proposal is no longer available.</h1>
<p>The link has been deactivated. If you believe this is a mistake, contact your Uncap lead or email hey@uncap.com.</p>
</div></body></html>`;
  return withSecurityHeaders(new Response(html, { status: 403, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } }));
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
// Security response headers applied to every worker response (API JSON,
// static assets, blueprint pages). The CSP is deliberately compatible with
// the no-build/in-browser-Babel architecture — @babel/standalone needs
// 'unsafe-eval' and the inline `text/babel` scripts need 'unsafe-inline' —
// but it still locks the exfiltration-relevant directives: connect-src is
// same-origin only (a stolen bearer token can't be POSTed to an attacker
// host), frame-ancestors 'self' allows only our own portal shell to frame
// pages (the discovery/blueprint embeds) while still blocking clickjacking
// from other origins, and script/style/font
// origins are pinned to the three known externals (Google Sign-In, Google
// Fonts, and unpkg for the two SRI-pinned print/demo pages).
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://unpkg.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' data: https:",
  "connect-src 'self' https://accounts.google.com",
  "frame-src 'self' https://accounts.google.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const SECURITY_HEADERS = {
  'Content-Security-Policy': CSP,
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Permissions-Policy': 'geolocation=(), camera=(), microphone=(), payment=()',
};

// Reattach headers on a (possibly immutable) response by rebuilding it.
function withSecurityHeaders(resp) {
  const headers = new Headers(resp.headers);
  for (const k in SECURITY_HEADERS) headers.set(k, SECURITY_HEADERS[k]);
  return new Response(resp.body, { status: resp.status, statusText: resp.statusText, headers });
}

const json = (status, body) =>
  withSecurityHeaders(new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  }));

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

// Strip CR/LF so a user-supplied value can't inject additional email
// headers when interpolated into the raw MIME header block.
const stripHeaderValue = (s) => String(s == null ? '' : s).replace(/[\r\n]+/g, ' ').trim();

const clientIp = (request) => request.headers.get('CF-Connecting-IP') || '';
const clientUa = (request) => request.headers.get('User-Agent') || '';

// Coarse, eventually-consistent fixed-window rate limiter backed by KV.
// Not a precise quota — it exists to blunt brute-force and email-bombing.
// Returns true if the caller is under the limit (and counts this hit),
// false if the window is exhausted.
async function rateLimit(env, key, max, windowSec) {
  const bucket = Math.floor(Date.now() / 1000 / windowSec);
  const k = `rl:${key}:${bucket}`;
  let n = 0;
  try { n = parseInt(await env.BLUEPRINT_AUTH.get(k), 10) || 0; } catch { n = 0; }
  if (n >= max) return false;
  await env.BLUEPRINT_AUTH.put(k, String(n + 1), { expirationTtl: windowSec + 60 }).catch(() => {});
  return true;
}

// Fetch + parse a blueprint bearer session, tolerating a corrupt record.
async function getBlueprintSession(env, token) {
  const raw = await env.BLUEPRINT_AUTH.get(`session:${token}`);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// Blueprint bearer sessions are bound to the IP + User-Agent they were
// minted for, so a token exfiltrated via page XSS can't be replayed from
// elsewhere. Only enforced when the session actually carries the bound
// values, so pre-existing sessions aren't force-logged-out on rollout.
function sessionBindingOk(sess, request) {
  if (!sess) return false;
  if (sess.ip && sess.ip !== clientIp(request)) return false;
  if (sess.userAgent && sess.userAgent !== clientUa(request)) return false;
  return true;
}

function genCode() {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(buf[0] % 1_000_000).padStart(6, '0');
}

function genToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function normalizeBlueprintId(raw) {
  return (raw || 'unknown').toString().trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'unknown';
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A Client Lead or Associated Contact picked from Attio. attioId is kept
// for reference/back-linking; email is what actually matters for access.
function sanitizeContact(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const email = (raw.email || '').toString().trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) return null;
  return {
    attioId: (raw.attioId || '').toString().trim().slice(0, 100),
    name: (raw.name || '').toString().trim().slice(0, 200),
    email,
  };
}

function sanitizeContacts(raw, max) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const item of raw) {
    const c = sanitizeContact(item);
    if (c && !out.some((existing) => existing.email === c.email)) out.push(c);
    if (out.length >= (max || 20)) break;
  }
  return out;
}

// ----------------------------------------------------------------------------
// Handlers
// ----------------------------------------------------------------------------
function genRandSlug() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// Lightweight session lookup — the admin toolbar polls this on mount to
// decide whether to render itself, and to know what to call /admin
// endpoints with. Returns the session record minus internal fields.
async function handleSession(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const token = (body.token || '').toString().trim();
  if (!token) return json(400, { ok: false, error: 'Missing token' });

  const sess = await getBlueprintSession(env, token);
  if (!sess) return json(401, { ok: false, error: 'Session expired' });
  if (!sessionBindingOk(sess, request)) return json(401, { ok: false, error: 'Session expired' });
  return json(200, {
    ok: true,
    email:       sess.email || '',
    admin:       !!sess.admin,
    selfTest:    !!sess.selfTest,
    blueprintId: sess.blueprintId || '',
  });
}

// Returns the access log for a given blueprintId — verification events
// and signature events sorted newest-first. Only callable by admin or
// self-test sessions (the @uncap.com team override). Anyone else
// gets a 403.
async function handleAccessLog(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const token       = (body.token || '').toString().trim();
  const blueprintId = normalizeBlueprintId(body.blueprintId);
  if (!token) return json(400, { ok: false, error: 'Missing token' });

  const sess = await getBlueprintSession(env, token);
  if (!sess) return json(401, { ok: false, error: 'Session expired' });
  if (!sessionBindingOk(sess, request)) return json(401, { ok: false, error: 'Session expired' });
  if (!sess.admin && !sess.selfTest) return json(403, { ok: false, error: 'Not authorised' });

  const events = await listBlueprintEvents(env, blueprintId);
  return json(200, { ok: true, blueprintId, events });
}

// Lets a signer fetch their own signature record so they can download a
// signed copy without any admin privilege — the signature record is keyed
// by the exact session token that signed it (signature:<blueprintId>:<token>),
// so this can only ever return the caller's own signature, never anyone
// else's.
async function handleMySignature(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const token = (body.token || '').toString().trim();
  if (!token) return json(400, { ok: false, error: 'Missing token' });

  const sess = await getBlueprintSession(env, token);
  if (!sess) return json(401, { ok: false, error: 'Session expired' });
  if (!sessionBindingOk(sess, request)) return json(401, { ok: false, error: 'Session expired' });

  const sigRaw = await env.BLUEPRINT_AUTH.get(`signature:${sess.blueprintId}:${token}`);
  if (!sigRaw) return json(200, { ok: true, signature: null });
  try {
    return json(200, { ok: true, signature: JSON.parse(sigRaw) });
  } catch {
    return json(200, { ok: true, signature: null });
  }
}

// List up to 200 events of each type for a blueprint — verification
// events and signature events merged, newest-first. KV keys for access
// events are prefixed with the inverted timestamp so a plain prefix scan
// returns them already sorted; signature events don't carry the inverted
// prefix (the existing key shape stays stable for audit), so we sort
// in-memory.
async function listBlueprintEvents(env, blueprintId) {
  const [accessList, signList] = await Promise.all([
    env.BLUEPRINT_AUTH.list({ prefix: `access:${blueprintId}:`, limit: 200 }),
    env.BLUEPRINT_AUTH.list({ prefix: `signature:${blueprintId}:`, limit: 200 }),
  ]);

  const accessEvents = await Promise.all(
    accessList.keys.map((k) => env.BLUEPRINT_AUTH.get(k.name).then((v) => {
      if (!v) return null;
      try {
        const rec = JSON.parse(v);
        // Uncap team logins aren't tracked anymore; hide the ones
        // recorded before that change too.
        if (rec.selfTest || (rec.email || '').endsWith('@uncap.com')) return null;
        return { type: 'view', ...rec };
      } catch { return null; }
    }))
  );
  const signEvents = await Promise.all(
    signList.keys.map((k) => env.BLUEPRINT_AUTH.get(k.name).then((v) => {
      if (!v) return null;
      try { return { type: 'sign', ...JSON.parse(v) }; } catch { return null; }
    }))
  );

  return [...accessEvents.filter(Boolean), ...signEvents.filter(Boolean)]
    .sort((a, b) => {
      const ta = new Date(a.verifiedAt || a.signedAt || 0).getTime();
      const tb = new Date(b.verifiedAt || b.signedAt || 0).getTime();
      return tb - ta;
    });
}

// ── Cross-entity activity feed ───────────────────────────────────────────
// Append-only lifecycle log backing the dashboard home page: one record per
// create / edit / status-change / sign across both blueprints and
// discoveries. The key carries an inverted timestamp so a plain prefix scan
// returns newest-first (same trick as access:/discovery:). Best-effort — a
// failed write must never block the action that triggered it.
async function logActivity(env, ctx, ev) {
  const ts = Date.now();
  const key = `activity:${(9_999_999_999_999 - ts).toString(36).padStart(10, '0')}:${genRandSlug()}`;
  const rec = {
    ts:     new Date(ts).toISOString(),
    type:   (ev.type   || '').toString().slice(0, 20),   // created | edited | signed | status
    entity: (ev.entity || '').toString().slice(0, 20),   // blueprint | discovery
    id:     (ev.id     || '').toString().slice(0, 120),
    name:   (ev.name   || '').toString().slice(0, 200),
    actor:  (ev.actor  || '').toString().slice(0, 200),
    detail: (ev.detail || '').toString().slice(0, 300),
  };
  if (ev.ref) rec.ref = ev.ref.toString().slice(0, 120);
  const write = env.BLUEPRINT_AUTH.put(key, JSON.stringify(rec), { expirationTtl: ACCESS_LOG_TTL_SECONDS }).catch(() => {});
  if (ctx && ctx.waitUntil) ctx.waitUntil(write); else await write;
}

// Best-effort human-readable name for a blueprint id: shipped registry name,
// else the draft record's name, else the id itself.
async function bpDisplayName(env, id) {
  const reg = BLUEPRINT_REGISTRY.find((b) => b.id === id);
  if (reg) return reg.name;
  const raw = await env.BLUEPRINT_AUTH.get(`bp:${id}`);
  if (raw) { try { return JSON.parse(raw).name || id; } catch {} }
  return id;
}

// Records an Approve & kickoff signature. Writes a permanent KV record
// (1-year TTL) under signature:<blueprintId>:<token> and sends a richer
// notification email to denis@uncap.com that includes the signer's name,
// title, email, timestamp, IP, and user-agent.
//
// Skip rules:
//   - admin sessions   → no KV write, no email (we don't want admin
//                        previews polluting the audit log either).
//   - self-test session → KV record IS written, no email. Lets denis
//                        rehearse the full flow and verify the record
//                        without inbox spam.
async function handleSign(request, env, ctx) {
  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

  const token = (body.token || '').toString().trim();
  // Strip CR/LF: name flows into the notification email's Subject line.
  const name  = stripHeaderValue((body.name || '').toString()).slice(0, 200);
  const title = stripHeaderValue((body.title || '').toString()).slice(0, 200);
  if (!token)        return json(400, { ok: false, error: 'Missing token' });
  if (!name || !title) return json(400, { ok: false, error: 'Both fields required' });

  const sess = await getBlueprintSession(env, token);
  if (!sess) return json(401, { ok: false, error: 'Session expired' });
  if (!sessionBindingOk(sess, request)) return json(401, { ok: false, error: 'Session expired' });

  if (sess.admin) return json(200, { ok: true, skipped: 'admin' });

  const ip        = request.headers.get('CF-Connecting-IP') || '';
  const userAgent = request.headers.get('User-Agent') || '';
  const signedAt  = new Date().toISOString();

  const record = {
    blueprintId: sess.blueprintId,
    email:       sess.email,
    name, title,
    signedAt, ip, userAgent,
  };

  // Persist the signature record. 1-year TTL is long enough for any
  // contract follow-up; KV will lazily evict it after that.
  try {
    await env.BLUEPRINT_AUTH.put(
      `signature:${sess.blueprintId}:${token}`,
      JSON.stringify(record),
      { expirationTtl: SIGNATURE_TTL_SECONDS }
    );
  } catch (err) {
    console.error('signature write failed:', err && err.message);
    return json(502, { ok: false, error: 'Could not record the signature right now. Try again shortly.' });
  }

  // Best-effort rollup so the admin app's blueprint list can show signed
  // status with a single get instead of a prefix scan per blueprint.
  const rollup = env.BLUEPRINT_AUTH.put(
    `bpsigned:${sess.blueprintId}`,
    JSON.stringify(record),
    { expirationTtl: SIGNATURE_TTL_SECONDS }
  ).catch(() => {});
  if (ctx && ctx.waitUntil) ctx.waitUntil(rollup);

  // Self-test sessions write the record but never email.
  if (sess.selfTest) return json(200, { ok: true, skipped: 'self-test' });

  await logActivity(env, ctx, { type: 'signed', entity: 'blueprint', id: sess.blueprintId, name: await bpDisplayName(env, sess.blueprintId), actor: sess.email, detail: `${name}${title ? ', ' + title : ''}` });

  const subject = `[Blueprint] ${sess.blueprintId} APPROVED by ${name} (${sess.email})`;
  const text =
    `Approval recorded for /${sess.blueprintId}/.\n\n` +
    `Signer: ${name}\n` +
    `Title:  ${title}\n` +
    `Email:  ${sess.email}\n` +
    `Time:   ${signedAt}\n` +
    `IP:     ${ip}\n` +
    `Agent:  ${userAgent}\n`;

  try {
    await notifyAdmin(env, { subject, text });
    return json(200, { ok: true });
  } catch (err) {
    // Record is already in KV; treat email failure as a 200 with a soft
    // warning so the client still gets confirmation. The signature stays.
    return json(200, { ok: true, emailError: err.message || 'send failed' });
  }
}

// ----------------------------------------------------------------------------
// Admin application — Google-authenticated area for the Uncap team.
//
// The root page (blueprint.uncap.com/) is the admin app. Sign-in is Google
// Identity Services: the page posts Google's ID token (a JWT) here, we
// verify the signature against Google's JWKS, require a verified
// @uncap.com address, and mint a KV-backed session carried by an HttpOnly
// __Host-bp_admin cookie. Because the cookie is scoped to the whole origin, the
// per-client blueprint gates can also mint preview sessions from it
// (POST /api/admin/bp-token), letting the team open any blueprint without
// the email-code step.
// ----------------------------------------------------------------------------

const ADMIN_SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

// __Host- prefix: the browser enforces Secure + Path=/ + no Domain, so a
// sibling subdomain can't set or overwrite this cookie for the apex host.
// (Renaming from the old bp_admin invalidates current admin sessions once;
// the team just re-signs in with Google.)
const ADMIN_COOKIE = '__Host-bp_admin';

// ── Admin hierarchy ───────────────────────────────────────────────────────
// Any @uncap.com Google account can sign in, but a new user stays "pending"
// until the super admin approves them. The super admin (denis) is the only
// one who can approve/revoke users and delete companies/discoveries.
// KV: adminuser:<email> → { email, name, picture, approved, approvedBy,
// approvedAt, createdAt, lastLoginAt }.
const SUPER_ADMIN_EMAIL = 'denis@uncap.com';
// Seeded teammates are auto-approved and land as Management (one tier below
// Admin). Not revocable or downgradable.
const SEED_MANAGEMENT = ['ryan@uncap.com', 'mj@uncap.com'];
const isSuperAdmin = (email) => (email || '').toString().toLowerCase() === SUPER_ADMIN_EMAIL;

// Team roles, most to least privileged:
//   admin       — denis@uncap.com only. Manages users/roles + can do everything.
//   management  — approved by the Admin. Full content access + delete + reopen.
//   staff       — approved by the Admin. Create/edit/invite/view; no deletes.
//   pending     — signed in with @uncap.com but not approved. No access.
const ROLE_ADMIN = 'admin';
const ROLE_MANAGEMENT = 'management';
const ROLE_STAFF = 'staff';
const ROLE_PENDING = 'pending';
const ASSIGNABLE_ROLES = [ROLE_MANAGEMENT, ROLE_STAFF];

async function getAdminUser(env, email) {
  const e = (email || '').toString().toLowerCase();
  const raw = await env.BLUEPRINT_AUTH.get(`adminuser:${e}`);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

async function upsertAdminUser(env, email, patch) {
  const e = (email || '').toString().toLowerCase();
  const cur = (await getAdminUser(env, e)) || { email: e, approved: false, createdAt: new Date().toISOString() };
  const next = { ...cur, ...patch, email: e };
  await env.BLUEPRINT_AUTH.put(`adminuser:${e}`, JSON.stringify(next));
  return next;
}

// Resolve a role from an email + its record. Admin and seeded Management are
// computed; everyone else comes from the record. Legacy approved records with
// no explicit role default to Staff (the lower tier).
function roleFromRecord(email, u) {
  const e = (email || '').toString().toLowerCase();
  if (isSuperAdmin(e)) return ROLE_ADMIN;
  if (SEED_MANAGEMENT.includes(e)) return ROLE_MANAGEMENT;
  if (u && u.approved) return (u.role === ROLE_MANAGEMENT || u.role === ROLE_STAFF) ? u.role : ROLE_STAFF;
  return ROLE_PENDING;
}

async function getAdminRole(env, email) {
  const e = (email || '').toString().toLowerCase();
  if (isSuperAdmin(e)) return ROLE_ADMIN;
  if (SEED_MANAGEMENT.includes(e)) return ROLE_MANAGEMENT;
  return roleFromRecord(e, await getAdminUser(env, e));
}

// Approved = holds any team role (Admin / Management / Staff), i.e. not pending.
async function adminIsApproved(env, email) {
  return (await getAdminRole(env, email)) !== ROLE_PENDING;
}

// Delete content + reopen signed blueprints: Admin or Management only.
async function adminCanDelete(env, email) {
  const r = await getAdminRole(env, email);
  return r === ROLE_ADMIN || r === ROLE_MANAGEMENT;
}

// Make sure the Admin and seeded Management teammates always exist as approved
// records with the right role so they show in the Users list before first
// sign-in.
async function seedAdminUsers(env) {
  const seeds = [[SUPER_ADMIN_EMAIL, ROLE_ADMIN], ...SEED_MANAGEMENT.map((e) => [e, ROLE_MANAGEMENT])];
  for (const [e, role] of seeds) {
    const u = await getAdminUser(env, e);
    if (!u || !u.approved || u.role !== role) {
      await upsertAdminUser(env, e, { approved: true, role, approvedBy: (u && u.approvedBy) || 'system', approvedAt: (u && u.approvedAt) || new Date().toISOString() });
    }
  }
}

// ── Shopify integration (Revenues > Recurring) ────────────────────────────
// Reads paid orders from the Shopify Admin API. Two ways to authenticate:
//   A) Store custom app: set SHOPIFY_ADMIN_TOKEN (shpat_...) as a secret.
//   B) Dev Dashboard app (Client ID + secret): run the one-time OAuth install
//      (/api/shopify/install), which stores an offline token in KV under
//      `shopify:admin_token`. Env token (A) wins if present.
// Vars/secrets (Cloudflare dashboard, not wrangler.toml — deploys --keep-vars):
//   SHOPIFY_SHOP_DOMAIN   — <store>.myshopify.com                [var]
//   SHOPIFY_STORE_HANDLE  — admin.shopify.com/store/<handle>, for links [var]
//   SHOPIFY_ADMIN_TOKEN   — path A only                          [secret]
//   SHOPIFY_CLIENT_ID     — path B (App Client ID)               [var]
//   SHOPIFY_CLIENT_SECRET — path B (shpss_...)                   [secret]
//   SHOPIFY_SCOPES        — optional; default read_orders        [var]
//   SHOPIFY_API_VERSION   — optional; default below              [var]
const SHOPIFY_API_VERSION_DEFAULT = '2025-10';
const SHOPIFY_SCOPES_DEFAULT = 'read_orders';
const SHOPIFY_TOKEN_KEY = 'shopify:admin_token';
const SHOPIFY_SHOP_KEY = 'shopify:shop_domain';

function shopifyConfig(env) {
  return {
    domain: (env.SHOPIFY_SHOP_DOMAIN || '').toString().trim().replace(/^https?:\/\//, '').replace(/\/+$/, ''),
    handle: (env.SHOPIFY_STORE_HANDLE || '').toString().trim(),
    version: (env.SHOPIFY_API_VERSION || SHOPIFY_API_VERSION_DEFAULT).toString().trim(),
    clientId: (env.SHOPIFY_CLIENT_ID || '').toString().trim(),
    clientSecret: (env.SHOPIFY_CLIENT_SECRET || '').toString().trim(),
    scopes: (env.SHOPIFY_SCOPES || SHOPIFY_SCOPES_DEFAULT).toString().trim(),
  };
}

// Effective token: a real Admin token from the env secret (path A) wins, else
// the OAuth token from KV (path B). The env value is only honoured if it looks
// like an Admin API token (shpat_/shpca_/shpua_) — a mis-pasted API key, client
// ID, or app secret (shpss_) is ignored so it can't mask a valid OAuth token.
async function shopifyGetToken(env) {
  const direct = (env.SHOPIFY_ADMIN_TOKEN || '').toString().trim();
  if (/^shp(at|ca|ua)_/.test(direct)) return direct;
  return (await env.BLUEPRINT_AUTH.get(SHOPIFY_TOKEN_KEY)) || '';
}

// Effective shop domain: the canonical *.myshopify.com captured during OAuth
// (KV) wins over the configured env hint, so the token and API calls always
// target the shop Shopify actually authenticated.
async function shopifyShopDomain(env) {
  const kv = await env.BLUEPRINT_AUTH.get(SHOPIFY_SHOP_KEY);
  if (kv) return kv;
  return (env.SHOPIFY_SHOP_DOMAIN || '').toString().trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

// Fetch paid orders in [fromISO, toISO], following REST Link-header pagination
// up to a page cap (250/page). Returns { orders, truncated }.
async function shopifyFetchPaidOrders(env, shop, token, fromISO, toISO, pageCap = 12) {
  const cfg = shopifyConfig(env);
  const fields = 'id,name,created_at,processed_at,total_price,current_total_price,currency,financial_status,customer';
  let url = `https://${shop}/admin/api/${cfg.version}/orders.json?status=any&financial_status=paid&limit=250`
    + `&created_at_min=${encodeURIComponent(fromISO)}&created_at_max=${encodeURIComponent(toISO)}`
    + `&fields=${encodeURIComponent(fields)}`;
  const out = [];
  let truncated = false;
  for (let page = 0; page < pageCap; page++) {
    const resp = await fetch(url, { headers: { 'X-Shopify-Access-Token': token, 'Accept': 'application/json' } });
    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      throw new Error(`Shopify ${resp.status}: ${body.slice(0, 180)}`);
    }
    const data = await resp.json().catch(() => ({}));
    out.push(...(Array.isArray(data.orders) ? data.orders : []));
    const link = resp.headers.get('Link') || resp.headers.get('link') || '';
    const m = link.match(/<([^>]+)>;\s*rel="next"/);
    if (!m) break;
    url = m[1];
    if (page === pageCap - 1) truncated = true;
  }
  return { orders: out, truncated };
}

// ── Revenue read-through cache (stale-while-revalidate) ───────────────────
// The revenue endpoints each fan out to slow, rate-limited external APIs
// (Shopify, Stripe, QuickBooks, Shopify Partner) with pagination, so a live
// recompute can take several seconds. We cache each computed response in KV
// and serve it stale-while-revalidate: a value younger than FRESH is returned
// as is; an older-but-usable value is returned instantly while a background
// refresh runs (ctx.waitUntil), so OS paints numbers immediately and self-
// heals within minutes. ?refresh=1 forces a live recompute and re-primes.
const REVENUE_CACHE_FRESH_MS = 5 * 60 * 1000;        // serve without revalidating
const REVENUE_CACHE_MAX_MS = 24 * 60 * 60 * 1000;    // usable-but-stale ceiling
const REVENUE_CACHE_TTL_SEC = 7 * 24 * 60 * 60;      // KV row lifetime

// Stable cache key from the request path + query (minus the refresh flag).
function revenueCacheKey(url) {
  const p = new URLSearchParams(url.search);
  p.delete('refresh');
  p.sort();
  // Bump the version when the response shape changes so old bodies are ignored.
  return `revcache:v3:${url.pathname}?${p.toString()}`;
}

// Wrap a handler (which returns a Response) with the SWR cache. Only 200/ok
// bodies are cached, so a transient failure never gets pinned.
async function revenueCached(request, env, ctx, compute) {
  const url = new URL(request.url);
  const force = url.searchParams.get('refresh') === '1';
  const key = revenueCacheKey(url);

  let cached = null;
  if (!force) {
    try { cached = JSON.parse((await env.BLUEPRINT_AUTH.get(key)) || 'null'); } catch { cached = null; }
  }
  const now = Date.now();
  const age = cached ? now - (cached.at || 0) : Infinity;

  const withMeta = (bodyStr, at, stale) => {
    let obj;
    try { obj = JSON.parse(bodyStr); } catch { return json(200, { ok: true }); }
    obj.cachedAt = at;
    obj.cacheAgeMs = Date.now() - at;
    obj.stale = stale;
    return json(200, obj);
  };

  const recompute = async () => {
    const resp = await compute();
    const text = await resp.clone().text();
    let ok = false, partial = false;
    try { const b = JSON.parse(text); ok = b.ok === true; partial = b.partial === true; } catch { ok = false; }
    // Never cache a partial read (a source errored, so a total is under-counted)
    // — otherwise a transient hiccup gets pinned and shows a wrong number until
    // a manual refresh. Leaving it uncached means the next load retries live.
    if (resp.status === 200 && ok && !partial) {
      await env.BLUEPRINT_AUTH.put(key, JSON.stringify({ at: Date.now(), body: text }), { expirationTtl: REVENUE_CACHE_TTL_SEC }).catch(() => {});
    }
    return { resp, text };
  };

  // Fresh enough: straight from cache.
  if (cached && age < REVENUE_CACHE_FRESH_MS) return withMeta(cached.body, cached.at, false);

  // Usable but stale: serve now, refresh in the background.
  if (cached && age < REVENUE_CACHE_MAX_MS) {
    if (ctx && ctx.waitUntil) ctx.waitUntil(recompute().catch(() => {}));
    return withMeta(cached.body, cached.at, true);
  }

  // Cold cache or forced: compute live.
  const { resp, text } = await recompute();
  let obj;
  try { obj = JSON.parse(text); } catch { return resp; }
  obj.cachedAt = Date.now();
  obj.cacheAgeMs = 0;
  obj.stale = false;
  return json(resp.status, obj);
}

// GET /api/admin/revenue/recurring?from=YYYY-MM-DD&to=YYYY-MM-DD
// The "Retainers" revenue stream: Shopify paid orders + Stripe payments,
// blended into one list. Either source alone is enough to be connected.
async function handleAdminRecurringRevenue(request, env) {
  const cfg = shopifyConfig(env);
  const token = await shopifyGetToken(env);
  const shop = await shopifyShopDomain(env);
  const stripe = stripeConfig(env);
  const shopifyOn = !!(shop && token);
  const stripeOn = !!stripe.key;

  if (!shopifyOn && !stripeOn) {
    return json(200, {
      ok: true, connected: false,
      canConnect: !!(cfg.domain && cfg.clientId && cfg.clientSecret),
      have: { domain: !!cfg.domain, clientId: !!cfg.clientId, clientSecret: !!cfg.clientSecret, handle: !!cfg.handle, stripe: false },
    });
  }

  const url = new URL(request.url);
  const from = (url.searchParams.get('from') || '').slice(0, 10);
  const to = (url.searchParams.get('to') || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return json(400, { ok: false, error: 'from and to must be YYYY-MM-DD' });
  }

  const rows = [];
  const errors = [];
  let truncated = false;

  if (shopifyOn) {
    try {
      const r = await shopifyFetchPaidOrders(env, shop, token, `${from}T00:00:00Z`, `${to}T23:59:59Z`);
      truncated = truncated || r.truncated;
      for (const o of r.orders) {
        const c = o.customer || {};
        const nm = [c.first_name, c.last_name].filter(Boolean).join(' ').trim();
        rows.push({
          id: 'shopify:' + o.id, source: 'Shopify',
          name: o.name || ('#' + o.id),
          date: o.processed_at || o.created_at || '',
          amount: parseFloat(o.current_total_price || o.total_price || '0') || 0,
          currency: (o.currency || '').toUpperCase(),
          status: o.financial_status || '',
          customer: nm || c.email || '',
          adminUrl: cfg.handle ? `https://admin.shopify.com/store/${cfg.handle}/orders/${o.id}` : `https://${shop}/admin/orders/${o.id}`,
        });
      }
    } catch (err) { errors.push('Shopify: ' + (err.message || err)); }
  }

  if (stripeOn) {
    try {
      const fromUnix = Math.floor(Date.parse(`${from}T00:00:00Z`) / 1000);
      const toUnix = Math.floor(Date.parse(`${to}T23:59:59Z`) / 1000);
      const r = await stripeFetchCharges(env, fromUnix, toUnix);
      truncated = truncated || r.truncated;
      for (const ch of r.charges) {
        if (ch.status !== 'succeeded' || !ch.paid) continue;
        const bd = ch.billing_details || {};
        rows.push({
          id: 'stripe:' + ch.id, source: 'Stripe',
          name: ch.description || ch.id,
          date: ch.created ? new Date(ch.created * 1000).toISOString() : '',
          amount: ((ch.amount_captured != null ? ch.amount_captured : ch.amount) || 0) / 100,
          currency: (ch.currency || '').toUpperCase(),
          status: 'succeeded',
          customer: bd.name || bd.email || (typeof ch.customer === 'string' ? ch.customer : '') || '',
          adminUrl: `${stripe.dashBase}/payments/${ch.payment_intent || ch.id}`,
        });
      }
    } catch (err) { errors.push('Stripe: ' + (err.message || err)); }
  }

  // Hard-fail only if every attempted source failed.
  if (!rows.length && errors.length >= (Number(shopifyOn) + Number(stripeOn))) {
    return json(502, { ok: false, connected: true, error: errors.join(' | ') });
  }

  // Newest first, blended across Shopify + Stripe. Rows missing a date sort last.
  rows.sort((a, b) => {
    const ta = Date.parse(a.date) || 0;
    const tb = Date.parse(b.date) || 0;
    return tb - ta;
  });
  return json(200, {
    ok: true, connected: true, from, to,
    partial: errors.length > 0,
    count: rows.length,
    total: rows.reduce((s, r) => s + r.amount, 0),
    currency: rows.length ? rows[0].currency : '',
    truncated,
    warning: errors.length ? errors.join(' | ') : '',
    orders: rows,
  });
}

// ── Shopify OAuth (one-time install for the Dev Dashboard app) ─────────────
function shopifyOAuthRedirectUri(request) {
  return `${new URL(request.url).origin}/api/shopify/callback`;
}

// GET /api/shopify/install — admin-only. Kicks off OAuth: stores a state nonce
// and redirects the browser to Shopify's authorize screen.
async function handleShopifyInstall(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess || !(await adminIsApproved(env, sess.email))) {
    return new Response('Sign in to the Uncap admin first, then retry.', { status: 401 });
  }
  const cfg = shopifyConfig(env);
  if (!cfg.domain || !cfg.clientId || !cfg.clientSecret) {
    return new Response('Shopify is not configured: set SHOPIFY_SHOP_DOMAIN, SHOPIFY_CLIENT_ID, and SHOPIFY_CLIENT_SECRET.', { status: 400 });
  }
  const state = genToken();
  await env.BLUEPRINT_AUTH.put(`shopify_oauth_state:${state}`, cfg.domain, { expirationTtl: 600 });
  const authorize = `https://${cfg.domain}/admin/oauth/authorize?client_id=${encodeURIComponent(cfg.clientId)}`
    + `&scope=${encodeURIComponent(cfg.scopes)}`
    + `&redirect_uri=${encodeURIComponent(shopifyOAuthRedirectUri(request))}`
    + `&state=${encodeURIComponent(state)}`
    + `&grant_options[]=`; // offline (default) token
  return Response.redirect(authorize, 302);
}

// Verify Shopify's HMAC signature over the callback query params.
async function shopifyVerifyHmac(url, secret) {
  const params = new URLSearchParams(url.search);
  const given = params.get('hmac') || '';
  params.delete('hmac');
  params.delete('signature');
  const message = [...params.keys()].sort().map((k) => `${k}=${params.get(k)}`).join('&');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  const hex = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
  if (hex.length !== given.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

// GET /api/shopify/callback — Shopify redirects here with ?code&hmac&shop&state.
// Validates, exchanges the code for an offline access token, stores it in KV.
async function handleShopifyCallback(request, env) {
  const url = new URL(request.url);
  const cfg = shopifyConfig(env);
  const shop = (url.searchParams.get('shop') || '').toString();
  const code = (url.searchParams.get('code') || '').toString();
  const state = (url.searchParams.get('state') || '').toString();

  const finish = (msg, okFlag) => new Response(
    `<!doctype html><meta charset="utf-8"><body style="font-family:system-ui;max-width:520px;margin:80px auto;padding:0 20px;color:#0A0A0A">`
    + `<h2 style="margin:0 0 8px">${okFlag ? 'Shopify connected' : 'Shopify connection failed'}</h2>`
    + `<p style="color:#555;line-height:1.5">${escapeHtml(msg)}</p>`
    + `<p><a href="/admin/revenues/recurring" style="color:#0A0A0A;font-weight:700">Back to Recurring revenue &rarr;</a></p></body>`,
    { status: okFlag ? 200 : 400, headers: { 'content-type': 'text/html; charset=utf-8' } }
  );

  // Shop must be a real myshopify domain; its authenticity is proven by the
  // HMAC below (signed with our client secret), so we trust whatever canonical
  // shop Shopify reports rather than requiring it to equal the configured hint.
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(shop)) return finish('Invalid shop domain in the callback.', false);
  // State is CSRF-only: confirm we issued this install (existence), don't tie it
  // to a specific domain string.
  const stateVal = await env.BLUEPRINT_AUTH.get(`shopify_oauth_state:${state}`);
  if (!stateVal) return finish('Expired or invalid install state. Start the connect flow again.', false);
  await env.BLUEPRINT_AUTH.delete(`shopify_oauth_state:${state}`);
  if (!(await shopifyVerifyHmac(url, cfg.clientSecret))) return finish('Signature check failed (client secret mismatch).', false);
  if (!code) return finish('Missing authorization code.', false);

  let tokenResp;
  try {
    tokenResp = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify({ client_id: cfg.clientId, client_secret: cfg.clientSecret, code }),
    });
  } catch (err) {
    return finish('Token exchange request failed: ' + (err.message || err), false);
  }
  if (!tokenResp.ok) {
    const body = await tokenResp.text().catch(() => '');
    return finish(`Token exchange rejected (${tokenResp.status}): ${body.slice(0, 160)}`, false);
  }
  const data = await tokenResp.json().catch(() => ({}));
  const accessToken = (data && data.access_token) || '';
  if (!accessToken) return finish('No access token returned by Shopify.', false);

  await env.BLUEPRINT_AUTH.put(SHOPIFY_TOKEN_KEY, accessToken);
  await env.BLUEPRINT_AUTH.put(SHOPIFY_SHOP_KEY, shop.toLowerCase());
  await logActivity(env, null, { type: 'status', entity: 'company', id: 'shopify', name: 'Shopify', actor: 'system', detail: `Shopify connected (OAuth) — ${shop.toLowerCase()}` });
  return finish('Recurring revenue is now pulling paid orders from Shopify.', true);
}

// ── QuickBooks Online integration (Revenues > Fixed) ──────────────────────
// Syncs invoices and payments via the QBO Accounting API. OAuth 2.0 with a
// refresh token (access tokens expire hourly, so we refresh on demand). Creds
// are Cloudflare vars/secrets; the realm (company) id + tokens are captured
// during Connect and stored in KV under `qbo:tokens`.
//   QBO_CLIENT_ID     — Intuit app Client ID     [var]
//   QBO_CLIENT_SECRET — Intuit app Client Secret [secret]
//   QBO_ENVIRONMENT   — 'production' (default) or 'sandbox' [var]
const QBO_TOKENS_KEY = 'qbo:tokens';
const QBO_MINOR_VERSION = '70';

function qboConfig(env) {
  const environment = ((env.QBO_ENVIRONMENT || 'production').toString().trim().toLowerCase() === 'sandbox') ? 'sandbox' : 'production';
  return {
    clientId: (env.QBO_CLIENT_ID || '').toString().trim(),
    clientSecret: (env.QBO_CLIENT_SECRET || '').toString().trim(),
    environment,
    apiBase: environment === 'sandbox' ? 'https://sandbox-quickbooks.api.intuit.com' : 'https://quickbooks.api.intuit.com',
    appBase: environment === 'sandbox' ? 'https://app.sandbox.qbo.intuit.com' : 'https://app.qbo.intuit.com',
  };
}

async function qboGetTokens(env) {
  const raw = await env.BLUEPRINT_AUTH.get(QBO_TOKENS_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// Refresh the access token using the stored refresh token; persists the result.
async function qboRefresh(env, tokens) {
  const cfg = qboConfig(env);
  const resp = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
    method: 'POST',
    headers: {
      'authorization': 'Basic ' + btoa(`${cfg.clientId}:${cfg.clientSecret}`),
      'content-type': 'application/x-www-form-urlencoded',
      'accept': 'application/json',
    },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(tokens.refreshToken)}`,
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    throw new Error(`QBO token refresh ${resp.status}: ${body.slice(0, 160)}`);
  }
  const d = await resp.json().catch(() => ({}));
  const next = {
    ...tokens,
    accessToken: d.access_token || tokens.accessToken,
    refreshToken: d.refresh_token || tokens.refreshToken, // Intuit rotates this
    expiresAt: Date.now() + ((d.expires_in || 3600) * 1000),
  };
  await env.BLUEPRINT_AUTH.put(QBO_TOKENS_KEY, JSON.stringify(next));
  return next;
}

// Return a valid { accessToken, realmId } (refreshing if within 2 min of expiry)
// or null if not connected.
async function qboValidToken(env) {
  let tokens = await qboGetTokens(env);
  if (!tokens || !tokens.accessToken || !tokens.realmId) return null;
  if (!tokens.expiresAt || Date.now() > tokens.expiresAt - 120000) {
    tokens = await qboRefresh(env, tokens);
  }
  return { accessToken: tokens.accessToken, realmId: tokens.realmId };
}

// Run a QBO SQL query, following STARTPOSITION pagination up to a page cap.
async function qboQueryAll(env, auth, entity, whereClause, pageCap = 10) {
  const cfg = qboConfig(env);
  const out = [];
  let start = 1;
  const size = 100;
  let truncated = false;
  for (let page = 0; page < pageCap; page++) {
    const sql = `select * from ${entity} ${whereClause} order by TxnDate desc startposition ${start} maxresults ${size}`;
    const url = `${cfg.apiBase}/v3/company/${auth.realmId}/query?minorversion=${QBO_MINOR_VERSION}&query=${encodeURIComponent(sql)}`;
    const resp = await fetch(url, { headers: { 'authorization': 'Bearer ' + auth.accessToken, 'accept': 'application/json' } });
    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      throw new Error(`QBO ${resp.status}: ${body.slice(0, 180)}`);
    }
    const data = await resp.json().catch(() => ({}));
    const rows = (data.QueryResponse && data.QueryResponse[entity]) || [];
    out.push(...rows);
    if (rows.length < size) break;
    start += size;
    if (page === pageCap - 1) truncated = true;
  }
  return { rows: out, truncated };
}

// GET /api/admin/revenue/fixed?from&to&kind=payments|invoices
async function handleAdminFixedRevenue(request, env) {
  const cfg = qboConfig(env);
  const auth = await qboValidToken(env).catch(() => null);
  if (!auth) {
    return json(200, {
      ok: true, connected: false,
      canConnect: !!(cfg.clientId && cfg.clientSecret),
      have: { clientId: !!cfg.clientId, clientSecret: !!cfg.clientSecret },
      environment: cfg.environment,
    });
  }

  const url = new URL(request.url);
  const from = (url.searchParams.get('from') || '').slice(0, 10);
  const to = (url.searchParams.get('to') || '').slice(0, 10);
  const kind = (url.searchParams.get('kind') || 'payments') === 'invoices' ? 'invoices' : 'payments';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return json(400, { ok: false, error: 'from and to must be YYYY-MM-DD' });
  }

  const where = `where TxnDate >= '${from}' and TxnDate <= '${to}'`;
  // "Money collected" is not only the Payment entity — a sale paid on the spot
  // is a SalesReceipt (no invoice). Query both so nothing is missed. Invoices
  // are their own entity.
  const entities = kind === 'invoices' ? ['Invoice'] : ['Payment', 'SalesReceipt'];
  const linkPath = { Invoice: 'invoice', Payment: 'recvpayment', SalesReceipt: 'salesreceipt' };
  const raw = [];
  let truncated = false;
  const errors = [];
  // Query each entity independently so a failure on one (e.g. SalesReceipt)
  // never hides the others.
  const results = await Promise.all(entities.map((e) =>
    qboQueryAll(env, auth, e, where)
      .then((res) => ({ e, ...res }))
      .catch((err) => ({ e, rows: [], truncated: false, error: err.message || String(err) }))
  ));
  for (const res of results) {
    if (res.error) { errors.push(`${res.e}: ${res.error}`); continue; }
    truncated = truncated || res.truncated;
    for (const r of res.rows) raw.push({ ...r, _entity: res.e });
  }
  // Only hard-fail if every entity failed (nothing usable came back).
  if (errors.length === entities.length) {
    return json(502, { ok: false, connected: true, error: errors.join(' | ') });
  }

  const rows = raw.map((r) => {
    const amount = parseFloat(r.TotalAmt || 0) || 0;
    const cust = (r.CustomerRef && (r.CustomerRef.name || r.CustomerRef.value)) || '';
    return {
      id: String(r.Id),
      type: r._entity,
      docNumber: r.DocNumber || '',
      date: r.TxnDate || '',
      amount,
      balance: r.Balance != null ? (parseFloat(r.Balance) || 0) : null,
      currency: (r.CurrencyRef && r.CurrencyRef.value) || '',
      customer: cust,
      link: `${cfg.appBase}/app/${linkPath[r._entity] || 'recvpayment'}?txnId=${r.Id}`,
    };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  return json(200, {
    ok: true, connected: true, kind, from, to,
    partial: errors.length > 0,
    count: rows.length,
    total: rows.reduce((s, r) => s + r.amount, 0),
    currency: rows.length ? rows[0].currency : '',
    truncated,
    warning: errors.length ? errors.join(' | ') : '',
    rows,
  });
}

// GET /api/qbo/install — admin-only. Redirects to Intuit's OAuth screen.
async function handleQboInstall(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess || !(await adminIsApproved(env, sess.email))) {
    return new Response('Sign in to the Uncap admin first, then retry.', { status: 401 });
  }
  const cfg = qboConfig(env);
  if (!cfg.clientId || !cfg.clientSecret) {
    return new Response('QuickBooks is not configured: set QBO_CLIENT_ID and QBO_CLIENT_SECRET.', { status: 400 });
  }
  const state = genToken();
  await env.BLUEPRINT_AUTH.put(`qbo_oauth_state:${state}`, '1', { expirationTtl: 600 });
  const redirect = `${new URL(request.url).origin}/api/qbo/callback`;
  const authorize = 'https://appcenter.intuit.com/connect/oauth2?client_id=' + encodeURIComponent(cfg.clientId)
    + '&response_type=code&scope=' + encodeURIComponent('com.intuit.quickbooks.accounting')
    + '&redirect_uri=' + encodeURIComponent(redirect)
    + '&state=' + encodeURIComponent(state);
  return Response.redirect(authorize, 302);
}

// GET /api/qbo/callback — Intuit redirects with ?code&state&realmId.
async function handleQboCallback(request, env) {
  const url = new URL(request.url);
  const cfg = qboConfig(env);
  const code = (url.searchParams.get('code') || '').toString();
  const state = (url.searchParams.get('state') || '').toString();
  const realmId = (url.searchParams.get('realmId') || '').toString();

  const finish = (msg, okFlag) => new Response(
    `<!doctype html><meta charset="utf-8"><body style="font-family:system-ui;max-width:520px;margin:80px auto;padding:0 20px;color:#0A0A0A">`
    + `<h2 style="margin:0 0 8px">${okFlag ? 'QuickBooks connected' : 'QuickBooks connection failed'}</h2>`
    + `<p style="color:#555;line-height:1.5">${escapeHtml(msg)}</p>`
    + `<p><a href="/admin/revenues/fixed" style="color:#0A0A0A;font-weight:700">Back to Fixed revenue &rarr;</a></p></body>`,
    { status: okFlag ? 200 : 400, headers: { 'content-type': 'text/html; charset=utf-8' } }
  );

  const stateVal = await env.BLUEPRINT_AUTH.get(`qbo_oauth_state:${state}`);
  if (!stateVal) return finish('Expired or invalid install state. Start the connect flow again.', false);
  await env.BLUEPRINT_AUTH.delete(`qbo_oauth_state:${state}`);
  if (!code) return finish('Missing authorization code.', false);
  if (!realmId) return finish('Missing realmId (company id) in the callback.', false);

  const redirect = `${url.origin}/api/qbo/callback`;
  let tokenResp;
  try {
    tokenResp = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'authorization': 'Basic ' + btoa(`${cfg.clientId}:${cfg.clientSecret}`),
        'content-type': 'application/x-www-form-urlencoded',
        'accept': 'application/json',
      },
      body: `grant_type=authorization_code&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirect)}`,
    });
  } catch (err) {
    return finish('Token exchange request failed: ' + (err.message || err), false);
  }
  if (!tokenResp.ok) {
    const body = await tokenResp.text().catch(() => '');
    return finish(`Token exchange rejected (${tokenResp.status}): ${body.slice(0, 160)}`, false);
  }
  const d = await tokenResp.json().catch(() => ({}));
  if (!d.access_token || !d.refresh_token) return finish('No tokens returned by QuickBooks.', false);

  await env.BLUEPRINT_AUTH.put(QBO_TOKENS_KEY, JSON.stringify({
    accessToken: d.access_token,
    refreshToken: d.refresh_token,
    expiresAt: Date.now() + ((d.expires_in || 3600) * 1000),
    realmId,
  }));
  await logActivity(env, null, { type: 'status', entity: 'company', id: 'quickbooks', name: 'QuickBooks', actor: 'system', detail: `QuickBooks connected (OAuth) — realm ${realmId}` });
  return finish('Fixed revenue is now syncing invoices and payments from QuickBooks.', true);
}

// ── Shopify Partner API (Revenues > Apps) ─────────────────────────────────
// App earnings from the Shopify Partner Dashboard (subscription/one-time/usage
// sales, net of Shopify's cut). Uses a static Partner API token (no OAuth).
//   SHOPIFY_PARTNER_ORG_ID       — the numeric org id in the partners URL [var]
//   SHOPIFY_PARTNER_TOKEN        — Partner API client access token        [secret]
//   SHOPIFY_PARTNER_API_VERSION  — optional; default below                [var]
const SHOPIFY_PARTNER_API_VERSION_DEFAULT = '2025-10';

function partnerConfig(env) {
  return {
    orgId: (env.SHOPIFY_PARTNER_ORG_ID || '').toString().trim(),
    token: (env.SHOPIFY_PARTNER_TOKEN || '').toString().trim(),
    version: (env.SHOPIFY_PARTNER_API_VERSION || SHOPIFY_PARTNER_API_VERSION_DEFAULT).toString().trim(),
  };
}

// Query the Partner API for app-revenue transactions in a window, following
// cursor pagination up to a page cap. Returns { nodes, truncated }.
async function partnerFetchAppTransactions(env, minISO, maxISO, pageCap = 20) {
  const cfg = partnerConfig(env);
  const endpoint = `https://partners.shopify.com/${cfg.orgId}/api/${cfg.version}/graphql.json`;
  const query = `query($first:Int!,$after:String,$min:DateTime!,$max:DateTime!){
    transactions(first:$first, after:$after, createdAtMin:$min, createdAtMax:$max,
      types:[APP_SUBSCRIPTION_SALE, APP_ONE_TIME_SALE, APP_USAGE_SALE, APP_SALE_ADJUSTMENT, APP_SALE_CREDIT]) {
      edges { cursor node {
        __typename
        ... on AppSubscriptionSale { id createdAt netAmount{amount currencyCode} app{name} shop{myshopifyDomain} }
        ... on AppOneTimeSale      { id createdAt netAmount{amount currencyCode} app{name} shop{myshopifyDomain} }
        ... on AppUsageSale        { id createdAt netAmount{amount currencyCode} app{name} shop{myshopifyDomain} }
        ... on AppSaleAdjustment   { id createdAt netAmount{amount currencyCode} app{name} shop{myshopifyDomain} }
        ... on AppSaleCredit       { id createdAt netAmount{amount currencyCode} app{name} shop{myshopifyDomain} }
      } }
      pageInfo { hasNextPage }
    }
  }`;
  const nodes = [];
  let after = null;
  let truncated = false;
  for (let page = 0; page < pageCap; page++) {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'X-Shopify-Access-Token': cfg.token, 'content-type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify({ query, variables: { first: 100, after, min: minISO, max: maxISO } }),
    });
    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      throw new Error(`Partner API ${resp.status}: ${body.slice(0, 180)}`);
    }
    const data = await resp.json().catch(() => ({}));
    if (data.errors && data.errors.length) throw new Error('Partner API: ' + (data.errors[0].message || 'query error'));
    const conn = data.data && data.data.transactions;
    const edges = (conn && conn.edges) || [];
    for (const e of edges) nodes.push(e.node);
    if (!conn || !conn.pageInfo || !conn.pageInfo.hasNextPage || !edges.length) break;
    after = edges[edges.length - 1].cursor;
    if (page === pageCap - 1) truncated = true;
  }
  return { nodes, truncated };
}

// GET /api/admin/revenue/apps?from&to
async function handleAdminAppsRevenue(request, env) {
  const cfg = partnerConfig(env);
  if (!cfg.orgId || !cfg.token) {
    return json(200, {
      ok: true, connected: false,
      have: { orgId: !!cfg.orgId, token: !!cfg.token },
    });
  }

  const url = new URL(request.url);
  const from = (url.searchParams.get('from') || '').slice(0, 10);
  const to = (url.searchParams.get('to') || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return json(400, { ok: false, error: 'from and to must be YYYY-MM-DD' });
  }

  let result;
  try {
    result = await partnerFetchAppTransactions(env, `${from}T00:00:00Z`, `${to}T23:59:59Z`);
  } catch (err) {
    return json(502, { ok: false, connected: true, error: err.message || 'Partner API request failed' });
  }

  const TYPE_LABEL = {
    AppSubscriptionSale: 'Subscription', AppOneTimeSale: 'One-time', AppUsageSale: 'Usage',
    AppSaleAdjustment: 'Adjustment', AppSaleCredit: 'Credit',
  };
  const rows = result.nodes.map((n) => ({
    id: String(n.id || ''),
    date: n.createdAt || '',
    app: (n.app && n.app.name) || '',
    shop: (n.shop && n.shop.myshopifyDomain) || '',
    type: TYPE_LABEL[n.__typename] || (n.__typename || ''),
    amount: parseFloat((n.netAmount && n.netAmount.amount) || 0) || 0,
    currency: (n.netAmount && n.netAmount.currencyCode) || '',
  })).sort((a, b) => new Date(b.date) - new Date(a.date));

  return json(200, {
    ok: true, connected: true, from, to,
    count: rows.length,
    total: rows.reduce((s, r) => s + r.amount, 0),
    currency: rows.length ? rows[0].currency : '',
    truncated: result.truncated,
    dashboardUrl: `https://partners.shopify.com/${cfg.orgId}/apps`,
    rows,
  });
}

// Query the Partner API for referral-payout transactions in a window.
async function partnerFetchReferrals(env, minISO, maxISO, pageCap = 20) {
  const cfg = partnerConfig(env);
  const endpoint = `https://partners.shopify.com/${cfg.orgId}/api/${cfg.version}/graphql.json`;
  const query = `query($first:Int!,$after:String,$min:DateTime!,$max:DateTime!){
    transactions(first:$first, after:$after, createdAtMin:$min, createdAtMax:$max,
      types:[REFERRAL]) {
      edges { cursor node {
        __typename
        ... on ReferralTransaction { id createdAt amount{amount currencyCode} shop{myshopifyDomain} }
      } }
      pageInfo { hasNextPage }
    }
  }`;
  const nodes = [];
  let after = null;
  let truncated = false;
  for (let page = 0; page < pageCap; page++) {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'X-Shopify-Access-Token': cfg.token, 'content-type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify({ query, variables: { first: 100, after, min: minISO, max: maxISO } }),
    });
    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      throw new Error(`Partner API ${resp.status}: ${body.slice(0, 180)}`);
    }
    const data = await resp.json().catch(() => ({}));
    if (data.errors && data.errors.length) throw new Error('Partner API: ' + (data.errors[0].message || 'query error'));
    const conn = data.data && data.data.transactions;
    const edges = (conn && conn.edges) || [];
    for (const e of edges) nodes.push(e.node);
    if (!conn || !conn.pageInfo || !conn.pageInfo.hasNextPage || !edges.length) break;
    after = edges[edges.length - 1].cursor;
    if (page === pageCap - 1) truncated = true;
  }
  return { nodes, truncated };
}

// GET /api/admin/revenue/referrals?from&to
async function handleAdminReferralsRevenue(request, env) {
  const cfg = partnerConfig(env);
  if (!cfg.orgId || !cfg.token) {
    return json(200, { ok: true, connected: false, have: { orgId: !!cfg.orgId, token: !!cfg.token } });
  }

  const url = new URL(request.url);
  const from = (url.searchParams.get('from') || '').slice(0, 10);
  const to = (url.searchParams.get('to') || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return json(400, { ok: false, error: 'from and to must be YYYY-MM-DD' });
  }

  let result;
  try {
    result = await partnerFetchReferrals(env, `${from}T00:00:00Z`, `${to}T23:59:59Z`);
  } catch (err) {
    return json(502, { ok: false, connected: true, error: err.message || 'Partner API request failed' });
  }

  const TYPE_LABEL = { ReferralTransaction: 'Referral', ReferralAdjustment: 'Adjustment' };
  const rows = result.nodes.map((n) => ({
    id: String(n.id || ''),
    date: n.createdAt || '',
    shop: (n.shop && n.shop.myshopifyDomain) || '',
    type: TYPE_LABEL[n.__typename] || (n.__typename || ''),
    amount: parseFloat((n.amount && n.amount.amount) || 0) || 0,
    currency: (n.amount && n.amount.currencyCode) || '',
  })).sort((a, b) => new Date(b.date) - new Date(a.date));

  return json(200, {
    ok: true, connected: true, from, to,
    count: rows.length,
    total: rows.reduce((s, r) => s + r.amount, 0),
    currency: rows.length ? rows[0].currency : '',
    truncated: result.truncated,
    dashboardUrl: `https://partners.shopify.com/${cfg.orgId}`,
    rows,
  });
}

// GET /api/admin/revenue/summary?today=YYYY-MM-DD
// Combined revenue totals across all sources for this month / quarter / year.
// Fetches the full year window once per source, then buckets by date (month
// and quarter are subsets of the year). Per-source failures degrade to 0.
async function handleAdminRevenueSummary(request, env) {
  const url = new URL(request.url);
  const today = (url.searchParams.get('today') || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) return json(400, { ok: false, error: 'today must be YYYY-MM-DD' });
  const y = today.slice(0, 4);
  const mm = parseInt(today.slice(5, 7), 10);
  const pad = (n) => String(n).padStart(2, '0');
  const monthFrom = `${y}-${pad(mm)}-01`;
  const quarterFrom = `${y}-${pad(Math.floor((mm - 1) / 3) * 3 + 1)}-01`;
  const yearFrom = `${y}-01-01`;
  const minISO = `${yearFrom}T00:00:00Z`;
  const maxISO = `${today}T23:59:59Z`;

  const items = []; // { date:'YYYY-MM-DD', amount:Number }
  const sources = {};
  let currency = '';
  const setCur = (c) => { if (!currency && c) currency = c; };

  // Every source group runs concurrently — they hit independent external APIs,
  // so fanning out cuts a cold recompute from the sum of latencies to the max.
  const stripe = stripeConfig(env);
  await Promise.all([
    // Retainers — Shopify paid orders + Stripe payments (blended)
    (async () => {
      const sToken = await shopifyGetToken(env);
      const sShop = await shopifyShopDomain(env);
      const recurringOn = !!(sShop && sToken) || !!stripe.key;
      sources.recurring = recurringOn ? { connected: true, ok: true } : { connected: false };
      if (sShop && sToken) {
        try {
          const r = await shopifyFetchPaidOrders(env, sShop, sToken, minISO, maxISO);
          for (const o of r.orders) { items.push({ src: 'recurring', date: (o.processed_at || o.created_at || '').slice(0, 10), amount: parseFloat(o.current_total_price || o.total_price || 0) || 0 }); setCur(o.currency); }
        } catch (e) { sources.recurring = { connected: true, ok: false, error: 'Shopify: ' + e.message }; }
      }
      if (stripe.key) {
        try {
          const fromUnix = Math.floor(Date.parse(minISO) / 1000);
          const toUnix = Math.floor(Date.parse(maxISO) / 1000);
          const r = await stripeFetchCharges(env, fromUnix, toUnix);
          for (const ch of r.charges) { if (ch.status === 'succeeded' && ch.paid) { items.push({ src: 'recurring', date: ch.created ? new Date(ch.created * 1000).toISOString().slice(0, 10) : '', amount: ((ch.amount_captured != null ? ch.amount_captured : ch.amount) || 0) / 100 }); setCur((ch.currency || '').toUpperCase()); } }
        } catch (e) { sources.recurring = { connected: true, ok: false, error: (sources.recurring.error ? sources.recurring.error + ' | ' : '') + 'Stripe: ' + e.message }; }
      }
    })(),
    // Fixed — QuickBooks payments + sales receipts
    (async () => {
      const qauth = await qboValidToken(env).catch(() => null);
      if (!qauth) { sources.fixed = { connected: false }; return; }
      sources.fixed = { connected: true, ok: true };
      try {
        const where = `where TxnDate >= '${yearFrom}' and TxnDate <= '${today}'`;
        const [pay, sr] = await Promise.all([qboQueryAll(env, qauth, 'Payment', where), qboQueryAll(env, qauth, 'SalesReceipt', where)]);
        for (const r of [...pay.rows, ...sr.rows]) { items.push({ src: 'fixed', date: r.TxnDate || '', amount: parseFloat(r.TotalAmt || 0) || 0 }); setCur(r.CurrencyRef && r.CurrencyRef.value); }
      } catch (e) { sources.fixed = { connected: true, ok: false, error: e.message }; }
    })(),
    // Apps + Referrals — Shopify Partner API
    (async () => {
      const pcfg = partnerConfig(env);
      if (!(pcfg.orgId && pcfg.token)) { sources.apps = { connected: false }; sources.referrals = { connected: false }; return; }
      sources.apps = { connected: true, ok: true };
      sources.referrals = { connected: true, ok: true };
      await Promise.all([
        (async () => {
          try {
            const a = await partnerFetchAppTransactions(env, minISO, maxISO);
            for (const n of a.nodes) { items.push({ src: 'apps', date: (n.createdAt || '').slice(0, 10), amount: parseFloat((n.netAmount && n.netAmount.amount) || 0) || 0 }); setCur(n.netAmount && n.netAmount.currencyCode); }
          } catch (e) { sources.apps = { connected: true, ok: false, error: e.message }; }
        })(),
        (async () => {
          try {
            const rf = await partnerFetchReferrals(env, minISO, maxISO);
            for (const n of rf.nodes) { items.push({ src: 'referrals', date: (n.createdAt || '').slice(0, 10), amount: parseFloat((n.amount && n.amount.amount) || 0) || 0 }); setCur(n.amount && n.amount.currencyCode); }
          } catch (e) { sources.referrals = { connected: true, ok: false, error: e.message }; }
        })(),
      ]);
    })(),
  ]);

  // YYYY-MM-DD compares lexicographically = chronologically. `srcs` null means
  // all sources (grand total); otherwise restrict to the named categories.
  const sumFrom = (from, srcs) => items.reduce((s, it) => {
    if (!it.date || it.date < from) return s;
    if (srcs && !srcs.includes(it.src)) return s;
    return s + it.amount;
  }, 0);
  const byPeriod = (srcs) => ({ month: sumFrom(monthFrom, srcs), quarter: sumFrom(quarterFrom, srcs), year: sumFrom(yearFrom, srcs) });
  const total = byPeriod(null);            // all revenues
  const services = byPeriod(['fixed', 'recurring']); // Projects + Retainers
  // Year-to-date amount per revenue channel, for the Overview mix pie.
  const channels = {
    recurring: sumFrom(yearFrom, ['recurring']),
    fixed: sumFrom(yearFrom, ['fixed']),
    apps: sumFrom(yearFrom, ['apps']),
    referrals: sumFrom(yearFrom, ['referrals']),
  };
  // A connected source that errored means the totals are under-counted — mark
  // the response partial so it isn't cached and the client can retry.
  const partial = Object.keys(sources).some((k) => sources[k] && sources[k].connected && sources[k].ok === false);
  return json(200, {
    ok: true,
    partial,
    currency,
    month: total.month,
    quarter: total.quarter,
    year: total.year,
    total,
    services,
    channels,
    windows: { month: monthFrom, quarter: quarterFrom, year: yearFrom, to: today },
    sources,
  });
}

// ── Stripe integration (Services > Retainers) ────────────────────────────
// Lists retainer payments collected in Stripe. Static secret key (no OAuth).
//   STRIPE_SECRET_KEY — sk_live_... (or sk_test_... for test mode) [secret]
function stripeConfig(env) {
  const key = (env.STRIPE_SECRET_KEY || '').toString().trim();
  const test = key.startsWith('sk_test') || key.startsWith('rk_test');
  return { key, test, dashBase: test ? 'https://dashboard.stripe.com/test' : 'https://dashboard.stripe.com' };
}

// Fetch succeeded charges in [fromUnix, toUnix], following Stripe cursor
// pagination (starting_after) up to a page cap (100/page).
async function stripeFetchCharges(env, fromUnix, toUnix, pageCap = 20) {
  const cfg = stripeConfig(env);
  const out = [];
  let startingAfter = '';
  let truncated = false;
  for (let page = 0; page < pageCap; page++) {
    const params = new URLSearchParams();
    params.set('limit', '100');
    params.set('created[gte]', String(fromUnix));
    params.set('created[lte]', String(toUnix));
    if (startingAfter) params.set('starting_after', startingAfter);
    const resp = await fetch('https://api.stripe.com/v1/charges?' + params.toString(), {
      headers: { 'authorization': 'Bearer ' + cfg.key, 'accept': 'application/json' },
    });
    if (!resp.ok) {
      const b = await resp.text().catch(() => '');
      throw new Error(`Stripe ${resp.status}: ${b.slice(0, 180)}`);
    }
    const data = await resp.json().catch(() => ({}));
    const rows = Array.isArray(data.data) ? data.data : [];
    out.push(...rows);
    if (!data.has_more || !rows.length) break;
    startingAfter = rows[rows.length - 1].id;
    if (page === pageCap - 1) truncated = true;
  }
  return { charges: out, truncated };
}

// Google OAuth "Web application" Client ID. This is a public identifier
// (it ships in the login page HTML anyway), so hardcoding is safe — and
// necessary, because deploys run `wrangler deploy --keep-vars`, meaning
// wrangler.toml var edits never reach the running worker. A
// GOOGLE_CLIENT_ID var set in the Cloudflare dashboard wins over this.
const GOOGLE_CLIENT_ID_FALLBACK = '';

function getGoogleClientId(env) {
  return ((env.GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID_FALLBACK) + '').trim();
}

// Registry of shipped blueprints (the static folders under public/).
// Drafts created from the admin app live in KV under bp:<slug> and are
// appended to this list by handleAdminBlueprints.
// Acquisition channel a blueprint came through — set at creation and editable
// from the dashboard, stored in bpmeta:<id>.channel.
const BP_CHANNELS = ['Partner', 'Inbound', 'Outbound', 'Referral', 'Events'];

const BLUEPRINT_REGISTRY = [
  { id: 'mitutoyo',         dir: 'Mitutoyo',         name: 'Mitutoyo',          num: '001', channel: 'Inbound' },
  { id: 'wichelt',          dir: 'wichelt',          name: 'Wichelt Imports',   num: '002', channel: 'Inbound' },
  { id: 'elevateoralcare',  dir: 'ElevateOralCare',  name: 'Elevate Oral Care', num: '003', channel: 'Partner' },
  { id: 'valveman',         dir: 'ValveMan',         name: 'ValveMan',          num: '004', channel: 'Outbound' },
  { id: 'benami',           dir: 'Ben-Ami',          name: 'Ben-Ami',           num: '005', channel: 'Partner' },
  { id: 'anatomywarehouse', dir: 'AnatomyWarehouse', name: 'Anatomy Warehouse', num: '006', channel: 'Partner' },
  { id: 'sperscientific',   dir: 'SperScientific',   name: 'Sper Scientific',   num: '007', channel: 'Inbound' },
  { id: 'gpscity',          dir: 'GPSCity',          name: 'GPS City',          num: '008', channel: 'Partner' },
  { id: 'tucsonalternator', dir: 'TucsonAlternator', name: 'Tucson Alternator', num: '009', channel: 'Referral' },
  { id: 'elycattleman',     dir: 'ElyCattleman',     name: 'Ely Cattleman',     num: '010', channel: 'Inbound' },
  { id: 'vivo',             dir: 'VIVO',             name: 'VIVO',              num: '011', channel: 'Inbound' },
  { id: 'weedooboats',      dir: 'Weedoo',           name: 'Weedoo Greenboat',  num: '012', channel: 'Inbound' },
  { id: 'cartoncraftsupply', dir: 'CartonCraftSupply', name: 'Carton Craft Supply', num: '013', channel: 'Inbound' },
  { id: 'uncap', dir: 'Uncap', name: 'Uncap (Demo)', num: '014', channel: 'Inbound' },
  { id: 'hydra-powersystems', dir: 'HydraPower', name: 'Hydra-Power Systems', num: '015', channel: 'Inbound' },
];

function getCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  const m = header.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? m[1] : '';
}

// CSRF guard for cookie-authenticated mutations. Browsers attach an Origin
// header to cross-site POSTs; we compare it to our own host. Fails closed:
// if Origin is absent we fall back to Referer, and if neither is present we
// reject (rather than the old fail-open behaviour).
function sameOrigin(request) {
  const host = new URL(request.url).host;
  const origin = request.headers.get('Origin');
  if (origin) {
    try { return new URL(origin).host === host; } catch { return false; }
  }
  const referer = request.headers.get('Referer');
  if (referer) {
    try { return new URL(referer).host === host; } catch { return false; }
  }
  return false;
}

async function getAdminSession(request, env) {
  const token = getCookie(request, ADMIN_COOKIE);
  if (!/^[a-f0-9]{48}$/.test(token)) return null;
  const raw = await env.BLUEPRINT_AUTH.get(`admin_session:${token}`);
  if (!raw) return null;
  try { return { token, ...JSON.parse(raw) }; } catch { return null; }
}

function handleAdminConfig(env) {
  return json(200, { ok: true, googleClientId: getGoogleClientId(env) });
}

// Per-blueprint operational metadata (bpmeta:<id>): expiration date and
// the disabled switch. Applies to shipped blueprints and drafts alike.
async function getBpMeta(env, id) {
  const raw = await env.BLUEPRINT_AUTH.get(`bpmeta:${id}`);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

// expiresAt is a YYYY-MM-DD date; the blueprint stays valid through the
// end of that day (UTC).
function isBpExpired(meta) {
  if (!meta || !meta.expiresAt) return false;
  const t = Date.parse(meta.expiresAt + 'T23:59:59Z');
  return Number.isFinite(t) && Date.now() > t;
}

async function handleAdminBlueprintMeta(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });

  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

  const id = normalizeBlueprintId(body.blueprintId);
  const known = BLUEPRINT_REGISTRY.some((b) => b.id === id) || !!(await env.BLUEPRINT_AUTH.get(`bp:${id}`));
  if (!known) return json(404, { ok: false, error: 'Unknown blueprint' });

  const meta = await getBpMeta(env, id);
  if (typeof body.expiresAt !== 'undefined') {
    const expiresAt = (body.expiresAt || '').toString().trim();
    if (expiresAt && !/^\d{4}-\d{2}-\d{2}$/.test(expiresAt)) {
      return json(400, { ok: false, error: 'Expiration must be a YYYY-MM-DD date' });
    }
    meta.expiresAt = expiresAt;
  }
  if (typeof body.disabled !== 'undefined') {
    meta.disabled = !!body.disabled;
  }
  if (typeof body.channel !== 'undefined') {
    const channel = (body.channel || '').toString().trim();
    if (channel && !BP_CHANNELS.includes(channel)) return json(400, { ok: false, error: 'Invalid channel' });
    meta.channel = channel;
  }
  meta.updatedAt = new Date().toISOString();
  meta.updatedBy = sess.email;

  await env.BLUEPRINT_AUTH.put(`bpmeta:${id}`, JSON.stringify(meta));
  const metaName = await bpDisplayName(env, id);
  if (typeof body.disabled !== 'undefined') {
    await logActivity(env, null, { type: 'status', entity: 'blueprint', id, name: metaName, actor: sess.email, detail: meta.disabled ? 'Put on hold (disabled)' : 'Re-enabled' });
  } else if (typeof body.expiresAt !== 'undefined') {
    await logActivity(env, null, { type: 'edited', entity: 'blueprint', id, name: metaName, actor: sess.email, detail: meta.expiresAt ? `Expiration set to ${meta.expiresAt}` : 'Expiration cleared' });
  } else if (typeof body.channel !== 'undefined') {
    await logActivity(env, null, { type: 'edited', entity: 'blueprint', id, name: metaName, actor: sess.email, detail: meta.channel ? `Channel set to ${meta.channel}` : 'Channel cleared' });
  }
  return json(200, { ok: true, meta: { expiresAt: meta.expiresAt || '', disabled: !!meta.disabled, channel: meta.channel || '', expired: isBpExpired(meta) } });
}

// Per-blueprint Terms of Service override (bptos:<id>): a JSON array of
// { num, title, items: [{ label, body }] } sections which, once explicitly
// saved, replaces the standard Master Services Agreement body wherever
// that blueprint's terms are shown (sign modal, print modes). Each
// section's sub-points (2.1, (a), (b)...) are their own item so they can
// be edited individually. Nothing is saved here automatically — the admin
// GET below pre-fills the standard text purely so the editor never looks
// blank; a blueprint's live rendering is unaffected until an admin
// actually clicks Save.
function sanitizeTosSections(raw) {
  if (!Array.isArray(raw)) return null;
  const out = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const num = (item.num || '').toString().trim().slice(0, 10);
    const title = (item.title || '').toString().trim().slice(0, 200);
    const items = [];
    const rawItems = Array.isArray(item.items) ? item.items : null;
    if (rawItems) {
      for (const it of rawItems) {
        if (!it || typeof it !== 'object') continue;
        const label = (it.label || '').toString().trim().slice(0, 20);
        const body = (it.body || '').toString().slice(0, 20_000);
        if (!label && !body) continue;
        items.push({ label, body });
        if (items.length >= 200) break;
      }
    }
    if (!title && !items.length) continue;
    out.push({ num, title, items });
    if (out.length >= 100) break;
  }
  return out;
}

async function getBpTosSections(env, id) {
  const raw = await env.BLUEPRINT_AUTH.get(`bptos:${id}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.sections) ? parsed.sections : null;
  } catch { return null; }
}

async function handleAdminGetTos(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  const id = normalizeBlueprintId(new URL(request.url).searchParams.get('bp'));
  const saved = await getBpTosSections(env, id);
  return json(200, {
    ok: true,
    blueprintId: id,
    sections: saved || DEFAULT_MSA_SECTIONS,
    isDefault: !saved,
    hasHardcodedTerms: BLUEPRINTS_WITH_HARDCODED_TERMS.includes(id),
  });
}

async function handleAdminSaveTos(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });

  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

  const id = normalizeBlueprintId(body.blueprintId);
  const known = BLUEPRINT_REGISTRY.some((b) => b.id === id) || !!(await env.BLUEPRINT_AUTH.get(`bp:${id}`));
  if (!known) return json(404, { ok: false, error: 'Unknown blueprint' });

  const sections = sanitizeTosSections(body.sections);
  if (sections && sections.length) {
    await env.BLUEPRINT_AUTH.put(`bptos:${id}`, JSON.stringify({ sections }));
  } else {
    // Empty save = revert to this blueprint's own default rendering.
    await env.BLUEPRINT_AUTH.delete(`bptos:${id}`);
  }
  await logActivity(env, null, { type: 'edited', entity: 'blueprint', id, name: await bpDisplayName(env, id), actor: sess.email, detail: (sections && sections.length) ? 'Terms of Service updated' : 'Terms reverted to standard' });
  return json(200, { ok: true, blueprintId: id, sections: sections && sections.length ? sections : DEFAULT_MSA_SECTIONS, isDefault: !(sections && sections.length) });
}

// Sets or clears the bpsigned:<id> rollup directly, for the admin
// dashboard's status dropdown — used both to mark a blueprint signed when
// the client signed a physical/paper copy instead of the digital flow,
// and to move a blueprint back to Open (clears the recorded signature).
async function handleAdminMarkSigned(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });

  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

  const id = normalizeBlueprintId(body.blueprintId);
  const known = BLUEPRINT_REGISTRY.some((b) => b.id === id);
  if (!known) return json(404, { ok: false, error: 'Unknown blueprint' });

  if (body.signed === false) {
    // Clearing a recorded signature (reopen) is a destructive action: Admin
    // or Management only.
    if (!(await adminCanDelete(env, sess.email))) {
      return json(403, { ok: false, error: 'Only Admin or Management can reopen a signed blueprint.' });
    }
    await env.BLUEPRINT_AUTH.delete(`bpsigned:${id}`);
    await logActivity(env, null, { type: 'status', entity: 'blueprint', id, name: await bpDisplayName(env, id), actor: sess.email, detail: 'Marked open (signature cleared)' });
    return json(200, { ok: true, blueprintId: id, signature: null });
  }

  const record = {
    blueprintId: id,
    email: '',
    name: (body.name || '').toString().trim().slice(0, 200) || 'Signed on paper (manual entry)',
    title: (body.title || '').toString().trim().slice(0, 200) || 'Manual entry',
    signedAt: new Date().toISOString(),
    ip: '',
    userAgent: 'manual-admin-entry',
  };
  await env.BLUEPRINT_AUTH.put(`bpsigned:${id}`, JSON.stringify(record));
  await logActivity(env, null, { type: 'signed', entity: 'blueprint', id, name: await bpDisplayName(env, id), actor: sess.email, detail: 'Marked signed (on paper)' });
  return json(200, { ok: true, blueprintId: id, signature: record });
}

// Public — no session needed, it's just legal copy. Unlike the admin GET,
// this does NOT synthesize defaults: only an actually-saved override is
// returned, so a blueprint nobody has edited keeps rendering its own
// terms (including any hardcoded `terms` prop customization) exactly as
// it always has.
async function handlePublicTos(request, env) {
  const id = normalizeBlueprintId(new URL(request.url).searchParams.get('bp'));
  const sections = await getBpTosSections(env, id);
  return json(200, { ok: true, blueprintId: id, sections });
}

// In-memory JWKS cache. Workers isolates live long enough that this saves
// a Google fetch on most logins; a kid miss forces a refresh so key
// rotation self-heals.
let googleJwks = { keys: null, fetchedAt: 0 };

function b64urlToBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : '';
  const bin = atob(s + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function verifyGoogleIdToken(credential, clientId) {
  const parts = (credential || '').split('.');
  if (parts.length !== 3) throw new Error('Malformed credential');
  const dec = new TextDecoder();
  const header  = JSON.parse(dec.decode(b64urlToBytes(parts[0])));
  const payload = JSON.parse(dec.decode(b64urlToBytes(parts[1])));

  // Pin the algorithm: we only ever verify RS256, so reject anything else
  // up front (defence-in-depth against alg-confusion / alg:none tokens).
  if (header.alg !== 'RS256') throw new Error('Unexpected token algorithm');

  const now = Date.now();
  const stale = !googleJwks.keys || now - googleJwks.fetchedAt > 60 * 60 * 1000;
  const kidMissing = googleJwks.keys && !googleJwks.keys.some((k) => k.kid === header.kid);
  if (stale || kidMissing) {
    const resp = await fetch('https://www.googleapis.com/oauth2/v3/certs');
    if (!resp.ok) throw new Error('Could not fetch Google signing keys');
    const jwks = await resp.json();
    googleJwks = { keys: jwks.keys || [], fetchedAt: now };
  }
  const jwk = googleJwks.keys.find((k) => k.kid === header.kid);
  if (!jwk) throw new Error('Unknown signing key');

  const key = await crypto.subtle.importKey(
    'jwk', jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['verify']
  );
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5', key,
    b64urlToBytes(parts[2]),
    new TextEncoder().encode(parts[0] + '.' + parts[1])
  );
  if (!valid) throw new Error('Invalid signature');

  if (payload.aud !== clientId) throw new Error('Token audience mismatch');
  if (payload.iss !== 'https://accounts.google.com' && payload.iss !== 'accounts.google.com') {
    throw new Error('Unexpected token issuer');
  }
  if ((payload.exp || 0) * 1000 < now - 60_000) throw new Error('Token expired');
  if (!payload.email || payload.email_verified !== true) throw new Error('Email not verified');
  return payload;
}

async function handleGoogleLogin(request, env) {
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });
  const clientId = getGoogleClientId(env);
  if (!clientId) return json(503, { ok: false, error: 'Google login is not configured yet' });

  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

  let payload;
  try { payload = await verifyGoogleIdToken((body.credential || '').toString(), clientId); }
  catch (err) { return json(401, { ok: false, error: err.message || 'Could not verify Google sign-in' }); }

  const email = payload.email.toLowerCase();
  if (!email.endsWith('@uncap.com')) {
    return json(403, { ok: false, error: 'Reserved for the Uncap team (@uncap.com).' });
  }

  // Record every teammate who signs in so the Admin can approve them.
  // Admin + seeded Management are approved on sight, with their role stamped.
  const seedRole = isSuperAdmin(email) ? ROLE_ADMIN : (SEED_MANAGEMENT.includes(email) ? ROLE_MANAGEMENT : '');
  await upsertAdminUser(env, email, {
    name: payload.name || '', picture: payload.picture || '',
    lastLoginAt: new Date().toISOString(),
    ...(seedRole ? { approved: true, role: seedRole, approvedBy: 'system', approvedAt: new Date().toISOString() } : {}),
  });
  const role = await getAdminRole(env, email);
  const approved = role !== ROLE_PENDING;

  const token = genToken();
  await env.BLUEPRINT_AUTH.put(
    `admin_session:${token}`,
    JSON.stringify({ email, name: payload.name || '', picture: payload.picture || '', ts: Date.now() }),
    { expirationTtl: ADMIN_SESSION_TTL_SECONDS }
  );

  return withSecurityHeaders(new Response(JSON.stringify({ ok: true, email, name: payload.name || '', picture: payload.picture || '', approved, role, isSuper: isSuperAdmin(email), canDelete: role === ROLE_ADMIN || role === ROLE_MANAGEMENT }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'set-cookie': `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${ADMIN_SESSION_TTL_SECONDS}`,
    },
  }));
}

async function handleAdminMe(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  const role = await getAdminRole(env, sess.email);
  return json(200, {
    ok: true, email: sess.email, name: sess.name || '', picture: sess.picture || '',
    approved: role !== ROLE_PENDING,
    role,
    isSuper: isSuperAdmin(sess.email),
    canDelete: role === ROLE_ADMIN || role === ROLE_MANAGEMENT,
  });
}

// ── User management (Admin only) ──────────────────────────────────────────
async function handleAdminListUsers(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  if (!isSuperAdmin(sess.email)) return json(403, { ok: false, error: 'Admin only' });
  await seedAdminUsers(env);
  const list = await env.BLUEPRINT_AUTH.list({ prefix: 'adminuser:', limit: 500 });
  const users = (await Promise.all(list.keys.map((k) => env.BLUEPRINT_AUTH.get(k.name).then((v) => {
    try { return JSON.parse(v); } catch { return null; }
  })))).filter(Boolean);
  const rank = { [ROLE_ADMIN]: 0, [ROLE_MANAGEMENT]: 1, [ROLE_STAFF]: 2, [ROLE_PENDING]: 3 };
  for (const u of users) {
    u.isSuper = isSuperAdmin(u.email);
    u.role = roleFromRecord(u.email, u);
    u.approved = u.role !== ROLE_PENDING;
    // Seeded Management and the Admin are fixed and can't be changed.
    u.locked = u.isSuper || SEED_MANAGEMENT.includes(u.email);
  }
  users.sort((a, b) => (rank[a.role] - rank[b.role]) || a.email.localeCompare(b.email));
  return json(200, { ok: true, users });
}

async function handleAdminApproveUser(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  if (!isSuperAdmin(sess.email)) return json(403, { ok: false, error: 'Admin only' });
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });
  let body;
  try { body = await request.json(); } catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const email = (body.email || '').toString().trim().toLowerCase();
  if (!email.endsWith('@uncap.com')) return json(400, { ok: false, error: 'Only @uncap.com accounts' });
  if (isSuperAdmin(email)) return json(400, { ok: false, error: 'The Admin cannot be changed' });
  if (SEED_MANAGEMENT.includes(email)) return json(400, { ok: false, error: 'This teammate is permanently Management' });

  // Assign a role, or revoke (empty/pending role, or approved:false = revoke).
  const rawRole = (body.role || '').toString().trim().toLowerCase();
  const revoke = body.approved === false || rawRole === ROLE_PENDING || (!rawRole && body.approved !== true);
  if (!revoke && !ASSIGNABLE_ROLES.includes(rawRole)) {
    return json(400, { ok: false, error: 'Role must be management or staff' });
  }
  const patch = revoke
    ? { approved: false, role: '', approvedBy: sess.email, approvedAt: new Date().toISOString() }
    : { approved: true, role: rawRole, approvedBy: sess.email, approvedAt: new Date().toISOString() };
  const user = await upsertAdminUser(env, email, patch);
  user.role = roleFromRecord(email, user);
  await logActivity(env, null, { type: revoke ? 'deleted' : 'created', entity: 'user', id: email, name: email, actor: sess.email, detail: revoke ? 'User access revoked' : `User approved as ${rawRole}` });
  return json(200, { ok: true, user });
}

async function handleAdminLogout(request, env) {
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });
  const token = getCookie(request, ADMIN_COOKIE);
  if (/^[a-f0-9]{48}$/.test(token)) {
    await env.BLUEPRINT_AUTH.delete(`admin_session:${token}`).catch(() => {});
  }
  return withSecurityHeaders(new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'set-cookie': `${ADMIN_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
    },
  }));
}

// List every blueprint (shipped registry + KV drafts) with its signature
// status. Signature status prefers the bpsigned:<id> rollup that
// handleSign maintains; older signatures that predate the rollup fall
// back to a prefix scan.
async function handleAdminBlueprints(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });

  const items = BLUEPRINT_REGISTRY.map((bp) => ({ ...bp, kind: 'live', signature: null }));

  // Once a draft has been promoted to a shipped (live) blueprint, its KV
  // draft record can linger. Suppress any draft that a live blueprint now
  // supersedes — matched by id or by normalized company name — so it stops
  // showing as a separate "draft" row.
  const liveIds = new Set(items.map((i) => i.id));
  const liveNames = new Set(items.map((i) => normalizeBlueprintId(i.name)));

  const draftList = await env.BLUEPRINT_AUTH.list({ prefix: 'bp:', limit: 100 });
  const draftRecs = await Promise.all(draftList.keys.map((k) => env.BLUEPRINT_AUTH.get(k.name)));
  for (const raw of draftRecs) {
    if (!raw) continue;
    try {
      const rec = JSON.parse(raw);
      if (liveIds.has(rec.id) || liveNames.has(normalizeBlueprintId(rec.name))) continue;
      items.push({
        id: rec.id, dir: '', name: rec.name, num: '', kind: 'draft', signature: null,
        website: rec.website || '', leadClient: rec.leadClient || '', address: rec.address || '',
        createdAt: rec.createdAt || '', createdBy: rec.createdBy || '',
        leadContact: rec.leadContact || null, associatedContacts: rec.associatedContacts || [],
        // Templated-content readiness so the admin list can distinguish a draft
        // that is live to the client ('ready') from one still hidden ('draft'),
        // and 'none' before any content has been generated.
        contentStatus: rec.content && rec.content.status ? rec.content.status : (rec.content ? 'draft' : 'none'),
      });
    } catch { /* skip corrupt record */ }
  }

  await Promise.all(items.map(async (i) => {
    const meta = await getBpMeta(env, i.id);
    i.expiresAt = meta.expiresAt || '';
    i.disabled  = !!meta.disabled;
    // An explicit channel saved in bpmeta wins; otherwise fall back to the
    // registry default set on the shipped blueprints.
    i.channel   = meta.channel || i.channel || '';
    i.expired   = isBpExpired(meta);

    // Registry pages and templated drafts that have gone live (contentStatus
    // 'ready') can both be signed, so load signatures for either.
    if (i.kind !== 'live' && i.contentStatus !== 'ready') return;
    const rollup = await env.BLUEPRINT_AUTH.get(`bpsigned:${i.id}`);
    if (rollup) { try { i.signature = JSON.parse(rollup); return; } catch { /* fall through */ } }
    const list = await env.BLUEPRINT_AUTH.list({ prefix: `signature:${i.id}:`, limit: 10 });
    if (!list.keys.length) return;
    const recs = (await Promise.all(list.keys.slice(0, 5).map((k) => env.BLUEPRINT_AUTH.get(k.name))))
      .filter(Boolean)
      .map((v) => { try { return JSON.parse(v); } catch { return null; } })
      .filter(Boolean)
      .sort((a, b) => new Date(b.signedAt || 0) - new Date(a.signedAt || 0));
    i.signature = recs[0] || null;
  }));

  // Attach each blueprint's owning portal company so the admin can link to
  // the new /<companyId>/blueprint URL instead of the legacy path.
  const companies = await listCompanies(env);
  const byBp = new Map(companies.filter((c) => c.blueprintId).map((c) => [c.blueprintId, c.id]));
  for (const i of items) i.companyId = byBp.get(i.id) || '';

  // Blueprint numbers run in creation order. Registry pages carry a hardcoded
  // num; number the remaining blueprints (templated drafts) after the highest
  // one in use, oldest first, so a published draft reads as a first-class
  // blueprint (e.g. 015) instead of a blank "-".
  let maxNum = items.reduce((m, i) => Math.max(m, parseInt(i.num, 10) || 0), 0);
  items.filter((i) => !i.num)
    .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
    .forEach((i) => { maxNum += 1; i.num = String(maxNum).padStart(3, '0'); });

  return json(200, { ok: true, blueprints: items });
}

// Save a new-blueprint request. Phase 1 records it as a draft in KV; the
// template generator that clones AnatomyWarehouse into a live page is the
// next phase and will consume these records.
async function handleAdminCreateBlueprint(request, env, ctx) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });

  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

  // Blueprints are created for portal companies only; the record supplies
  // name, website, address, and contacts, with role picks in the body.
  const portalCo = await getCompany(env, body.companyId);
  if (!portalCo) return json(400, { ok: false, error: 'Pick a company from the portal' });

  const name       = portalCo.name;
  const website    = ((body.website || portalCo.storeUrl || '')).toString().trim().slice(0, 300);
  const address    = ((body.address || portalCo.address || '')).toString().trim().slice(0, 300);
  const expiresAt  = (body.expiresAt   || '').toString().trim();
  const channel    = (body.channel     || '').toString().trim();
  const companyAttioId    = portalCo.attioCompanyId || '';
  const leadContact       = sanitizeContact(body.leadContact) || (portalCo.leadContact ? sanitizeContact(portalCo.leadContact) : null);
  const associatedContacts = (body.associatedContacts !== undefined
    ? sanitizeContacts(body.associatedContacts)
    : sanitizeContacts(portalCo.contacts)
  ).filter((c) => !leadContact || c.email !== leadContact.email);
  const leadClient = leadContact ? (leadContact.name || leadContact.email) : '';
  if (!leadContact) return json(400, { ok: false, error: 'The company needs a lead contact first' });
  if (expiresAt && !/^\d{4}-\d{2}-\d{2}$/.test(expiresAt)) {
    return json(400, { ok: false, error: 'Expiration must be a YYYY-MM-DD date' });
  }
  if (channel && !BP_CHANNELS.includes(channel)) return json(400, { ok: false, error: 'Invalid channel' });

  const slug = normalizeBlueprintId(name);
  if (BLUEPRINT_REGISTRY.some((b) => b.id === slug)) {
    return json(409, { ok: false, error: `A blueprint with the id "${slug}" already exists` });
  }
  if (await env.BLUEPRINT_AUTH.get(`bp:${slug}`)) {
    return json(409, { ok: false, error: `A draft with the id "${slug}" already exists` });
  }

  const rec = {
    id: slug, name, website, leadClient, address,
    companyAttioId, companyId: portalCo.id, leadContact, associatedContacts,
    status: 'draft',
    createdAt: new Date().toISOString(),
    createdBy: sess.email,
  };
  await env.BLUEPRINT_AUTH.put(`bp:${slug}`, JSON.stringify(rec));
  // Link it back so the customer's portal Blueprint tab flips to ready.
  try { portalCo.blueprintId = slug; await putCompany(env, portalCo); } catch (_) {}
  if (expiresAt || channel) {
    await env.BLUEPRINT_AUTH.put(`bpmeta:${slug}`, JSON.stringify({
      expiresAt, disabled: false, channel,
      updatedAt: rec.createdAt, updatedBy: sess.email,
    }));
  }
  // Client Lead + Associated Contacts become this blueprint's dynamic
  // allowlist — the only outside emails that can view it. No contacts
  // picked means no restriction, same as any blueprint today.
  const allowlistEmails = [
    ...(leadContact ? [leadContact.email] : []),
    ...associatedContacts.map((c) => c.email),
  ];
  if (allowlistEmails.length) {
    await env.BLUEPRINT_AUTH.put(`bpallow:${slug}`, JSON.stringify(allowlistEmails));
  }

  // Seed the new blueprint's Terms of Service from Anatomy Warehouse's —
  // the designated master template (edited via the same TOS button any
  // other blueprint uses). From here each copy is fully independent;
  // editing this new blueprint's TOS never touches the template or any
  // other blueprint. No-op if the template itself hasn't been set yet.
  const templateTos = await env.BLUEPRINT_AUTH.get(`bptos:${TOS_TEMPLATE_BLUEPRINT_ID}`);
  if (templateTos) await env.BLUEPRINT_AUTH.put(`bptos:${slug}`, templateTos);

  await logActivity(env, null, { type: 'created', entity: 'blueprint', id: slug, name, actor: sess.email, detail: 'Blueprint draft created' });

  // Draft the templated proposal content in the background from the company's
  // discovery answers, so the admin opens the editor to a filled-in draft
  // instead of a blank form. It lands as status:'draft' — never shown to the
  // customer until an admin reviews and marks it ready.
  if (ctx && ctx.waitUntil) {
    ctx.waitUntil((async () => {
      try {
        let answers = {};
        if (portalCo.discoveryHandle) {
          const disc = await getDiscoveryByHandle(env, portalCo.discoveryHandle);
          if (disc) answers = (await getDiscoveryAnswers(env, disc.id)).answers || {};
        }
        const content = await buildBlueprintContent(env, { company: portalCo, answers });
        const raw = await env.BLUEPRINT_AUTH.get(`bp:${slug}`);
        if (!raw) return;
        const cur = JSON.parse(raw);
        if (cur.content && cur.content.status) return; // an admin already edited it
        cur.content = { ...content, status: 'draft', generatedAt: new Date().toISOString(), generatedBy: 'ai' };
        await env.BLUEPRINT_AUTH.put(`bp:${slug}`, JSON.stringify(cur));
      } catch (_) { /* editor can still generate on demand */ }
    })());
  }

  return json(200, { ok: true, blueprint: rec });
}

// Sanitize the structured blueprint content an admin saves from the editor.
// Mirrors the generator's shape; clamps lengths and strips banned dashes.
function sanitizeBlueprintContent(raw) {
  const s = (v, max) => (v == null ? '' : v.toString()).replace(/\s+[—–]\s+/g, ', ').replace(/[—–]/g, '-').replace(/\s+/g, ' ').trim().slice(0, max || 400);
  const list = (arr, fn, max) => (Array.isArray(arr) ? arr.slice(0, max).map(fn) : []);
  const c = raw && typeof raw === 'object' ? raw : {};
  const inv = c.investment && typeof c.investment === 'object' ? c.investment : {};
  const tl = c.timeline && typeof c.timeline === 'object' ? c.timeline : {};
  return {
    status: c.status === 'ready' ? 'ready' : 'draft',
    headline: s(c.headline, 120),
    subhead: s(c.subhead, 200),
    summary: s(c.summary, 900),
    objectives: list(c.objectives, (o) => ({ title: s(o && o.title, 80), body: s(o && o.body, 300) }), 8).filter((o) => o.title || o.body),
    scope: list(c.scope, (o) => ({ title: s(o && o.title, 80), body: s(o && o.body, 300) }), 12).filter((o) => o.title || o.body),
    investment: {
      total: s(inv.total, 40),
      note: s(inv.note, 200),
      installments: list(inv.installments, (o) => ({ label: s(o && o.label, 60), amount: s(o && o.amount, 40) }), 8).filter((o) => o.label || o.amount),
    },
    timeline: {
      weeks: s(tl.weeks, 40),
      note: s(tl.note, 200),
      phases: list(tl.phases, (o) => ({ name: s(o && o.name, 60), weeks: s(o && o.weeks, 40), detail: s(o && o.detail, 300) }), 10).filter((o) => o.name || o.detail),
    },
    team: list(c.team, (o) => ({ name: s(o && o.name, 80), role: s(o && o.role, 120) }), 10).filter((o) => o.name || o.role),
    generatedAt: c.generatedAt || '',
    generatedBy: c.generatedBy || '',
  };
}

// Public-ish content read for the template renderer. Cookie-gated: an approved
// admin, or a portal session of the company that owns this blueprint. Accepts
// ?id=<blueprintId> (admin preview) or ?company=<companyId> (portal frame).
async function handleBlueprintContent(request, env) {
  const url = new URL(request.url);
  let id = normalizeBlueprintId(url.searchParams.get('id') || '');
  let company = null;
  const companyId = (url.searchParams.get('company') || '').toString();
  if (companyId) {
    company = await getCompany(env, companyId);
    if (company) id = normalizeBlueprintId(company.blueprintId || '');
  }
  if (!id) return json(404, { ok: false, error: 'Not found' });
  if (!company) company = await findCompanyByBlueprintId(env, id);

  // Authorize: approved admin (may preview any status), or the owning
  // company's portal session (ready content only).
  const admin = await getAdminSession(request, env);
  const isAdmin = !!(admin && await adminIsApproved(env, admin.email));
  let ok = isAdmin;
  if (!ok) {
    const portal = await getPortalSession(request, env);
    ok = !!(portal && company && portal.companyId === company.id);
  }
  if (!ok) return json(401, { ok: false, error: 'Not authorised' });

  const draft = await blueprintDraft(env, id);
  if (!draft) return json(404, { ok: false, error: 'Not found' });
  // Admins may open a not-yet-generated draft (content: null) so the editor
  // can render a Generate button. Customers get 404 until it's ready.
  if (!draft.content && !isAdmin) return json(404, { ok: false, error: 'No content yet' });
  if (draft.content && draft.content.status !== 'ready' && !isAdmin) return json(404, { ok: false, error: 'Not ready' });

  return json(200, {
    ok: true,
    id,
    name: (company && company.name) || draft.name || id,
    content: draft.content || null,
    branding: company ? {
      hasLogo: !!company.hasLogo,
      logoUrl: company.hasLogo ? `/api/company/logo?id=${encodeURIComponent(company.id)}` : '',
      palette: company.palette || null,
      address: company.address || '',
      storeUrl: company.storeUrl || '',
    } : null,
  });
}

async function handleAdminSaveBlueprintContent(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });
  let body;
  try { body = await request.json(); } catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const id = normalizeBlueprintId(body.id || '');
  const draft = await blueprintDraft(env, id);
  if (!draft) return json(404, { ok: false, error: 'Blueprint draft not found' });
  draft.content = sanitizeBlueprintContent(body.content);
  await env.BLUEPRINT_AUTH.put(`bp:${id}`, JSON.stringify(draft));
  return json(200, { ok: true, content: draft.content });
}

async function handleAdminGenerateBlueprint(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });
  let body;
  try { body = await request.json(); } catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const id = normalizeBlueprintId(body.id || '');
  const draft = await blueprintDraft(env, id);
  if (!draft) return json(404, { ok: false, error: 'Blueprint draft not found' });

  const company = await findCompanyByBlueprintId(env, id);
  let answers = {};
  if (company && company.discoveryHandle) {
    const disc = await getDiscoveryByHandle(env, company.discoveryHandle);
    if (disc) answers = (await getDiscoveryAnswers(env, disc.id)).answers || {};
  }
  const content = await buildBlueprintContent(env, { company, answers });
  // Regenerating keeps the draft unpublished; the admin re-reviews and marks ready.
  draft.content = sanitizeBlueprintContent({ ...content, status: 'draft', generatedAt: new Date().toISOString(), generatedBy: sess.email });
  await env.BLUEPRINT_AUTH.put(`bp:${id}`, JSON.stringify(draft));
  return json(200, { ok: true, content: draft.content });
}

// Delete a blueprint DRAFT (super admin only). Shipped blueprints in
// BLUEPRINT_REGISTRY are static pages in the repo and can't be removed at
// runtime — only KV drafts are deletable here. Purges the draft record and
// all its KV side-data, and unlinks it from its portal company.
async function handleAdminDeleteBlueprint(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  if (!(await adminCanDelete(env, sess.email))) return json(403, { ok: false, error: 'Only Admin or Management can delete blueprints.' });
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });
  let body;
  try { body = await request.json(); } catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const id = normalizeBlueprintId(body.id);

  if (BLUEPRINT_REGISTRY.some((b) => b.id === id)) {
    return json(400, { ok: false, error: 'Shipped blueprints are static pages and must be removed from the repo, not here.' });
  }
  const raw = await env.BLUEPRINT_AUTH.get(`bp:${id}`);
  if (!raw) return json(404, { ok: false, error: 'Blueprint draft not found' });
  let rec = {};
  try { rec = JSON.parse(raw); } catch {}

  // Core record + all per-blueprint side-data.
  await env.BLUEPRINT_AUTH.delete(`bp:${id}`).catch(() => {});
  for (const k of [`bpmeta:${id}`, `bpallow:${id}`, `bptos:${id}`, `bpsigned:${id}`]) {
    await env.BLUEPRINT_AUTH.delete(k).catch(() => {});
  }
  for (const prefix of [`signature:${id}:`, `access:${id}:`]) {
    const list = await env.BLUEPRINT_AUTH.list({ prefix, limit: 1000 });
    await Promise.all(list.keys.map((k) => env.BLUEPRINT_AUTH.delete(k.name).catch(() => {})));
  }
  // Unlink from any portal company that pointed at it.
  const owner = await findCompanyByBlueprintId(env, id);
  if (owner) { owner.blueprintId = ''; await putCompany(env, owner).catch(() => {}); }

  await logActivity(env, null, { type: 'deleted', entity: 'blueprint', id, name: rec.name || id, actor: sess.email, detail: 'Blueprint draft deleted' });
  return json(200, { ok: true });
}

// Cookie-authenticated variant of the access log for the admin app.
async function handleAdminAccessLog(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  const blueprintId = normalizeBlueprintId(new URL(request.url).searchParams.get('bp'));
  const events = await listBlueprintEvents(env, blueprintId);
  return json(200, { ok: true, blueprintId, events });
}

// Mint a blueprint preview session from the admin cookie so the team can
// open any blueprint without the email gate. admin:true means the session
// writes no signature records and fires no notifications — previews stay
// out of the audit trail, matching the old passcode behaviour.
async function handleAdminBpToken(request, env) {
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });
  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const blueprintId = normalizeBlueprintId(body.blueprintId);

  // The blueprint page reads this to render its "Valid through" date from the
  // expiration an admin set in the app, rather than a hardcoded value.
  const bpMeta = await getBpMeta(env, blueprintId);
  const expiresAt = (bpMeta && bpMeta.expiresAt) || '';

  const sess = await getAdminSession(request, env);
  if (sess) {
    const token = genToken();
    await env.BLUEPRINT_AUTH.put(
      `session:${token}`,
      JSON.stringify({ email: sess.email, admin: true, selfTest: true, blueprintId, ip: clientIp(request), userAgent: clientUa(request), ts: Date.now() }),
      { expirationTtl: SESSION_TTL_SECONDS }
    );
    return json(200, { ok: true, token, expiresAt });
  }
  // Signed-in portal customers pass their own company's blueprint gate
  // silently — the gate already calls this endpoint on load.
  const portal = await getPortalSession(request, env);
  if (portal) {
    const co = await getCompany(env, portal.companyId);
    if (co && co.blueprintId === blueprintId) {
      const token = genToken();
      await env.BLUEPRINT_AUTH.put(
        `session:${token}`,
        JSON.stringify({ email: portal.email, name: portal.name || '', portal: true, blueprintId, ip: clientIp(request), userAgent: clientUa(request), ts: Date.now() }),
        { expirationTtl: SESSION_TTL_SECONDS }
      );
      return json(200, { ok: true, token, expiresAt });
    }
  }
  return json(401, { ok: false, error: 'Not signed in' });
}

// ----------------------------------------------------------------------------
// Attio CRM proxy. The API token (env.ATTIO_API_KEY) lives only in the
// Cloudflare dashboard's Variables and Secrets — never in wrangler.toml —
// and never reaches the browser; the dashboard only ever calls these two
// admin-authenticated search endpoints, which pass back the minimal fields
// the company/contact pickers need.
// ----------------------------------------------------------------------------
const ATTIO_API_BASE = 'https://api.attio.com/v2';

async function attioQuery(env, object, filter, limit) {
  if (!env.ATTIO_API_KEY) {
    const err = new Error('Attio isn\'t connected yet — add ATTIO_API_KEY in the Cloudflare dashboard.');
    err.status = 503;
    throw err;
  }
  const resp = await fetch(`${ATTIO_API_BASE}/objects/${object}/records/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.ATTIO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filter, limit: limit || 8 }),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    const err = new Error(`Attio ${object} query failed (${resp.status}): ${text.slice(0, 300)}`);
    err.status = resp.status >= 400 && resp.status < 500 ? 502 : 502;
    throw err;
  }
  const data = await resp.json().catch(() => ({}));
  return Array.isArray(data.data) ? data.data : [];
}

// Attio's "text" attribute values come back as e.g. [{ value: "Acme Inc" }].
function attioFirstText(values) {
  if (!Array.isArray(values) || !values.length) return '';
  const v = values[0];
  return (v && (v.value || v.full_name || v.domain || v.email_address)) || '';
}

// Best-effort address lookup: Attio workspaces vary in whether/where a
// company's address lives (custom attribute, or a standard "location"-type
// field under one of a few common slugs). Tries each candidate and
// formats whichever is present; blank if the workspace has none of them.
function attioFirstAddress(values) {
  const candidates = ['primary_location', 'address', 'location', 'headquarters'];
  for (const slug of candidates) {
    const arr = values && values[slug];
    if (!Array.isArray(arr) || !arr.length) continue;
    const v = arr[0];
    if (!v) continue;
    if (typeof v.value === 'string' && v.value) return v.value;
    const parts = [v.line_1, v.line_2, v.locality, v.region, v.postcode, v.country_code].filter(Boolean);
    if (parts.length) return parts.join(', ');
  }
  return '';
}

async function handleAdminAttioSearchCompanies(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });

  const q = (new URL(request.url).searchParams.get('q') || '').trim().slice(0, 200);
  if (!q) return json(200, { ok: true, companies: [] });

  let records;
  try {
    records = await attioQuery(env, 'companies', { name: { '$contains': q } });
  } catch (err) {
    return json(err.status || 502, { ok: false, error: err.message });
  }

  const companies = records.map((r) => ({
    attioId: r.id && r.id.record_id,
    name: attioFirstText(r.values && r.values.name),
    domain: attioFirstText(r.values && r.values.domains),
    address: attioFirstAddress(r.values),
  })).filter((c) => c.attioId);

  return json(200, { ok: true, companies });
}

async function handleAdminAttioSearchPeople(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });

  const q = (new URL(request.url).searchParams.get('q') || '').trim().slice(0, 200);
  if (!q) return json(200, { ok: true, people: [] });

  // Search by email when the query looks like one, name otherwise — Attio
  // filters a single attribute at a time, so this is a best-effort split
  // rather than a true OR across both fields. Both are compound
  // attributes on the People object (personal-name and email-address
  // respectively), so the filter has to target the actual sub-field —
  // filtering the bare attribute slug matches nothing.
  const filter = q.includes('@')
    ? { email_addresses: { email_address: { '$contains': q } } }
    : { name: { full_name: { '$contains': q } } };

  let records;
  try {
    records = await attioQuery(env, 'people', filter);
  } catch (err) {
    return json(err.status || 502, { ok: false, error: err.message });
  }

  const people = records.map((r) => ({
    attioId: r.id && r.id.record_id,
    name: attioFirstText(r.values && r.values.name),
    email: attioFirstText(r.values && r.values.email_addresses),
  })).filter((p) => p.attioId && p.email);

  return json(200, { ok: true, people });
}

// Everyone Attio associates with a company, for the new-discovery modal:
// pick the company, get its people back with name/email/title so the admin
// only assigns roles instead of searching each person by hand.
async function handleAdminAttioCompanyPeople(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });

  const companyId = (new URL(request.url).searchParams.get('companyId') || '').trim().slice(0, 100);
  if (!companyId) return json(400, { ok: false, error: 'Missing companyId' });

  // People's `company` attribute is a record reference; filter on its
  // target_record_id sub-field, same pattern as the compound attributes
  // in the people search above.
  let records;
  try {
    records = await attioQuery(env, 'people', { company: { target_record_id: { '$eq': companyId } } }, 25);
  } catch (err) {
    return json(err.status || 502, { ok: false, error: err.message });
  }

  const people = records.map((r) => ({
    attioId: r.id && r.id.record_id,
    name: attioFirstText(r.values && r.values.name),
    email: attioFirstText(r.values && r.values.email_addresses),
    title: attioFirstText(r.values && r.values.job_title),
  })).filter((p) => p.attioId && p.email);

  return json(200, { ok: true, people });
}

async function handleAdminListDiscoveries(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });

  // discovery:<inverted-ts>:<rand> — the inverted timestamp makes a plain
  // prefix scan return newest-first.
  const list = await env.BLUEPRINT_AUTH.list({ prefix: 'discovery:', limit: 200 });
  const discoveries = (await Promise.all(list.keys.map(async (k) => {
    const raw = await env.BLUEPRINT_AUTH.get(k.name);
    if (!raw) return null;
    try {
      const id = k.name.slice('discovery:'.length);
      const rec = JSON.parse(raw);
      // Backfill a handle for discoveries created before the experience
      // shipped, so their View/Transcript links work. Expiration was
      // removed from discoveries entirely; purge it from old records the
      // same lazy way.
      const dirty = ('expiresAt' in rec);
      if (dirty) delete rec.expiresAt;
      if (!rec.handle) {
        rec.handle = await uniqueDiscoveryHandle(env, discoveryHandleFromWebsite(rec.website, rec.company));
        await env.BLUEPRINT_AUTH.put(k.name, JSON.stringify(rec)).catch(() => {});
        await env.BLUEPRINT_AUTH.put(`dischandle:${rec.handle}`, id).catch(() => {});
      } else if (dirty) {
        await env.BLUEPRINT_AUTH.put(k.name, JSON.stringify(rec)).catch(() => {});
      }
      return { id, ...rec };
    } catch { return null; }
  }))).filter(Boolean);

  // Attach each discovery's owning portal company so the admin links to the
  // new /<companyId>/discovery URL instead of the legacy /discovery/<handle>.
  const companies = await listCompanies(env);
  const byHandle = new Map(companies.filter((c) => c.discoveryHandle).map((c) => [c.discoveryHandle, c.id]));
  for (const d of discoveries) d.companyId = d.companyId || byHandle.get(d.handle) || '';

  return json(200, { ok: true, discoveries });
}

// Cross-entity recent-activity feed for the dashboard home page. Merges the
// append-only activity: log with a backfill of 'created' events (from
// existing draft/discovery createdAt) and 'signed' events (from bpsigned
// rollups), so the feed is populated from history even though lifecycle
// logging only began when this shipped. A backfilled event is suppressed
// when a real logged event already covers the same entity, so the two never
// double-count.
async function handleAdminActivity(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });

  const logged = [];
  const actList = await env.BLUEPRINT_AUTH.list({ prefix: 'activity:', limit: 300 });
  const actVals = await Promise.all(actList.keys.map((k) => env.BLUEPRINT_AUTH.get(k.name)));
  for (const v of actVals) { if (!v) continue; try { logged.push(JSON.parse(v)); } catch {} }

  // Entities already covered by a real logged created/signed event.
  const have = new Set(
    logged.filter((e) => e.type === 'created' || e.type === 'signed')
          .map((e) => `${e.type}:${e.entity}:${e.id}`)
  );
  const events = [...logged];

  const [bpList, discList, signedList] = await Promise.all([
    env.BLUEPRINT_AUTH.list({ prefix: 'bp:', limit: 300 }),
    env.BLUEPRINT_AUTH.list({ prefix: 'discovery:', limit: 300 }),
    env.BLUEPRINT_AUTH.list({ prefix: 'bpsigned:', limit: 300 }),
  ]);

  const bpRecs = await Promise.all(bpList.keys.map((k) => env.BLUEPRINT_AUTH.get(k.name)));
  for (const raw of bpRecs) {
    if (!raw) continue;
    try {
      const r = JSON.parse(raw);
      if (r.createdAt && !have.has(`created:blueprint:${r.id}`)) {
        events.push({ ts: r.createdAt, type: 'created', entity: 'blueprint', id: r.id, name: r.name || r.id, actor: r.createdBy || '', detail: 'Blueprint draft created' });
      }
    } catch {}
  }

  const discRecs = await Promise.all(discList.keys.map((k) => env.BLUEPRINT_AUTH.get(k.name).then((v) => [k.name.slice('discovery:'.length), v])));
  for (const [id, raw] of discRecs) {
    if (!raw) continue;
    try {
      const r = JSON.parse(raw);
      if (r.createdAt && !have.has(`created:discovery:${id}`)) {
        events.push({ ts: r.createdAt, type: 'created', entity: 'discovery', id, name: r.company || id, actor: r.createdBy || '', detail: 'Discovery created' });
      }
    } catch {}
  }

  const signedRecs = await Promise.all(signedList.keys.map((k) => env.BLUEPRINT_AUTH.get(k.name).then((v) => [k.name.slice('bpsigned:'.length), v])));
  for (const [id, raw] of signedRecs) {
    if (!raw) continue;
    try {
      const r = JSON.parse(raw);
      if (r.signedAt && !have.has(`signed:blueprint:${id}`)) {
        const reg = BLUEPRINT_REGISTRY.find((b) => b.id === id);
        events.push({ ts: r.signedAt, type: 'signed', entity: 'blueprint', id, name: (reg && reg.name) || r.blueprintId || id, actor: r.email || r.name || '', detail: r.name ? `${r.name}${r.title ? ', ' + r.title : ''}` : '' });
      }
    } catch {}
  }

  events.sort((a, b) => new Date(b.ts || 0) - new Date(a.ts || 0));
  return json(200, { ok: true, events: events.slice(0, 300) });
}

// Insert a document-stated SKU count into a profile's search-placeholder
// swap ("Search SKUs," → "Search 48,000 SKUs,"). No-op on swaps whose
// value already carries a count.
function patchSkuCount(swaps, skuCount) {
  if (!skuCount) return swaps;
  return swaps.map(([f, t]) => (
    f === STOCK_SEARCH_TOKEN && typeof t === 'string' && t.startsWith('Search SKUs,')
      ? [f, t.replace(/^Search SKUs,/, `Search ${skuCount} SKUs,`)]
      : [f, t]
  ));
}

// Client logo + palette validation for discovery creation. The logo is a
// base64 image stored under its own KV key and served back by
// handleDiscoveryLogo; the palette is a pair of hex colors the experience
// swaps into the wireframe scenes.
const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];
function sanitizeLogo(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const ct = (raw.type || '').toString().toLowerCase();
  const data = (raw.data || '').toString();
  if (!LOGO_TYPES.includes(ct)) return null;
  if (!data || data.length > 2_000_000 || !/^[A-Za-z0-9+/=]+$/.test(data)) return null;
  return { ct, data };
}
function sanitizePalette(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const hex = (s) => (/^#[0-9a-fA-F]{6}$/.test((s || '').toString()) ? (s || '').toString().toUpperCase() : '');
  const prime = hex(raw.prime);
  const accent = hex(raw.accent);
  return prime && accent ? { prime, accent } : null;
}

// Public logo fetch, addressed by handle like /api/discovery/meta. SVGs are
// locked down with a no-script CSP so a crafted file can't run anything
// when opened directly.
async function handleDiscoveryLogo(request, env) {
  const url = new URL(request.url);
  const disc = await getDiscoveryByHandle(env, url.searchParams.get('handle'));
  if (!disc || disc.demo || !disc.hasLogo) return new Response('Not found', { status: 404 });
  const raw = await env.BLUEPRINT_AUTH.get(`disclogo:${disc.id}`);
  if (!raw) return new Response('Not found', { status: 404 });
  let logo;
  try { logo = JSON.parse(raw); } catch { return new Response('Not found', { status: 404 }); }
  let bytes;
  try { bytes = b64ToBytes(logo.data); } catch { return new Response('Not found', { status: 404 }); }
  return new Response(bytes, {
    headers: {
      'content-type': logo.ct,
      'cache-control': 'public, max-age=3600',
      'x-content-type-options': 'nosniff',
      'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'",
    },
  });
}

// Analyze an uploaded RFP/requirements document with Claude and write the
// extracted answers into the discovery, without overwriting anything a
// human already typed. Runs synchronously; the modal shows an analyzing
// state while it waits.
async function handleAdminDiscoveryPrefill(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });

  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const id = (body.id || '').toString().slice(0, 120);
  if (!id) return json(400, { ok: false, error: 'Missing discovery id' });
  const rawRec = await env.BLUEPRINT_AUTH.get(`discovery:${id}`);
  if (!rawRec) return json(404, { ok: false, error: 'Discovery not found' });
  let rec = {};
  try { rec = JSON.parse(rawRec); } catch {}

  // The document can arrive inline ({doc}) or reference a file already
  // uploaded on the portal company ({companyId, fid}) — e.g. its RFP.
  let doc = body.doc || null;
  if (!doc && body.companyId && body.fid) {
    const co = await getCompany(env, body.companyId);
    const meta = co && (co.files || []).find((f) => f.fid === body.fid);
    const stored = meta ? await env.BLUEPRINT_AUTH.get(`cofile:${co.id}:${meta.fid}`) : null;
    if (!stored) return json(404, { ok: false, error: 'Company file not found' });
    try {
      const parsed = JSON.parse(stored);
      doc = { type: parsed.ct, name: parsed.name, data: parsed.data };
    } catch { return json(500, { ok: false, error: 'Company file is unreadable' }); }
  }

  let extracted;
  try {
    extracted = await prefillAnswersFromDoc(env, doc || {});
  } catch (err) {
    return json(err.status || 502, { ok: false, error: err.message });
  }

  // Wireframe search bars never show an invented SKU count: only a count
  // the document explicitly stated gets patched into the profile's
  // search-placeholder swap ("Search SKUs," → "Search 48,000 SKUs,").
  if (extracted.skuCount) {
    try {
      const freshRaw = await env.BLUEPRINT_AUTH.get(`discovery:${id}`);
      const fresh = freshRaw ? JSON.parse(freshRaw) : null;
      if (fresh && fresh.profile && Array.isArray(fresh.profile.swaps)) {
        fresh.profile.swaps = patchSkuCount(fresh.profile.swaps, extracted.skuCount);
        // Remember the count so the background AI profile upgrade, if it
        // lands after this, re-applies the patch instead of clobbering it.
        fresh.skuCount = extracted.skuCount;
        await env.BLUEPRINT_AUTH.put(`discovery:${id}`, JSON.stringify(fresh));
        rec = fresh;
      }
    } catch (_) { /* count patch is best-effort */ }
  }

  const clean = sanitizeAnswers(extracted.answers);
  const cur = await getDiscoveryAnswers(env, id);
  const hasValue = (v) => (Array.isArray(v) ? v.length > 0 : (v || '').toString().trim() !== '');
  const merged = { ...clean };
  for (const [k, v] of Object.entries(cur.answers || {})) {
    if (hasValue(v)) merged[k] = v; // never overwrite a human answer
  }
  await env.BLUEPRINT_AUTH.put(`discans:${id}`, JSON.stringify({
    answers: merged,
    activeStepIdx: cur.activeStepIdx || 0,
    unlockedIdx: 9,
    status: cur.status || 'new',
    updatedAt: new Date().toISOString(),
    updatedBy: sess.email,
  }));
  const docName = ((body.doc && body.doc.name) || 'document').toString().slice(0, 80);
  await logActivity(env, null, { type: 'disc-update', entity: 'discovery', id, name: rec.company || id, actor: sess.email, detail: `Pre-filled ${Object.keys(clean).length} answers from ${docName}` });
  return json(200, { ok: true, filled: Object.keys(clean).length });
}

// Permanently removes a discovery: the record, its public handle, the
// saved answers, and any submission snapshots. The /discovery/uncap/
// training demo never lives in KV, so it can't be deleted here.
async function handleAdminDeleteDiscovery(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  if (!(await adminCanDelete(env, sess.email))) return json(403, { ok: false, error: 'Only Admin or Management can delete discoveries.' });
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });

  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const id = (body.id || '').toString().slice(0, 120);
  if (!id) return json(400, { ok: false, error: 'Missing discovery id' });

  const raw = await env.BLUEPRINT_AUTH.get(`discovery:${id}`);
  if (!raw) return json(404, { ok: false, error: 'Discovery not found' });
  let rec = {};
  try { rec = JSON.parse(raw); } catch {}

  const deletes = [
    env.BLUEPRINT_AUTH.delete(`discovery:${id}`),
    env.BLUEPRINT_AUTH.delete(`discans:${id}`),
    env.BLUEPRINT_AUTH.delete(`disclogo:${id}`),
  ];
  if (rec.handle) deletes.push(env.BLUEPRINT_AUTH.delete(`dischandle:${rec.handle}`));
  const subs = await env.BLUEPRINT_AUTH.list({ prefix: `discsub:${id}:`, limit: 100 }).catch(() => null);
  if (subs) for (const k of subs.keys) deletes.push(env.BLUEPRINT_AUTH.delete(k.name));
  await Promise.all(deletes.map((p) => p.catch(() => {})));

  await logActivity(env, null, { type: 'deleted', entity: 'discovery', id, name: rec.company || id, actor: sess.email, detail: 'Discovery deleted' });
  return json(200, { ok: true });
}

async function handleAdminCreateDiscovery(request, env, ctx) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });

  let body;
  try { body = await request.json(); }
  catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

  // Discoveries are created for portal companies only: the company record
  // (imported from Attio, then owned in the admin) supplies name, store
  // url, address, palette, and logo. The body still carries the contact
  // roles picked in the modal and may override website/address/palette.
  const portalCo = await getCompany(env, body.companyId);
  if (!portalCo) return json(400, { ok: false, error: 'Pick a company from the portal' });

  const company = portalCo.name;
  const address = ((body.address || portalCo.address || '')).toString().trim().slice(0, 300);
  const website = ((body.website || portalCo.storeUrl || '')).toString().trim().slice(0, 300);
  const companyAttioId = portalCo.attioCompanyId || '';
  const leadContact       = sanitizeContact(body.leadContact) || (portalCo.leadContact ? sanitizeContact(portalCo.leadContact) : null);
  const associatedContacts = (body.associatedContacts !== undefined
    ? sanitizeContacts(body.associatedContacts)
    : sanitizeContacts(portalCo.contacts)
  ).filter((c) => !leadContact || c.email !== leadContact.email);
  const client = leadContact ? (leadContact.name || leadContact.email) : '';
  const palette = sanitizePalette(body.palette) || sanitizePalette(portalCo.palette);
  let logo = sanitizeLogo(body.logo);
  if (!logo && portalCo.hasLogo) {
    try {
      const raw = await env.BLUEPRINT_AUTH.get(`cologo:${portalCo.id}`);
      if (raw) { const parsed = JSON.parse(raw); logo = { ct: parsed.ct, data: parsed.data }; }
    } catch (_) { /* logo stays absent */ }
  }
  if (!leadContact) return json(400, { ok: false, error: 'The company needs a lead contact first' });

  // Personalize the wireframe scenes: scrape the client's site once and
  // build the swap profile now, so the experience is branded from the
  // first open. Never let a slow or dead site block creation.
  let profile = null;
  try { profile = await buildDiscoveryProfile({ website, company, address }); } catch (_) {}

  const ts = Date.now();
  const id = `${(9_999_999_999_999 - ts).toString(36).padStart(10, '0')}:${genRandSlug()}`;
  // Public URL handle derived from the client's website domain, e.g.
  // https://www.maplewoodfab.com → "maplewoodfab". Unique across discoveries.
  const handle = await uniqueDiscoveryHandle(env, discoveryHandleFromWebsite(website, company));
  const rec = {
    company, client, address, website, handle,
    companyAttioId, companyId: portalCo.id, leadContact, associatedContacts, profile,
    palette, hasLogo: !!logo,
    status: 'new',
    createdAt: new Date(ts).toISOString(),
    createdBy: sess.email,
  };
  await env.BLUEPRINT_AUTH.put(`discovery:${id}`, JSON.stringify(rec));
  await env.BLUEPRINT_AUTH.put(`dischandle:${handle}`, id);
  if (logo) await env.BLUEPRINT_AUTH.put(`disclogo:${id}`, JSON.stringify(logo)).catch(() => {});
  // Link it back so the customer's portal Discovery tab lights up.
  try { portalCo.discoveryHandle = handle; await putCompany(env, portalCo); } catch (_) {}
  await logActivity(env, null, { type: 'created', entity: 'discovery', id, name: company, actor: sess.email, detail: 'Discovery created' });

  // Upgrade the wireframe profile with Claude-written content in the
  // background, so creation stays fast. The deterministic profile above is
  // the fallback and stays in place if the model call fails or the
  // ANTHROPIC_API_KEY secret isn't configured.
  if (env.ANTHROPIC_API_KEY && ctx && ctx.waitUntil) {
    ctx.waitUntil((async () => {
      try {
        const aiProfile = await buildDiscoveryProfileWithAI(env, { website, company, address });
        const raw = await env.BLUEPRINT_AUTH.get(`discovery:${id}`);
        if (!raw) return;
        const cur = JSON.parse(raw);
        // A concurrent document pre-fill may have recorded an exact SKU
        // count; carry it into the upgraded profile.
        if (cur.skuCount && Array.isArray(aiProfile.swaps)) {
          aiProfile.swaps = patchSkuCount(aiProfile.swaps, cur.skuCount);
        }
        cur.profile = aiProfile;
        await env.BLUEPRINT_AUTH.put(`discovery:${id}`, JSON.stringify(cur));
      } catch (_) { /* deterministic profile stays */ }
    })());
  }

  return json(200, { ok: true, discovery: { id, ...rec } });
}

// ── Discovery experience: handle, gate, autosave, submit ─────────────────
// The public discovery URL is /discovery/<handle>/, where <handle> is a
// clean slug of the client's website domain. Answers persist server-side so
// a half-finished session resumes anywhere; the same URL is filled by an
// admin (auto-authed via the admin cookie) on the call and later opened by
// the client with an email passcode to edit/complete their own entries.

// ── Training demo instance (/discovery/uncap/) ───────────────────────────
// A fixed, always-filled discovery the team trains on. Reads return the full
// example set below; saves/submits are no-ops so it can never be polluted.
// IMPORTANT: when questions or fields are added anywhere, add their example
// answers HERE (and only here) so this demo stays fully populated.
const DEMO_DISCOVERY_HANDLE = 'uncap';
const DEMO_DISCOVERY = {
  id: 'demo-uncap', handle: 'uncap', company: 'Harlow Industrial Supply (Demo)',
  client: 'Uncap Team', website: 'uncap.com', status: 'complete',
  leadContact: { name: 'Uncap Team', email: 'denis@uncap.com' }, associatedContacts: [],
};
const DEMO_ANSWERS = {
  // 1 · Client
  'q-name': 'Harlow Industrial Supply',
  'q-what': 'Industrial MRO distribution — abrasives, fasteners, safety, power tools, and cutting tools. We sell to fabricators, contractors, and plant-maintenance teams across the Midwest.',
  'q-rev': '$50–250M',
  'q-stake': 'Karen Ruiz (VP Ecommerce, decision maker), Tom Beckett (Director of IT), Priya Shah (Product Data Manager), and Dana Whitfield (Inside Sales Lead).',
  'q-owner': 'Karen Ruiz, VP Ecommerce',
  'q-why': 'We lost two national accounts last quarter to competitors with self-serve portals, and our ERP contract renews in nine months — we want commerce sorted before then.',
  'q-success': '30% of revenue online within 12 months, 500+ active buyer accounts self-serving, and a 20% drop in order-entry calls.',
  'q-channels': ['Sales reps', 'Phone / email', 'EDI'],
  // 2 · Architecture
  'q-platform': 'Adobe Commerce (Magento) · Magento Open Source',
  'q-breaking': 'Magento 2 is on an unsupported version, integrations are held together with nightly CSV jobs, and inventory is always a day stale.',
  'q-erp': 'Epicor · Prophet 21 / P21',
  'q-pim': 'Akeneo',
  'q-pim-skus': '48,000',
  'q-pim-products': '12,500',
  'q-pim-categories': '240',
  'q-pim-filters': '36',
  'q-pim-attributes': '410',
  'q-b2b-contract': 'Yes',
  'q-b2b-pricegroups': '14',
  'q-b2b-collections': 'Yes',
  'q-b2b-qtyrules': ['Tier Pricing', 'Min QTY', 'Increments'],
  'q-paygateway': 'Authorize.net for cards, ACH through the bank',
  'q-payoptions': ['Credit Cards', 'ACH', 'Net Terms', 'PO Orders'],
  'q-crm': 'HubSpot',
  'q-crm-quotes': 'Reps build quotes in the ERP and email PDFs; approvals happen over the phone and nothing links back to the site.',
  'q-wms': 'Körber (HighJump)',
  'q-ims': 'Tracked in the ERP',
  'q-oms': 'ERP order entry',
  'q-fulfilsys': 'ShipStation',
  'q-locations': '8',
  'q-integrations': 'A middleware vendor syncs P21 to Magento nightly; EDI runs through SPS Commerce; payments via a legacy gateway.',
  'q-edi': 'Yes',
  'q-maintains': 'A single contractor, part-time',
  // 3 · Experience
  'q-5sec': "That we're a real distributor with deep stock, contract pricing, and same-day shipping — not a marketplace reseller.",
  'q-brand': 'Logo only',
  'q-lookup': 'Mostly by part number and manufacturer number, then by category and application.',
  'q-skus': '10–100K',
  'q-topcats': 'Abrasives, Fasteners, Safety & PPE, Power Tools',
  'q-convince': 'Net-30 terms, same-day shipping, real technical specs, and a rep they can call.',
  'q-guest': 'Login to see',
  'q-custpricing': 'Yes',
  // 4 · Discovery
  'q-attrs': 'Size/diameter, grit, material, brand, thread size, and compliance rating.',
  'q-dataq': 'Messy',
  'q-card': 'Part number, price (contract price when signed in), stock status, brand, and a quick-add quantity.',
  'q-stock': 'By location',
  'q-partsearch': 'Critical',
  'q-crossref': 'Yes',
  'q-ordersize': '5–20',
  'q-compare': 'Yes',
  // 5 · Conversion
  'q-pricing': 'List price with customer-specific contract pricing and quantity breaks; a handful of negotiated SKUs.',
  'q-qtybreaks': 'Yes',
  'q-uom': 'Each / case',
  'q-techcontent': 'Spec tables, datasheets (PDF), SDS sheets, and CAD models for select lines.',
  'q-assets': 'Shared drive and vendor portals, plus PDFs stored in the ERP',
  'q-leadtime': 'Varies',
  'q-quote': 'Yes',
  'q-rep': 'Yes',
  // 6 · Revenue
  'q-aov': '$5–50K',
  'q-friction': 'Freight quoting for LTL, PO entry, and tax exemption — buyers give up and call instead.',
  'q-paymethods': ['Credit card', 'PO / net terms', 'ACH'],
  'q-terms': 'Credit application reviewed by finance, usually 2–3 days; limits set per account.',
  'q-freight': 'Parcel for small orders, LTL freight for pallets; some hazmat (aerosols); will-call at two branches.',
  'q-split': 'Yes',
  'q-freightquote': 'Yes',
  'q-taxexempt': 'Yes',
  // 7 · Unified
  'q-roles': 'Yes — purchasing agents place orders, plant managers approve above a threshold, and each account sets spending limits.',
  'q-accounts': '1–10K',
  'q-quoteflow': "Today it's email and PDFs back and forth, then re-keyed into the ERP — slow and error-prone.",
  'q-repsorder': 'Yes',
  'q-calls': 'Invoice copies, order status, tracking, and reordering past items.',
  'q-payinvoice': 'Yes',
  'q-repeat': 'Yes',
  'q-punchout': 'Yes',
  // 8 · Project
  'q-launch': 'Q3 next year, ahead of the ERP renewal',
  'q-deadlines': "ERP contract renews in nine months; we want to avoid re-signing a commerce module we won't use.",
  'q-phased': 'Phased',
  'q-budget': '$150–300K',
  'q-signoff': 'Karen Ruiz (VP Ecommerce), with CFO approval',
  'q-internal': 'Karen owns the project, Tom (IT) owns integrations, Priya owns product data, marketing supports content.',
  'q-capacity': 'Some',
  'q-procurement': 'Proposal review, legal for the MSA, then a procurement PO — about 3–4 weeks.',
  // 9 · Growth
  'q-support': 'Growth retainer',
  'q-dayto': "Marketing plus Karen's team, with our retainer for larger changes",
  'q-metrics': 'Online revenue %, new account signups, reorder rate, and order-entry call volume.',
  'q-analytics': 'GA4 plus ERP reports',
  'q-testing': 'Yes',
  'q-phase2': 'Punchout integrations, a mobile app for reps, and international shipping.',
  'q-newchannels': ['Marketplaces', 'International'],
  'q-marketing': ['SEO', 'Email / SMS'],
  // 10 · Enclosing
  'q-missed': 'How we migrate 20 years of order history, and whether customers keep their existing logins.',
  'q-risk': "Product-data quality — if attributes aren't cleaned up, filtering and search won't deliver.",
  'q-agencies': 'Worked with a large agency before — great design, weak grasp of B2B/ERP realities. We want a partner who gets distribution.',
  'q-comms': 'Weekly standups, Slack, and a shared board',
  'q-proposal': 'Three weeks from today',
  'q-audience': 'Karen Ruiz (VP Ecommerce) and the CFO',
  'q-confidential': "We're quietly evaluating one competitor's platform too — please keep this engagement discreet.",
  'q-homerun': 'Launch on time, hit 30% online revenue, and have reps actually prefer the new tools.',
};

function discoveryHandleFromWebsite(website, company) {
  let h = (website || '').toString().trim().toLowerCase();
  h = h.replace(/^https?:\/\//, '').replace(/^www\./, '');
  h = h.split('/')[0].split('?')[0].split(':')[0];   // host only
  h = h.split('.')[0];                                // main label before first dot
  h = h.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!h) h = normalizeBlueprintId(company || 'client');
  return h || 'client';
}

async function uniqueDiscoveryHandle(env, base) {
  let h = base;
  for (let i = 2; i <= 50; i++) {
    const existing = await env.BLUEPRINT_AUTH.get(`dischandle:${h}`);
    if (!existing) return h;
    h = `${base}-${i}`;
  }
  return `${base}-${genRandSlug()}`;
}

async function getDiscoveryByHandle(env, handle) {
  const clean = (handle || '').toString().trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!clean) return null;
  // The training demo always resolves, even if no KV record exists.
  if (clean === DEMO_DISCOVERY_HANDLE) {
    const id = await env.BLUEPRINT_AUTH.get(`dischandle:${clean}`);
    if (id) {
      const raw = await env.BLUEPRINT_AUTH.get(`discovery:${id}`);
      if (raw) { try { return { demo: true, id, ...JSON.parse(raw) }; } catch {} }
    }
    return { demo: true, ...DEMO_DISCOVERY };
  }
  const id = await env.BLUEPRINT_AUTH.get(`dischandle:${clean}`);
  if (!id) {
    // Company-folder alias: /<companyId>/discovery reaches the experience
    // with the company id, which may differ from the discovery handle.
    const co = await getCompany(env, clean);
    if (co && co.discoveryHandle && co.discoveryHandle !== clean) {
      return getDiscoveryByHandle(env, co.discoveryHandle);
    }
    return null;
  }
  const raw = await env.BLUEPRINT_AUTH.get(`discovery:${id}`);
  if (!raw) return null;
  try { return { id, ...JSON.parse(raw) }; } catch { return null; }
}

function discoveryAllowlist(disc) {
  const emails = [];
  if (disc.leadContact && disc.leadContact.email) emails.push(disc.leadContact.email.toLowerCase());
  for (const c of (disc.associatedContacts || [])) {
    if (c && c.email) emails.push(c.email.toLowerCase());
  }
  return [...new Set(emails)];
}

// Name of the assigned contact for an email, so client submits report a real
// name without asking for it at the gate.
function discoveryContactName(disc, email) {
  const e = (email || '').toLowerCase();
  if (disc.leadContact && (disc.leadContact.email || '').toLowerCase() === e) return disc.leadContact.name || '';
  for (const c of (disc.associatedContacts || [])) {
    if (c && (c.email || '').toLowerCase() === e) return c.name || '';
  }
  return '';
}

async function getDiscoveryAnswers(env, id) {
  const raw = await env.BLUEPRINT_AUTH.get(`discans:${id}`);
  if (!raw) return { answers: {}, activeStepIdx: 0, unlockedIdx: 0, status: 'new' };
  try {
    const p = JSON.parse(raw);
    return {
      answers: p.answers || {},
      activeStepIdx: p.activeStepIdx || 0,
      unlockedIdx: p.unlockedIdx || 0,
      status: p.status || 'new',
      updatedAt: p.updatedAt || '',
      updatedBy: p.updatedBy || '',
    };
  } catch { return { answers: {}, activeStepIdx: 0, unlockedIdx: 0, status: 'new' }; }
}

function sanitizeAnswers(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  let n = 0;
  for (const k of Object.keys(raw)) {
    if (n++ >= 400) break;
    const key = k.toString().slice(0, 80);
    const v = raw[k];
    if (Array.isArray(v)) {
      out[key] = v.slice(0, 40).map((x) => x.toString().slice(0, 400));
    } else if (v == null) {
      out[key] = '';
    } else {
      out[key] = v.toString().slice(0, 8000);
    }
  }
  return out;
}

// A discovery bearer session (client, passcode-authed). Distinct from
// blueprint sessions by kind; bound to one discovery id + IP/UA.
async function getDiscoverySession(env, token) {
  if (!token) return null;
  const raw = await env.BLUEPRINT_AUTH.get(`session:${token}`);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    return s.kind === 'discovery' ? s : null;
  } catch { return null; }
}

// Resolve who's acting on a discovery: an admin (cookie) or a passcode
// client (token in the body). Returns { role, email, name } or null.
async function resolveDiscoveryActor(request, env, body, disc) {
  const admin = await getAdminSession(request, env);
  if (admin) return { role: 'admin', email: admin.email, name: admin.name || admin.email };
  // A signed-in portal customer opens their own company's discovery with
  // no extra gate — the portal cookie is the session.
  const portal = await getPortalSession(request, env);
  if (portal) {
    const co = await getCompany(env, portal.companyId);
    if (co && (co.discoveryHandle === disc.handle || (disc.companyId && disc.companyId === co.id))) {
      return { role: 'client', email: portal.email || '', name: portal.name || portal.email || 'Client' };
    }
  }
  const token = (body.token || '').toString().trim();
  const sess = await getDiscoverySession(env, token);
  if (sess && sess.discoveryId === disc.id && sessionBindingOk(sess, request)) {
    return { role: 'client', email: sess.email || '', name: sess.name || sess.email || 'Client' };
  }
  return null;
}

// Public: minimal meta so the gate/welcome can render before auth.
async function handleDiscoveryMeta(request, env) {
  const url = new URL(request.url);
  const disc = await getDiscoveryByHandle(env, url.searchParams.get('handle'));
  if (!disc) return json(404, { ok: false, error: 'Discovery not found' });
  const admin = await getAdminSession(request, env);
  return json(200, {
    ok: true,
    handle: disc.handle,
    company: disc.company || '',
    clientName: disc.company || disc.client || '',
    address: disc.address || '',
    profile: disc.profile || null,
    palette: disc.palette || null,
    hasLogo: !!disc.hasLogo,
    status: disc.status || 'new',
    isAdmin: !!admin,
  });
}

async function handleDiscoveryRequestCode(request, env) {
  let body;
  try { body = await request.json(); } catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const emailRaw = (body.email || '').toString().trim();
  if (!emailRaw || !EMAIL_RE.test(emailRaw)) return json(400, { ok: false, error: 'Enter a valid email' });
  const email = emailRaw.toLowerCase();
  const disc = await getDiscoveryByHandle(env, body.handle);
  if (!disc) return json(404, { ok: false, error: 'Discovery not found' });

  // Strict allowlist: only the clients assigned to this discovery (lead +
  // associated contacts) can ever request a passcode. The Uncap team opens
  // it through the admin dashboard (cookie auth), not this gate — except the
  // training demo, which any @uncap.com teammate can unlock by passcode.
  const allow = discoveryAllowlist(disc);
  const allowed = allow.includes(email) || (disc.demo && email.endsWith('@uncap.com'));
  if (!allowed) {
    return json(403, { ok: false, error: 'This discovery is restricted. Use the email it was sent to.' });
  }
  {
    const ip = clientIp(request);
    const okEmail = await rateLimit(env, `disccode:email:${disc.id}:${encodeURIComponent(email)}`, 3, 15 * 60);
    const okIp = ip ? await rateLimit(env, `disccode:ip:${ip}`, 10, 15 * 60) : true;
    if (!okEmail || !okIp) return json(429, { ok: false, error: 'Too many code requests. Wait a few minutes and try again.' });
  }
  const code = genCode();
  await env.BLUEPRINT_AUTH.put(`disccode:${disc.id}:${encodeURIComponent(email)}`, code, { expirationTtl: CODE_TTL_SECONDS });
  await env.BLUEPRINT_AUTH.delete(`disctries:${disc.id}:${encodeURIComponent(email)}`).catch(() => {});
  try {
    await sendCodeEmail(env, { to: email, code, label: 'Discovery' });
    return json(200, { ok: true });
  } catch (err) {
    console.error('discovery sendCodeEmail failed:', err && err.message);
    return json(502, { ok: false, error: 'Could not send the code right now. Try again shortly.' });
  }
}

async function handleDiscoveryVerify(request, env) {
  let body;
  try { body = await request.json(); } catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const email = (body.email || '').toString().trim().toLowerCase();
  const code = (body.code || '').toString().trim();
  if (!email || !code) return json(400, { ok: false, error: 'Enter your code' });
  const disc = await getDiscoveryByHandle(env, body.handle);
  if (!disc) return json(404, { ok: false, error: 'Discovery not found' });
  // Only assigned contacts hold a code, but re-check the allowlist here too.
  if (!discoveryAllowlist(disc).includes(email) && !(disc.demo && email.endsWith('@uncap.com'))) {
    return json(403, { ok: false, error: 'This discovery is restricted.' });
  }
  const name = stripHeaderValue(discoveryContactName(disc, email)).slice(0, 200) || email.split('@')[0];

  const ip = clientIp(request);
  if (ip && !(await rateLimit(env, `discverify:${ip}`, 20, 10 * 60))) {
    return json(429, { ok: false, error: 'Too many attempts. Wait a few minutes and try again.' });
  }
  const key = `disccode:${disc.id}:${encodeURIComponent(email)}`;
  const triesKey = `disctries:${disc.id}:${encodeURIComponent(email)}`;
  const stored = await env.BLUEPRINT_AUTH.get(key);
  if (!stored || stored !== code) {
    const tries = (parseInt(await env.BLUEPRINT_AUTH.get(triesKey), 10) || 0) + 1;
    if (stored && tries >= MAX_CODE_ATTEMPTS) {
      await env.BLUEPRINT_AUTH.delete(key).catch(() => {});
      await env.BLUEPRINT_AUTH.delete(triesKey).catch(() => {});
    } else {
      await env.BLUEPRINT_AUTH.put(triesKey, String(tries), { expirationTtl: CODE_TTL_SECONDS }).catch(() => {});
    }
    return json(401, { ok: false, error: 'Invalid or expired code. Request a new one if needed.' });
  }
  await env.BLUEPRINT_AUTH.delete(key);
  await env.BLUEPRINT_AUTH.delete(triesKey).catch(() => {});

  const token = genToken();
  await env.BLUEPRINT_AUTH.put(
    `session:${token}`,
    JSON.stringify({ kind: 'discovery', discoveryId: disc.id, handle: disc.handle, email, name, ip, userAgent: clientUa(request), ts: Date.now() }),
    { expirationTtl: SESSION_TTL_SECONDS }
  );
  return json(200, { ok: true, token, role: 'client', name });
}

// Load answers + progress. Admin (cookie) or client (token in query/body).
async function handleDiscoveryGetAnswers(request, env) {
  const url = new URL(request.url);
  const disc = await getDiscoveryByHandle(env, url.searchParams.get('handle'));
  if (!disc) return json(404, { ok: false, error: 'Discovery not found' });
  const actor = await resolveDiscoveryActor(request, env, { token: url.searchParams.get('token') || '' }, disc);
  if (!actor) return json(401, { ok: false, error: 'Not authorised' });
  // The training demo always returns the full example set, every step
  // unlocked, and never reads persisted answers.
  if (disc.demo) {
    return json(200, {
      ok: true, role: actor.role, company: disc.company || '',
      clientName: disc.company || disc.client || '', handle: disc.handle,
      answers: DEMO_ANSWERS, activeStepIdx: 0, unlockedIdx: 9, status: 'complete',
    });
  }
  const data = await getDiscoveryAnswers(env, disc.id);
  return json(200, {
    ok: true,
    role: actor.role,
    company: disc.company || '',
    clientName: disc.company || disc.client || '',
    address: disc.address || '',
    profile: disc.profile || null,
    palette: disc.palette || null,
    hasLogo: !!disc.hasLogo,
    handle: disc.handle,
    answers: data.answers,
    activeStepIdx: data.activeStepIdx,
    unlockedIdx: data.unlockedIdx,
    status: disc.status || data.status || 'new',
  });
}

async function writeDiscoveryStatus(env, disc, status) {
  if (disc.status === status) return;
  disc.status = status;
  const { id, ...rest } = disc;
  await env.BLUEPRINT_AUTH.put(`discovery:${id}`, JSON.stringify(rest)).catch(() => {});
}

// Admin autosave (continuous during the call) — also flips status to
// in_progress on first save, and to complete when the admin finishes.
async function handleDiscoverySaveAnswers(request, env) {
  let body;
  try { body = await request.json(); } catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const disc = await getDiscoveryByHandle(env, body.handle);
  if (!disc) return json(404, { ok: false, error: 'Discovery not found' });
  const actor = await resolveDiscoveryActor(request, env, body, disc);
  if (!actor) return json(401, { ok: false, error: 'Not authorised' });
  if (actor.role !== 'admin') return json(403, { ok: false, error: 'Admin only' });
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });
  // The training demo is read-only — accept saves but never persist, so it
  // stays pristine no matter who clicks through it.
  if (disc.demo) return json(200, { ok: true, status: 'complete', demo: true });

  const prev = await getDiscoveryAnswers(env, disc.id);
  const answers = sanitizeAnswers(body.answers);
  const activeStepIdx = Math.max(0, Math.min(9, parseInt(body.activeStepIdx, 10) || 0));
  const unlockedIdx = Math.max(0, Math.min(9, parseInt(body.unlockedIdx, 10) || 0));
  const complete = body.complete === true;
  const status = complete ? 'complete' : (disc.status === 'complete' ? 'complete' : 'in_progress');

  await env.BLUEPRINT_AUTH.put(`discans:${disc.id}`, JSON.stringify({
    answers, activeStepIdx, unlockedIdx, status,
    updatedAt: new Date().toISOString(), updatedBy: actor.email,
  }));
  await writeDiscoveryStatus(env, disc, status);

  if (complete && prev.status !== 'complete') {
    await logActivity(env, null, { type: 'status', entity: 'discovery', id: disc.id, name: disc.company || disc.handle, actor: actor.email, detail: 'Discovery completed' });
  } else if (prev.status === 'new') {
    await logActivity(env, null, { type: 'edited', entity: 'discovery', id: disc.id, name: disc.company || disc.handle, actor: actor.email, detail: 'Discovery started' });
  }
  return json(200, { ok: true, status });
}

// Client submit — diff against what's stored, save, and report the change
// set on the dashboard activity feed with a viewable payload.
async function handleDiscoverySubmit(request, env) {
  let body;
  try { body = await request.json(); } catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const disc = await getDiscoveryByHandle(env, body.handle);
  if (!disc) return json(404, { ok: false, error: 'Discovery not found' });
  const actor = await resolveDiscoveryActor(request, env, body, disc);
  if (!actor) return json(401, { ok: false, error: 'Not authorised' });
  // Training demo: accept the submit but never persist or report it.
  if (disc.demo) return json(200, { ok: true, changed: 0, demo: true });

  const prev = await getDiscoveryAnswers(env, disc.id);
  const next = sanitizeAnswers(body.answers);
  const labels = (body.labels && typeof body.labels === 'object') ? body.labels : {};

  // Compute the diff (added + changed entries) so the admin can review
  // exactly what the client touched.
  const changes = [];
  const norm = (v) => Array.isArray(v) ? v.join(', ') : (v == null ? '' : String(v));
  for (const qid of Object.keys(next)) {
    const before = norm(prev.answers[qid]);
    const after = norm(next[qid]);
    if (after !== before && after.trim() !== '') {
      changes.push({
        qid,
        label: (labels[qid] || qid).toString().slice(0, 200),
        before: before.slice(0, 800),
        after: after.slice(0, 800),
        isNew: before.trim() === '',
      });
    }
    if (changes.length >= 200) break;
  }

  const merged = { ...prev.answers, ...next };
  await env.BLUEPRINT_AUTH.put(`discans:${disc.id}`, JSON.stringify({
    answers: merged,
    activeStepIdx: prev.activeStepIdx, unlockedIdx: prev.unlockedIdx,
    status: disc.status === 'complete' ? 'complete' : 'in_progress',
    updatedAt: new Date().toISOString(), updatedBy: actor.email,
  }));

  if (changes.length) {
    const ts = Date.now();
    const ref = `${(9_999_999_999_999 - ts).toString(36).padStart(10, '0')}:${genRandSlug()}`;
    await env.BLUEPRINT_AUTH.put(`discsub:${disc.id}:${ref}`, JSON.stringify({
      discoveryId: disc.id, handle: disc.handle, company: disc.company || '',
      by: actor.name, email: actor.email, at: new Date(ts).toISOString(), changes,
    }), { expirationTtl: ACCESS_LOG_TTL_SECONDS });
    const who = actor.name || actor.email || 'A client';
    await logActivity(env, null, {
      type: 'disc-update', entity: 'discovery', id: disc.id,
      name: disc.company || disc.handle, actor: who,
      detail: `${changes.length} ${changes.length === 1 ? 'entry' : 'entries'} updated`,
      ref: `${disc.id}:${ref}`,
    });
  }
  return json(200, { ok: true, changed: changes.length });
}

// Admin: fetch a stored client-submission change set for the activity popup.
async function handleAdminDiscoverySubmission(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  const ref = (new URL(request.url).searchParams.get('ref') || '').trim();
  // ref is disc.id + ':' + submissionId, each of which is itself
  // "<base36ts>:<hexslug>", so the full value is 4 colon-joined alnum parts.
  if (ref.length > 120 || !/^[a-z0-9]+(:[a-z0-9]+){1,5}$/i.test(ref)) return json(400, { ok: false, error: 'Bad ref' });
  const raw = await env.BLUEPRINT_AUTH.get(`discsub:${ref}`);
  if (!raw) return json(404, { ok: false, error: 'Not found' });
  try { return json(200, { ok: true, submission: JSON.parse(raw) }); }
  catch { return json(404, { ok: false, error: 'Not found' }); }
}

// ----------------------------------------------------------------------------
// Email senders — both routes go through Cloudflare's send_email binding.
//
// Important constraint: send_email is restricted to addresses that are
// already registered + verified as destination addresses in Cloudflare
// Email Routing on the worker's zone. Sends to unverified addresses
// fail with an error from Cloudflare's side.
// ----------------------------------------------------------------------------

async function sendCodeEmail(env, { to, code, blueprintId, label }) {
  const what = label || 'Blueprint';
  const subject = `Your Uncap ${what} passcode`;
  const text =
    `Your 6-digit passcode to open the Uncap ${what}:\n\n` +
    `${code}\n\n` +
    `Valid for 10 minutes. If you didn't request this, you can ignore the email.`;
  const html = `
    <div style="font-family:-apple-system,Inter,Arial,sans-serif;color:#0A0A0A;line-height:1.5;max-width:480px;margin:0 auto;padding:32px 24px;background:#F2EFE7;">
      <div style="font-family:monospace;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#707070;margin-bottom:24px;">Uncap ${escapeHtml(what)} · Passcode</div>
      <p style="font-size:16px;margin:0 0 16px;">Your 6-digit passcode to open the ${escapeHtml(what)}:</p>
      <p style="font-family:monospace;font-size:34px;letter-spacing:8px;font-weight:700;margin:0 0 24px;background:#FFFFFF;border-radius:8px;padding:20px 24px;text-align:center;color:#0A0A0A;">${escapeHtml(code)}</p>
      <p style="font-size:13px;color:#707070;margin:0;">Valid for 10 minutes. If you didn't request this, you can ignore the email.</p>
    </div>`;
  await sendViaCloudflareEmail(env, { to, subject, text, html });
}

// Branded portal-invite email. Same transport + HTML style as the passcode
// email; tells the contact their private portal is ready and links to it.
async function sendCompanyInvite(env, company, contact) {
  const link = `https://${GO_HOST}/${company.id}/company`;
  const co = company.name || 'your company';
  const hi = contact.name ? contact.name.split(' ')[0] : 'there';
  const subject = `Your Uncap Hub for ${co} is ready`;
  const text =
    `Hi ${hi},\n\n` +
    `Your Uncap Hub for ${co} is ready. It's where you'll find your company details, your discovery, and your blueprint proposal.\n\n` +
    `Open it here:\n${link}\n\n` +
    `Sign in with this email address (${contact.email}) and we'll send you a 6-digit code. No password needed.\n\n` +
    `See you inside,\nThe Uncap team`;
  const html = `
    <div style="font-family:-apple-system,Inter,Arial,sans-serif;color:#0A0A0A;line-height:1.55;max-width:480px;margin:0 auto;padding:32px 24px;background:#F2EFE7;">
      <div style="font-family:monospace;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#707070;margin-bottom:22px;">Uncap · Hub</div>
      <p style="font-size:20px;font-weight:700;letter-spacing:-0.01em;margin:0 0 12px;">Your Hub is ready, ${escapeHtml(hi)}.</p>
      <p style="font-size:15px;margin:0 0 20px;color:#1A1A1A;">Your Uncap Hub for <b>${escapeHtml(co)}</b> is where you'll find your company details, your discovery, and your blueprint proposal.</p>
      <p style="margin:0 0 22px;"><a href="${escapeHtml(link)}" style="display:inline-block;background:#0A0A0A;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:650;border-radius:6px;padding:14px 26px;">Open your Hub</a></p>
      <p style="font-size:13px;color:#707070;margin:0;">Sign in with this email (${escapeHtml(contact.email)}) and we'll send you a 6-digit code. No password needed.</p>
    </div>`;
  await sendViaCloudflareEmail(env, { to: contact.email, subject, text, html });
}

// Send portal invites to a company's contacts (approved admin). Returns a
// per-recipient result so the UI can report which addresses the Cloudflare
// transport accepted (unverified destinations fail).
async function handleAdminCompanyInvite(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });
  let body;
  try { body = await request.json(); } catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const rec = await getCompany(env, body.id);
  if (!rec) return json(404, { ok: false, error: 'Company not found' });

  // Target = the requested subset, else every contact on the company.
  const all = [rec.leadContact, ...(rec.contacts || [])].filter((c) => c && c.email);
  const wanted = Array.isArray(body.emails) && body.emails.length
    ? new Set(body.emails.map((e) => e.toString().toLowerCase()))
    : null;
  const targets = all.filter((c) => !wanted || wanted.has(c.email.toLowerCase()));
  if (!targets.length) return json(400, { ok: false, error: 'No contacts to invite' });

  rec.invites = rec.invites && typeof rec.invites === 'object' ? rec.invites : {};
  const results = [];
  for (const c of targets) {
    try {
      await sendCompanyInvite(env, rec, c);
      rec.invites[c.email.toLowerCase()] = { at: new Date().toISOString(), by: sess.email };
      results.push({ email: c.email, ok: true });
    } catch (err) {
      results.push({ email: c.email, ok: false, error: (err && err.message) || 'send failed' });
    }
  }
  const sent = results.filter((r) => r.ok).length;
  if (sent) {
    await putCompany(env, rec);
    await logActivity(env, null, { type: 'view', entity: 'company', id: rec.id, name: rec.name, actor: sess.email, detail: `Portal invite sent to ${sent} contact${sent === 1 ? '' : 's'}` });
  }
  return json(200, { ok: true, results, invites: rec.invites });
}

// Internal recipients for every Blueprint notification (view + sign).
// Hardcoded here rather than read from env because the deploy runs with
// `wrangler deploy --keep-vars`, so wrangler.toml var edits don't take
// effect — the dashboard vars win. Any addresses set in env.NOTIFY_EMAIL
// (comma-separated) are merged in on top, deduped.
const NOTIFY_RECIPIENTS = ['denis@uncap.com', 'ryan@uncap.com'];

function notifyRecipients(env) {
  const fromEnv = (env.NOTIFY_EMAIL || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const all = [...NOTIFY_RECIPIENTS.map((s) => s.toLowerCase()), ...fromEnv];
  return [...new Set(all)];
}

async function notifyAdmin(env, { subject, text }) {
  const html = `<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>`;
  const recipients = notifyRecipients(env);
  // Cloudflare's send_email binding delivers to one envelope recipient
  // per message, so fan out one email per recipient. Use allSettled so a
  // single failed/unverified destination doesn't suppress the others.
  const results = await Promise.allSettled(
    recipients.map((to) => sendViaCloudflareEmail(env, { to, subject, text, html }))
  );
  // If every send failed, surface the first error so the caller can react.
  if (results.length && results.every((r) => r.status === 'rejected')) {
    throw results[0].reason || new Error('All notification sends failed');
  }
}

async function sendViaCloudflareEmail(env, { to, subject, text, html }) {
  if (!env.NOTIFY_MAIL) {
    throw new Error('NOTIFY_MAIL binding is not configured');
  }
  const from = parseAddress(env.EMAIL_FROM || 'Uncap Blueprint <noreply@uncap.com>');
  const boundary = '----=_Part_' + crypto.randomUUID();
  // Strip CR/LF from every interpolated header value so no field can inject
  // extra headers into the raw MIME block.
  const fromDisplay = stripHeaderValue(from.display);
  const fromAddress = stripHeaderValue(from.address);
  const headers = [
    `From: ${fromDisplay ? `"${fromDisplay}" <${fromAddress}>` : fromAddress}`,
    `To: ${stripHeaderValue(to)}`,
    `Subject: ${stripHeaderValue(subject)}`,
    `Message-ID: <${crypto.randomUUID()}@uncap.com>`,
    `Date: ${new Date().toUTCString()}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ].join('\r\n');
  const parts = [
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    b64utf8(text),
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    b64utf8(html),
    `--${boundary}--`,
    ``,
  ].join('\r\n');
  await env.NOTIFY_MAIL.send(new EmailMessage(from.address, to, headers + '\r\n\r\n' + parts));
}

function parseAddress(input) {
  const trimmed = (input || '').trim();
  if (!trimmed) return { display: '', address: '' };
  const m = trimmed.match(/^\s*(.+?)\s*<([^>]+)>\s*$/);
  if (m) return { display: m[1].replace(/^"|"$/g, ''), address: m[2].trim() };
  return { display: '', address: trimmed };
}

function b64utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/(.{76})/g, '$1\r\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// Companies — the portal's source of truth for every client we invite.
// Imported from Attio once by an admin, then owned and edited here; the
// discovery and blueprint creation flows read from these records, never
// from Attio directly. Files (RFP, technical brief, other documents) live
// alongside so proposals and pre-fills pull from the same place customers
// see in their portal.
//
// KV layout:
//   company:<id>          → record (no file bodies)
//   cologo:<id>           → { ct, data } logo, same shape as disclogo
//   cofile:<id>:<fid>     → { ct, name, data } uploaded document
//   portal_session:<tok>  → { email, name, companyId, ts }
//   pocode:<email> / potries:<email> → passcode state for portal login
// ═══════════════════════════════════════════════════════════════════════════

const PORTAL_COOKIE = '__Host-bp_portal';
const PORTAL_SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const COMPANY_FILE_KINDS = ['rfp', 'brief', 'doc'];
const COMPANY_MAX_FILES = 14;

function companySlug(name) {
  const s = (name || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  return s || 'company';
}

async function uniqueCompanyId(env, base) {
  if (PORTAL_RESERVED.has(base)) base = `${base}-co`;
  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    if (!(await env.BLUEPRINT_AUTH.get(`company:${candidate}`))) return candidate;
  }
  return `${base}-${genToken().slice(0, 6)}`;
}

// A company contact: like sanitizeContact but keeps the person's title.
function sanitizeCoContact(raw) {
  const c = sanitizeContact(raw);
  if (!c) return null;
  c.title = ((raw && raw.title) || '').toString().trim().slice(0, 120);
  return c;
}

function sanitizeCoContacts(raw, max) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const item of raw) {
    const c = sanitizeCoContact(item);
    if (c && !out.some((x) => x.email === c.email)) out.push(c);
    if (out.length >= (max || 20)) break;
  }
  return out;
}

// The editable field set shared by create and update.
function companyFieldsFrom(body) {
  return {
    name: (body.name || '').toString().trim().slice(0, 200),
    storeUrl: (body.storeUrl || '').toString().trim().slice(0, 300),
    address: (body.address || '').toString().trim().slice(0, 300),
    description: (body.description || '').toString().trim().slice(0, 2000),
    platform: (body.platform || '').toString().trim().slice(0, 120),
    erp: (body.erp || '').toString().trim().slice(0, 120),
    attioCompanyId: (body.attioCompanyId || '').toString().trim().slice(0, 100),
    leadContact: sanitizeCoContact(body.leadContact),
    contacts: sanitizeCoContacts(body.contacts),
    palette: sanitizePalette(body.palette),
  };
}

async function getCompany(env, id) {
  const clean = (id || '').toString().trim().toLowerCase();
  if (!/^[a-z0-9-]{1,60}$/.test(clean)) return null;
  const raw = await env.BLUEPRINT_AUTH.get(`company:${clean}`);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

async function putCompany(env, rec) {
  rec.updatedAt = new Date().toISOString();
  await env.BLUEPRINT_AUTH.put(`company:${rec.id}`, JSON.stringify(rec));
  return rec;
}

async function listCompanies(env) {
  const list = await env.BLUEPRINT_AUTH.list({ prefix: 'company:', limit: 500 });
  const rows = await Promise.all(list.keys.map((k) => env.BLUEPRINT_AUTH.get(k.name).then((v) => {
    try { return JSON.parse(v); } catch { return null; }
  }).catch(() => null)));
  return rows.filter(Boolean).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

async function handleAdminListCompanies(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  try { await migrateCompaniesV1(env); } catch (_) { /* migration is best-effort */ }
  return json(200, { ok: true, companies: await listCompanies(env) });
}

async function handleAdminCreateCompany(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });
  let body;
  try { body = await request.json(); } catch { return json(400, { ok: false, error: 'Invalid JSON' }); }

  const fields = companyFieldsFrom(body);
  if (!fields.name) return json(400, { ok: false, error: 'Company name is required' });

  // The company folder follows the store domain: companyname.com →
  // go.uncap.com/companyname/. Name is only the fallback when no domain.
  const base = fields.storeUrl
    ? discoveryHandleFromWebsite(fields.storeUrl, fields.name)
    : companySlug(fields.name);
  const id = await uniqueCompanyId(env, base);
  const rec = {
    id, ...fields,
    hasLogo: false, files: [],
    discoveryHandle: '', blueprintId: '',
    createdAt: new Date().toISOString(), createdBy: sess.email,
  };
  const logo = sanitizeLogo(body.logo);
  if (logo) {
    await env.BLUEPRINT_AUTH.put(`cologo:${id}`, JSON.stringify(logo));
    rec.hasLogo = true;
  }
  await putCompany(env, rec);
  await logActivity(env, null, { type: 'created', entity: 'company', id, name: rec.name, actor: sess.email, detail: 'Company added to portal' });
  return json(200, { ok: true, company: rec });
}

async function handleAdminUpdateCompany(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });
  let body;
  try { body = await request.json(); } catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const rec = await getCompany(env, body.id);
  if (!rec) return json(404, { ok: false, error: 'Company not found' });

  const fields = companyFieldsFrom(body);
  if (!fields.name) return json(400, { ok: false, error: 'Company name is required' });
  Object.assign(rec, fields);

  // Logo: pass logo:{type,data} to replace, logo:null leaves as-is,
  // removeLogo:true clears it.
  const logo = sanitizeLogo(body.logo);
  if (logo) {
    await env.BLUEPRINT_AUTH.put(`cologo:${rec.id}`, JSON.stringify(logo));
    rec.hasLogo = true;
  } else if (body.removeLogo === true) {
    await env.BLUEPRINT_AUTH.delete(`cologo:${rec.id}`).catch(() => {});
    rec.hasLogo = false;
  }
  // Optional links to the company's discovery/blueprint, admin-managed.
  if (typeof body.discoveryHandle === 'string') rec.discoveryHandle = body.discoveryHandle.trim().toLowerCase().slice(0, 60);
  if (typeof body.blueprintId === 'string') rec.blueprintId = normalizeBlueprintId(body.blueprintId) === 'unknown' && body.blueprintId.trim() === '' ? '' : body.blueprintId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 60);

  await putCompany(env, rec);
  await logActivity(env, null, { type: 'disc-update', entity: 'company', id: rec.id, name: rec.name, actor: sess.email, detail: 'Company profile updated' });
  return json(200, { ok: true, company: rec });
}

async function handleAdminDeleteCompany(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  if (!(await adminCanDelete(env, sess.email))) return json(403, { ok: false, error: 'Only Admin or Management can delete companies.' });
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });
  let body;
  try { body = await request.json(); } catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const rec = await getCompany(env, body.id);
  if (!rec) return json(404, { ok: false, error: 'Company not found' });
  await env.BLUEPRINT_AUTH.delete(`company:${rec.id}`).catch(() => {});
  await env.BLUEPRINT_AUTH.delete(`cologo:${rec.id}`).catch(() => {});
  for (const f of rec.files || []) {
    await env.BLUEPRINT_AUTH.delete(`cofile:${rec.id}:${f.fid}`).catch(() => {});
  }
  await logActivity(env, null, { type: 'deleted', entity: 'company', id: rec.id, name: rec.name, actor: sess.email, detail: 'Company removed from portal' });
  return json(200, { ok: true });
}

// Upload one file onto a company. kind: rfp | brief | doc — rfp and brief
// are single-slot (a new upload replaces the old one), docs accumulate.
async function handleAdminCompanyFileUpload(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });
  let body;
  try { body = await request.json(); } catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const rec = await getCompany(env, body.id);
  if (!rec) return json(404, { ok: false, error: 'Company not found' });

  const kind = COMPANY_FILE_KINDS.includes(body.kind) ? body.kind : 'doc';
  const name = (body.name || 'document').toString().trim().slice(0, 160) || 'document';
  const ct = (body.type || 'application/octet-stream').toString().slice(0, 120);
  const data = (body.data || '').toString();
  if (!data || data.length > 14_000_000 || !/^[A-Za-z0-9+/=]+$/.test(data)) {
    return json(400, { ok: false, error: 'File must be under 10 MB.' });
  }
  rec.files = Array.isArray(rec.files) ? rec.files : [];
  if (rec.files.length >= COMPANY_MAX_FILES && kind === 'doc') {
    return json(400, { ok: false, error: 'File limit reached for this company.' });
  }

  // Single-slot kinds replace their predecessor.
  if (kind !== 'doc') {
    for (const f of rec.files.filter((f) => f.kind === kind)) {
      await env.BLUEPRINT_AUTH.delete(`cofile:${rec.id}:${f.fid}`).catch(() => {});
    }
    rec.files = rec.files.filter((f) => f.kind !== kind);
  }

  const fid = genToken().slice(0, 16);
  await env.BLUEPRINT_AUTH.put(`cofile:${rec.id}:${fid}`, JSON.stringify({ ct, name, data }));
  rec.files.push({ fid, kind, name, ct, size: Math.round(data.length * 3 / 4), at: new Date().toISOString() });
  await putCompany(env, rec);
  return json(200, { ok: true, company: rec });
}

async function handleAdminCompanyFileDelete(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });
  let body;
  try { body = await request.json(); } catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const rec = await getCompany(env, body.id);
  if (!rec) return json(404, { ok: false, error: 'Company not found' });
  const fid = (body.fid || '').toString();
  await env.BLUEPRINT_AUTH.delete(`cofile:${rec.id}:${fid}`).catch(() => {});
  rec.files = (rec.files || []).filter((f) => f.fid !== fid);
  await putCompany(env, rec);
  return json(200, { ok: true, company: rec });
}

function companyFileResponse(stored) {
  let payload;
  try { payload = JSON.parse(stored); } catch { return new Response('Not found', { status: 404 }); }
  let bytes;
  try { bytes = b64ToBytes(payload.data); } catch { return new Response('Not found', { status: 404 }); }
  const safeName = (payload.name || 'document').replace(/[^\w.\- ]+/g, '_');
  return new Response(bytes, {
    headers: {
      'content-type': payload.ct || 'application/octet-stream',
      'content-disposition': `attachment; filename="${safeName}"`,
      'cache-control': 'private, no-store',
      'x-content-type-options': 'nosniff',
      'content-security-policy': "default-src 'none'",
    },
  });
}

async function handleAdminCompanyFileGet(request, env) {
  const sess = await getAdminSession(request, env);
  if (!sess) return new Response('Not signed in', { status: 401 });
  const url = new URL(request.url);
  const rec = await getCompany(env, url.searchParams.get('id'));
  const fid = (url.searchParams.get('fid') || '').toString();
  if (!rec || !(rec.files || []).some((f) => f.fid === fid)) return new Response('Not found', { status: 404 });
  const stored = await env.BLUEPRINT_AUTH.get(`cofile:${rec.id}:${fid}`);
  if (!stored) return new Response('Not found', { status: 404 });
  return companyFileResponse(stored);
}

// Public logo by company id, CSP-locked like the discovery logo.
async function handleCompanyLogo(request, env) {
  const url = new URL(request.url);
  const rec = await getCompany(env, url.searchParams.get('id'));
  if (!rec || !rec.hasLogo) return new Response('Not found', { status: 404 });
  const raw = await env.BLUEPRINT_AUTH.get(`cologo:${rec.id}`);
  if (!raw) return new Response('Not found', { status: 404 });
  let logo;
  try { logo = JSON.parse(raw); } catch { return new Response('Not found', { status: 404 }); }
  let bytes;
  try { bytes = b64ToBytes(logo.data); } catch { return new Response('Not found', { status: 404 }); }
  return new Response(bytes, {
    headers: {
      'content-type': logo.ct,
      'cache-control': 'public, max-age=3600',
      'x-content-type-options': 'nosniff',
      'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'",
    },
  });
}

// ── Customer portal auth: passwordless, portal-wide ──────────────────────
// Any contact on any portal company signs in at go.uncap.com with just
// their email: we find their company, send a 6-digit code, and mint a
// cookie session bound to that company. View + signature only.

function companyEmails(rec) {
  const out = [];
  if (rec.leadContact && rec.leadContact.email) out.push(rec.leadContact.email);
  for (const c of rec.contacts || []) if (c.email) out.push(c.email);
  return out;
}

async function findCompanyByEmail(env, email) {
  const companies = await listCompanies(env);
  return companies.find((c) => companyEmails(c).includes(email)) || null;
}

function portalContactName(rec, email) {
  if (rec.leadContact && rec.leadContact.email === email) return rec.leadContact.name || '';
  const c = (rec.contacts || []).find((x) => x.email === email);
  return (c && c.name) || '';
}

async function handlePortalRequestCode(request, env) {
  let body;
  try { body = await request.json(); } catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const emailRaw = (body.email || '').toString().trim();
  if (!emailRaw || !EMAIL_RE.test(emailRaw)) return json(400, { ok: false, error: 'Enter a valid email' });
  const email = emailRaw.toLowerCase();

  {
    const ip = clientIp(request);
    const okEmail = await rateLimit(env, `pocode:rl:${encodeURIComponent(email)}`, 3, 15 * 60);
    const okIp = ip ? await rateLimit(env, `pocode:ip:${ip}`, 10, 15 * 60) : true;
    if (!okEmail || !okIp) return json(429, { ok: false, error: 'Too many code requests. Wait a few minutes and try again.' });
  }

  const company = await findCompanyByEmail(env, email);
  if (!company) {
    // Same response as success: never confirm which emails have access.
    return json(200, { ok: true });
  }
  const code = genCode();
  await env.BLUEPRINT_AUTH.put(`pocode:${encodeURIComponent(email)}`, code, { expirationTtl: CODE_TTL_SECONDS });
  await env.BLUEPRINT_AUTH.delete(`potries:${encodeURIComponent(email)}`).catch(() => {});
  try {
    await sendCodeEmail(env, { to: email, code, label: 'Hub' });
  } catch (err) {
    console.error('portal sendCodeEmail failed:', err && err.message);
    return json(502, { ok: false, error: 'Could not send the code right now. Try again shortly.' });
  }
  return json(200, { ok: true });
}

async function handlePortalVerify(request, env) {
  let body;
  try { body = await request.json(); } catch { return json(400, { ok: false, error: 'Invalid JSON' }); }
  const email = (body.email || '').toString().trim().toLowerCase();
  const code = (body.code || '').toString().trim();
  if (!email || !code) return json(400, { ok: false, error: 'Enter your code' });

  const ip = clientIp(request);
  if (ip && !(await rateLimit(env, `poverify:${ip}`, 20, 10 * 60))) {
    return json(429, { ok: false, error: 'Too many attempts. Wait a few minutes and try again.' });
  }
  const key = `pocode:${encodeURIComponent(email)}`;
  const triesKey = `potries:${encodeURIComponent(email)}`;
  const stored = await env.BLUEPRINT_AUTH.get(key);
  if (!stored || stored !== code) {
    const tries = (parseInt(await env.BLUEPRINT_AUTH.get(triesKey), 10) || 0) + 1;
    if (stored && tries >= MAX_CODE_ATTEMPTS) {
      await env.BLUEPRINT_AUTH.delete(key).catch(() => {});
      await env.BLUEPRINT_AUTH.delete(triesKey).catch(() => {});
    } else {
      await env.BLUEPRINT_AUTH.put(triesKey, String(tries), { expirationTtl: CODE_TTL_SECONDS }).catch(() => {});
    }
    return json(401, { ok: false, error: 'Invalid or expired code. Request a new one if needed.' });
  }
  const company = await findCompanyByEmail(env, email);
  if (!company) return json(403, { ok: false, error: 'No portal access for this email.' });
  await env.BLUEPRINT_AUTH.delete(key);
  await env.BLUEPRINT_AUTH.delete(triesKey).catch(() => {});

  const token = genToken();
  const name = portalContactName(company, email);
  await env.BLUEPRINT_AUTH.put(
    `portal_session:${token}`,
    JSON.stringify({ email, name, companyId: company.id, ts: Date.now() }),
    { expirationTtl: PORTAL_SESSION_TTL_SECONDS }
  );
  await logActivity(env, null, { type: 'view', entity: 'company', id: company.id, name: company.name, actor: email, detail: 'Portal sign-in' });
  return withSecurityHeaders(new Response(JSON.stringify({ ok: true, name }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'set-cookie': `${PORTAL_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${PORTAL_SESSION_TTL_SECONDS}`,
    },
  }));
}

async function getPortalSession(request, env) {
  const token = getCookie(request, PORTAL_COOKIE);
  if (!/^[a-f0-9]{48}$/.test(token)) return null;
  const raw = await env.BLUEPRINT_AUTH.get(`portal_session:${token}`);
  if (!raw) return null;
  try { return { token, ...JSON.parse(raw) }; } catch { return null; }
}

// Everything the signed-in customer's portal needs in one call: their
// company profile, contacts, files (meta only), and where discovery and
// blueprint stand. View-only by design.
async function handlePortalMe(request, env) {
  const sess = await getPortalSession(request, env);
  if (!sess) return json(401, { ok: false, error: 'Not signed in' });
  const rec = await getCompany(env, sess.companyId);
  if (!rec) return json(401, { ok: false, error: 'No portal access' });

  let discovery = null;
  if (rec.discoveryHandle) {
    const disc = await getDiscoveryByHandle(env, rec.discoveryHandle);
    if (disc) discovery = { handle: disc.handle, status: disc.status || 'new', url: `/${rec.id}/discovery` };
  }
  let blueprint = null;
  if (rec.blueprintId && await blueprintIsViewable(env, rec.blueprintId)) {
    blueprint = { id: rec.blueprintId, url: `/${rec.id}/blueprint` };
  }
  return json(200, {
    ok: true,
    email: sess.email,
    name: sess.name || '',
    company: {
      id: rec.id, name: rec.name, storeUrl: rec.storeUrl, address: rec.address,
      description: rec.description, platform: rec.platform, erp: rec.erp,
      palette: rec.palette || null, hasLogo: !!rec.hasLogo,
      leadContact: rec.leadContact || null, contacts: rec.contacts || [],
      files: (rec.files || []).map((f) => ({ fid: f.fid, kind: f.kind, name: f.name, size: f.size, at: f.at })),
    },
    discovery,
    blueprint,
  });
}

async function handlePortalFile(request, env) {
  const sess = await getPortalSession(request, env);
  if (!sess) return new Response('Not signed in', { status: 401 });
  const rec = await getCompany(env, sess.companyId);
  if (!rec) return new Response('Not found', { status: 404 });
  const url = new URL(request.url);
  const fid = (url.searchParams.get('fid') || '').toString();
  if (!(rec.files || []).some((f) => f.fid === fid)) return new Response('Not found', { status: 404 });
  const stored = await env.BLUEPRINT_AUTH.get(`cofile:${rec.id}:${fid}`);
  if (!stored) return new Response('Not found', { status: 404 });
  return companyFileResponse(stored);
}

async function handlePortalLogout(request, env) {
  if (!sameOrigin(request)) return json(403, { ok: false, error: 'Bad origin' });
  const token = getCookie(request, PORTAL_COOKIE);
  if (/^[a-f0-9]{48}$/.test(token)) {
    await env.BLUEPRINT_AUTH.delete(`portal_session:${token}`).catch(() => {});
  }
  return withSecurityHeaders(new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'set-cookie': `${PORTAL_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
    },
  }));
}

// Top-level path segments that can never be company folders.
const PORTAL_RESERVED = new Set([
  'admin', 'api', 'discovery', 'blueprint', 'blueprints', 'discoveries',
  'build', 'portal', 'assets', 'vendor', 'legal', 'demo', 'companies',
  'company', 'delivery', 'growth', 'favicon-32', 'index',
]);

async function findCompanyByBlueprintId(env, bpId) {
  const companies = await listCompanies(env);
  return companies.find((c) => c.blueprintId === bpId) || null;
}

// A blueprint is actually viewable when it's a shipped bespoke page (in the
// registry) OR a draft whose templated content has been generated and marked
// ready by an admin. An un-generated draft is NOT viewable — the portal must
// keep showing "Under Review" instead of linking to a blank fallback.
async function blueprintDraft(env, id) {
  const raw = await env.BLUEPRINT_AUTH.get(`bp:${normalizeBlueprintId(id)}`);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
async function blueprintIsViewable(env, id) {
  const clean = normalizeBlueprintId(id);
  if (BLUEPRINT_REGISTRY.some((b) => b.id === clean)) return true;
  const draft = await blueprintDraft(env, clean);
  return !!(draft && draft.content && draft.content.status === 'ready');
}

async function findCompanyByDiscoveryHandle(env, handle) {
  const clean = (handle || '').toString().trim().toLowerCase();
  if (!clean || clean === DEMO_DISCOVERY_HANDLE) return null;
  const companies = await listCompanies(env);
  return companies.find((c) => c.discoveryHandle === clean) || null;
}

// ── One-time migration: give every existing blueprint and discovery a
// portal company, so old clients get the new /<company>/ experience.
// Flag-guarded and idempotent; runs from the admin companies list.
async function migrateCompaniesV1(env) {
  if (await env.BLUEPRINT_AUTH.get('comigrate:v1')) return;
  await env.BLUEPRINT_AUTH.put('comigrate:v1', new Date().toISOString());

  const upsert = async (slug, patch) => {
    const id = slug.replace(/[^a-z0-9-]/g, '') || 'client';
    let rec = await getCompany(env, id);
    if (!rec) {
      rec = {
        id, name: patch.name || id, storeUrl: '', address: '', description: '',
        platform: '', erp: '', attioCompanyId: '', leadContact: null, contacts: [],
        palette: null, hasLogo: false, files: [], discoveryHandle: '', blueprintId: '',
        createdAt: new Date().toISOString(), createdBy: 'migration',
      };
    }
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === null || v === '') continue;
      if (k === 'contacts') {
        const have = new Set((rec.contacts || []).map((c) => c.email).concat(rec.leadContact ? [rec.leadContact.email] : []));
        rec.contacts = [...(rec.contacts || []), ...v.filter((c) => c && c.email && !have.has(c.email))];
      } else if (k === 'leadContact') {
        if (!rec.leadContact) {
          rec.leadContact = v;
          rec.contacts = (rec.contacts || []).filter((c) => c.email !== v.email);
        }
      } else if (!rec[k]) {
        rec[k] = v;
      }
    }
    await putCompany(env, rec);
    return rec;
  };

  // 1. Every shipped blueprint plus every KV draft becomes a company; its
  //    contacts come from the blueprint record or the email allowlist.
  const drafts = await env.BLUEPRINT_AUTH.list({ prefix: 'bp:', limit: 500 });
  const bpEntries = BLUEPRINT_REGISTRY.map((b) => ({ id: b.id, name: b.name || b.id, website: '', leadContact: null, contacts: [] }));
  for (const k of drafts.keys) {
    try {
      const r = JSON.parse(await env.BLUEPRINT_AUTH.get(k.name));
      if (r && r.id) bpEntries.push({ id: r.id, name: r.name || r.id, website: r.website || '', leadContact: r.leadContact || null, contacts: r.associatedContacts || [] });
    } catch (_) { /* skip unreadable draft */ }
  }
  for (const bp of bpEntries) {
    let lead = bp.leadContact;
    let contacts = bp.contacts || [];
    if (!lead && !contacts.length) {
      try {
        const allow = JSON.parse((await env.BLUEPRINT_AUTH.get(`bpallow:${bp.id}`)) || '[]');
        const people = allow.filter((e) => typeof e === 'string' && EMAIL_RE.test(e)).map((email) => ({ name: '', email: email.toLowerCase(), title: '' }));
        lead = people[0] || null;
        contacts = people.slice(1);
      } catch (_) { /* no allowlist */ }
    }
    const slug = bp.website ? discoveryHandleFromWebsite(bp.website, bp.name) : bp.id;
    await upsert(slug, { name: bp.name, storeUrl: bp.website, blueprintId: bp.id, leadContact: lead, contacts });
  }

  // 2. Every discovery joins (or creates) the company matching its domain,
  //    bringing contacts, palette, and logo along.
  const discList = await env.BLUEPRINT_AUTH.list({ prefix: 'discovery:', limit: 500 });
  for (const k of discList.keys) {
    let rec;
    try { rec = JSON.parse(await env.BLUEPRINT_AUTH.get(k.name)); } catch { continue; }
    if (!rec || !rec.handle || rec.handle === DEMO_DISCOVERY_HANDLE) continue;
    if (rec.companyId && (await getCompany(env, rec.companyId))) continue;
    const slug = discoveryHandleFromWebsite(rec.website, rec.company);
    const lead = rec.leadContact || null;
    const co = await upsert(slug, {
      name: rec.company, storeUrl: rec.website, address: rec.address,
      discoveryHandle: rec.handle, palette: rec.palette || null,
      leadContact: lead, contacts: rec.associatedContacts || [],
    });
    if (rec.hasLogo && !co.hasLogo) {
      try {
        const id = k.name.slice('discovery:'.length);
        const logo = await env.BLUEPRINT_AUTH.get(`disclogo:${id}`);
        if (logo) { await env.BLUEPRINT_AUTH.put(`cologo:${co.id}`, logo); co.hasLogo = true; await putCompany(env, co); }
      } catch (_) { /* logo copy is best-effort */ }
    }
  }
}
