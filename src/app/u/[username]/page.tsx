import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUserAndProfile, getProfileByUsername } from "@/lib/profile";
import { getUserLogs, getUserStats, getUserMapPoints } from "@/lib/logs";
import StatTiles from "./_components/stat-tiles";
import ProfileLogItem from "./_components/profile-log-item";
import BobaMap from "./_components/boba-map";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return { title: `@${username} — Boba` };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const [stats, logs, points, { user }] = await Promise.all([
    getUserStats(profile.id),
    getUserLogs(profile.id),
    getUserMapPoints(profile.id),
    getCurrentUserAndProfile(),
  ]);

  const isSelf = user?.id === profile.id;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-tea/10 text-2xl">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            "🧋"
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-tea-dark">
            {profile.display_name || `@${profile.username}`}
          </h1>
          <p className="text-sm text-tea/70">
            @{profile.username}
            {profile.home_city ? ` · ${profile.home_city}` : ""}
          </p>
          {profile.bio && (
            <p className="mt-1 text-sm text-tea/90">{profile.bio}</p>
          )}
        </div>
      </header>

      {/* Stats */}
      <section>
        <StatTiles stats={stats} />
      </section>

      {/* Boba history map */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-tea-dark">
          Boba history map
        </h2>
        {points.length === 0 ? (
          <p className="rounded-xl bg-white/60 p-4 text-sm text-tea">
            No mapped logs yet — logs pick up a pin when you record where you
            drank.
          </p>
        ) : (
          <BobaMap points={points} />
        )}
      </section>

      {/* Log feed */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-tea-dark">Logs</h2>
        {logs.length === 0 ? (
          <p className="rounded-xl bg-white/60 p-4 text-sm text-tea">
            {isSelf ? (
              <>
                You haven&apos;t logged anything yet.{" "}
                <Link href="/shops" className="text-tea-dark underline">
                  Find a drink
                </Link>{" "}
                to log.
              </>
            ) : (
              "No logs yet."
            )}
          </p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <ProfileLogItem key={log.id} log={log} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
