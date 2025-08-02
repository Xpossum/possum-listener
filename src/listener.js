const express = require("express");
const xrpl = require("xrpl");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Serve /public folder (relative to src/)
app.use(express.static(path.join(__dirname, "../public")));

// ✅ Write to /public/mint.json
const FILE_PATH = path.join(__dirname, "../public", "mint.json");

// 👇 Replace with your actual wallet
const WALLET = "rfx2mVhTZzc6bLXKeYyFKtpha2LHrkNZFT";

async function main() {
  const client = new xrpl.Client("wss://xrplcluster.com");
  await client.connect();
  console.log("✅ Connected to XRPL, listening for mints...");

  await client.request({
    command: "subscribe",
    accounts: [WALLET],
  });

  client.on("transaction", (tx) => {
    const { transaction, meta } = tx;

    if (
      transaction.TransactionType === "NFTokenMint" &&
      transaction.Account === WALLET &&
      tx.validated
    ) {
      const now = new Date().toISOString();
      console.log(`🔥 GEN2 Possum Minted at ${now}`);

      const data = { lastMint: now };
      fs.writeFile(FILE_PATH, JSON.stringify(data), (err) => {
        if (err) {
          console.error("❌ Failed to write mint.json:", err);
        } else {
          console.log("✅ mint.json updated successfully");
        }
      });
    }
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  main();
});

