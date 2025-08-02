const path = require("path");
const express = require("express");
const fs = require("fs");
const xrpl = require("xrpl");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ FIXED — serve /public from the right spot
app.use(express.static(path.join(__dirname, "../public")));

const FILE_PATH = path.join(__dirname, "../public", "mint.json");
// ✅ Serve mint.json publicly
app.use(express.static(path.join(__dirname, "../public")));
app.get("/mint.json", (req, res) => {
  res.sendFile(FILE_PATH);
});

// ✅ Start Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// ✅ XRPL Listener
const WALLET = "rfx2mVhTZzc6bLXKeYyFKtpha2LHrkNZFT"; // your possum wallet

async function main() {
  const client = new xrpl.Client("wss://xrplcluster.com");
  await client.connect();
  console.log("🔁 Listening for NFT mints from:", WALLET);

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
      console.log("🔥 GEN2 Possum minted at", mintTime);

      try {
        fs.writeFileSync(FILE_PATH, JSON.stringify({ lastMint: mintTime }, null, 2));
        console.log("✅ mint.json updated successfully");
      } catch (e) {
        console.error("❌ Failed to write mint.json:", e);
      }
    }
  });
}

main().catch(console.error);

