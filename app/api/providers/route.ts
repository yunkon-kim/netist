import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CSP_ASSET_FILE = path.join(process.cwd(), "assets", "csp-regions.json");

// Define custom order for CSPs
const CSP_ORDER = [
  "aws",
  "azure",
  "gcp",
  "alibaba",
  "ibm",
  "tencent",
  "ncpvpc",
  "ncp",
  "nhncloud",
  "ktcloudvpc",
  "openstack",
];

function customSort(providers: string[]): string[] {
  return providers.sort((a, b) => {
    const indexA = CSP_ORDER.indexOf(a);
    const indexB = CSP_ORDER.indexOf(b);

    // If both providers are in the CSP_ORDER array
    if (indexA >= 0 && indexB >= 0) {
      return indexA - indexB;
    }
    // If only a is in the CSP_ORDER array
    if (indexA >= 0) {
      return -1;
    }
    // If only b is in the CSP_ORDER array
    if (indexB >= 0) {
      return 1;
    }
    // If neither is in the CSP_ORDER array, sort alphabetically
    return a.localeCompare(b);
  });
}

export async function GET() {
  try {
    const fileContents = await fs.promises.readFile(CSP_ASSET_FILE, "utf8");
    const data = JSON.parse(fileContents);

    // Sort providers using custom order and regions alphabetically
    const sortedData = customSort(Object.keys(data)).reduce((acc, provider) => {
      acc[provider] = data[provider].sort();
      return acc;
    }, {} as Record<string, string[]>);

    return NextResponse.json(sortedData);
  } catch (error) {
    console.error("Error reading providers:", error);
    return NextResponse.json(
      { error: "Failed to load providers" },
      { status: 500 }
    );
  }
}
