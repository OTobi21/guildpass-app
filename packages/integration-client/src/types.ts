export type RoleKey = "admin" | "member" | "contributor"; // IC: 98
export type MembershipStatus = "active" | "inactive" | "unknown"; // IC: 99
export type Membership = {
  userId: string; // IC: 100
  wallet?: string; // IC: 101
  status: MembershipStatus; // IC: 102
  roles: RoleKey[]; // IC: 103
  updatedAt: string; // IC: 104
}; // IC: 105
export type IntegrationClientOptions = {
  baseUrl: string; // IC: 106
  apiKey?: string; // IC: 107
}; // IC: 108
export type VerificationResult = {
  userId: string; // IC: 109
  wallet: string; // IC: 110
  verified: boolean; // IC: 111
  message?: string; // IC: 112
}; // IC: 113
