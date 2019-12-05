var express = require('express');
var app = express();

const url = require('url');
var rp = require('request-promise');
var bodyParser = require('body-parser');

app.use(bodyParser());


const MongoService = require('./mongoService/db');
const YcloudTokenPostUrl = "https://c4id-iam-test-one.accounts400.ondemand.com/oauth2/token"

const RedirectURL = "https://aa4tm323i6.execute-api.eu-central-1.amazonaws.com/Prod/callbackGetTokenByCode";
const ClientId = "T000003";
const ClientSecret = "2913671Oks";


app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


//CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Org, from, to');

  if ('OPTIONS' === req.method) {
    res.send(200);
  }
  else {
    next();
  }
});
//CORS


app.get('/deleteAllActiveVersions', async function (req, res) {
  let allVersions = await (await MongoService.getAllOrgInstance()).findAll("activeVersion")
  allVersions.map(async version => {
    await (await MongoService.getAllOrgInstance()).deleteOne("activeVersion", version._id)
  })
  res.send(true)
})

app.get('/deleteAllVersions', async function (req, res) {
  let allVersions = await (await MongoService.getAllOrgInstance()).findAll("versions")
  allVersions.map(async version => {
    await (await MongoService.getAllOrgInstance()).deleteOne("versions", version._id)
  })
  res.send(true)
})

app.get('/allVersions', async function (req, res) {
  let allVersions = await (await MongoService.getAllOrgInstance()).findAll("versions")
  let sortedVersions = allVersions.filter(version => version.service === req.query.service).sort(function (a, b) {
    return b.timestamp - a.timestamp;
  })
  let i = 0;
  sortedVersions.map(version => {
    version.name = "v" + (sortedVersions.length - (i++))
  })
  res.send(sortedVersions);
})

app.get('/activeVersions', async function (req, res) {
  let activeVersions = await (await MongoService.getAllOrgInstance()).findAll("activeVersion")
  res.send(activeVersions);
})

app.post('/newVersion', async function (req, res) {    //new version is always active
  try {
    console.log(req.body)
    let newVersion = {
      timestamp: new Date().getTime(),
      permissions: req.body.permissionsForGroup,
      service: req.body.service
    }
    await (await MongoService.getAllOrgInstance()).saveOne("versions", newVersion)
    console.log(newVersion)
    await (await MongoService.getAllOrgInstance()).deleteOne("activeVersion", req.body.service)
    await (await MongoService.getAllOrgInstance()).saveOne("activeVersion", { _id: req.body.service, versionId: newVersion._id })
    console.log({ _id: req.body.service, versionId: newVersion._id })
    res.send(newVersion)
  } catch (err) {
    console.log(err)
  }
})

app.post('/activateOldVersion', async function (req, res) {
  await (await MongoService.getAllOrgInstance()).deleteOne("activeVersion", req.body.service)
  let newActiveVersion = { _id: req.body.service, versionId: req.body.versionId }
  await (await MongoService.getAllOrgInstance()).saveOne("activeVersion", newActiveVersion)
  res.send(newActiveVersion)
})

app.get('/allServices', function (req, res) {

  res.send([
    "SAP Service Cloud",
    "SAP Marketing Cloud",
    "SAP Sales Cloud"
  ]);

})

app.get('/allGroups', function (req, res) {

  res.send([
    "ServiceEngineer",
    "ServiceConsultant",
    "Manager",
    "MarketingConsultant",
  ]);

})

app.get('/groupsForService', function (req, res) {
  console.log(req.query.service)
  let service = decodeURIComponent(req.query.service)
  console.log(service)
  switch (service) {
    case "SAP Service Cloud":
      res.send([
        "ServiceEngineer",
        "ServiceConsultant",
        "Manager",
      ])
    case "SAP Marketing Cloud":
      res.send([
        "MarketingConsultant",
        "Manager",
      ])
    default:
      res.send([])
  }
})


app.get('/servicePermissionsForGroup', function (req, res) {
  let group = decodeURIComponent(req.query.group)
  switch (group) {
    case "ServiceEngineer":
      res.send([
        { service: "SAP Service Cloud", permission: "ViewServiceOrdersAssignedToMe" },
      ])
    case "ServiceConsultant":
      res.send([
        { service: "SAP Service Cloud", permission: "ViewAllServiceOrders" },
      ])
    case "MarketingConsultant":
      res.send([
        { service: "SAP Marketing Cloud", permission: "ViewMarketingCampaigns" },
      ])
    case "Manager":
      res.send([
        { service: "SAP Service Cloud", permission: "ViewAllServiceOrders" },
        { service: "SAP Service Cloud", permission: "ViewCustomerData" },
        { service: "SAP Service Cloud", permission: "CreateServiceOrder" },
        { service: "SAP Marketing Cloud", permission: "ViewROI" },
      ])
    default:
      res.send([])
  }
})

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


app.get('/callbackGetTokenByCodeSSC', async function (req, res) {

  let code = req.query.code;

  console.log(code)

  let options = {
    method: 'POST',
    uri: YcloudTokenPostUrl,
    headers: {
      'Authorization': 'Basic ' + new Buffer("T000006" + ':' + ClientSecret).toString('base64')
    },
    form: {
      grant_type: "authorization_code",
      code: code,
      redirect_uri: RedirectURL + "SSC",
      client_id: "T000006",
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
    let urlToRedirect = new url.URL("https://master.d29oecan9pu8tt.amplifyapp.com");
    urlToRedirect.searchParams.append('id_token', token);
    console.log(urlToRedirect.toString())
    res.redirect(urlToRedirect.toString())
  }
  catch (err) {
    console.log(err)
    res.status(403).send(err);
  }

});



app.get('/callbackGetTokenByCodeSMC', async function (req, res) {

  let code = req.query.code;

  console.log(code)

  let options = {
    method: 'POST',
    uri: YcloudTokenPostUrl,
    headers: {
      'Authorization': 'Basic ' + new Buffer("T000007" + ':' + ClientSecret).toString('base64')
    },
    form: {
      grant_type: "authorization_code",
      code: code,
      redirect_uri: RedirectURL + "SMC",
      client_id: "T000007",
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
    let urlToRedirect = new url.URL("https://master.d29oecan9pu8tt.amplifyapp.com");
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
