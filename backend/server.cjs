// server.mock.js
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
app.use(bodyParser.json());

// آرایه برای ذخیره کاربران (Mock DB)
let students = [];

// ------------------- SignUp -------------------
app.post('/signup', async (req, res) => {
    const { name, student_id, password } = req.body;

    if (!name || !student_id || !password) {
        return res.status(400).send({ error: 'لطفاً همه فیلدها را پر کنید' });
    }

    // بررسی اینکه student_id تکراری نباشد
    if (students.some(s => s.student_id === student_id)) {
        return res.status(400).send({ error: 'شماره دانشجویی قبلاً ثبت شده است' });
    }

    // هش پسورد
    const hashedPassword = await bcrypt.hash(password, 10);

    // ذخیره کاربر در آرایه
    const newStudent = { name, student_id, password: hashedPassword };
    students.push(newStudent);

    res.send({ message: 'ثبت‌نام با موفقیت انجام شد!', student: newStudent });
});

// ------------------- Login -------------------
app.post('/login', async (req, res) => {
    const { student_id, password } = req.body;

    if (!student_id || !password) {
        return res.status(400).send({ error: 'لطفاً همه فیلدها را پر کنید' });
    }

    const student = students.find(s => s.student_id === student_id);
    if (!student) return res.status(400).send({ error: 'دانشجو پیدا نشد' });

    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.status(400).send({ error: 'رمز عبور اشتباه است' });

    res.send({ message: 'ورود با موفقیت انجام شد!', student });
});

// ------------------- سرور -------------------
const PORT = 5003;
app.listen(PORT, () => console.log(`Mock server running on http://localhost:${PORT}`));
