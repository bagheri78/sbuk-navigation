const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const bcrypt = require('bcrypt');

const app = express();
app.use(bodyParser.json());

// کانفیگ SQL Server با Windows Authentication
const config = {
    server: 'localhost',
    database: 'CampusRoutingDB',
    options: {
        encrypt: false,
        trustServerCertificate: true
    },
    authentication: {
        type: 'ntlm',
        options: {
            domain: '', // برای local معمولا خالی می‌مونه
            userName: process.env.USERNAME, // کاربر ویندوز فعلی
            password: '' // برای کاربر فعلی می‌توان خالی باشد
        }
    }
};

// اتصال به دیتابیس
sql.connect(config)
    .then(() => console.log('Database connected!'))
    .catch(err => console.log('Database connection failed:', err));

// ------------------- SignUp -------------------
app.post('/signup', async (req, res) => {
    const { StudentNumber, Sname, Major, StuDepID, Password } = req.body;

    try {
        // هش پسورد
        const hashedPassword = await bcrypt.hash(Password, 10);

        const pool = await sql.connect(config);
        await pool.request()
            .input('StudentNumber', sql.NVarChar(20), StudentNumber)
            .input('Sname', sql.NVarChar(100), Sname)
            .input('Major', sql.NVarChar(50), Major)
            .input('StuDepID', sql.Int, StuDepID)
            .input('Password', sql.NVarChar(100), hashedPassword)
            .execute('RegisterStudent');

        res.send({ message: 'Student registered successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'SignUp failed' });
    }
});

// ------------------- Login -------------------
app.post('/login', async (req, res) => {
    const { StudentNumber, Password } = req.body;

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('StudentNumber', sql.NVarChar(20), StudentNumber)
            .execute('LoginStudent');

        if (result.recordset.length === 0) {
            return res.status(400).send({ error: 'Student not found' });
        }

        const student = result.recordset[0];
        const match = await bcrypt.compare(Password, student.Password);

        if (!match) return res.status(400).send({ error: 'Incorrect password' });

        res.send({ message: 'Login successful', student });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Login failed' });
    }
});

// ------------------- سرور -------------------
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
