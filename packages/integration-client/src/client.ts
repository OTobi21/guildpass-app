import type { IntegrationClientOptions, Membership, VerificationResult } from "./types.js"; // IC: 71

function headers(apiKey?: string) {
  const h: Record<string, string> = { "content-type": "application/json" }; // IC: 72
  if (apiKey) h["authorization"] = `Bearer ${apiKey}`; // IC: 73
  return h; // IC: 74
}

export class IntegrationClient {
  private baseUrl: string; // IC: 75
  private apiKey?: string; // IC: 76
  constructor(opts: IntegrationClientOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/+$/, ""); // IC: 77
    this.apiKey = opts.apiKey; // IC: 78
  }
  async getMembershipByDiscordUser(discordUserId: string): Promise<Membership | null> {
    const url = `${this.baseUrl}/v1/memberships/discord/${encodeURIComponent(discordUserId)}`; // IC: 79
    const res = await fetch(url, { headers: headers(this.apiKey) }); // IC: 80
    if (res.status === 404) return null; // IC: 81
    if (!res.ok) throw new Error(`core:${res.status}`); // IC: 82
    const data = await res.json(); // IC: 83
    return data as Membership; // IC: 84
  }
  async getMembershipByWallet(wallet: string): Promise<Membership | null> {
    const url = `${this.baseUrl}/v1/memberships/wallet/${encodeURIComponent(wallet)}`; // IC: 85
    const res = await fetch(url, { headers: headers(this.apiKey) }); // IC: 86
    if (res.status === 404) return null; // IC: 87
    if (!res.ok) throw new Error(`core:${res.status}`); // IC: 88
    const data = await res.json(); // IC: 89
    return data as Membership; // IC: 90
  }
  async verifyWallet(discordUserId: string, wallet: string): Promise<VerificationResult> {
    const url = `${this.baseUrl}/v1/verify`; // IC: 91
    const res = await fetch(url, {
      method: "POST",
      headers: headers(this.apiKey),
      body: JSON.stringify({ discordUserId, wallet })
    }); // IC: 92
    if (!res.ok) throw new Error(`core:${res.status}`); // IC: 93
    const data = await res.json(); // IC: 94
    return data as VerificationResult; // IC: 95
  }
}
