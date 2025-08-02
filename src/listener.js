const express = require("express");
const xrpl = require("xrpl");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Path to mint.json (one level up from src folder)
const FILE_PATH = path.join(__dirname, "..", "mint.json");

// ✅ Serve mint.json at /mint.json
app.get("/mint.json", (req, res) => {
  console.log("Serving mint.json...");
  res.sendFile(FILE_PATH);
});

// ✅ Start Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// ✅ XRPL Listener Setup
const WALLET = "rfx2mVhTZzc6bLXKeYyFKtpha2LHrkNZFT";

async function main() {
  const client = new xrpl.Client("wss://xrplcluster.com");
  await client.connect();
  console.log("Listening for NFT mints from:", WALLET);

  await client.request({
    command: "subscribe",
    accounts: [WALLET],
  });

  client.on("transaction", (tx) => {
    console.log("Received tx:", JSON.stringify(tx, null, 2));

    const { transaction, meta } = tx;
    if (
      transaction.TransactionType === "NFTokenMint" &&
      transaction.Account === WALLET &&
      meta.TransactionResult === "tesSUCCESS"
    ) {
      const mintTime = new Date().toISOString();
      console.log("✅ GEN2 Possum Minted at:", mintTime);

      // ✅ Save timestamp to mint.json
      fs.writeFileSync(FILE_PATH, JSON.stringify({ lastMint: mintTime }));
      console.log("✅ mint.json updated at:", FILE_PATH);
    }
  });
}

main().catch(console.error);
