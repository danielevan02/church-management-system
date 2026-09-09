import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { LandingCopyButton } from "@/components/landing/landing-copy-button";
import { LandingSection } from "@/components/landing/landing-section";
import { QrisImage } from "@/components/giving/qris-image";
import { LoadingLink } from "@/components/shared/loading-link";
import { church } from "@/config/church";

/**
 * Giving.
 *
 * Set as a printed remittance slip: a definition list on hairlines, the
 * account number in the mono face at a size that can be read off a phone held
 * at arm's length by someone who is transcribing it into a banking app. That
 * is the actual task, and the previous version buried it under a verification
 * badge, a shield icon and two accent chips that made a bank transfer look
 * like a checkout flow.
 *
 * Everything here is conditional on being configured. A church that has not
 * filled in `NEXT_PUBLIC_CHURCH_BANK_ACCOUNT_NUMBER` gets the QRIS column
 * alone; one with neither gets the section's own copy and the link to the
 * giving page, which is still true and still useful.
 */
export async function LandingGiving({ index }: { index: string }) {
  const t = await getTranslations("landing");
  const tGive = await getTranslations("publicGive");
  const bank = church.bank;
  const hasBank = Boolean(bank.accountNumber && bank.accountHolder);

  return (
    <LandingSection
      id="persembahan"
      index={index}
      label={t("nav.give")}
      title={t("give.title")}
      description={t("give.description")}
      tone="sand"
      aside={
        <LoadingLink
          href="/give"
          className="lp-action h-11 rounded-full bg-lp-ink px-6 text-lp-paper transition-colors hover:bg-lp-accent-deep"
        >
          {t("give.pageCta")}
        </LoadingLink>
      }
    >
      <div className="lp-reveal grid gap-x-10 gap-y-12 lg:grid-cols-12">
        {/* QRIS */}
        <div className="lg:col-span-5">
          <h3 className="lp-label border-b border-lp-ink pb-3 text-lp-ink">
            {tGive("qrisLabel")}
          </h3>

          <div className="mt-8 flex flex-col items-start">
            <div className="rounded-3xl border border-lp-rule-firm bg-lp-paper p-5">
              <QrisImage
                src={bank.qrisImagePath}
                alt={tGive("qrisAlt", { church: church.name })}
                className="h-56 w-56 object-contain"
                fallback={
                  <div className="flex h-56 w-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-lp-rule-firm px-6 text-center">
                    <span className="lp-label text-lp-ink-faint">
                      {t("give.qrisMissing")}
                    </span>
                    <span className="lp-small text-lp-ink-soft">
                      {t("give.qrisMissingHint")}
                    </span>
                  </div>
                }
              />
            </div>
            <p className="lp-small mt-5 max-w-xs text-lp-ink-soft">
              {t("give.qrisHint")}
            </p>
          </div>
        </div>

        {/* Bank transfer */}
        <div className="lg:col-span-6 lg:col-start-7">
          <h3 className="lp-label border-b border-lp-ink pb-3 text-lp-ink">
            {tGive("bankAccount")}
          </h3>

          {hasBank ? (
            <dl>
              <div className="border-b border-lp-rule-firm py-5">
                <dt className="lp-label text-lp-ink-faint">
                  {t("give.bankLabel")}
                </dt>
                <dd className="lp-num-sm mt-2 text-lp-ink">
                  {bank.name}
                </dd>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-lp-rule-firm py-5">
                <div className="min-w-0">
                  <dt className="lp-label text-lp-ink-faint">
                    {t("give.accountNumberLabel")}
                  </dt>
                  <dd className="lp-account mt-2 break-all text-lp-ink">
                    {bank.accountNumber}
                  </dd>
                </div>
                <LandingCopyButton
                  value={bank.accountNumber}
                  label={tGive("copyAccountNumber")}
                  copiedLabel={t("give.copied")}
                />
              </div>

              <div className="border-b border-lp-rule-firm py-5">
                <dt className="lp-label text-lp-ink-faint">
                  {tGive("accountHolder")}
                </dt>
                <dd className="lp-body mt-2 text-lp-ink">
                  {bank.accountHolder}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="lp-body border-b border-lp-rule-firm py-5 text-lp-ink-soft">
              {tGive("bankNotConfigured")}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4">
            {bank.confirmationWhatsApp ? (
              <a
                href={`https://wa.me/${bank.confirmationWhatsApp}`}
                target="_blank"
                rel="noreferrer noopener"
                className="lp-action group inline-flex items-center gap-1.5 text-lp-ink transition-colors hover:text-lp-accent"
              >
                <span className="lp-link-on">{t("give.confirmCta")}</span>
                <ArrowUpRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </a>
            ) : null}
          </div>

          <p className="lp-small mt-7 max-w-lg text-lp-ink-faint">
            {t("give.reconciliationNote")}
          </p>
        </div>
      </div>
    </LandingSection>
  );
}
