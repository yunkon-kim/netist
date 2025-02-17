import path from "path";
import { promises as fs } from "fs";

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const TB_API_USERNAME = process.env.TB_API_USERNAME;
  const TB_API_PASSWORD = process.env.TB_API_PASSWORD;

  const auth = Buffer.from(`${TB_API_USERNAME}:${TB_API_PASSWORD}`).toString(
    "base64"
  );

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `API request failed: ${response.statusText}`
    );
  }

  return response.json();
}

const CSP_ASSET_FILE = path.join(process.cwd(), "assets", "csp-regions.json");
const TB_REST_ENDPOINT =
  process.env.NEXT_PUBLIC_TB_REST_URL || "http://localhost:1323/tumblebug";

interface Location {
  display: string;
  latitude: string;
  longitude: string;
}

interface RegionDetail {
  regionId: string;
  regionName: string;
  description: string;
  location: Location;
  zones: string[];
}

interface IdList {
  output: string[];
}

interface RegionList {
  regions: RegionDetail[];
}

export async function checkTumblebugStatus(): Promise<boolean> {
  if (!TB_REST_ENDPOINT) {
    console.error("Tumblebug REST URL is not configured");
    return false;
  }

  const response = await fetch(`${TB_REST_ENDPOINT}/readyz`, {
    method: "GET",
    cache: "no-store",
  });
  if (!response.ok) {
    console.warn("Tumblebug health check failed:", response.statusText);
    return false;
  }

  return response.ok;
}

export async function GetProviders(): Promise<string[]> {
  if (!TB_REST_ENDPOINT) {
    throw new Error("Tumblebug REST URL is not configured");
  }

  try {
    const data = await fetchWithAuth<IdList>(`${TB_REST_ENDPOINT}/provider`);
    // console.log("Response from the API server:", data);
    return data.output; // ["aws", "azure", "gcp", ... ]
  } catch (error) {
    console.error("Failed to get providers:", error);
    throw error;
  }
}

export async function GetRegions(provider: string): Promise<RegionDetail[]> {
  try {
    const data = await fetchWithAuth<RegionList>(
      `${TB_REST_ENDPOINT}/provider/${provider.toLowerCase()}/region`
    );
    // console.log(data);
    return data.regions;
  } catch (error) {
    console.error("Failed to get regions:", error);
    throw error;
  }
}

export type ProviderRegionsMap = {
  [key: string]: string[];
};

export async function saveCspRegionsToFile(
  data: ProviderRegionsMap
): Promise<void> {
  await fs.mkdir(path.dirname(CSP_ASSET_FILE), { recursive: true });
  await fs.writeFile(CSP_ASSET_FILE, JSON.stringify(data, null, 2));
}

export async function loadProvidersAndRegionsFromFile(): Promise<ProviderRegionsMap> {
  try {
    const data = await fs.readFile(CSP_ASSET_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load CSP regions from file:", error);
    return {};
  }
}

export async function initializeProvidersAndRegions() {
  try {
    const ready = await checkTumblebugStatus();

    if (ready) {
      console.log("Tumblebug is ready");
      const providers = await GetProviders();
      const providerAndRegions: ProviderRegionsMap = {};

      for (const provider of providers) {
        const regions = await GetRegions(provider);
        providerAndRegions[provider] = regions.map((region) => region.regionId);
      }
      await saveCspRegionsToFile(providerAndRegions);
      return;
    }
    console.log("Tumblebug is not ready, using cached data if available");
  } catch (error) {
    console.log(
      "Could not connect to Tumblebug, using cached data if available:",
      error
    );
    // Don't rethrow the error, just log it and continue
  }
}
