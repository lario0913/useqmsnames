import { Contract, JsonRpcProvider, ZeroAddress, getAddress, isAddress } from "ethers";

/** QMS Testnet deployment of the QMSNames contract. */
export const QMS_TESTNET = Object.freeze({
  chainId: 19480,
  rpc: "https://rpc.testnet.qms.finance",
  explorer: "https://testnet.qmsscan.io",
  contract: "0x21f5c1A44170F8396b95887b433515fc87898A38",
});

export const ABI = [
  "function resolve(string) view returns (address)",
  "function nameOf(address) view returns (string)",
  "function text(string,string) view returns (string)",
  "function available(string) view returns (bool)",
  "function expiresAt(string) view returns (uint256)",
  "function ownerOf(uint256) view returns (address)",
];

const TLD = ".qms";
const LABEL = /^[a-z0-9-]{3,63}$/;

/**
 * Turn "Alice.qms" / " alice " into "alice". Returns null if it is not a valid name.
 * Mirrors the on-chain rules: a-z, 0-9, hyphen; 3-63 chars; no leading/trailing hyphen.
 */
export function normalize(input) {
  if (typeof input !== "string") return null;
  let s = input.trim().toLowerCase();
  if (s.endsWith(TLD)) s = s.slice(0, -TLD.length);
  if (!LABEL.test(s) || s.startsWith("-") || s.endsWith("-")) return null;
  return s;
}

export function isValidName(input) {
  return normalize(input) !== null;
}

const shorten = (a) => a.slice(0, 6) + "…" + a.slice(-4);

/**
 * Create a resolver.
 * @param {object} [opts]
 * @param {import("ethers").Provider} [opts.provider] Any ethers v6 provider. Defaults to the public QMS Testnet RPC.
 * @param {string} [opts.contract] Override the contract address (for other networks).
 */
export function createQmsNames(opts = {}) {
  const provider = opts.provider ?? new JsonRpcProvider(QMS_TESTNET.rpc, QMS_TESTNET.chainId, { staticNetwork: true });
  const c = new Contract(opts.contract ?? QMS_TESTNET.contract, ABI, provider);

  return {
    normalize,
    isValidName,

    /** "alice.qms" -> "0x..." or null (unknown, expired, or invalid). */
    async resolve(name) {
      const label = normalize(name);
      if (!label) return null;
      const addr = await c.resolve(label);
      return addr === ZeroAddress ? null : getAddress(addr);
    },

    /** "0x..." -> "alice.qms" (the address's primary name) or null. Verified on-chain both ways. */
    async lookup(address) {
      if (!isAddress(address)) return null;
      const name = await c.nameOf(address);
      return name || null;
    },

    /** Read a text record such as "url", "description", "com.twitter". null if empty. */
    async getText(name, key) {
      const label = normalize(name);
      if (!label) return null;
      const v = await c.text(label, key);
      return v || null;
    },

    /** True if the name is valid and can be registered right now. */
    async isAvailable(name) {
      const label = normalize(name);
      if (!label) return false;
      return c.available(label);
    },

    /** Expiry as a Date, or null if the name has never been registered. */
    async expiry(name) {
      const label = normalize(name);
      if (!label) return null;
      const t = Number(await c.expiresAt(label));
      return t ? new Date(t * 1000) : null;
    },

    /** Handy for UIs: the primary name if there is one, else a shortened address. */
    async displayName(address) {
      if (!isAddress(address)) return String(address);
      return (await this.lookup(address)) ?? shorten(getAddress(address));
    },
  };
}
