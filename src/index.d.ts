import type { Provider } from "ethers";

export declare const QMS_TESTNET: Readonly<{ chainId: number; rpc: string; explorer: string; contract: string }>;
export declare const ABI: string[];

/** "Alice.qms" -> "alice"; null when invalid. */
export declare function normalize(input: string): string | null;
export declare function isValidName(input: string): boolean;

export interface QmsNames {
  normalize: typeof normalize;
  isValidName: typeof isValidName;
  resolve(name: string): Promise<string | null>;
  lookup(address: string): Promise<string | null>;
  getText(name: string, key: string): Promise<string | null>;
  isAvailable(name: string): Promise<boolean>;
  expiry(name: string): Promise<Date | null>;
  displayName(address: string): Promise<string>;
}

export declare function createQmsNames(opts?: { provider?: Provider; contract?: string }): QmsNames;
