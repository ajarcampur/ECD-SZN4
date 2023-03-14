import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { hexToBytes, toHex } from "ethereum-cryptography/utils";

/**
 * Local wallet.
 * Simulate a MetaMask-like wallet which stores private keys safely,
 * and gives access to public key/address.
 * Keys are store in hexadecimal format.
 */

// List of account keys in hexa format without the '0x'
const ACCOUNT_KEYS = new Map([
  [
    "bob",
    {
      private:
        "29be1477eae57525e0c2a8e500156bb3925bca8510547c0bac9129ed737b134e",
      public:
        "0402a8424c00971024cc0749535d5654619094a67da48b85a184fd4beee6b37a97825fb37d977439760440e770ac5146fe0784695885928a9ae0240a598129d217",
    },
  ],
  [
    "alice",
    {
      private:
        "0738adb3a788d31b4c54070917a676b453a27abfdd384f591287ae073a0964cb",
      public:
        "045345d9df3d3b4344caa9a70ba429616fd1ba2049efc68b815ad1c5beaf014b1d9493bdb223ed96c98e2106476d209803027b7d5785c42b779f4cf7aaf43bdf5e",
    },
  ],
  [
    "charles",
    {
      private:
        "1a92b771f653574c15f12a8928d54825e382cfca82178a58f0fd8701fddd52e7",
      public:
        "04f96d3230a318834bb70db17120e3e8a1defd3e51e87c6d6f21997428f1ff9c749a70849505e86dce212b14624cff7a53afdb59bd788bff34dc099e72c9d59fbc",
    },
  ],
]);

// user names derived from the list of accounts
const USERS = Array.from(ACCOUNT_KEYS.keys());

/**
 * Hash a message using KECCAK-256
 * @param message the message to hash.
 * @returns the hash of the message.
 */
const hashMessage = (message) => keccak256(Uint8Array.from(message));

/**
 * Get the user public key.
 * @param user the user
 * @returns the public key as a Uint8Array.
 */
const getPublicKey = (user) => {
  if (!user) return null;
  return hexToBytes(ACCOUNT_KEYS.get(user).public);
};

/**
 * Get the user private key.
 * @param user the user.
 * @returns the private key as a Uint8Array.
 */
const getPrivateKey = (user) => {
  if (!user) return null;
  return hexToBytes(ACCOUNT_KEYS.get(user).private);
};

/**
 * Derive the address from the public key of an user.
 * @param user the user.
 * @returns the user address as a hexa string.
 */
const getAddress = (user) => {
  if (!user) return null;
  const pubKey = getPublicKey(user);
  const hash = keccak256(pubKey.slice(1));
  return toHex(hash.slice(-20)).toUpperCase();
};

/**
 * Get the public key of an user in hexa format.
 * @param user the user.
 * @returns the public key.
 */
const getHexPubKey = (user) => {
  if (!user) return null;
  return toHex(getPublicKey(user)).toUpperCase();
};

/**
 * Sign a message.
 * @param username name of the user account.
 * @param message message to sign
 * @returns the signature in hexa format with the recovery bit as the first byte.
 */
const sign = async (username, message) => {
  const privateKey = getPrivateKey(username);
  const hash = hashMessage(message);

  const [signature, recoveryBit] = await secp.sign(hash, privateKey, {
    recovered: true,
  });
  const fullSignature = new Uint8Array([recoveryBit, ...signature]);
  return toHex(fullSignature);
};

const wallet = {
  USERS,
  sign,
  getAddress,
  getHexPubKey,
};
export default wallet;
