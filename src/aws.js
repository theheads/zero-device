const AWS = require('aws-sdk');
const s3 = new AWS.S3();

var aws = {
  upload: function(name, file, user, callback) {

    var params = {Bucket: 'zerorecordings' , Key: user + '/' + name, Body: file};
    s3.upload(params, function(err, data) {
      if (err) {
        console.log(err)
      } else {
        console.log("Successfully uploaded data");
      }
      callback()
    });
  }
}

module.exports = aws;
