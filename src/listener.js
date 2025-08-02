const express = require("express");
const xrpl = require("xrpl");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Serve everything in /public correctly (no more __dirname + "..")
app.use(express.static(path.join(process.cwd(), "public")));

// ✅ Write to actual file inside /public
const FILE_PATH = path.join(process.cwd(), "public", "mint.json");

// 🔐 Your XRPL wallet
const WALLET = "rfx2mVhTZzc6bLXKeYyFKtpha2LHrkNZFT";

// 🚀 Start listening for XRPL mint transactions
async function main() {
  const client = new xrpl.Client("wss://xrplcluster.com");
  await client.connect();
  console.log("✅ Connected to XRPL, listening for mints...");

  await client.request({
    command: "subscribe",
    accounts: [WALLET],
  });

  client.on("transaction", (tx) => {
    console.log("🔵 TX received:", JSON.stringify(tx, null, 2));

    const { transaction, meta } = tx;
    if (
      transaction.TransactionType === "NFTokenMint" &&
      transaction.Account === WALLET &&
      meta.TransactionResult === "tesSUCCESS"
    ) {
      const mintTime = new Date().toISOString();
      console.log("🔥 GEN2 Possum Minted at", mintTime);

      // ✅ Save to /public/mint.json
      fs.writeFileSync(FILE_PATH, JSON.stringify({ lastMint: mintTime }));
      console.log("✅ mint.json updated successfully");
    }
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

main().catch(console.error);
