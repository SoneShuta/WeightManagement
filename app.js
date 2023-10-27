const express = require('express');
const mysql = require('mysql');

const app = express();

app.use(express.static('public'));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'shuta0111',
  database: 'weight_management'
});

connection.connect((err) => {
  if (err) {
    console.log('error connecting: ' + err.stack);
    return;
  }
  console.log('success');
});

app.get('/', (req, res) => {
  connection.query(
    'SELECT * FROM users',
    (error, results) => {
      console.log(results);
      res.render('main.ejs');
    }
  );
});
app.get('/target',(req,res) => {
  res.render('target.ejs');
});
app.get('/login',(req,res) => {
  res.render('login.ejs');
});
app.get('/registration',(req,res) => {
  res.render('registration.ejs');
});

const port = 3002; // ポート番号を変数に指定
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
