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

// ✅ Serve /public
app.use(express.static(path.join(__dirname, "..", "public")));

// ✅ Path to mint.json
const FILE_PATH = path.join(__dirname, "..", "public", "mint.json");

// ✅ Wallet to monitor
const WALLET = "rfx2mVhTZzc6bLXKeYyFKtpha2LHrkNZFT";

// ✅ Track last known mint to avoid overwriting with null
let lastValidMint = null;

// ✅ Save last mint to file
function saveMintTime(timestamp) {
  lastValidMint = timestamp;
  const data = { lastMint: timestamp };
  fs.writeFile(FILE_PATH, JSON.stringify(data), (err) => {
    if (err) {
      console.error("❌ Failed to write mint.json:", err);
    } else {
      console.log("✅ mint.json updated:", timestamp);
    }
  });
}

// ✅ Load existing timestamp from file at startup
function loadLastMint() {
  if (fs.existsSync(FILE_PATH)) {
    try {
      const content = fs.readFileSync(FILE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed.lastMint) {
        lastValidMint = parsed.lastMint;
        console.log("🔁 Loaded last mint timestamp:", lastValidMint);
      }
    } catch (err) {
      console.warn("⚠️ Couldn't load mint.json:", err);
    }
  }
}

// ✅ Connect to XRPL with auto-reconnect
async function connectToXRPL() {
  const client = new xrpl.Client("wss://xrplcluster.com");

  const connectAndListen = async () => {
    try {
      await client.connect();
      console.log("🟢 Connected to XRPL");

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
          console.log("🔥 GEN2 Possum Minted at", now);
          saveMintTime(now);
        }
      });

      client.on("disconnected", () => {
        console.warn("🔌 Disconnected from XRPL, retrying in 5s...");
        setTimeout(connectAndListen, 5000);
      });

    } catch (err) {
      console.error("❌ Error connecting to XRPL:", err.message);
      setTimeout(connectAndListen, 5000);
    }
  };

  connectAndListen();
}

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  loadLastMint();
  connectToXRPL();
});
