import { getTranslations } from "next-intl/server";

import { LandingAbout } from "@/components/landing/landing-about";
import { LandingDevotional } from "@/components/landing/landing-devotional";
import { LandingEvents } from "@/components/landing/landing-events";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingGiving } from "@/components/landing/landing-giving";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingSchedule } from "@/components/landing/landing-schedule";
import { LandingVisit, hasVisitInfo } from "@/components/landing/landing-visit";
import { listPublicDevotionals } from "@/server/queries/devotionals";
import { listEvents } from "@/server/queries/events";
import { getUpcomingServices } from "@/server/queries/services";

/**
 * Public landing page.
 *
 * The section order answers a first-time visitor's questions in the order they
 * ask them: who are you and when do you meet (hero), what is it like to come
 * (schedule), what do you believe (about), what are you saying right now
 * (devotionals, events), how do I give, where are you, and finally — come.
 *
 * Section numbering is computed rather than written down, because three of the
 * seven sections disappear when their data or configuration is absent and a
 * hard-coded "05" over the fifth surviving section would be wrong on most
 * deployments.
 */
export default async function Home() {
  const t = await getTranslations("landing");

  const [upcomingServices, devotionals, events] = await Promise.all([
    getUpcomingServices(4),
    listPublicDevotionals(3),
    listEvents({ publishedOnly: true, upcomingOnly: true, pageSize: 3 }),
  ]);

  const services = [1, 2, 3].map((n) => ({
    name: t(`schedule.service${n}.name`),
    time: t(`schedule.service${n}.time`),
    note: t(`schedule.service${n}.note`),
  }));

  const sections = {
    devotional: devotionals.length > 0,
    events: events.items.length > 0,
    visit: hasVisitInfo(),
  };

  let sectionNo = 0;
  const step = () => String(++sectionNo).padStart(2, "0");

  return (
    <main className="flex min-h-dvh flex-col bg-lp-paper text-lp-ink selection:bg-lp-accent/15 selection:text-lp-ink">
      <LandingHeader sections={sections} />

      <LandingHero services={services} />

      <LandingSchedule upcoming={upcomingServices} index={step()} />

      <LandingAbout index={step()} />

      {sections.devotional ? (
        <LandingDevotional devotionals={devotionals} index={step()} />
      ) : null}

      {sections.events ? (
        <LandingEvents events={events.items} index={step()} />
      ) : null}

      <LandingGiving index={step()} />

      {sections.visit ? <LandingVisit index={step()} /> : null}

      <LandingFooter sections={sections} />
    </main>
  );
}
