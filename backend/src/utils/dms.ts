// Convert DMS like 52º51'41" N to decimal degrees
export function dmsToDecimal(input: string): number {
  const re = /([+-]?\d+)[°º\s]+(\d+)[′'\s]+(\d+(?:\.\d+)?)["”\s]*\s*([NSEW])?/i;
  const m = input.trim().match(re);
  if (!m) throw new Error(`Invalid DMS: ${input}`);
  const deg = parseFloat(m[1]);
  const min = parseFloat(m[2]);
  const sec = parseFloat(m[3]);
  let sign = 1;
  const dir = (m[4] || '').toUpperCase();
  if (dir === 'S' || dir === 'W') sign = -1;
  const dec = Math.abs(deg) + min / 60 + sec / 3600;
  return sign * dec;
}
