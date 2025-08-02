const express = require("express");
const xrpl = require("xrpl");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Serve static files in /public
app.use(express.static(path.join(__dirname, "..", "public")));

// ✅ Path to the actual mint.json file
const FILE_PATH = path.join(__dirname, "..", "public", "mint.json");

// ✅ XRPL Issuer Wallet
const WALLET = "rfx2mVhTZzc6bLXKeYyFKtpha2LHrkNZFT";

// ✅ Start web server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

// ✅ Start XRPL listener
async function main() {
  const client = new xrpl.Client("wss://xrplcluster.com");
  await client.connect();
  console.log("📡 Connected to XRPL, listening for mints...");

  await client.request({
    command: "subscribe",
    accounts: [WALLET],
  });

  client.on("transaction", (tx) => {
    console.log("🔄 TX received:", JSON.stringify(tx, null, 2));

    const { transaction, meta } = tx;

    if (
      transaction.TransactionType === "NFTokenMint" &&
      transaction.Account === WALLET &&
      meta?.TransactionResult === "tesSUCCESS"
    ) {
      const mintTime = new Date().toISOString();
      console.log("🔥 GEN2 Possum Minted at", mintTime);

      try {
        fs.writeFileSync(FILE_PATH, JSON.stringify({ lastMint: mintTime }));
        console.log("✅ mint.json updated successfully");
      } catch (err) {
        console.error("❌ Error writing mint.json:", err);
      }
    }
  });
}

main().catch((err) => {
  console.error("❌ Listener error:", err);
});
