export const cspRegions = {
  AWS: ["us-east-1", "us-west-2", "eu-central-1", "ap-northeast-2"],
  Azure: ["eastus", "westeurope", "southeastasia", "koreacentral"],
  GCP: ["us-central1", "europe-west1", "asia-east1", "asia-northeast3"],
} as const;

export type CSP = keyof typeof cspRegions;

export interface VNetConfig {
  id: string;
  name: string; // 추가
  subnetCount: number;
  hostsPerSubnet: number;
  useFirstNZones: number;
}

export interface NetworkConfig {
  id: string;
  csp: CSP;
  region: string;
  vnets: VNetConfig[];
}
