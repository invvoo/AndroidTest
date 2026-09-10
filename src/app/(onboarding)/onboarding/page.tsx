import { redirect } from "next/navigation";
import { getCurrentUserAndProfile } from "@/lib/profile";
import OnboardingForm from "./_components/onboarding-form";

export default async function OnboardingPage() {
  const { user, profile } = await getCurrentUserAndProfile();

  // Middleware already blocks anon users, but guard here too.
  if (!user) redirect("/login?next=/onboarding");
  // Already onboarded — nothing to do.
  if (profile) redirect("/");

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl bg-white/70 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-tea-dark">
          Set up your profile
        </h1>
        <p className="mt-1 text-sm text-tea">
          Pick a username. You can change the rest later.
        </p>
        <div className="mt-6">
          <OnboardingForm />
        </div>
      </div>
    </div>
  );
}
