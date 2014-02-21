var http = require('http');
var path = require('path');
var _ = require('lodash');
var express = require('express');
var busboy = require('connect-busboy');
var multipart = require('connect-multiparty');

var app = express();

app.use(express.static(path.join(__dirname, './static')));

if (process.argv[2] === 'multiparty') {
  console.log('Using multiparty');
  useMultiparty();
}
else {
  console.log('Using busboy');
  useBusboy();
}

function useBusboy() {
  app.post('/api/upload', busboy(), function(req, res) {
    var result = {};
    var fields = {};
    var files = {};

    req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      files[fieldname] = {name: filename};

      // `file` is a `ReadableStream`
      // We should always do something with it, 
      // else busboy won't fire the 'finish' even
      // At minimum do:
      file.resume();
    });
    
    req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
      fields[key] = value;
    });
    
    req.busboy.on('finish', function() {
      var result = {
        ok: true,
        fields: fields, 
        files: files
      };

      handleUploadResponse(req, res, result);
    });

    req.pipe(req.busboy);
  });
}

function useMultiparty() {
  // Temporary location to store uploads, required by multiparty
  // Directory should exist already, it will not get created
  // NOTE: this is not automatically cleaned up, see
  // https://groups.google.com/forum/#!msg/express-js/iP2VyhkypHo/5AXQiYN3RPcJ
  var TMP_UPLOAD_DIR = process.env.TMP_UPLOAD_DIR || path.join(__dirname, './.tmp_uploads');

  var multipartMiddleware = multipart({uploadDir: TMP_UPLOAD_DIR});

  app.post('/api/upload', multipartMiddleware, function(req, res) {
    var fields = req.body;
    var files = _.reduce(req.files, function(result, file, key) {
      // Filter out empty file inputs
      if (file.size) {
        result[key] =  _.pick(file, 'name', 'size', 'path');
      }
      return result;
    }, {});

    // We can read uploaded files with:

    // var filePath = files[fileInputName].path;
    // fs.createReadStream(filePath);
    // fs.readFile(filePath, cb);

    // And clean them up when done with:

    // fs.unlink(filePath, cb);

    var result = {
      ok: true,
      fields: fields, 
      files: files
    };

    handleUploadResponse(req, res, result);
  });
}

function handleUploadResponse(req, res, result) {
  setTimeout(function() {
    if (typeof req.query.iframe !== 'undefined') {
      return sendIframeJsonResponse(res, result);
    }

    res.send(result);
  }, 1000);
}

function sendIframeJsonResponse(res, data) {
  var html = [
    '<textarea data-type="application/json" style="width: 271px; height: 129px;">',
    JSON.stringify(data, null, 2),
    '</textarea>'
  ].join('');

  res.set('Content-Type', 'text/html');
  res.send(html);
}

http.createServer(app).listen(8081);
console.log('Upload server started on port 8081');