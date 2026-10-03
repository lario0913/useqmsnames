import { createQmsNames } from "../src/index.js";

const qms = createQmsNames(); // uses the public QMS Testnet RPC
const name = process.argv[2] ?? "alice";
console.log(name, "->", await qms.resolve(name));
console.log("available:", await qms.isAvailable(name));
