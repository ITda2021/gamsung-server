const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const PORT = process.env.port || 3001;
const cors = require('cors');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'gamsung'
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api/posts", (req, res)=>{
  const sqlSelect = "SELECT * FROM notice_posts;";
  db.query(sqlSelect, (err, result)=>{
      res.send(result);
  })
})

app.post('/api/posts', (req, res) => {
  const title = req.body.title;
  const content = req.body.content;
  const category = req.body.category;
  const sqlInsert = "INSERT INTO notice_posts (title, content, category) VALUES (?, ?, ?)";
  
  db.query(
    sqlInsert, 
    [title, content, category], 
  (err, result) => {
    res.send('success');
  })
});

app.listen(PORT, () => {
  console.log(`running on port ${PORT}`);
});