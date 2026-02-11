import SHA256 from 'crypto-js/sha256';

/**
 * Deterministic rollout hash: SHA-256 of `identifier:ruleId`, mapped to 0-99.
 * Same inputs always produce the same bucket.
 *
 * Mirrors `server/src/usecases/evaluate.usecase.ts#computeRolloutHash`.
 */
export function computeRolloutHash(identifier: string, ruleId: string): number {
  const digest = SHA256(`${identifier}:${ruleId}`).toString();
  const slice = parseInt(digest.substring(0, 8), 16);
  return slice % 100;
}
