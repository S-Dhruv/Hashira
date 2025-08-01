const fs = require("fs");
const path = require("path");
const readline = require("readline");

function modPow(a, b, mod) {
  a = ((a % mod) + mod) % mod;
  let res = 1n;
  while (b > 0n) {
    if (b % 2n === 1n) res = (res * a) % mod;
    a = (a * a) % mod;
    b /= 2n;
  }
  return res;
}
function modInv(a, p) {
  return modPow(a, p - 2n, p);
}

function lagrangeInterpolationAtZero(xs, ys, p) {
  let secret = 0n;
  for (let j = 0; j < xs.length; j++) {
    let num = 1n,
      denom = 1n;
    for (let m = 0; m < xs.length; m++) {
      if (m !== j) {
        num = (num * -xs[m]) % p;
        denom = (denom * (xs[j] - xs[m])) % p;
      }
      //   console.log(num,denom);
    }
    const lj = (num * modInv(denom, p)) % p;
    secret = (secret + ys[j] * lj) % p;
    // translates to num/denom + y
  }
  return (secret + p) % p;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter JSON file name (e.g., data.json): ", (fileName) => {
  const filePath = path.join(__dirname, fileName);

  if (!fs.existsSync(filePath)) {
    console.error("File not found:", fileName);
    rl.close();
    return;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);
  console.log("Raw Json:", data);
  const { k } = data.keys;

  const shares = Object.entries(data)
    .filter(([key]) => key !== "keys")
    .map(([xStr, { base, value }]) => {
      const x = BigInt(xStr);
      const y = BigInt(parseInt(value, parseInt(base)));
      return { x, y };
    });

  console.log("Share", shares);
  // we only want upto k
  const selectedShares = shares.slice(0, k);
  const xs = selectedShares.map((s) => s.x);
  const ys = selectedShares.map((s) => s.y);
  const PRIME = 170141183460469231731687303715884105727n;

  const secret = lagrangeInterpolationAtZero(xs, ys, PRIME);
  console.log(" Recovered Secret:", secret.toString());

  rl.close();
});
