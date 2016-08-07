const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const aws = {
  upload: function(name, file, user, callback) {

    const params = {Bucket: 'zerorecordings' , Key: user + '/' + name, Body: file, public_url: true};
    s3.upload(params, function(err, data) {
      if (err) {
        console.log(err)
      } else {
        console.log("Successfully uploaded data", data);
      }
      callback()
    });
  }
}

module.exports = aws;
