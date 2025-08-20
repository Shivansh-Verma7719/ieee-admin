import Link from "next/link";

export default async function AuthError() {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-5xl font-bold">
          Your login access is restricted
        </h1>
        <p className="mt-3 text-2xl">
          Please contact the Core 4 for assistance.
        </p>
        <div className="flex flex-col items-center justify-center mt-8">
          <Link
            href="/"
            className="px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            If this issue is resolved and you are an IEEE member, try logging in again
          </Link>
          <Link
            href="/"
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Return to home page
          </Link>
        </div>
      </main>
    </div>
  );
}
