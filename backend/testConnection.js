import { poolPromise } from "./db.js";

(async () => {
  try {
    const pool = await poolPromise;
    console.log("Connection successful!");
  } catch (err) {
    console.error(err);
  }
})();
