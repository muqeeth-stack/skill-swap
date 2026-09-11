import Link from "next/link";

export const metadata = {
  title: "Terms of Service — SynapseLearn",
  description: "The terms that govern your use of the SynapseLearn platform.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Terms of Service</h1>
      <p className="text-xs text-gray-500 dark:text-gray-400">Last updated: {new Date().toDateString()}</p>

      {[
        {
          title: "1. Acceptance of Terms",
          body:
            "By creating an account or using SynapseLearn, you agree to these Terms of Service. If you do not agree, please do not use the platform.",
        },
        {
          title: "2. Accounts",
          body:
            "You are responsible for safeguarding your password and for all activity under your account. Provide accurate information and do not impersonate others.",
        },
        {
          title: "3. Skills Exchange Conduct",
          body:
            "SynapseLearn connects learners and teachers for 1-on-1 skill exchange. Be respectful, punctual, and honest. Report safety concerns via the built-in reporting tools.",
        },
        {
          title: "4. Content You Post",
          body:
            "You retain ownership of content you post, and grant SynapseLearn a license to host and display it in the context of the platform. Do not post unlawful, abusive, or infringing content.",
        },
        {
          title: "5. Video Content",
          body:
            "SynapseLearn may aggregate learning videos for educational purposes. Respect intellectual property and do not re-distribute paid or licensed content.",
        },
        {
          title: "6. Limitation of Liability",
          body:
            "The platform is provided 'as is'. We are not liable for outcomes of peer learning exchanges, disputes between users, or interruptions in service.",
        },
        {
          title: "7. Termination",
          body:
            "We may suspend or terminate accounts that violate these terms, including abusive, fraudulent, or unsafe behavior.",
        },
        {
          title: "8. Changes",
          body:
            "We may update these terms from time to time. Continued use after changes constitutes acceptance.",
        },
      ].map((s) => (
        <section key={s.title} className="space-y-1">
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">{s.title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.body}</p>
        </section>
      ))}

      <div className="pt-4">
        <Link href="/" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
          ← Back to SynapseLearn
        </Link>
      </div>
    </div>
  );
}