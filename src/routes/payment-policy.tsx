import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { LegalLink, LegalSection, LegalShell } from "@/components/legal/LegalShell";
import "@/file-routes";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/payment-policy")({
  component: PaymentPolicyPage,
});

function PaymentPolicyPage() {
  const email = BRAND.legal.supportEmail;

  useEffect(() => {
    document.title = `Payment Policy · ${BRAND.name}`;
    return () => {
      document.title = BRAND.name;
    };
  }, []);

  return (
    <LegalShell
      activePage="payment"
      title="Payment Policy"
      subtitle={`How payments, billing, and settlements work on ${BRAND.name}.`}
    >
      <p>
        This Payment Policy explains how money moves through <strong>{BRAND.name}</strong> — both
        when Schools pay for a {BRAND.name} subscription, and when parents or guardians pay school
        fees online through a School’s workspace. {BRAND.legal.operatorNotice} Read it together with
        our <LegalLink href={BRAND.legal.termsPath}>Terms of Use</LegalLink>,{" "}
        <LegalLink href={BRAND.legal.privacyPath}>Privacy Policy</LegalLink>, and{" "}
        <LegalLink href={BRAND.legal.refundPolicyPath}>Refund Policy</LegalLink>.
      </p>

      <LegalSection title="1. Two kinds of payments">
        <p>{BRAND.name} may process or facilitate two categories of payments:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Platform subscription:</strong> fees a School pays to {BRAND.legal.operator} for
            using {BRAND.name} (Basic, Premium, Enterprise, or other published plans).
          </li>
          <li>
            <strong>School fee collection:</strong> fees a parent, guardian, or payer pays to a
            School for tuition or other school charges, when that School enables online collection
            inside {BRAND.name}.
          </li>
        </ul>
        <p>
          These are separate. Paying school fees does not pay your {BRAND.name} subscription, and
          vice versa.
        </p>
      </LegalSection>

      <LegalSection title="2. Platform subscription billing">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            Subscription prices are shown on the{" "}
            <LegalLink href="/pricing">pricing page</LegalLink> and at checkout in INR unless
            otherwise stated.
          </li>
          <li>Billing cycles are typically monthly or annual, depending on the plan selected.</li>
          <li>
            Paid plans renew automatically at the end of each period unless cancelled before renewal.
          </li>
          <li>
            Applicable taxes (such as GST in India) may be added as required by law and shown on the
            invoice where available.
          </li>
          <li>
            Invoices and receipts for platform billing are issued under{" "}
            <strong>{BRAND.legal.operator}</strong>.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. School fee payments (parent / guardian)">
        <p>
          When a School turns on online fee collection, parents or authorised payers may pay dues
          through {BRAND.name} using supported payment methods (for example UPI, cards, or net
          banking via our payment partners).
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            The School sets fee amounts, due dates, and what is owed. {BRAND.name} displays those
            figures and records successful payments in the School’s books.
          </li>
          <li>
            Payment is made to the School (or its designated merchant account), not as a purchase of
            the {BRAND.name} software itself.
          </li>
          <li>
            Receipts generated in {BRAND.name} are issued for the School’s records. Disputes about
            fee amounts, concessions, or academic charges should be raised with the School first.
          </li>
          <li>
            Settlement timing, platform fees (if any), and payout bank details depend on the School’s
            configured payment provider and settlement settings.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Payment methods & processors">
        <p>
          We use licensed third-party payment processors and gateways to accept and settle payments.
          By paying through {BRAND.name}, you also agree to the applicable processor’s terms.
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Card and UPI data are handled by the processor — {BRAND.name} does not store full card numbers</li>
          <li>Availability of methods may vary by country, bank, and School configuration</li>
          <li>Failed, pending, or delayed bank authorisations are outside our direct control</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Successful, failed, and pending payments">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            A payment is treated as successful when our processor confirms settlement or clear
            authorisation.
          </li>
          <li>
            Failed payments are not charged (or are auto-reversed by the processor). You may retry
            with another method.
          </li>
          <li>
            Pending payments may take time to clear. Do not pay twice for the same invoice unless the
            School or support confirms the first attempt failed.
          </li>
          <li>
            If money was debited but the receipt was not issued, contact{" "}
            <a
              href={`mailto:${email}`}
              className="font-medium text-[var(--mkt-green-deep)] hover:underline"
            >
              {email}
            </a>{" "}
            with the School name, amount, time, and UTR / transaction ID.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Currency">
        <p>
          Platform list prices are published in Indian Rupees (INR). School workspaces may display
          other currencies for local reporting; gateway settlement currency depends on the merchant
          account and processor configuration.
        </p>
      </LegalSection>

      <LegalSection title="7. Refunds & chargebacks">
        <p>
          Refund rules for {BRAND.name} subscriptions are described in our{" "}
          <LegalLink href={BRAND.legal.refundPolicyPath}>Refund Policy</LegalLink>.
        </p>
        <p>
          Refunds of school fees paid online are decided by the School (or as required by law /
          processor rules). {BRAND.name} can help coordinate a refund through the payment partner
          when the School authorises it.
        </p>
        <p>
          Please contact us before filing a chargeback so we can investigate. Unresolved chargebacks
          may pause payouts or workspace access while the dispute is open.
        </p>
      </LegalSection>

      <LegalSection title="8. Security">
        <p>
          Payment pages use encrypted connections. We apply access controls so only authorised School
          staff see payment history in the workspace. Report suspected fraud to{" "}
          <a
            href={`mailto:${email}`}
            className="font-medium text-[var(--mkt-green-deep)] hover:underline"
          >
            {email}
          </a>{" "}
          immediately.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes">
        <p>
          We may update this Payment Policy from time to time. The “Last updated” date on the page
          will change when we do. Continued use of paid features or online fee collection after
          changes take effect constitutes acceptance of the updated policy.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact">
        <p>
          Payment and billing questions:{" "}
          <a
            href={`mailto:${email}`}
            className="font-medium text-[var(--mkt-green-deep)] hover:underline"
          >
            {email}
          </a>
        </p>
        <p>
          Or visit our <LegalLink href={BRAND.supportPath}>Support</LegalLink> page.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
