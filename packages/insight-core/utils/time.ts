/** Simple UTC helpers. (Your real system likely already has robust JD conversions.) */
export function isoUtcNow(): string {
  return new Date().toISOString();
}

/** Julian Day from UTC date. */
export function jdFromDateUTC(d: Date): number {
  // Algorithm: Meeus (valid Gregorian). Good enough for scaffolding.
  const year = d.getUTCFullYear();
  let month = d.getUTCMonth() + 1;
  const day = d.getUTCDate()
    + (d.getUTCHours() + (d.getUTCMinutes() + (d.getUTCSeconds() + d.getUTCMilliseconds()/1000)/60)/60) / 24;

  let Y = year;
  let M = month;
  if (M <= 2) { Y -= 1; M += 12; }

  const A = Math.floor(Y/100);
  const B = 2 - A + Math.floor(A/4);

  const JD = Math.floor(365.25*(Y + 4716))
    + Math.floor(30.6001*(M + 1))
    + day + B - 1524.5;

  return JD;
}
