const express = require("express");
const xrpl = require("xrpl");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors({
  origin: "https://xrplawesomepossum.com" // Allow only your domain
}));
const PORT = process.env.PORT || 3000;

// ✅ Serve everything in /public (one level up from /src)
app.use(express.static(path.join(__dirname, "..", "public")));

// ✅ Path to mint.json
const FILE_PATH = path.join(__dirname, "..", "public", "mint.json");

// ✅ XRPL wallet to track
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
    const { transaction } = tx;

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


