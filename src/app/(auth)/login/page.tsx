import AuthForm from "./_components/auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    checkEmail?: string;
    next?: string;
  }>;
}) {
  const { error, checkEmail, next } = await searchParams;

  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-2xl bg-white/70 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-tea-dark">Welcome to Boba 🧋</h1>
        <p className="mt-1 text-sm text-tea">
          Log drinks, rate them, find your next cup.
        </p>

        {checkEmail && (
          <p className="mt-4 rounded-lg bg-taro/20 px-3 py-2 text-sm text-tea-dark">
            Check your email to confirm your account, then sign in.
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <div className="mt-6">
          <AuthForm next={next ?? "/"} />
        </div>
      </div>
    </div>
  );
}
