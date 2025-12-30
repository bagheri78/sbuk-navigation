import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import sql from 'mssql'
import { poolPromise } from '../db.js'

const router = express.Router()

// ====================
// REGISTER (SIGNUP)
// ====================
router.post('/signup', async (req, res) => {
  const { student_id, name, password } = req.body

  try {
    const pool = await poolPromise

    // بررسی تکراری نبودن شماره دانشجویی
    const exists = await pool.request()
      .input('StudentNumber', sql.NVarChar, student_id)
      .query('SELECT StuID FROM Student WHERE StudentNumber = @StudentNumber')

    if (exists.recordset.length > 0)
      return res.status(400).json({ message: 'این شماره دانشجویی قبلاً ثبت شده' })

    // هش پسورد
    const hashedPassword = await bcrypt.hash(password, 10)

    // استفاده از Stored Procedure
    await pool.request()
      .input('StudentNumber', sql.NVarChar, student_id)
      .input('Sname', sql.NVarChar, name)
      .input('Major', sql.NVarChar, null)
      .input('StuDepID', sql.Int, null)
      .input('Password', sql.NVarChar, hashedPassword)
      .execute('RegisterStudent')

    res.json({ message: 'ثبت‌نام با موفقیت انجام شد' })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'خطای سرور' })
  }
})


// ====================
// LOGIN
// ====================
router.post('/login', async (req, res) => {
  const { student_id, password } = req.body

  try {
    const pool = await poolPromise

    // گرفتن کاربر
    const result = await pool.request()
      .input('StudentNumber', sql.NVarChar, student_id)
      .query('SELECT * FROM Student WHERE StudentNumber = @StudentNumber')

    if (result.recordset.length === 0)
      return res.status(400).json({ message: 'کاربر یافت نشد' })

    const student = result.recordset[0]

    // مقایسه پسورد هش‌شده
    const isMatch = await bcrypt.compare(password, student.Password)
    if (!isMatch)
      return res.status(400).json({ message: 'رمز عبور اشتباه است' })

    // JWT
    const token = jwt.sign(
      { stuId: student.StuID, studentNumber: student.StudentNumber },
      'SECRET_KEY',
      { expiresIn: '1d' }
    )

    res.json({
      message: 'ورود موفق',
      token
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'خطای سرور' })
  }
})

export default router
