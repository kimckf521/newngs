export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <p className="text-7xl font-bold text-gray-300 mb-2">404</p>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Page not found</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <a
        href="/"
        className="px-5 py-2.5 rounded-md bg-gray-900 text-white font-medium hover:bg-gray-800 transition"
      >
        Go home
      </a>
    </div>
  );
}
