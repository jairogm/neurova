import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="h-full w-full bg-dot-slate-200 dark:bg-dot-slate-700"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(226 232 240) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }} />
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md flex justify-center">
          <SignIn fallbackRedirectUrl="/dashboard" />
        </div>
      </div>
    </div>
  );
}

