const express = require("express");
const xrpl = require("xrpl");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Serve static files from /public (no ".." needed now)
app.use(express.static(path.join(__dirname, "public")));

const FILE_PATH = path.join(__dirname, "public", "mint.json");
const WALLET = "rfx2mVhTZzc6bLXKeYyFKtpha2LHrkNZFT";

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// ✅ Start XRPL listener
async function main() {
  const client = new xrpl.Client("wss://xrplcluster.com");
  await client.connect();
  console.log("🟢 Connected to XRPL, listening for mints...");

  await client.request({
    command: "subscribe",
    accounts: [WALLET],
  });

  client.on("transaction", (tx) => {
    const { transaction, meta } = tx;

    if (
      transaction.TransactionType === "NFTokenMint" &&
      transaction.Account === WALLET &&
      meta.TransactionResult === "tesSUCCESS"
    ) {
      const mintTime = new Date().toISOString();
      console.log("🔥 GEN2 Possum Minted at", mintTime);

      fs.writeFileSync(FILE_PATH, JSON.stringify({ lastMint: mintTime }));
      console.log("✅ mint.json updated successfully");
    }
  });
}

main().catch(console.error);
