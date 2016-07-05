
const axios = require('axios')
const fs = require("fs")

var WIT = module.exports = {
  process: function(callback) {
    var header =  {
      'Authorization': 'Bearer 5XT3LFOXIVPX6OIC53ZHXWBHBTBG6JXF',
     'accept': 'application/json',
     'Content-Type': 'audio/wav'
    }

    var config = {
      headers: header
    };

    var stream = fs.createReadStream(__dirname + '/../audio/test.wav');
    axios.post('https://api.wit.ai/speech?v=20160526', stream, config)
      .then(function(res) {
        console.log(res.data, res.data['_text'])

        callback(null, res.data['_text'])
      })
      .catch(function(res) {
        callback(res)
      })

  }
}
