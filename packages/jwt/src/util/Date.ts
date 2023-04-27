/**
 * Converts milliseconds to seconds and rounds down to the nearest integer.
 *
 * @param ms - The number of milliseconds.
 * @returns The number of seconds.
 */
export function toSeconds (ms: number): number {
  return Math.floor(ms / 1000)
}
