const xrpl = require("xrpl");
const fs = require("fs");

const WALLET = "rfx2mVhTZzc6bLXKeYyFKtpha2LHrkNZFT";
const MINT_FILE = "mint.json";

async function main() {
  const client = new xrpl.Client("wss://xrplcluster.com");
  await client.connect();
  console.log("🔗 Connected to XRPL");

  await client.request({ command: "subscribe", accounts: [WALLET] });

  client.on("transaction", (event) => {
  const tx = event.transaction;
  console.log("📦 Incoming transaction:", tx.TransactionType, "from", tx.Account);

  if (tx.TransactionType === "NFTokenMint" && tx.Account === WALLET) {
    const timestamp = new Date().toISOString();
    console.log("🎉 ▶️  NFTokenMint detected! Writing mint.json…");
    fs.writeFileSync(MINT_FILE, JSON.stringify({ lastMint: timestamp }, null, 2));
    console.log("📝  mint.json updated:", timestamp);
  }
});
}

main().catch(console.error);