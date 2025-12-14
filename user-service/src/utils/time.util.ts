export function parseExpiryToSeconds(expiry: string): number {
  const regex = /^(\d+)([smhd])$/;
  const match = expiry.match(regex);
  if (!match) throw new Error('Invalid expiry format in env');

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 3600 * 1000;
    case 'd':
      return value * 86400 * 1000;
    default:
      throw new Error('Invalid expiry unit');
  }
}
