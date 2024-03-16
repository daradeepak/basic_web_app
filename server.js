const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('database.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to the database');
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            age INTEGER,
            dob DATE
        )`);
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/submit', (req, res) => {
    const { name, email, age, dob } = req.body;

    // Perform validation
    // If validation passes, store data in the database
    db.run(`INSERT INTO users (name, email, age, dob) VALUES (?, ?, ?, ?)`, [name, email, age, dob], function(err) {
        if (err) {
            return console.error('Error inserting into database:', err.message);
        }
        console.log(`A row has been inserted with rowid ${this.lastID}`);
        res.redirect('/users');
    });
});

app.get('/users', (req, res) => {
    db.all(`SELECT * FROM users`, [], (err, rows) => {
        if (err) {
            return console.error('Error querying database:', err.message);
        }
        res.send(`
           <!DOCTYPE html>
<html>
<head>
    <title>User Data</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            margin: 0;
            padding: 0;
        }
        
        h1 {
            text-align: center;
            margin-top: 20px;
            margin-bottom: 30px;
            color: #333;
        }
        
        table {
            width: 80%;
            margin: 0 auto;
            border-collapse: collapse;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            background-color: #fff;
        }
        
        th, td {
            padding: 10px;
            text-align: left;
        }
        
        th {
            background-color: #4CAF50;
            color: white;
        }
        
        tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        
        tr:hover {
            background-color: #ddd;
        }
    </style>
</head>
<body>
    <h1>User Data</h1>
    <table>
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Age</th>
            <th>Date of Birth</th>
        </tr>
        ${rows.map(row => `
            <tr>
                <td>${row.id}</td>
                <td>${row.name}</td>
                <td>${row.email}</td>
                <td>${row.age}</td>
                <td>${row.dob}</td>
            </tr>
        `).join('')}
    </table>
</body>
</html>

        `);
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
