const express = require('express');
const app = express();
const ejs = require('ejs')
const multer = require('multer');
const path = require('path');
const axios = require('axios')
const fs = require("fs")
app.set("view engine", "ejs");

app.use(express.static('public'));
const port = 80;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp') 
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now()) 
  }
});
const upload = multer({ storage: storage });

const FormData = require('form-data');


app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.body.upscale) {
    return res.status(400).json({message:"select the upscale"})
  }
  if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Unsupported Image' });
  }
try {
const form = new FormData();
form.append('file', fs.readFileSync(req.file.path), {
filename: req.file.originalname,
contentType: req.file.mimetype
});
const headers = {
...form.getHeaders(),
};
const response = await axios.post('https://telegra.ph/upload', form, { headers });
const teleresult = "https://telegra.ph" + response.data[0].src;
const aemtResponse = await axios.get(`https:\/\/aemt.me/remini?url=${teleresult}&resolusi=${req.body.upscale}`);
const resultUrl = aemtResponse.data.url;
res.render('result.ejs', { result: resultUrl });
// res.json({ "status": true, "url": "https://telegra.ph" + response.data[0].src });

} catch (error) {
console.error(error);
res.status(500).json({ error: 'Internal Server Error' });
}
});

app.get('/', (req, res) => {
    res.render('home', { });

});
app.get('/result', (req, res) => {
    res.render('result', { });

});

app.listen(port, () => {
  console.log(`yoi:${port}`);;
});
