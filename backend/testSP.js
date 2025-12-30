import { poolPromise } from "./db.js";
import sql from "mssql";

async function testSP() {
  try {
    const pool = await poolPromise;

    await pool.request()
      .input('StudentNumber', sql.NVarChar(20), '20251234')
      .input('Sname', sql.NVarChar(100), 'Ali Reza')
      .input('Major', sql.NVarChar(50), 'Computer Science')
      .input('StuDepID', sql.Int, 1)
      .input('Password', sql.NVarChar(100), '123456')
      .execute('RegisterStudent'); // <-- نام SP تو

    console.log('✅ Student registered successfully!');
  } catch (err) {
    console.error('❌ Error registering student:', err);
  }
}

testSP();
