"use client";

import { useState, useEffect } from "react";
import { CSP, NetworkConfig, VNetConfig } from "@/types/types";
// import { ProviderRegionsMap, loadProvidersAndRegions } from "@/types/providers";
import styles from "@/styles/design/design.module.css";

export type ProviderRegionsMap = {
  [key: string]: string[];
};

export async function loadProvidersAndRegions(): Promise<ProviderRegionsMap> {
  try {
    const response = await fetch("/api/providers");
    if (!response.ok) {
      throw new Error("Failed to fetch providers");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading providers:", error);
    return {
      aws: ["us-east-1", "us-west-2", "eu-central-1", "ap-northeast-2"].sort(),
      azure: ["eastus", "westeurope", "southeastasia", "koreacentral"].sort(),
      gcp: [
        "us-central1",
        "europe-west1",
        "asia-east1",
        "asia-northeast3",
      ].sort(),
    };
  }
}

function getKoreaRegion(provider: string): string {
  switch (provider) {
    case "aws":
      return "ap-northeast-2";
    case "azure":
      return "koreacentral";
    case "gcp":
      return "asia-northeast3";
    case "alibaba":
      return "ap-northeast-1";
    // case "ibm":
    //   return "xxx";
    case "tencent":
      return "ap-seoul";
    case "ncpvpc":
      return "KR";
    case "ncp":
      return "KR";
    case "nhncloud":
      return "KR1";
    case "ktcloudvpc":
      return "KR1";
    // case "openstack":
    //   return "xxx" ;
    default:
      return "";
  }
}

export default function DesignForm() {
  // Initialize with empty providers to avoid hydration mismatch
  const [providers, setProviders] = useState<ProviderRegionsMap>({});
  const [networkConfigs, setNetworkConfigs] = useState<NetworkConfig[]>([]);
  const [selectedCsp, setSelectedCsp] = useState<CSP>("aws");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [privateNetwork, setPrivateNetwork] = useState("10.0.0.0/8");
  const [supernetting, setSupernetting] = useState(true);
  const [generatedJson, setGeneratedJson] = useState<string>("");
  const [isJsonVisible, setIsJsonVisible] = useState(false);
  const [networkName, setNetworkName] = useState<string>("netist");

  const generateVNetName = (index: number): string => {
    return `${networkName}-vnet-${index.toString().padStart(2, "0")}`;
  };

  const addCspRegion = () => {
    // Check for duplicate region
    const isDuplicate = networkConfigs.some(
      (config) => config.csp === selectedCsp && config.region === selectedRegion
    );
    if (isDuplicate) {
      alert("This CSP region is already added!");
      return;
    }

    const newConfig: NetworkConfig = {
      id: `${selectedCsp}+${selectedRegion}`,
      csp: selectedCsp,
      region: selectedRegion,
      vnets: [
        {
          id: `${selectedCsp}+${selectedRegion}`,
          name: generateVNetName(1), // First VNet
          subnetCount: 2,
          hostsPerSubnet: 500,
          useFirstNZones: 2,
        },
      ],
    };

    setNetworkConfigs((prev) => [...prev, newConfig]);
  };

  const addVNet = (configId: string) => {
    setNetworkConfigs((prev) => {
      const totalVNets = prev.reduce(
        (sum, config) => sum + config.vnets.length,
        0
      );
      return prev.map((config) => {
        if (config.id === configId) {
          return {
            ...config,
            vnets: [
              ...config.vnets,
              {
                id: generateVNetName(totalVNets + 1),
                name: generateVNetName(totalVNets + 1),
                subnetCount: 2,
                hostsPerSubnet: 500,
                useFirstNZones: 2,
              },
            ],
          };
        }
        return config;
      });
    });
  };

  const updateVNet = (
    configId: string,
    vnetId: string,
    updates: Partial<VNetConfig>
  ) => {
    setNetworkConfigs((prev) =>
      prev.map((config) => {
        if (config.id === configId) {
          return {
            ...config,
            vnets: config.vnets.map((vnet) =>
              vnet.id === vnetId ? { ...vnet, ...updates } : vnet
            ),
          };
        }
        return config;
      })
    );
  };

  const removeVNet = (configId: string, vnetId: string) => {
    setNetworkConfigs((prev) => {
      // First, remove the VNet
      const updatedConfigs = prev.map((config) => {
        if (config.id === configId) {
          return {
            ...config,
            vnets: config.vnets.filter((vnet) => vnet.id !== vnetId),
          };
        }
        return config;
      });

      // Then, update all VNet names with new indices
      let globalIndex = 1;
      return updatedConfigs.map((config) => ({
        ...config,
        vnets: config.vnets.map((vnet) => ({
          ...vnet,
          name: generateVNetName(globalIndex++),
          id: generateVNetName(globalIndex - 1), // Update ID to match new name
        })),
      }));
    });
  };

  const removeCspRegion = (configId: string) => {
    setNetworkConfigs((prev) => {
      // First, remove the CSP region
      const filteredConfigs = prev.filter((config) => config.id !== configId);

      // Then, update all VNet names with new indices
      let globalIndex = 1;
      return filteredConfigs.map((config) => ({
        ...config,
        vnets: config.vnets.map((vnet) => ({
          ...vnet,
          name: generateVNetName(globalIndex++),
          id: generateVNetName(globalIndex - 1), // Update ID to match new name
        })),
      }));
    });
  };

  const generateNetworkJson = () => {
    // Input validation
    if (!networkName.trim()) {
      alert("Please enter a network name");
      return;
    }

    if (networkConfigs.length === 0) {
      alert("Please add at least one CSP region");
      return;
    }

    const hasEmptyVnets = networkConfigs.some(
      (config) => config.vnets.length === 0
    );
    if (hasEmptyVnets) {
      alert("Please add at least one VNet for each CSP region");
      return;
    }

    const configData = {
      name: networkName,
      privateNetwork,
      supernetting,
      csps: networkConfigs.reduce((acc, config) => {
        // Initialize CSP if not exists
        if (!acc[config.csp]) {
          acc[config.csp] = {};
        }

        // Add VNet list to Region
        acc[config.csp][config.region] = config.vnets.map(
          ({ id, ...vnet }) => ({
            ...vnet,
          })
        );

        return acc;
      }, {} as Record<CSP, Record<string, Array<Omit<VNetConfig, "id">>>>),
    };

    const jsonString = JSON.stringify(configData, null, 2);
    setGeneratedJson(jsonString);
    setIsJsonVisible(true);
  };

  // Calculate global VNet index
  const calculateGlobalVnetIndex = (
    currentConfigIndex: number,
    vnetIndex: number
  ): number => {
    let totalIndex = 0;

    // Sum all VNets from previous configs
    for (let i = 0; i < currentConfigIndex; i++) {
      totalIndex += networkConfigs[i].vnets.length;
    }

    // Add current VNet index
    return totalIndex + vnetIndex + 1;
  };

  // Update VNet names function
  const updateVNetNames = () => {
    setNetworkConfigs((prev) => {
      let vnetIndex = 1;
      return prev.map((config) => ({
        ...config,
        vnets: config.vnets.map((vnet) => {
          const updatedVNet = {
            ...vnet,
            name: generateVNetName(vnetIndex),
          };
          vnetIndex++;
          return updatedVNet;
        }),
      }));
    });
  };

  // Update all VNet names when networkName changes
  useEffect(() => {
    if (networkConfigs.length > 0) {
      updateVNetNames();
    }
  }, [networkName]);

  useEffect(() => {
    async function initializeProviders() {
      try {
        const providerRegionMap = await loadProvidersAndRegions();
        setProviders(providerRegionMap);

        // Set initial selections after data is loaded
        const firstProvider = Object.keys(providerRegionMap)[0] as CSP;
        setSelectedCsp(firstProvider);

        const koreaRegion = getKoreaRegion(firstProvider);
        if (
          koreaRegion &&
          providerRegionMap[firstProvider].includes(koreaRegion)
        ) {
          setSelectedRegion(koreaRegion);
        } else {
          setSelectedRegion(providerRegionMap[firstProvider][0]);
        }
      } catch (error) {
        console.error("Failed to initialize providers:", error);
        const fallbackProviders = {
          aws: ["us-east-1"],
          azure: ["eastus"],
          gcp: ["us-central1"],
        };
        setProviders(fallbackProviders);
        setSelectedCsp("aws");
        setSelectedRegion("us-east-1");
      }
    }

    initializeProviders();
  }, []);

  return (
    <div className={styles.containerFluid}>
      <aside className={styles.sidebar}>
        <h3 className={styles.title}>Design! ✨☁️</h3>
        <h3 className={styles.title}>Your multi-cloud network</h3>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Cloud Service Provider</label>
          <select
            className={styles.formSelect}
            value={selectedCsp}
            onChange={(e) => {
              const newCsp = e.target.value as CSP;
              setSelectedCsp(newCsp);
              const krRegion = getKoreaRegion(newCsp);
              {
                krRegion != ""
                  ? setSelectedRegion(krRegion)
                  : setSelectedRegion(providers[newCsp][0]);
              }
            }}
          >
            {Object.keys(providers).map((csp) => (
              <option key={csp} value={csp}>
                {csp}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Region</label>
          <select
            className={styles.formSelect}
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            {providers[selectedCsp]?.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <button className={styles.buttonPrimary} onClick={addCspRegion}>
            Add CSP Region
          </button>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Private Network</label>
          <select
            className={styles.formSelect}
            value={privateNetwork}
            onChange={(e) => setPrivateNetwork(e.target.value)}
          >
            <option value="10.0.0.0/8">10.0.0.0/8</option>
            <option value="172.16.0.0/12">172.16.0.0/12</option>
            <option value="192.168.0.0/16">192.168.0.0/16</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Enable supernetting</label>
          <select
            className={styles.formSelect}
            value={String(supernetting)}
            onChange={(e) => setSupernetting(e.target.value === "true")}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Network Name</label>
          <input
            type="text"
            className={styles.formInput}
            value={networkName}
            onChange={(e) => setNetworkName(e.target.value)}
            placeholder="Enter network name"
          />
          <div className={styles.buttonContainer}>
            <button
              className={styles.buttonSuccess}
              onClick={generateNetworkJson}
            >
              Generate a desired multi-cloud network
            </button>
          </div>
        </div>
      </aside>

      <main className={styles.content}>
        <div className={styles.configurations}>
          {networkConfigs.map((config, configIndex) => (
            <div key={config.id} className={styles.networkSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleGroup}>
                  <h3 className={styles.sectionTitle}>
                    {config.csp} - {config.region}
                  </h3>
                </div>
                <button
                  onClick={() => removeCspRegion(config.id)}
                  className={styles.removeButton}
                  aria-label="Remove CSP region"
                >
                  ×
                </button>
              </div>

              <div className={styles.vnetHeader}>
                <h4>Virtual Networks</h4>
                <button
                  className={styles.addVNetButton}
                  onClick={() => addVNet(config.id)}
                >
                  Add
                </button>
              </div>

              {config.vnets.length === 0 ? (
                <div className={styles.emptyState}>
                  Click "Add" button to create a virtual network
                </div>
              ) : (
                <table className={styles.vnetTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Desired number of subnets</th>
                      <th>Desired hosts per subnet</th>
                      <th>First N zones to use</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.vnets.map((vnet, vnetIndex) => (
                      <tr key={vnet.id}>
                        <td>
                          vnet-
                          {calculateGlobalVnetIndex(configIndex, vnetIndex)
                            .toString()
                            .padStart(2, "0")}
                        </td>
                        <td>
                          <input
                            type="number"
                            className={styles.formInput}
                            min="1"
                            value={vnet.subnetCount}
                            onChange={(e) =>
                              updateVNet(config.id, vnet.id, {
                                subnetCount: parseInt(e.target.value) || 1,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className={styles.formInput}
                            min="2"
                            value={vnet.hostsPerSubnet}
                            onChange={(e) =>
                              updateVNet(config.id, vnet.id, {
                                hostsPerSubnet: parseInt(e.target.value) || 2,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className={styles.formInput}
                            min="1"
                            max="3"
                            value={vnet.useFirstNZones}
                            onChange={(e) =>
                              updateVNet(config.id, vnet.id, {
                                useFirstNZones: parseInt(e.target.value) || 1,
                              })
                            }
                          />
                        </td>
                        <td>
                          <button
                            onClick={() => removeVNet(config.id, vnet.id)}
                            className={styles.vnetRemoveButton}
                            aria-label="Remove VNet"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>

        {isJsonVisible && generatedJson && (
          <div className={styles.jsonContainer}>
            <h3>Desired Multi-Cloud Network</h3>
            <pre className={styles.codeBlock}>
              <code>{generatedJson}</code>
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
