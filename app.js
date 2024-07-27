const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

// session設定
app.use(
  session({
    secret: 'my_secret_key',
    resave: false,
    saveUninitialized: false,
  })
);

// MySQLへ接続
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
app.use((req, res, next) => {
  if (req.session.username === undefined) {
    console.log('ログインしていません');
    res.locals.username = 'ゲスト';
  } else {
    console.log('ログインしています');
    res.locals.username = req.session.username;
  }
  next();
});

// app.get('/', (req, res) => {
//   if (!req.session.userId) {
//     return res.redirect('/login');
//   }

//   const loggedInUserId = req.session.userId;

//   connection.query(
//     'SELECT * FROM users_test WHERE id = ?',
//     [loggedInUserId],
//     (error, results) => {
//       if (error) {
//         console.error('データベースクエリ中にエラーが発生しました:', error);
//         return res.status(500).send('Internal Server Error');
//       }
//       if (results.length === 0) {
//         return res.render('main.ejs');
//       }
//       const userData = results[0];
//       const currentWeight = userData.current_weight || 0; // データベースから体重を取得
//       res.render('main.ejs', { userData, currentWeight }); // テンプレートにデータを渡す
//     }
//   );
// });
app.get('/', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  const loggedInUserId = req.session.userId;

  connection.query(
    'SELECT * FROM users_test WHERE id = ?',
    [loggedInUserId],
    (error, results) => {
      if (error) {
        console.error('データベースクエリ中にエラーが発生しました:', error);
        return res.status(500).send('Internal Server Error');
      }
      if (results.length === 0) {
        return res.render('main.ejs');
      }
      const userData = results[0];
      const currentWeight = userData.current_weight || 0;
      const targetWeight = userData.target_weight || 0;
      const weightDifference = currentWeight - targetWeight;
      res.render('main.ejs', { userData, currentWeight, weightDifference });
    }
  );
});


app.get('/target', (req, res) => {
  connection.query('SELECT * FROM users_test', (error, results) => {
    res.render('target.ejs');
  });
});

app.get('/login', (req, res) => {
  res.render('loginpage.ejs');
});

app.get('/registration', (req, res) => {
  res.render('registration.ejs');
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('セッションの破棄中にエラーが発生しました。');
    }
    res.redirect('/login');
  });
});

// ユーザー登録
app.post('/registration', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const confirmation = req.body.passwordConfirmation;

  connection.query(
    'SELECT * FROM users_test WHERE username = ?',
    [username],
    (selectError, selectResults) => {
      if (selectError) {
        console.error('ユーザー名の存在確認中にエラーが発生しました: ');
        return res.status(500).send('データベースエラー');
      }
      if (selectResults.length > 0) {
        return res.status(400).send('<button onclick="window.location.href=\'/registration\'" style="width: 300px; height: 100px;">既に使用されているユーザー名です</button>');
      }

      if (password !== confirmation) {
        return res.status(400).send('パスワードと確認用パスワードが一致しません');
      }

      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          console.error('ハッシュ化エラー: ' + err);
          return res.status(500).send('ハッシュ化エラー');
        }

        connection.query(
          'INSERT INTO users_test (username, password) VALUES(?, ?)',
          [username, hash],
          (error, results) => {
            if (error) {
              console.error('クエリ実行中にエラーが発生しました: ' + error);
              return res.status(500).send('データベースエラー');
            }
            req.session.username = username;
            req.session.userId = results.insertId; // セッションにuserIdを保存
            console.log('新しいユーザーがデータベースに登録されました');
            res.status(200).send('<button onclick="window.location.href=\'/\'" class="errorLink">登録が完了しました</button>');
          }
        );
      });
    }
  );
});

// ログイン処理
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  connection.query(
    'SELECT * FROM users_test WHERE username = ?',
    [username],
    (error, results) => {
      if (error) {
        console.error('クエリ実行中にエラーが発生しました: ' + error);
        return res.status(500).send('データベースエラー');
      }
      if (results.length === 0) {
        return res.status(401).send('ユーザーが見つかりません');
      }

      const hash = results[0].password;

      bcrypt.compare(password, hash, (err, isValid) => {
        if (err) {
          console.error('パスワード比較中にエラーが発生しました: ' + err);
          return res.status(500).send('認証エラー');
        }
        if (isValid) {
          req.session.username = username;
          req.session.userId = results[0].id; // セッションにuserIdを保存
          console.log('ログイン成功');
          res.redirect('/');
        } else {
          return res.status(401).send('パスワードが間違っています');
        }
      });
    }
  );
});

// ログアウト時の確認
function confirmLogout() {
  if (confirm("本当にログアウトしますか？")) {
    window.location.href = "/logout";
  }
}


app.post('/target', (req, res) => {
  const startingWeight = req.body.startingWeight;
  const targetWeight = req.body.targetWeight;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const showWeight = req.body.showWeight === '表示';
  const loggedInUsername = req.session.username;

  console.log('Received data:', {
    startingWeight,
    targetWeight,
    startDate,
    endDate,
    showWeight,
    loggedInUsername,
  });

  connection.query(
    'UPDATE users_test SET starting_weight = ?, target_weight = ?, start_date = ?, end_date = ?, display_weight = ? WHERE username = ?',
    [startingWeight, targetWeight, startDate, endDate, showWeight, loggedInUsername],
    (error, results) => {
      if (error) {
        console.error('クエリ実行中にエラーが発生しました:', error);
        return res.status(500).send('データベースエラー');
      }
      res.status(200).send('<a href="/">目標を設定しました。</a>');
      console.log('DB更新完了');
    }
  );
});

app.post('/', (req, res) => {
  const inputDate = req.body.inputDate;
  const currentWeight = req.body.currentWeight;
  const loggedInUsername = req.session.username;

  console.log('Received data:', {
    inputDate,
    currentWeight,
    loggedInUsername,
  });

  connection.query(
    'UPDATE users_test SET input_date = ? ,current_weight = ? WHERE username = ?',
    [inputDate, currentWeight, loggedInUsername],
    (error, results) => {
      if (error) {
        console.error('クエリ実行中にエラーが発生しました:', error);
        return res.status(500).send('データベースエラー');
      }
      res.status(200).send('<a href="/">更新しました。</a>');
      console.log('DB更新完了');
    }
  );
});

const port = 3004;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});