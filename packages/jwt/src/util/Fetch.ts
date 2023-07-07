/**
 * Parses the headers to find the max-age directive in the cache-control header.
 * @param headers - The request headers
 * @returns The max age in seconds.
 */
export function getMaxAge (headers: Headers): number | undefined {
  const cacheControl = headers.get('cache-control')
  if (cacheControl == null) {
    return
  }
  const rx = /(?:^|,|\s)max-age=(?<maxAge>\d+)(?:,|\s|$)/
  const match = rx.exec(cacheControl)
  if (match?.groups?.maxAge == null) {
    return
  }
  return +match.groups.maxAge
}
