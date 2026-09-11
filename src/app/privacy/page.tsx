import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — SynapseLearn",
  description: "How SynapseLearn handles your data, privacy, and security.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Privacy Policy</h1>
      <p className="text-xs text-gray-500 dark:text-gray-400">Last updated: {new Date().toDateString()}</p>

      {[
        {
          title: "1. Data We Collect",
          body:
            "Profile information you provide (name, email, skills, goals, availability), content you create (messages, reviews, learning progress), and technical data (device, browser) needed to operate the service.",
        },
        {
          title: "2. Passwords & Authentication",
          body:
            "Passwords are never stored in plain text. They are salted and hashed with PBKDF2-SHA256. Where you sign in with Google, we receive only the profile fields you authorize via Google's OAuth consent screen.",
        },
        {
          title: "3. Storage & Persistence",
          body:
            "In the current build, your SynapseLearn data persists locally in your browser storage, and sessions are device-specific. We do not sell personal data.",
        },
        {
          title: "4. Sharing",
          body:
            "Your public profile, skills, and reviews are visible to other users for matching purposes. Message contents are visible only to conversation participants.",
        },
        {
          title: "5. Analytics",
          body:
            "We use aggregate interaction data to improve matching and recommendations. No sensitive personal data is used for advertising.",
        },
        {
          title: "6. Security",
          body:
            "We use signed session tokens, timing-safe verification, and principle of least privilege. Report vulnerabilities responsibly.",
        },
        {
          title: "7. Your Rights",
          body:
            "You can edit or delete your profile data at any time from your profile and settings pages. Contact us to request data removal.",
        },
        {
          title: "8. Contact",
          body:
            "For privacy questions, reach out through the platform's reporting tools or support channels referenced at signup.",
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