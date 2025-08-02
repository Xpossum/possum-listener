const express = require("express");
const xrpl = require("xrpl");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// 🔐 This will serve your mint.json file publicly
const FILE_PATH = path.resolve(__dirname, "mint.json");

app.get("/mint.json", (req, res) => {
  console.log("Serving mint.json...");
  res.sendFile(FILE_PATH);
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

// 🚀 XRPL Mint Listener
const WALLET = "rfx2mVhTZzc6bLXKeYyFKtpha2LHrkNZFT";

async function main() {
  const client = new xrpl.Client("wss://xrplcluster.com");
  await client.connect();
  console.log("🎧 Listening for NFT mints from:", WALLET);

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

      try {
        fs.writeFileSync(FILE_PATH, JSON.stringify({ lastMint: mintTime }));
        console.log("✅ mint.json updated successfully");
      } catch (err) {
        console.error("❌ Failed to write mint.json:", err);
      }
    }
  });
}

main().catch(console.error);
