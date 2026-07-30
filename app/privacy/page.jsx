/**
 * Privacy notice — Healthyram
 * © 2026 Aseem Mohan. All rights reserved.
 *
 * INSTALL AT: app/privacy/page.jsx
 *
 * BEFORE PUBLISHING: set CONTACT below to an address you monitor.
 * Under the PDPA you must answer access and deletion requests, so
 * it cannot be a no-reply address.
 */

import Link from "next/link";

const CONTACT = "hello@healthyram.net"; // ← set this up before launch
const UPDATED = "July 2026";

export const metadata = {
  title: "Privacy notice — Healthyram",
  description: "What Healthyram collects, which is almost nothing, and why.",
};

export default function Privacy() {
  return (
    <>
      <nav className="nav">
        <div className="nav-in">
          <Link className="mark" href="/">healthy<em>ram</em></Link>
          <Link className="nav-link" href="/">All dishes</Link>
        </div>
      </nav>

      <header className="dishhead">
        <div className="wrap">
          <p className="eyebrow">Last updated {UPDATED}</p>
          <h1>Privacy notice</h1>
          <p className="dish-portion" style={{ marginTop: 16, maxWidth: "42ch" }}>
            Short, because there is very little to tell you.
          </p>
          <div style={{ height: 34 }} />
        </div>
      </header>

      <main className="wrap pv">
        <section className="sec">
          <h2>The short version</h2>
          <p>
            Healthyram has no accounts, no login and no database. The dish pages collect
            nothing. The plan builder runs entirely inside your browser and never sends your
            measurements anywhere. The one exception is the assistant, and that is covered
            below.
          </p>
        </section>
<section className="sec">
          <h2>Cookies</h2>
          <p>
            This site sets no cookies of any kind. No consent banner appears because there
            is nothing to consent to.
          </p>
        </section>
        <section className="sec">
          <h2>Who is responsible</h2>
          <p>
            This site is run by Aseem Mohan as an individual, based in Singapore. I am the data
            controller. Contact: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. This notice is
            written to meet the Personal Data Protection Act 2012 (Singapore).
          </p>
        </section>

        <section className="sec">
          <h2>The dish pages</h2>
          <p>
            Nothing is collected. No cookies are set, no analytics run, and there are no
            tracking pixels or advertising scripts anywhere on this site. There is nothing to
            opt out of.
          </p>
        </section>

        <section className="sec">
          <h2>The plan builder</h2>
          <p>
            Your age, sex, height, weight, waist measurement, activity level, goal and the
            medical screening answers are all processed <strong>in your browser</strong>. None of
            it is transmitted to any server, including mine. Nothing is stored. Close the tab
            and it is gone.
          </p>
          <p>
            This is not a policy choice that could quietly change — it is how the page is built.
            The calculations run in code that has already been downloaded to your device.
          </p>
        </section>

        <section className="sec">
          <h2>The assistant</h2>
          <p>
            This is the one place data leaves your device. When you ask the assistant a question,
            the text of that question and the recent messages in that conversation are sent to
            Anthropic, whose model generates the answer. That processing may happen outside
            Singapore.
          </p>
          <p>
            I do not store your questions, your conversation, or anything derived from them. The
            conversation exists only in your browser tab and disappears when you close it.
            Anthropic handles what it receives under its own terms as a processor.
          </p>
          <p>
            <strong>Practical advice:</strong> do not type anything into the assistant that you
            would not put in an email to a stranger. It is built to answer questions about food,
            not to receive your medical history, and it will decline medical questions anyway.
          </p>
        </section>

        <section className="sec">
          <h2>Server logs</h2>
          <p>
            The site is served by Vercel, which keeps standard access logs — IP address, page
            requested, timestamp — as part of running any web server. I do not use these to
            build profiles and I have no way of connecting them to anything you typed, because
            nothing you typed was saved.
          </p>
        </section>

        <section className="sec">
          <h2>Your rights</h2>
          <p>
            Under the PDPA you can ask what data I hold about you, correct it, or have it
            deleted. In practice the answer is that I hold nothing, because nothing is stored —
            but you are entitled to ask, and I will answer within 30 days. Email{" "}
            <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
          </p>
        </section>

        <section className="sec">
          <h2>If this changes</h2>
          <p>
            If I ever add something that stores data — an account, a saved food log, an email
            list — this notice changes first and the date at the top changes with it. I will not
            quietly start collecting things.
          </p>
        </section>

        <Link className="back" href="/">← All dishes</Link>
      </main>

      <footer className="foot">
        <div className="wrap">
          <p>
            General information about food. Not medical or dietary advice, and no substitute for
            someone who can see your bloodwork.
          </p>
          <p>© 2026 Aseem Mohan.</p>
        </div>
      </footer>
    </>
  );
}
