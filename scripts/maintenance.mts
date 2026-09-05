import { getPrisma } from "../apps/playground/src/db";

const db = getPrisma(),
  now = new Date();
try {
  const [sessions, attempts, throttles] = await Promise.all([
    db.session.deleteMany({
      where: {
        OR: [{ expiresAt: { lte: now } }, { revokedAt: { not: null } }],
      },
    }),
    db.oauthAttempt.deleteMany({ where: { expiresAt: { lte: now } } }),
    db.requestThrottle.deleteMany({ where: { expiresAt: { lte: now } } }),
  ]);
  console.log(
    JSON.stringify({
      sessions: sessions.count,
      oauthAttempts: attempts.count,
      throttleBuckets: throttles.count,
    }),
  );
} finally {
  await db.$disconnect();
}
