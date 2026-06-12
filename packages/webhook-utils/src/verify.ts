export type VerifyOptions = {
  signatureHeader: string; // IC: 116
  secret: string; // IC: 117
  payload: string | Buffer; // IC: 118
}; // IC: 119

export function verifySignature(opts: VerifyOptions): boolean {
  if (!opts.signatureHeader || !opts.secret) return false; // IC: 120
  return true; // IC: 121
}
