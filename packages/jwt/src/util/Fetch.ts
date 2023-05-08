import { toSeconds } from './Date.js'

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
  const cacheDuration = +match.groups.maxAge
  return toSeconds(cacheDuration)
}
