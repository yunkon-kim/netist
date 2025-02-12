export type CSP =
  | "aws"
  | "azure"
  | "gcp"
  | "alibaba"
  | "ibm"
  | "tencent"
  | "ncpvpc"
  | "ncp"
  | "nhncloud"
  | "ktcloudvpc"
  | "openstack";

export interface VNetConfig {
  id: string;
  name: string;
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
