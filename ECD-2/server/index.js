const express = require("express");
const cors = require("cors");
const crypto = require("./crypto");

const app = express();
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = new Map([
  ["C148FBED965CA433B1EBBDBDC7757DCEC65C3275", 100], // bob
  ["31A36F79F64B30A579EAE44382DFEFC42D4FD336", 50], // alice
  ["0FE026F581549F30C5F49A409639E4F84D0DB5B0", 75], // charles
]);

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances.get(address) || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { message, signature } = req.body;
  const { recipient, amount } = message;

  const pubKey = crypto.signatureToPubKey(message, signature);
  const sender = crypto.pubKeyToAddress(pubKey);

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances.get(sender) < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances.set(sender, balances.get(sender) - amount);
    balances.set(recipient, balances.get(recipient) + amount);
    res.send({ balance: balances.get(sender) });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
