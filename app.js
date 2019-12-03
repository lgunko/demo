var express = require('express');
var app = express();

const url = require('url');
var rp = require('request-promise');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');

app.use(bodyParser());

const YcloudTokenPostUrl = "https://c4id-iam-test-one.accounts400.ondemand.com/oauth2/token"

const RedirectURL = "https://aa4tm323i6.execute-api.eu-central-1.amazonaws.com/Prod/callbackGetTokenByCode";
const ClientId = "T000003";
const ClientSecret = "2913671Oks";


app.get('/callbackGetTokenByCode', async function (req, res) {



  let code = req.query.code;

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

  try {
    let result = await rp(options);
    var token = result.id_token
    let urlToRedirect = new url.URL("https://master.dfrd6929zuy83.amplifyapp.com");
    urlToRedirect.searchParams.append('id_token', token);
    res.redirect(urlToRedirect.toString())
  }
  catch (err) {
    res.status(500).send(err);
  }


  const params = new url.URLSearchParams();
  params.append('grant_type', "authorization_code");
  params.append('code', req.query.code);
  params.append('redirect_uri', myUrl);
  try {
    let response = await fetch('https://leonid.auth.eu-central-1.amazoncognito.com/oauth2/token', {
      method: 'POST',
      body: params,
      headers: {
        'Authorization': 'Basic ' + new Buffer("33jclv5ijp65msi3befivvsufv" + ':' + "hb48c2gf3134adbrhsv49k9a3vsc6bc4u3fvrqh04mtehdopl3a").toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    })
    let tokens = await response.json();
    if (tokens.id_token && tokens.access_token && tokens.refresh_token) {
      let urlToRedirect = new url.URL(req.query.state);
      urlToRedirect.searchParams.append('id_token', tokens.id_token);
      res.redirect(urlToRedirect.toString())
    }
    else {
      res.status(403).send()
    }
  }
  catch (err) {
    console.log(err)
    res.status(403).send()
  }
});


// Export your Express configuration so that it can be consumed by the Lambda handler
module.exports = app
