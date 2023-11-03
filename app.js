const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended:false}));

// session設定
app.use(
  session({
    secret: 'my_secret_key',
    resave: false,
    saveUninitialized: false,
  })
);

//　MySQLへ接続
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


// ログイン情報のミドルウェア
app.use((req,res,next) => {
  if(req.session.username === undefined){
    console.log('ログインしていません');
    res.locals.username = 'ゲスト';
  } else {
    console.log('ログインしています');
    const username = req.session.username;
    res.locals.username = req.session.username;
  }
  next();
});

app.get('/', (req, res) => {
  connection.query(
    'SELECT * FROM users_test',
    (error, results) => {
      res.render('main.ejs');
    }
  );
});
app.get('/target',(req,res) => {
  connection.query(
    'SELECT * FROM users_test',
    (error, results) => {
      res.render('target.ejs');
  });
});
app.get('/login',(req,res) => {
  res.render('loginpage.ejs');
});
app.get('/registration',(req,res) => {
  res.render('registration.ejs');
});

// 新規登録
app.post('/registration',(req,res)=>{
  const username = req.body.username;
  const password = req.body.password;
  const confirmation = req.body.passwordConfirmation;
  if(password !== confirmation) {
    return res.status(400).send('パスワードと確認用パスワードが一致しません');
  }
    // パスワードをハッシュ化
    bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('ハッシュ化エラー: ' + err);
      return res.status(500).send('ハッシュ化エラー');
    }
    // ハッシュ化したパスワードをデータベースに保存
    connection.query(
      'INSERT INTO users_test (username, password) VALUES(?, ?)',
      [username, hash],
      (error,results)=>{
        if (error) {
          console.error('クエリ実行中にエラーが発生しました: ' + error);
          return res.status(500).send('データベースエラー');
        }
          // ユーザーがデータベースに登録されたらログイン
          req.session.username = username;
          console.log('新しいユーザーがデータベースに登録されました');
          res.status(200).send('<a href="/registration">登録が完了しました</a>');
      }
    );
  });
});

// ログイン
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // データベースからユーザー名に一致するレコードを取得
  connection.query(
    'SELECT * FROM users_test WHERE username = ?',
    [username],
    (error, results) => {
      if (error) {
        console.error('クエリ実行中にエラーが発生しました: ' + error);
        return res.status(500).send('データベースエラー');
      }

      if (results.length === 0) {
        // ユーザー名が見つからない場合のエラー処理
        return res.status(401).send('ユーザーが見つかりません');
      }

      const hash = results[0].password;

      // ハッシュと提供されたパスワードを比較
      bcrypt.compare(password, hash, (err, isValid) => {
        if (err) {
          console.error('パスワード比較中にエラーが発生しました: ' + err);
          return res.status(500).send('認証エラー');
        }

        if (isValid) {
          // パスワードが一致した場合、ユーザーを認証
          req.session.username = username;
          console.log('ログイン成功');
          res.status(200).send('ログイン成功');
        } else {
          // パスワードが一致しない場合のエラー処理
          return res.status(401).send('パスワードが間違っています');
        }
      });
    }
  );
});


const port = 3005; // ポート番号を変数に指定
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
