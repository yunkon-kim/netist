// 'use client';
// import { VNetConfig } from "@/types/types";
// import styles from '@/styles/design/design.module.css';

// interface VNetFormProps {
//   config: VNetConfig;
//   onUpdate: (updates: Partial<VNetConfig>) => void;
//   onRemove: () => void;
// }

// function VNetForm({ config, onUpdate, onRemove }: VNetFormProps) {
//   return (
//     <div className={styles.vnetForm}>
//       <div className={styles.formHeader}>
//         <h4 className={styles.vnetTitle}>vNet Configuration</h4>
//         <button
//           onClick={onRemove}
//           className={styles.removeButton}
//           aria-label="Remove vNet"
//         >
//           ×
//         </button>
//       </div>
//       <div className={styles.inputGroup}>
//         <input
//           type="number"
//           className={styles.formInput}
//           placeholder="Subnet Count"
//           min="1"
//           value={config.subnetCount}
//           onChange={(e) => onUpdate({ subnetCount: parseInt(e.target.value) || 1 })}
//         />
//         <input
//           type="number"
//           className={styles.formInput}
//           placeholder="Hosts per Subnet"
//           min="2"
//           value={config.hostsPerSubnet}
//           onChange={(e) => onUpdate({ hostsPerSubnet: parseInt(e.target.value) || 2 })}
//         />
//         <input
//           type="number"
//           className={styles.formInput}
//           placeholder="Use First N Zones"
//           min="1"
//           max="3"
//           value={config.useFirstNZones}
//           onChange={(e) => onUpdate({ useFirstNZones: parseInt(e.target.value) || 1 })}
//         />
//       </div>
//     </div>
//   );
// }

// interface RegionSectionProps {
//   name: string;
//   vNets: VNetConfig[];
//   onAddVNet: () => void;
//   onUpdateVNet: (vNetId: string, updates: Partial<VNetConfig>) => void;
//   onRemoveVNet: (vNetId: string) => void;
// }

// function RegionSection({ name, vNets, onAddVNet, onUpdateVNet, onRemoveVNet }: RegionSectionProps) {
//   return (
//     <div className={styles.regionSection}>
//       <div className={styles.regionHeader}>
//         <h3 className={styles.regionTitle}>{name}</h3>
//         <button
//           className={styles.addButton}
//           onClick={onAddVNet}
//         >
//           Add vNet
//         </button>
//       </div>
//       {vNets.map(vNet => (
//         <VNetForm
//           key={vNet.id}
//           config={vNet}
//           onUpdate={(updates) => onUpdateVNet(vNet.id, updates)}
//           onRemove={() => onRemoveVNet(vNet.id)}
//         />
//       ))}
//     </div>
//   );
// }

// interface CspSectionProps {
//   config: CspConfiguration;
//   regions: readonly string[];
//   onAddRegion: (cspId: string, regionName: string) => void;
//   onAddVNet: (cspId: string, regionName: string) => void;
//   onUpdateVNet: (cspId: string, regionName: string, vNetId: string, updates: Partial<VNetConfig>) => void;
//   onRemoveVNet: (cspId: string, regionName: string, vNetId: string) => void;
//   onRemove: () => void;
// }

// export function CspSection({
//   config,
//   regions,
//   onAddRegion,
//   onAddVNet,
//   onUpdateVNet,
//   onRemoveVNet,
//   onRemove
// }: CspSectionProps) {
//   const [selectedRegion, setSelectedRegion] = useState(regions[0]);

//   return (
//     <div className={`${styles.cspSection} csp-section`}>
//       <div className={styles.cspHeader}>
//         <h2 className={styles.cardTitle}>{config.name}</h2>
//         <button
//           onClick={onRemove}
//           className={styles.removeButton}
//           aria-label="Remove CSP section"
//         >
//           ×
//         </button>
//       </div>

//       <div className={styles.regionSelector}>
//         <select
//           className={styles.formSelect}
//           value={selectedRegion}
//           onChange={(e) => setSelectedRegion(e.target.value)}
//         >
//           {regions.map(region => (
//             <option key={region} value={region}>{region}</option>
//           ))}
//         </select>
//         <button
//           className={styles.addButton}
//           onClick={() => onAddRegion(config.id, selectedRegion)}
//         >
//           Add Region
//         </button>
//       </div>

//       {config.regions.map(region => (
//         <RegionSection
//           key={region.name}
//           name={region.name}
//           vNets={region.vNets}
//           onAddVNet={() => onAddVNet(config.id, region.name)}
//           onUpdateVNet={(vNetId, updates) => onUpdateVNet(config.id, region.name, vNetId, updates)}
//           onRemoveVNet={(vNetId) => onRemoveVNet(config.id, region.name, vNetId)}
//         />
//       ))}
//     </div>
//   );
