const express = require("express");
const xrpl = require("xrpl");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// === Path to mint.json in root folder ===
const FILE_PATH = path.join(__dirname, "mint.json");

// === Serve mint.json publicly ===
app.get("/mint.json", (req, res) => {
  console.log("Serving mint.json...");
  res.sendFile(FILE_PATH);
});

// === Start Express server ===
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// === XRPL listener ===
const WALLET = "rfx2mVhTZzc6bLXKeYyFKtpha2LHrkNZFT"; // Your GEN2 issuer wallet

async function main() {
  const client = new xrpl.Client("wss://xrplcluster.com");
  await client.connect();
  console.log("Connected to XRPL, watching for mints from:", WALLET);

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
      console.log("GEN2 Possum Minted at", mintTime);

      fs.writeFileSync(FILE_PATH, JSON.stringify({ lastMint: mintTime }));
      console.log("Updated mint.json ✅");
    }
  });
}

main().catch((err) => {
  console.error("Error in XRPL listener:", err);
});
