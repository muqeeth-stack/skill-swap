import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-4">
        <div className="text-6xl">🧭</div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          404 — Page Not Found
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This trail hasn&apos;t been mapped yet on SynapseLearn. The link may be broken, or the
          page may have moved.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-md transition-all"
          >
            Go Home
          </Link>
          <Link
            href="/skills"
            className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            Browse Skills
          </Link>
        </div>
      </div>
    </div>
  );
}