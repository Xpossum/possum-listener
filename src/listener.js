const express = require("express");
const xrpl = require("xrpl");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ====== Define file path to mint.json ======
const FILE_PATH = path.join(__dirname, "..", "mint.json");

// ====== Serve mint.json publicly ======
app.get("/mint.json", (req, res) => {
  console.log("Serving mint.json...");
  res.sendFile(FILE_PATH);
});

// ====== Start Express server ======
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// ====== XRPL Listener logic ======
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
      console.log("GEN2 Possum Minted at", mintTime);

      // ✅ Save timestamp to mint.json
      console.log("Saving to:", FILE_PATH);
      fs.writeFileSync(FILE_PATH, JSON.stringify({ lastMint: mintTime }));
    }
  });
}

main().catch(console.error);
