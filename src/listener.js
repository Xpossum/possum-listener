const express = require("express");
const xrpl = require("xrpl");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Serve everything in /public
app.use(express.static(path.join(__dirname, "..", "public")));

// ✅ Path to /public/mint.json
const FILE_PATH = path.join(__dirname, "..", "public", "mint.json");

// ✅ Your XRPL wallet address
const WALLET = "rfx2mVhTZzc6bLXKeYyFKtpha2LHrkNZFT";

// ✅ Start Express server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

// ✅ XRPL Listener logic
async function main() {
  const client = new xrpl.Client("wss://xrplcluster.com");
  await client.connect();
  console.log(`🔌 Connected to XRPL, listening for mints from: ${WALLET}`);

  await client.request({
    command: "subscribe",
    accounts: [WALLET],
  });

  client.on("transaction", (tx) => {
    console.log("📦 TX received:", JSON.stringify(tx, null, 2));

    const { transaction, meta } = tx;

    if (
      transaction.TransactionType === "NFTokenMint" &&
      transaction.Account === WALLET &&
      meta.TransactionResult === "tesSUCCESS"
    ) {
      const mintTime = new Date().toISOString();
      console.log("🔥 GEN2 Possum Minted at", mintTime);

      try {
        fs.writeFileSync(FILE_PATH, JSON.stringify({ lastMint: mintTime }));
        console.log("✅ mint.json updated successfully");
      } catch (err) {
        console.error("❌ Failed to write mint.json:", err);
      }
    }
  });
}

main().catch((err) => {
  console.error("❌ Listener failed:", err);
});
