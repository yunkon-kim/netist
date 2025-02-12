import { VNetConfig } from "@/types/types";
import styles from "@/styles/design/design.module.css";

interface VNetFormProps {
  vnet: VNetConfig;
  vnetIndex: number;
  onUpdate: (updates: Partial<VNetConfig>) => void;
  onRemove: () => void;
}

export default function VNetForm({ vnet, vnetIndex, onUpdate, onRemove }: VNetFormProps) {
  return (
    <div className={styles.vnetSection}>
      <div className={styles.vnetHeader}>
        <h4>Virtual Network (vnet-{vnetIndex.toString().padStart(2, "0")})</h4>
        <button
          onClick={onRemove}
          className={styles.removeButton}
          aria-label="Remove VNet"
        >
          ×
        </button>
      </div>
      <div className={styles.formFields}>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Desired number of subnets</label>
          <input
            type="number"
            className={styles.formInput}
            min="1"
            value={vnet.subnetCount}
            onChange={(e) =>
              onUpdate({
                subnetCount: parseInt(e.target.value) || 1,
              })
            }
          />
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Desired hosts per subnet</label>
          <input
            type="number"
            className={styles.formInput}
            min="2"
            value={vnet.hostsPerSubnet}
            onChange={(e) =>
              onUpdate({
                hostsPerSubnet: parseInt(e.target.value) || 2,
              })
            }
          />
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>First N zones to use</label>
          <input
            type="number"
            className={styles.formInput}
            min="1"
            max="3"
            value={vnet.useFirstNZones}
            onChange={(e) =>
              onUpdate({
                useFirstNZones: parseInt(e.target.value) || 1,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
