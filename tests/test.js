'use strict';

const supertest = require('supertest');
const test = require('unit.js');
const app = require('../app.js');

const request = supertest(app);

describe('Tests app', function () {
  it('verifies delete all versions', function (done) {
    request.get('/deleteAllVersions')
      .expect(200).end((err, response) => {
        test.assert(response.body, true)
        done(err);
      });
  });

  it('verifies post version', function (done) {
    request.post('/newVersion')
      .send({
        permissionsFoGroup: {
          "Manager": ["ViewCustomerData"]
        }
      })
      .expect(200).end((err, response) => {
        test.assert(response.body.permissions.Manager, "ViewCustomerData")
        done(err);
      });
  });

  it('verifies post version', function (done) {
    request.post('/newVersion')
      .send({
        permissionsFoGroup: {
          "Manager": ["ViewCustomerData", "CreateServiceOrder"]
        }
      })
      .expect(200).end((err, response) => {
        test.assert(response.body.permissions.Manager, "ViewCustomerData")
        done(err);
      });
  });

  it('verifies get all versions', function (done) {
    request.get('/allVersions')
      .expect(200).end((err, response) => {
        test.assert(response.body[0].permissions.Manager[0], "ViewCustomerData")
        test.assert(response.body[0].name, "v1")
        test.assert(response.body[1].permissions.Manager[0], "ViewCustomerData")
        test.assert(response.body[1].permissions.Manager[1], "CreateServiceOrder")
        test.assert(response.body[1].name, "v2")
        done(err);
      });
  });
});
