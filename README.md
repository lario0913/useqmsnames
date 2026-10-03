# qms-names

Show `.qms` names in your app. Resolve `alice.qms` to an address and an address back to its name on QMS Network, in a few lines.

Works with [ethers v6](https://docs.ethers.org/v6/). Currently points at **QMS Testnet** (chain ID 19480).

## Install

```bash
npm install qms-names ethers
```

## Quick start

```js
import { createQmsNames } from "qms-names";

const qms = createQmsNames(); // uses the public QMS Testnet RPC

await qms.resolve("alice.qms");        // "0x…" or null
await qms.lookup("0x…");               // "alice.qms" or null (the address's primary name)
await qms.displayName("0x…");          // "alice.qms", or "0x1234…abcd" if none
await qms.getText("alice", "url");     // text record or null
await qms.isAvailable("alice");        // true / false
await qms.expiry("alice");             // Date or null
```

Pass your own provider (for example the one your app already uses):

```js
const qms = createQmsNames({ provider });
```

## What apps and wallets should do

Wherever you show an address, show the primary name instead when one exists:

```js
const label = await qms.displayName(address); // falls back to a short address
```

`lookup` is checked in both directions on-chain: the name must still be registered, unexpired, and owned by that address. Show it without extra verification.

### React

```jsx
import { useEffect, useState } from "react";
import { createQmsNames } from "qms-names";

const qms = createQmsNames();

export function useQmsName(address) {
  const [name, setName] = useState(null);
  useEffect(() => {
    if (!address) return;
    let live = true;
    qms.lookup(address).then((n) => live && setName(n)).catch(() => {});
    return () => { live = false; };
  }, [address]);
  return name;
}
```

### Not using ethers? (viem example)

```js
import { createPublicClient, http, parseAbi } from "viem";

const client = createPublicClient({ transport: http("https://rpc.testnet.qms.finance") });
const name = await client.readContract({
  address: "0x21f5c1A44170F8396b95887b433515fc87898A38",
  abi: parseAbi(["function nameOf(address) view returns (string)"]),
  functionName: "nameOf",
  args: [address],
});
```

Any library works: call `nameOf(address)` or `resolve(string label)` on the contract.

## API

| Function | Returns |
| --- | --- |
| `createQmsNames({ provider?, contract? })` | resolver object |
| `resolve(name)` | address or `null` (unknown, expired or invalid) |
| `lookup(address)` | primary name like `alice.qms`, or `null` |
| `displayName(address)` | primary name, else shortened address |
| `getText(name, key)` | text record or `null` |
| `isAvailable(name)` | `boolean` |
| `expiry(name)` | `Date` or `null` |
| `normalize(name)` | `"alice"` or `null` if invalid |
| `isValidName(name)` | `boolean` |

Names are lowercase `a-z`, `0-9` and `-`, 3 to 63 characters. `Alice.QMS` is normalized to `alice` automatically.

## Network

| | |
| --- | --- |
| Chain ID | 19480 |
| RPC | https://rpc.testnet.qms.finance |
| Contract | `0x21f5c1A44170F8396b95887b433515fc87898A38` |
| Explorer | https://testnet.qmsscan.io |

The public RPC is rate limited, so avoid calling it in a tight loop. Cache results where you can.

## Notes

- Testnet only for now. Names have no value and may be reset.
- Names expire. `resolve` returns `null` once a name has expired.
- Not ENS. Apps that only support ENS will not show `.qms` names until they use this package or call the contract.

## License

MIT
