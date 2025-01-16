"use client";

export default function LoginPage() {
  return (
    <div className="container mx-auto p-4 mt-20">
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Login to ReclaimLA</h1>
        <form>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-zinc-800 text-white rounded-full p-2 hover:bg-zinc-700"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}