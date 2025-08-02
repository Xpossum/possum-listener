const express = require("express");
const xrpl = require("xrpl");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Serve static files from /public
app.use(express.static(path.join(__dirname, "..", "public")));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// ✅ Set correct path to mint.json in /public
const FILE_PATH = path.join(__dirname, "..", "public", "mint.json");
const WALLET = "rfx2mVhTZzc6bLXKeYyFKtpha2LHrkNZFT";

// ✅ Start XRPL listener
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
      console.log("🔥 GEN2 minted with timestamp:", mintTime);

      fs.writeFileSync(FILE_PATH, JSON.stringify({ lastMint: mintTime }));
      console.log("✅ mint.json updated successfully");
    }
  });
}

main().catch(console.error);
