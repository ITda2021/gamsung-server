const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
aws.config.loadFromPath(__dirname + '/awsconfig.json');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const s3 = new aws.S3();
const PORT = process.env.port || 8080;

const whitelist = [
  "https://www.gamsungsoft.com", 
  "https://test.gamsungsoft.com",
  "http://3.130.190.15",
  "http://localhost:3000"] ;

const corsOptions = {
  credentials: true, 
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not Allowed Origin!"));
    }
  },
};

const db = mysql.createPool({
  host: '3.130.190.15',
  user: 'user',
  password: 'rkatjdTHVMXM@0607',
  database: 'gamsung'
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'gamsung-website-images-bucket',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: function(req, file, cb) { 
      cb(null, Math.floor(Math.random() * 1000).toString() + Date.now() + '.' + file.originalname.split('.').pop()); 
    },
  }),
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));

//[post] upload image
app.post('/api/img', upload.single('img'), (req, res) => {
  try {
    console.log('전달받은 파일', req.file);
    res.json({ url: req.file.location });
  } catch (err) {
    console.log(err);
    response(res, 500, "서버 에러")
  }
});

//[get] get posts and also can get posts with query category
app.get("/api/posts", (req, res)=>{
  const category = req.query.category;
  const sqlSelect = category ?
   "SELECT * FROM notice_posts WHERE category=?;":
   "SELECT * FROM notice_posts";
  db.query(sqlSelect, category, (err, result)=>{
      res.send(result);
  })
})

//[get] get post with param seq
app.get("/api/posts/:seq", (req, res)=>{
  const postSeq = req.params.seq;
  const sqlSelect = "SELECT * FROM notice_posts WHERE seq=?;";
  db.query(sqlSelect, postSeq, (err, result)=>{
      res.send(result[0]);
  })
})

//[post] create post
app.post('/api/posts', (req, res) => {
  const title = req.body.title;
  const content = req.body.content;
  const category = req.body.category;
  const sqlInsert = "INSERT INTO notice_posts (title, content, category, created_at, modified_at) VALUES (?, ?, ?, NOW(), NOW());";
  
  db.query(
    sqlInsert, 
    [title, content, category], 
  (err, result) => {
    res.send('success');
  })
});

//[put] update post
app.put('/api/posts/:seq', (req, res) => {
  const postSeq = req.params.seq;
  const title = req.body.title;
  const content = req.body.content;
  const category = req.body.category;
  const created_at = req.body.created_at;

  const sqlInsert = "UPDATE notice_posts SET title=?, content=?, category=?, created_at=?, modified_at=NOW() WHERE seq=?;";
  
  db.query(
    sqlInsert, 
    [title, content, category, created_at, postSeq], 
    (err, result) => {
      res.send('success');
      console.log(result);
      console.log(err);
    }
  )
});

//[delete] delete post with param seq
app.delete("/api/posts/:seq", (req, res)=>{
  const postSeq = req.params.seq;
  const sqlSelect = "DELETE FROM notice_posts WHERE seq=?;";
  db.query(sqlSelect, postSeq, (err, result)=>{
      res.send(`delete post seq: ${postSeq}`);
  })
})

app.listen(PORT, () => {
  console.log(`running on port ${PORT}`);
});