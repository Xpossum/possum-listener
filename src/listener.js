const xrpl = require("xrpl");
const fs = require("fs");
const path = require("path");

const WALLET = 'rfx2mVhTZzc6bLXKeYyFKtpha2LHrkNZFT';
const FILE_PATH = path.join(__dirname, "..", "mint.json");

async function main() {
  const client = new xrpl.Client('wss://xrplcluster.com');
  await client.connect();
  console.log('Listening for NFT mints from:', WALLET);

  client.request({
    command: 'subscribe',
    accounts: [WALLET]
  });

  client.on('transaction', (tx) => {
    const { transaction, meta } = tx;
    if (
      transaction.TransactionType === 'NFTokenMint' &&
      transaction.Account === WALLET &&
      meta.TransactionResult === 'tesSUCCESS'
    ) {
      const mintTime = new Date().toISOString();
      console.log('GEN2 Possum Minted at', mintTime);

      fs.writeFileSync(FILE_PATH, JSON.stringify({ lastMint: mintTime }));
    }
  });

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Serve mint.json publicly
app.get("/mint.json", (req, res) => {
  res.sendFile(path.join(__dirname, "../mint.json"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
}

main().catch(console.error);

