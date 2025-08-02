const express = require("express");
const xrpl = require("xrpl");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Serve everything in /public
app.use(express.static(path.join(__dirname, "..", "public")));

// ✅ Path to the actual file in /public
const FILE_PATH = path.join(__dirname, "..", "public", "mint.json");

// ✅ XRPL wallet
const WALLET = "rfx2mVhTZzc6bLXKeYyFKtpha2LHrkNZFT";

// ✅ Start XRPL listener
async function main() {
  const client = new xrpl.Client("wss://xrplcluster.com");
  await client.connect();
  console.log("✅ Connected to XRPL, listening for mints...");

  await client.request({
    command: "subscribe",
    accounts: [WALLET],
  });

  client.on("transaction", (tx) => {
    console.log("🔍 TX received:", JSON.stringify(tx, null, 2));

    const { transaction, meta } = tx;

    if (
      transaction.TransactionType === "NFTokenMint" &&
      transaction.Account === WALLET &&
      meta.TransactionResult === "tesSUCCESS"
    ) {
      const mintTime = new Date().toISOString();
      console.log("🔥 GEN2 minted with timestamp:", mintTime);

      try {
        fs.writeFileSync(FILE_PATH, JSON.stringify({ lastMint: mintTime }));
        console.log("✅ mint.json updated successfully");
      } catch (err) {
        console.error("❌ Failed to write mint.json:", err);
      }
    }
  });
}

// ✅ Start HTTP server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ Start XRPL logic
main().catch(console.error);
