var express = require('express');
var app = express();

const url = require('url');
var rp = require('request-promise');
var bodyParser = require('body-parser');

app.use(bodyParser());

const YcloudTokenPostUrl = "https://c4id-iam-test-one.accounts400.ondemand.com/oauth2/token"

const RedirectURL = "https://aa4tm323i6.execute-api.eu-central-1.amazonaws.com/Prod/callbackGetTokenByCode";
const ClientId = "T000003";
const ClientSecret = "2913671Oks";


app.get('/callbackGetTokenByCode', async function (req, res) {



  let code = req.query.code;

  console.log(code)

  let options = {
    method: 'POST',
    uri: YcloudTokenPostUrl,
    headers: {
      'Authorization': 'Basic ' + new Buffer(ClientId + ':' + ClientSecret).toString('base64')
    },
    form: {
      grant_type: "authorization_code",
      code: code,
      redirect_uri: RedirectURL,
      client_id: ClientId,
      client_secret: ClientSecret,
    },
    json: true,
  }

  console.log(options)

  try {
    let result = await rp(options);
    console.log(result)
    var token = result.id_token
    console.log(token)
    let urlToRedirect = new url.URL("https://master.dfrd6929zuy83.amplifyapp.com");
    urlToRedirect.searchParams.append('id_token', token);
    console.log(urlToRedirect.toString())
    res.redirect(urlToRedirect.toString())
  }
  catch (err) {
    console.log(err)
    res.status(403).send(err);
  }

});


// Export your Express configuration so that it can be consumed by the Lambda handler
module.exports = app
