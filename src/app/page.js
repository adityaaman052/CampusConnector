import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple Navbar */}
      <nav className="flex justify-end p-6">
        <Link
          href="/login"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
        >
          Login
        </Link>
      </nav>

      {/* Centered Welcome Text */}
      <main className="flex-1 flex items-center justify-center">
        <h1 className="text-3xl sm:text-5xl font-bold text-center">
          Welcome to Campus Connector
        </h1>
      </main>
    </div>
  );
}
