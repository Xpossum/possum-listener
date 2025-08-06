// Import required packages
const express = require("express");
const xrpl = require("xrpl");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

// Initialize Express app
const app = express();

// Allow CORS from your website only
app.use(cors({
  origin: "https://xrplawesomepossum.com"
}));

// Set server port (Render will use process.env.PORT)
const PORT = process.env.PORT || 3000;

// ✅ Serve static files from /public (one level up from /src)
app.use(express.static(path.join(__dirname, "..", "public")));

// ✅ Define path to mint.json
const FILE_PATH = path.join(__dirname, "..", "public", "mint.json");

// ✅ Your GEN2 Issuer Wallet
const WALLET = "rfx2mVhTZzc6bLXKeYyFKtpha2LHrkNZFT";

// Main function to connect to XRPL and listen for mints
async function main() {
  const client = new xrpl.Client("wss://xrplcluster.com");

  // Try to connect
  await client.connect();
  console.log("✅ Connected to XRPL, listening for mints...");

  // Subscribe to wallet transactions
  await client.request({
    command: "subscribe",
    accounts: [WALLET],
  });

  // Listen for transactions
  client.on("transaction", (tx) => {
    const { transaction } = tx;

    // Check if it's a valid NFTokenMint from your wallet
    if (
      transaction.TransactionType === "NFTokenMint" &&
      transaction.Account === WALLET &&
      tx.validated
    ) {
      const now = new Date().toISOString();
      console.log(`🔥 GEN2 Possum Minted at ${now}`);

      const data = { lastMint: now };

      // Write to mint.json
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

// Start the Express server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  main(); // Launch XRPL listener after server starts
});
