'use strict';

const supertest = require('supertest');
const test = require('unit.js');
const app = require('../app.js');

const request = supertest(app);

var lastSavedVersionId = "";

describe('Tests app', function () {
  it('verifies delete all versions', function (done) {
    request.get('/deleteAllVersions')
      .expect(200).end((err, response) => {
        test.assert(response.body, true)
        done(err);
      });
  });

  it('verifies delete all active versions', function (done) {
    request.get('/deleteAllActiveVersions')
      .expect(200).end((err, response) => {
        test.assert(response.body, true)
        done(err);
      });
  });

  it('verifies post version', function (done) {
    request.post('/newVersion')
      .send({
        permissionsForGroup: {
          "Manager": ["ViewCustomerData"]
        },
        service: "SAP Service Cloud"
      })
      .expect(200).end((err, response) => {
        console.log(response.body)
        lastSavedVersionId = response.body._id
        test.assert(response.body.permissions.Manager, "ViewCustomerData")
        test.assert(response.body.service, "SAP Service Cloud")
        done(err);
      });
  });

  it('verifies post version', function (done) {
    request.post('/newVersion')
      .send({
        permissionsForGroup: {
          "Manager": ["ViewCustomerData"]
        },
        service: "SAP Marketing Cloud"
      })
      .expect(200).end((err, response) => {
        console.log(response.body)
        lastSavedVersionId = response.body._id
        test.assert(response.body.permissions.Manager, "ViewCustomerData")
        test.assert(response.body.service, "SAP Marketing Cloud")
        done(err);
      });
  });

  it('verifies post version', function (done) {
    request.post('/newVersion')
      .send({
        permissionsForGroup: {

        },
        service: "SAP Sales Cloud"
      })
      .expect(200).end((err, response) => {
        console.log(response.body)
        lastSavedVersionId = response.body._id
        test.assert(response.body.service, "SAP Sales Cloud")
        done(err);
      });
  });

  it('verifies get active versions', function (done) {
    request.get('/activeVersions')
      .expect(200).end((err, response) => {
        console.log(response.body)
        test.assert(response.body.find(version => version._id === "SAP Service Cloud").versionId, lastSavedVersionId)
        done(err);
      });
  });

  it('verifies post version', function (done) {
    request.post('/newVersion')
      .send({
        permissionsForGroup: {
          "Manager": ["ViewCustomerData", "CreateServiceOrder"]
        },
        service: "SAP Service Cloud"
      })
      .expect(200).end((err, response) => {
        console.log(response.body)
        lastSavedVersionId = response.body._id
        test.assert(response.body.permissions.Manager, "ViewCustomerData")
        test.assert(response.body.service, "SAP Service Cloud")
        done(err);
      });
  });

  it('verifies get active versions', function (done) {
    request.get('/activeVersions')
      .expect(200).end((err, response) => {
        console.log(response.body)
        test.assert(response.body.find(version => version._id === "SAP Service Cloud").versionId, lastSavedVersionId)
        done(err);
      });
  });

  it('verifies get all versions', function (done) {
    request.get('/allVersions?service=' + encodeURIComponent("SAP Service Cloud"))
      .expect(200).end((err, response) => {
        console.log(response.body)
        test.assert(response.body[1].permissions.Manager[0], "ViewCustomerData")
        test.assert(response.body[1].name, "v1")
        test.assert(response.body[0].permissions.Manager[0], "ViewCustomerData")
        test.assert(response.body[0].permissions.Manager[1], "CreateServiceOrder")
        test.assert(response.body[0].name, "v2")
        done(err);
      });
  });
  
  it('verifies get timestamp', function (done) {
    request.get('/timestamp')
      .expect(200).end((err, response) => {
        console.log(response.body.now)
        done(err);
      });
  });

  it('creates tar gz', function (done) {
    request.get('/bundle/serviceCloud')
      .expect(200).end((err, response) => {
        console.log(response.body)
        done(err);
      });
  });
});
