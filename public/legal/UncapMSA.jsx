// ── Uncap Master Services Agreement (inline React component) ─────────────
// Rendered inside the BPApproveButton signature modal on every Blueprint.
// Props: { company, name, title }. The signer's name + title update the
// signature block live as they type. Effective Date auto-fills today.
//
// Future blueprints get this for free as long as their index.html loads
//   <script type="text/babel" src="/legal/UncapMSA.jsx?v=DEPLOY_HASH"></script>
// BEFORE components/blueprint/BlueprintSections.jsx, and the modal renders
//   <UncapMSA company={BRAND_NAME} name={name} title={title} />
// ─────────────────────────────────────────────────────────────────────────

(function () {
  const COUNSEL = {
    name:  'Genc Arifi',
    email: 'info@gencarifi.com',
    phone: '(630) 636-1955'
  };

  const todayString = () =>
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // ── Once-only stylesheet for the MSA body. Scoped under .uncap-msa so it
  //    can't bleed into the rest of the modal. ────────────────────────────
  const STYLE_ID = 'uncap-msa-styles';
  function ensureStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
      .uncap-msa { font-family: var(--font-sans); color: var(--fg-1); font-size: 13.5px; line-height: 1.65; }
      .uncap-msa .msa-eyebrow { font-family: var(--font-mono); font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--fg-3); margin-bottom: 6px; }
      .uncap-msa h2 { font-family: var(--font-hero); font-weight: 800; font-size: clamp(20px, 2.6vw, 24px); line-height: 1.05; letter-spacing: -0.02em; margin: 0 0 6px; color: var(--fg-1); }
      .uncap-msa .msa-dt { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; color: var(--fg-3); margin-bottom: 18px; }
      .uncap-msa .msa-intro p { margin: 0 0 12px; }
      .uncap-msa .msa-recital { color: var(--fg-2); }
      .uncap-msa .msa-clause { display: grid; grid-template-columns: 42px 1fr; column-gap: 10px; margin-bottom: 12px; }
      .uncap-msa .msa-clause.h { margin-top: 18px; }
      .uncap-msa .msa-num { font-family: var(--font-mono); font-size: 12px; font-weight: 500; color: var(--uc-signal-ink, #b3a800); padding-top: 1px; }
      .uncap-msa .msa-body { margin: 0; }
      .uncap-msa .msa-ctitle { font-weight: 700; color: var(--fg-1); }
      .uncap-msa .msa-ctitle.u { text-decoration: underline; text-underline-offset: 3px; }
      .uncap-msa .msa-sub { display: grid; grid-template-columns: 42px 1fr; column-gap: 10px; margin: 8px 0 0 28px; }
      .uncap-msa .msa-sub .msa-num,
      .uncap-msa .msa-sub .msa-alpha { font-family: var(--font-mono); color: var(--fg-3); font-size: 11.5px; padding-top: 1px; }
      .uncap-msa .msa-caps { font-size: 12.5px; letter-spacing: 0.005em; }
      .uncap-msa .msa-notice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin: 12px 0 0 52px; }
      .uncap-msa .msa-nb .msa-lbl { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-3); margin-bottom: 4px; }
      .uncap-msa .msa-nb .msa-ln { line-height: 1.6; font-size: 12.5px; color: var(--fg-2); }
      .uncap-msa .msa-foot { margin-top: 26px; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--fg-3); }
      .uncap-msa .msa-sig { margin-top: 24px; padding-top: 22px; border-top: 1px solid var(--line-1); }
      .uncap-msa .msa-sig-intro { font-family: var(--font-serif); font-style: italic; color: var(--fg-2); font-size: 13px; margin: 0 0 18px; }
      .uncap-msa .msa-sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
      .uncap-msa .msa-sigbox .msa-co { font-weight: 700; color: var(--fg-1); margin-bottom: 32px; font-size: 14px; }
      .uncap-msa .msa-sigbox .msa-sign-on { font-family: var(--font-mono); font-size: 10.5px; color: var(--fg-3); margin-bottom: 6px; }
      .uncap-msa .msa-sigbox .msa-rule { border-top: 1.5px solid var(--fg-1); padding-top: 6px; }
      .uncap-msa .msa-sigbox .msa-fld { font-size: 12.5px; color: var(--fg-1); margin-bottom: 2px; min-height: 1.4em; }
      .uncap-msa .msa-sigbox .msa-fld .msa-k { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg-3); margin-right: 8px; }
      @media (max-width: 600px) {
        .uncap-msa .msa-notice-grid,
        .uncap-msa .msa-sig-grid { grid-template-columns: 1fr; }
        .uncap-msa .msa-clause,
        .uncap-msa .msa-sub { grid-template-columns: 30px 1fr; column-gap: 8px; }
      }
    `;
    document.head.appendChild(s);
  }

  // ── The MSA body (clauses 1-25). Pure legal text, never changes per
  //    blueprint. Kept as one HTML string + dangerouslySetInnerHTML so
  //    diffing this file stays tractable. ───────────────────────────────
  const MSA_BODY_HTML = (effective) => `
    <div class="msa-intro">
      <p>This Services Agreement (this "<strong>Agreement</strong>"), dated as of ${effective} (the "<strong>Effective Date</strong>"), is by and between Uncap, Inc., a Delaware corporation, with offices located at 8770 West Bryn Mawr Ave, Suite 1300, Chicago, Illinois 60631 ("<strong>Service Provider</strong>"), and the customer identified on the signature page and in the accompanying Statement of Work (the "<strong>Customer</strong>", and together with Service Provider, the "<strong>Parties</strong>", and each a "<strong>Party</strong>").</p>
      <p class="msa-recital">WHEREAS, Service Provider has the capability and capacity to provide certain services; and</p>
      <p class="msa-recital">WHEREAS, Customer desires to retain Service Provider to provide the said services, and Service Provider is willing to perform such services under the terms and conditions hereinafter set forth;</p>
      <p class="msa-recital">NOW, THEREFORE, in consideration of the mutual covenants and agreements hereinafter set forth and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, Service Provider and Customer agree as follows:</p>
    </div>

    <div class="msa-clause"><span class="msa-num">1.</span><p class="msa-body"><span class="msa-ctitle u">Services.</span> Service Provider shall provide to Customer the services (the "Services") set out in one or more statements of work to be issued by Customer and accepted by Service Provider (each, a "Statement of Work"). The initial accepted Statement of Work is attached hereto as Exhibit A. Additional Statements of Work shall be deemed issued and accepted only if signed by the Service Provider Contract Manager and the Customer Contract Manager, appointed pursuant to Section 2.1(a) and Section 3.1, respectively.</p></div>

    <div class="msa-clause h"><span class="msa-num">2.</span><p class="msa-body"><span class="msa-ctitle u">Service Provider Obligations.</span> Service Provider shall:</p></div>
    <div class="msa-sub"><span class="msa-num">2.1</span><p class="msa-body">Designate employees or contractors that it determines, in its sole discretion, to be capable of filling the following positions:</p></div>
    <div class="msa-sub"><span class="msa-alpha">(a)</span><p class="msa-body">A primary contact to act as its authorized representative with respect to all matters pertaining to this Agreement (the "Service Provider Contract Manager").</p></div>
    <div class="msa-sub"><span class="msa-alpha">(b)</span><p class="msa-body">A number of employees or contractors that it deems sufficient to perform the Services set out in each Statement of Work (collectively, with the Service Provider Contract Manager, "Provider Representatives").</p></div>

    <div class="msa-clause h"><span class="msa-num">3.</span><p class="msa-body"><span class="msa-ctitle u">Customer Obligations.</span> Customer shall:</p></div>
    <div class="msa-sub"><span class="msa-num">3.1</span><p class="msa-body">Designate one of its employees or agents to serve as its primary contact with respect to this Agreement and to act as its authorized representative with respect to matters pertaining to this Agreement (the "Customer Contract Manager"), with such designation to remain in force unless and until a successor Customer Contract Manager is appointed.</p></div>
    <div class="msa-sub"><span class="msa-num">3.2</span><p class="msa-body">Require that the Customer Contract Manager respond promptly to any reasonable requests from Service Provider for instructions, information, or approvals required by Service Provider to provide the Services.</p></div>
    <div class="msa-sub"><span class="msa-num">3.3</span><p class="msa-body">Cooperate with Service Provider in its performance of the Services as required to enable Service Provider to provide the Services.</p></div>
    <div class="msa-sub"><span class="msa-num">3.4</span><p class="msa-body">Take all steps necessary, including obtaining any required licenses or consents, to prevent Customer caused delays in Service Provider's provision of the Services.</p></div>

    <div class="msa-clause h"><span class="msa-num">4.</span><p class="msa-body"><span class="msa-ctitle u">Fees and Expenses.</span></p></div>
    <div class="msa-sub"><span class="msa-num">4.1</span><p class="msa-body">In consideration of the provision of the Services by the Service Provider and the rights granted to Customer under this Agreement, Customer shall pay the fees set out in the applicable Statement of Work. Payment to Service Provider of such fees and the reimbursement of expenses pursuant to this Section 4 shall constitute payment in full for the performance of the Services. Unless otherwise provided in the applicable Statement of Work, said fee will be payable upon receipt by the Customer of an invoice from Service Provider but in no event more than ten (10) days after completion of the Services performed pursuant to the applicable Statement of Work.</p></div>
    <div class="msa-sub"><span class="msa-num">4.2</span><p class="msa-body">Customer shall reimburse Service Provider for all reasonable expenses incurred in accordance with the Statement of Work upon receipt by the Customer of an invoice from Service Provider accompanied by receipts and reasonable supporting documentation.</p></div>
    <div class="msa-sub"><span class="msa-num">4.3</span><p class="msa-body">Customer shall be responsible for all sales, use, and excise taxes, and any other similar taxes, duties, and charges of any kind imposed by any federal, state, or local governmental entity on any amounts payable by Customer hereunder; provided, that in no event shall Customer pay or be responsible for any taxes imposed on, or with respect to, Service Provider's income, revenues, gross receipts, personnel, or real or personal property, or other assets.</p></div>
    <div class="msa-sub"><span class="msa-num">4.4</span><p class="msa-body">Except for invoiced payments that the Customer has successfully disputed, all late payments shall bear interest at the lesser of (a) the rate of 1.5% per month and (b) the highest rate permissible under applicable law, calculated daily and compounded monthly. Customer shall also reimburse Service Provider for all costs incurred in collecting any late payments, including, without limitation, attorneys' fees and costs. In addition to all other remedies available under this Agreement or at law (which Service Provider does not waive by the exercise of any rights hereunder), Service Provider shall be entitled to suspend the provision of any Services if the Customer fails to pay any invoices when due hereunder and such failure continues for ten (10) days following written notice thereof.</p></div>
    <div class="msa-sub"><span class="msa-num">4.5</span><p class="msa-body">All rights and ownership to all documents, work product, and other materials that are delivered to Customer under this Agreement or prepared by or on behalf of the Service Provider in the course of performing the Services (collectively, the "Deliverables") shall be transferred to Customer only after Customer has paid off all payments, fees, and expenses under this Agreement.</p></div>

    <div class="msa-clause h"><span class="msa-num">5.</span><p class="msa-body"><span class="msa-ctitle u">Limited Warranty and Limitation of Liability.</span></p></div>
    <div class="msa-sub"><span class="msa-num">5.1</span><p class="msa-body">Service Provider warrants that it shall perform the Services:</p></div>
    <div class="msa-sub"><span class="msa-alpha">(a)</span><p class="msa-body">In accordance with the terms and subject to the conditions set out in the respective Statement of Work and this Agreement.</p></div>
    <div class="msa-sub"><span class="msa-alpha">(b)</span><p class="msa-body">Using personnel of commercially reasonable skill, experience, and qualifications.</p></div>
    <div class="msa-sub"><span class="msa-alpha">(c)</span><p class="msa-body">In a timely, workmanlike, and professional manner in accordance with generally recognized industry standards for similar services.</p></div>
    <div class="msa-sub"><span class="msa-num">5.2</span><p class="msa-body">Service Provider's sole and exclusive liability and Customer's sole and exclusive remedy for breach of this warranty shall be as follows:</p></div>
    <div class="msa-sub"><span class="msa-alpha">(a)</span><p class="msa-body">Service Provider shall use reasonable commercial efforts to promptly cure any such breach; provided, that if Service Provider cannot cure such breach within a reasonable time, but no more than thirty (30) days after Customer's written notice of such breach, Customer may, at its option, terminate the Agreement by serving written notice of termination in accordance with Section 8.2.</p></div>
    <div class="msa-sub"><span class="msa-alpha">(b)</span><p class="msa-body">In the event the Agreement is terminated pursuant to Section 5.2 above, Service Provider shall within thirty (30) days after the effective date of termination, refund to Customer any fees paid by the Customer as of the date of termination for the Services or Deliverables (as defined in Section 6 below), less a deduction equal to the fees for receipt or use of such Deliverables or Services up to and including the date of termination on a pro rated basis.</p></div>
    <div class="msa-sub"><span class="msa-alpha">(c)</span><p class="msa-body">The foregoing remedy shall not be available unless Customer provides written notice of such breach within ten (10) days after delivery of such Services or Deliverables to Customer.</p></div>
    <div class="msa-sub"><span class="msa-num">5.3</span><p class="msa-body msa-caps">SERVICE PROVIDER MAKES NO WARRANTIES EXCEPT FOR THAT PROVIDED IN SECTION 5.1, ABOVE. ALL OTHER WARRANTIES, EXPRESS AND IMPLIED, ARE EXPRESSLY DISCLAIMED.</p></div>

    <div class="msa-clause h"><span class="msa-num">6.</span><p class="msa-body"><span class="msa-ctitle u">Intellectual Property.</span> All intellectual property rights, including copyrights, patents, patent disclosures, and inventions (whether patentable or not), trademarks, service marks, trade secrets, know how, and other confidential information, trade dress, trade names, logos, corporate names, and domain names, together with all of the goodwill associated therewith, derivative works, and all other rights (collectively, "Intellectual Property Rights") (except for any Confidential Information of Customer or customer materials) shall be owned by Customer. Customer hereby grants Service Provider a license to use all Intellectual Property Rights in the Deliverables free of additional charge and on a non exclusive, non transferable, non sublicensable, fully paid up, royalty free, and perpetual basis to the extent necessary to enable Service Provider to make reasonable use of the Deliverables and the Services for the sole purpose of reproducing, publishing, and displaying the Deliverables in Service Provider's portfolios and websites, in galleries, design periodicals, and other media or exhibits for the purposes of recognition of creative excellence or professional advancement, and to be credited with authorship of the Deliverables in connection with such uses.</p></div>

    <div class="msa-clause h"><span class="msa-num">7.</span><p class="msa-body"><span class="msa-ctitle u">Confidentiality.</span> From time to time during the Term of this Agreement, either Party (as the "Disclosing Party") may disclose or make available to the other Party (as the "Receiving Party"), non public, proprietary, and confidential information of Disclosing Party that, if disclosed in writing or other tangible form is clearly labeled as "confidential," or if disclosed orally, is identified as confidential when disclosed and within ten (10) days thereafter, is summarized in writing and confirmed as confidential ("Confidential Information"); provided, however, that Confidential Information does not include any information that: (a) is or becomes generally available to the public other than as a result of Receiving Party's breach of this Section 7; (b) is or becomes available to the Receiving Party on a non confidential basis from a third party source, provided that such third party is not and was not prohibited from disclosing such Confidential Information; (c) was in Receiving Party's possession prior to Disclosing Party's disclosure hereunder; or (d) was or is independently developed by Receiving Party without using any Confidential Information. The Receiving Party shall: (x) protect and safeguard the confidentiality of the Disclosing Party's Confidential Information with at least the same degree of care as the Receiving Party would use to protect its own Confidential Information, but in no event with less than a commercially reasonable degree of care; (y) not use the Disclosing Party's Confidential Information, or permit it to be accessed or used, for any purpose other than to exercise its rights or perform its obligations under this Agreement; and (z) not disclose any such Confidential Information to any person or entity, except to the Receiving Party's Group who need to know the Confidential Information to assist the Receiving Party, or act on its behalf, to exercise its rights or perform its obligations under this Agreement.</p></div>
    <div class="msa-clause"><span class="msa-num"></span><p class="msa-body">If the Receiving Party is required by applicable law or legal process to disclose any Confidential Information, it shall, prior to making such disclosure, use commercially reasonable efforts to notify Disclosing Party of such requirements to afford Disclosing Party the opportunity to seek, at Disclosing Party's sole cost and expense, a protective order or other remedy. For purposes of this Section 7 and Section 8.4 only, Receiving Party's Group shall mean the Receiving Party's affiliates and its or their employees, officers, directors, shareholders, partners, members, managers, agents, independent contractors, service providers, sublicensees, subcontractors, attorneys, accountants, and financial advisors.</p></div>

    <div class="msa-clause h"><span class="msa-num">8.</span><p class="msa-body"><span class="msa-ctitle u">Term, Termination, and Survival.</span></p></div>
    <div class="msa-sub"><span class="msa-num">8.1</span><p class="msa-body">This Agreement shall commence as of the Effective Date and shall continue thereafter until the completion of the Services under all Statements of Work, unless sooner terminated pursuant to Section 8.2 or Section 8.3.</p></div>
    <div class="msa-sub"><span class="msa-num">8.2</span><p class="msa-body">Either Party may terminate this Agreement, effective upon written notice to the other Party (the "Defaulting Party"), if the Defaulting Party:</p></div>
    <div class="msa-sub"><span class="msa-alpha">(a)</span><p class="msa-body">Materially breaches this Agreement, and such breach is incapable of cure, or with respect to a breach capable of cure, the Defaulting Party does not cure such breach within ten (10) days after receipt of written notice of such breach.</p></div>
    <div class="msa-sub"><span class="msa-alpha">(b)</span><p class="msa-body">Becomes insolvent or admits its inability to pay its debts generally as they become due.</p></div>
    <div class="msa-sub"><span class="msa-alpha">(c)</span><p class="msa-body">Becomes subject, voluntarily or involuntarily, to any proceeding under any domestic or foreign bankruptcy or insolvency law, which is not fully stayed within seven (7) business days or is not dismissed or vacated within forty five (45) business days after filing.</p></div>
    <div class="msa-sub"><span class="msa-alpha">(d)</span><p class="msa-body">Is dissolved or liquidated or takes any corporate action for such purpose.</p></div>
    <div class="msa-sub"><span class="msa-alpha">(e)</span><p class="msa-body">Makes a general assignment for the benefit of creditors.</p></div>
    <div class="msa-sub"><span class="msa-alpha">(f)</span><p class="msa-body">Has a receiver, trustee, custodian, or similar agent appointed by order of any court of competent jurisdiction to take charge of or sell any material portion of its property or business.</p></div>
    <div class="msa-sub"><span class="msa-num">8.3</span><p class="msa-body">Notwithstanding anything to the contrary in Section 8.2(a), Service Provider may terminate this Agreement before the expiration date of the Term on written notice if Customer fails to pay any amount when due hereunder and such failure continues for three (3) days after Customer's receipt of written notice of nonpayment.</p></div>
    <div class="msa-sub"><span class="msa-num">8.4</span><p class="msa-body">Notwithstanding anything to the contrary in Sections 8.2(a) and 8.3, either party may terminate this Agreement at any time and for any reason on thirty (30) days prior written notice to the other Party. If Customer terminates this Agreement under this Section 8.4, Customer shall within three (3) days pay Service Provider for all service performed through the date of termination. Service Provider shall have no obligation to continue performing any service pursuant to this Agreement or any Statement of Work upon receipt of notice from Customer pursuant to this Section 8.4.</p></div>
    <div class="msa-sub"><span class="msa-num">8.5</span><p class="msa-body">Service Provider shall, at Customer's reasonable discretion, complete any work assigned or scheduled during the notice period in accordance with the terms and conditions of this Agreement.</p></div>
    <div class="msa-sub"><span class="msa-num">8.6</span><p class="msa-body">If Service Provider determines that Customer's personnel or contractors are not completing Customer's responsibilities as described in the applicable Statement of Work timely or accurately, Service Provider shall promptly notify the Customer Contract Manager for such Statement of Work, but in no event more than thirty (30) calendar days from the date of such determination. Service Provider shall bear no liability or otherwise be responsible for delays in the provision of the Services or Deliverables occasioned by Customer's failure to complete Customer's responsibilities or adhere to a Customer schedule which were brought to the attention of the Customer Contract Manager on a timely basis. In the event of any delay in Customer's performance of any of the obligations set forth in this Agreement or any Statement of Work or any other delays caused by Customer, Service Provider reserves the right to adjust, as reasonably necessary to accommodate such delays, the milestones, fees, and date(s) set forth in this Agreement or any Statement of Work or elect to terminate this Agreement pursuant to Section 8.</p></div>

    <div class="msa-clause h"><span class="msa-num">9.</span><p class="msa-body"><span class="msa-ctitle u">Limitation of Liability.</span></p></div>
    <div class="msa-sub"><span class="msa-num">9.1</span><p class="msa-body msa-caps">IN NO EVENT SHALL SERVICE PROVIDER BE LIABLE TO CUSTOMER OR TO ANY THIRD PARTY FOR ANY LOSS OF USE, REVENUE, OR PROFIT OR LOSS OF DATA OR DIMINUTION IN VALUE, OR FOR ANY CONSEQUENTIAL, INCIDENTAL, INDIRECT, EXEMPLARY, SPECIAL, OR PUNITIVE DAMAGES WHETHER ARISING OUT OF BREACH OF CONTRACT, TORT (INCLUDING NEGLIGENCE), OR OTHERWISE, REGARDLESS OF WHETHER SUCH DAMAGE WAS FORESEEABLE AND WHETHER OR NOT SERVICE PROVIDER HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES, AND NOTWITHSTANDING THE FAILURE OF ANY AGREED OR OTHER REMEDY OF ITS ESSENTIAL PURPOSE.</p></div>
    <div class="msa-sub"><span class="msa-num">9.2</span><p class="msa-body msa-caps">IN NO EVENT SHALL SERVICE PROVIDER'S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT, WHETHER ARISING OUT OF OR RELATED TO BREACH OF CONTRACT, TORT (INCLUDING NEGLIGENCE), OR OTHERWISE, EXCEED TWO (2) TIMES THE AGGREGATE AMOUNTS PAID OR PAYABLE TO SERVICE PROVIDER PURSUANT TO THE APPLICABLE STATEMENT OF WORK PERIOD PRECEDING THE EVENT GIVING RISE TO THE CLAIM.</p></div>

    <div class="msa-clause h"><span class="msa-num">10.</span><p class="msa-body"><span class="msa-ctitle u">Indemnity.</span> Customer hereby agrees to defend, indemnify, and hold Service Provider and its members, managers, officers, employees, and agents harmless from and against any and all claims, demands, losses, damages, costs, liabilities, claims, or other charges, absolute or contingent, matured or unmatured, known or unknown, and any and all expenses incurred (including, but not limited to, attorney's fees and court costs) by such party in connection with or arising out of (i) Customer's breach of this Agreement or alleged breach of any Statement of Work and (ii) any action, suit, or proceeding by a third party relating to the subject matter of this Agreement.</p></div>

    <div class="msa-clause h"><span class="msa-num">11.</span><p class="msa-body"><span class="msa-ctitle u">Attorney's Fees and Costs.</span> Service Provider shall be entitled to recover from Customer all costs and expenses, including without limitation, reasonable attorneys' fees and paralegals' fees, incurred by Service Provider in connection with Service Provider's enforcing any of its rights and remedies under this Agreement and any Statement of Work.</p></div>

    <div class="msa-clause h"><span class="msa-num">12.</span><p class="msa-body"><span class="msa-ctitle u">Entire Agreement.</span> This Agreement, including and together with any related Statements of Work, exhibits, schedules, attachments, and appendices, constitutes the sole and entire agreement of the Parties with respect to the subject matter contained herein, and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, both written and oral, regarding such subject matter. The parties acknowledge and agree that if there is any conflict between the terms and conditions of this Agreement and the terms and conditions of any Statement of Work, the terms and conditions of this Agreement shall supersede and control.</p></div>

    <div class="msa-clause h"><span class="msa-num">13.</span><p class="msa-body"><span class="msa-ctitle u">Notices.</span> All notices, requests, consents, claims, demands, waivers, and other communications under this Agreement (each, a "Notice", and with the correlative meaning "Notify") must be in writing and addressed to the other Party at its address set forth below (or to such other address that the receiving Party may designate from time to time in accordance with this Section). Unless otherwise agreed herein, all Notices must be delivered by personal delivery, nationally recognized overnight courier, or certified or registered mail (in each case, return receipt requested, postage prepaid) and electronic mail. Except as otherwise provided in this Agreement, a Notice is effective only (a) on receipt by the receiving Party; and (b) if the Party giving the Notice has complied with the requirements of this Section 13.</p></div>

    <div class="msa-notice-grid">
      <div class="msa-nb">
        <div class="msa-lbl">Notice to Customer</div>
        <div class="msa-ln">At the address set forth for Customer in the accompanying Statement of Work.</div>
      </div>
      <div class="msa-nb">
        <div class="msa-lbl">Notice to Service Provider</div>
        <div class="msa-ln">Uncap, Inc<br>c/o Denis Dyli<br>8770 West Bryn Mawr Ave, Suite 1300<br>Chicago, IL 60631</div>
      </div>
    </div>
    <div class="msa-notice-grid" style="margin-top:16px;">
      <div class="msa-nb">
        <div class="msa-lbl">With a copy to</div>
        <div class="msa-ln">${COUNSEL.name}<br>E: ${COUNSEL.email}<br>P: ${COUNSEL.phone}</div>
      </div>
    </div>

    <div class="msa-clause h"><span class="msa-num">14.</span><p class="msa-body"><span class="msa-ctitle u">Non Solicitation of Employees.</span> The Customer understands and acknowledges that the Service Provider has expended and continues to expend significant time and expense in recruiting and training its employees and that the loss of employees would cause significant and irreparable harm to the Service Provider. The Customer agrees and covenants not to directly or indirectly solicit, hire, or recruit for their own benefit or the benefit of any other person, or so attempt to solicit, hire, or recruit, any employee of the Service Provider ("Covered Employee"), or induce any Covered Employee to terminate their employment for 24 months immediately following the termination of this Agreement, regardless of the reason for the termination, whether voluntary or involuntary ("Restricted Period").</p></div>
    <div class="msa-clause"><span class="msa-num"></span><p class="msa-body">This non solicitation provision explicitly covers all forms of oral, written, or electronic communication, including, but not limited to, communications by email, regular mail, express mail, telephone, fax, instant message, and social media, including, but not limited to, Facebook, LinkedIn, Instagram, and X, and any other social media platform, whether or not in existence at the time of entering into this Agreement.</p></div>

    <div class="msa-clause h"><span class="msa-num">15.</span><p class="msa-body"><span class="msa-ctitle u">Severability.</span> If any term or provision of this Agreement is found by a court of competent jurisdiction to be invalid, illegal, or unenforceable in any jurisdiction, such invalidity, illegality, or unenforceability shall not affect any other term or provision of this Agreement or invalidate or render unenforceable such term or provision in any other jurisdiction.</p></div>

    <div class="msa-clause h"><span class="msa-num">16.</span><p class="msa-body"><span class="msa-ctitle u">Amendments.</span> No amendment to or modification of or rescission, termination, or discharge of this Agreement is effective unless it is in writing, identified as an amendment to or rescission, termination, or discharge of this Agreement, and signed by an authorized representative of each Party.</p></div>

    <div class="msa-clause h"><span class="msa-num">17.</span><p class="msa-body"><span class="msa-ctitle u">Waiver.</span> No waiver by any Party of any of the provisions of this Agreement shall be effective unless explicitly set forth in writing and signed by the Party so waiving. Except as otherwise set forth in this Agreement, no failure to exercise, or delay in exercising, any right, remedy, power, or privilege arising from this Agreement shall operate or be construed as a waiver thereof, nor shall any single or partial exercise of any right, remedy, power, or privilege hereunder preclude any other or further exercise thereof or the exercise of any other right, remedy, power, or privilege.</p></div>

    <div class="msa-clause h"><span class="msa-num">18.</span><p class="msa-body"><span class="msa-ctitle u">Assignment.</span> Customer shall not assign, transfer, delegate, or subcontract any of its rights or delegate any of its obligations under this Agreement without the prior written consent of Service Provider. Any purported assignment or delegation in violation of this Section 18 shall be null and void. No assignment or delegation shall relieve the Customer of any of its obligations under this Agreement. Service Provider may assign any of its rights or delegate any of its obligations to any affiliate or to any person acquiring all or substantially all of Service Provider's assets without Customer's consent.</p></div>

    <div class="msa-clause h"><span class="msa-num">19.</span><p class="msa-body"><span class="msa-ctitle u">Successors and Assigns.</span> This Agreement is binding on and inures to the benefit of the Parties to this Agreement and their respective permitted successors and permitted assigns.</p></div>

    <div class="msa-clause h"><span class="msa-num">20.</span><p class="msa-body"><span class="msa-ctitle u">Relationship of the Parties.</span> The relationship between the Parties is that of independent contractors. The details of the method and manner for performance of the Services by Service Provider shall be under its own control, Customer being interested only in the results thereof. The Service Provider shall be solely responsible for supervising, controlling, and directing the details and manner of the completion of the Services. Nothing in this Agreement shall give the Customer the right to instruct, supervise, control, or direct the details and manner of the completion of the Services. The Services must meet the Customer's final approval and shall be subject to the Customer's general right of inspection throughout the performance of the Services and to secure satisfactory final completion. Nothing contained in this Agreement shall be construed as creating any agency, partnership, joint venture, or other form of joint enterprise, employment, or fiduciary relationship between the Parties, and neither Party shall have authority to contract for or bind the other Party in any manner whatsoever.</p></div>

    <div class="msa-clause h"><span class="msa-num">21.</span><p class="msa-body"><span class="msa-ctitle u">No Third Party Beneficiaries.</span> This Agreement benefits solely the Parties to this Agreement and their respective permitted successors and assigns and nothing in this Agreement, express or implied, confers on any other person or entity any legal or equitable right, benefit, or remedy of any nature whatsoever under or by reason of this Agreement.</p></div>

    <div class="msa-clause h"><span class="msa-num">22.</span><p class="msa-body"><span class="msa-ctitle u">Choice of Law.</span> This Agreement and all related documents including all exhibits attached hereto, and all matters arising out of or relating to this Agreement, whether sounding in contract, tort, or statute, are governed by, and construed in accordance with, the laws of the State of Illinois, United States of America, without giving effect to the conflict of laws provisions thereof to the extent such principles or rules would require or permit the application of the laws of any jurisdiction other than those of the State of Illinois.</p></div>

    <div class="msa-clause h"><span class="msa-num">23.</span><p class="msa-body"><span class="msa-ctitle u">Choice of Forum.</span> Each Party irrevocably and unconditionally agrees that it will not commence any action, litigation, or proceeding of any kind whatsoever against the other Party in any way arising from or relating to this Agreement, including all exhibits, schedules, attachments, and appendices attached to this Agreement, and all contemplated transactions, including, but not limited to, contract, equity, tort, fraud, and statutory claims, in any forum other than in courts having situs within Cook County, Illinois, and any local, state, or federal court located within Cook County, Illinois. Each Party irrevocably and unconditionally submits to the exclusive jurisdiction of such courts and agrees to bring any such action, litigation, or proceeding only in courts having situs in Cook County, Illinois. Each Party further waives any right it may have to transfer venue of any such action or proceeding. Each Party agrees that a final judgment in any such action, litigation, or proceeding is conclusive and may be enforced in other jurisdictions by suit on the judgment or in any other manner provided by law.</p></div>

    <div class="msa-clause h"><span class="msa-num">24.</span><p class="msa-body"><span class="msa-ctitle u">Waiver of Jury Trial.</span> <span class="msa-caps">EACH PARTY ACKNOWLEDGES THAT ANY CONTROVERSY THAT MAY ARISE UNDER THIS AGREEMENT, INCLUDING EXHIBITS, SCHEDULES, ATTACHMENTS, AND APPENDICES ATTACHED TO THIS AGREEMENT, IS LIKELY TO INVOLVE COMPLICATED AND DIFFICULT ISSUES AND, THEREFORE, EACH SUCH PARTY IRREVOCABLY AND UNCONDITIONALLY WAIVES ANY RIGHT IT MAY HAVE TO A TRIAL BY JURY IN RESPECT OF ANY LEGAL ACTION ARISING OUT OF OR RELATING TO THIS AGREEMENT, INCLUDING ANY EXHIBITS, SCHEDULES, ATTACHMENTS, OR APPENDICES ATTACHED TO THIS AGREEMENT, OR THE TRANSACTIONS CONTEMPLATED HEREBY.</span></p></div>

    <div class="msa-clause h"><span class="msa-num">25.</span><p class="msa-body"><span class="msa-ctitle u">Counterparts.</span> This Agreement may be executed in counterparts, each of which is deemed an original, but all of which together are deemed to be one and the same agreement.</p></div>

    <div class="msa-foot">Uncap · Master Services Agreement</div>
  `;

  function UncapMSA(props) {
    ensureStyles();
    const company = (props && props.company) || '[Client Company]';
    const name    = (props && props.name)    || '';
    const title   = (props && props.title)   || '';
    const effective = todayString();

    return (
      React.createElement('div', { className: 'uncap-msa' },
        React.createElement('div', { className: 'msa-eyebrow' }, 'Terms'),
        React.createElement('h2', null, 'Services Agreement'),
        React.createElement('div', { className: 'msa-dt' }, 'Effective ' + effective),
        React.createElement('div', { dangerouslySetInnerHTML: { __html: MSA_BODY_HTML(effective) } }),
        React.createElement('div', { className: 'msa-sig' },
          React.createElement('p', { className: 'msa-sig-intro' },
            'IN WITNESS WHEREOF, the parties hereto have caused this Agreement to be executed as of the Effective Date by their respective duly authorized officers.'
          ),
          React.createElement('div', { className: 'msa-sig-grid' },
            React.createElement('div', { className: 'msa-sigbox' },
              React.createElement('div', { className: 'msa-co' }, company),
              React.createElement('div', { className: 'msa-sign-on' }, 'Signature'),
              React.createElement('div', { className: 'msa-rule' },
                React.createElement('div', { className: 'msa-fld' },
                  React.createElement('span', { className: 'msa-k' }, 'Name'),
                  name
                ),
                React.createElement('div', { className: 'msa-fld' },
                  React.createElement('span', { className: 'msa-k' }, 'Title'),
                  title
                ),
                React.createElement('div', { className: 'msa-fld' },
                  React.createElement('span', { className: 'msa-k' }, 'Date'),
                  effective
                )
              )
            ),
            React.createElement('div', { className: 'msa-sigbox' },
              React.createElement('div', { className: 'msa-co' }, 'Uncap, Inc'),
              React.createElement('div', { className: 'msa-sign-on' }, 'Signature'),
              React.createElement('div', { className: 'msa-rule' },
                React.createElement('div', { className: 'msa-fld' },
                  React.createElement('span', { className: 'msa-k' }, 'Name'),
                  'Denis Dyli'
                ),
                React.createElement('div', { className: 'msa-fld' },
                  React.createElement('span', { className: 'msa-k' }, 'Title'),
                  'CEO'
                ),
                React.createElement('div', { className: 'msa-fld' },
                  React.createElement('span', { className: 'msa-k' }, 'Date'),
                  ''
                )
              )
            )
          )
        )
      )
    );
  }

  if (typeof window !== 'undefined') window.UncapMSA = UncapMSA;
})();
