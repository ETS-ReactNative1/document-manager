import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import supertest from 'supertest';
import isEmpty from 'lodash/isEmpty';
import app from '../../build/server';
import { hashPassword } from '../../server/helpers/helper';

const Document = require('../../build/models').Document;
const Role = require('../../build/models').Role;
const User = require('../../build/models').User;

const request = supertest.agent(app);
chai.use(chaiHttp);

const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJrZW5uZWR5Lm53YW9yZ3VAYW5kZWxhLmNvbSIsInVzZXJuYW1lIjoiY29kZWpvY2tpZSIsImlhdCI6MTUwMDcyODYxMCwiZXhwIjoxNTMyMjY0NjEwfQ.mn1ns_DZzP7vZKYR7_0EWm-8-HF_jk59jCQCmI0V6WY';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJkZXZqY2tlbm5lZHlAZ21haWwuY29tIiwidXNlcm5hbWUiOiJhY2VkY29kZXIiLCJpYXQiOjE1MDA3MjgyNDYsImV4cCI6MTUzMjI2NDI0Nn0.1_F20AvUfDV-HM-dZR-Qo28eozSqN_hEUDGZ_gvTHMs';

describe('Users endpoints', () => {
  beforeEach((done) => {
    User.destroy({
      where: {},
      truncate: true,
      cascade: true,
      restartIdentity: true
    })
      .then((err) => {
        if (!err) {
          Role.destroy({
            where: {},
            truncate: true,
            cascade: true,
            restartIdentity: true
          })
            .then((err) => {
              if (!err) {
                Role.bulkCreate([{
                  name: 'admin'
                },
                {
                  name: 'user'
                }]).then((err) => {
                  if (!err) {
                    //
                  }
                  done();
                });
              }
            });
        }
      });
  });

  // GET /v1/users route
  describe('GET /v1/users', () => {
    beforeEach((done) => {
      User.bulkCreate([{
        username: process.env.USERNAME,
        firstname: 'Kennedy',
        lastname: 'John',
        password: hashPassword(process.env.PASSWORD),
        email: process.env.EMAIL,
        roleId: 1
      }, {
        username: 'acedcoder',
        firstname: 'Kennedy',
        lastname: 'John',
        password: hashPassword('test'),
        email: 'devjckennedy@gmail.com',
        roleId: 2
      }]).then(() => {
        done();
      });
    });

    it('successfully connects to the API', (done) => {
      request
        .get('/v1/users')
        .set('Accept', 'application/json')
        .set('X-Auth', authToken)
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
          }
          done();
        });
    });

    it('validates offset and limit query params', (done) => {
      request
        .get('/v1/users/?limit=cj&offset=0')
        .set('X-Auth', authToken)
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(400);
            expect(res.body.status).to.equal('error');
            expect(res.body.message).to.equal('Limit and Offset params must be numbers');
          }
          done();
        });
    });

    it('given valid offset and limit, it returns correct data', (done) => {
      request
        .get('/v1/users/?limit=1&offset=0')
        .set('X-Auth', authToken)
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('ok');
            expect(res.body.count).to.equal(1);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data[0].fullName).to.equal('John Kennedy');
          }
          done();
        });
    });

    it('returns a 200 status if no users', (done) => {
      User.destroy({
        where: {},
        truncate: true,
        cascade: true,
        restartIdentity: true
      }).then((err) => {
        if (!err) {
          Role.destroy({
            where: {},
            truncate: true,
            cascade: true,
            restartIdentity: true
          }).then(() => {
            //
          });
        }
      });

      request
        .get('/v1/users')
        .set('Accept', 'application/json')
        .set('X-Auth', authToken)
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('No users found');
          }
          done();
        });
    });

    it('successfully retrieves users', (done) => {
      request
        .get('/v1/users')
        .set('Accept', 'application/json')
        .set('X-Auth', authToken)
        .end((err, res) => {
          if (!err) {
            expect(res.body.data).to.be.an('array');
          }
          done();
        });
    });
  });

  // POST /v1/users route
  describe('POST /v1/users', () => {
    beforeEach((done) => {
      User.create({
        username: process.env.USERNAME,
        firstname: process.env.FIRSTNAME,
        lastname: process.env.LASTNAME,
        password: hashPassword(process.env.PASSWORD),
        email: process.env.EMAIL,
        roleId: 1
      }).then((err) => {
        if (!err) {
          //
        }
        done();
      });
    });

    it('should not POST incomplete user data', (done) => {
      const user = {
        username: '',
        firstname: '',
        lastname: '',
        password: '',
        email: process.env.EMAIL,
      };

      request
        .post('/v1/users')
        .set('X-Auth', authToken)
        .send(user)
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(400);
            expect(isEmpty(res.body.errors)).to.equal(false);
            expect(res.body.errors.username).to.equal('Username is required');
            expect(res.body.errors.firstname).to.equal('Firstname is required');
            expect(res.body.errors.lastname).to.equal('Lastname is required');
            expect(res.body.errors.password).to.equal('Password is required');
            expect(res.body.errors.roleId).to.equal('Role ID is required');
            expect(res.body.errors).to.not.have.property('email');
          }
          done();
        });
    });

    it('should return 400 status message for duplicate user', (done) => {
      const user = {
        username: process.env.USERNAME,
        firstname: process.env.FIRSTNAME,
        lastname: process.env.LASTNAME,
        password: hashPassword(process.env.PASSWORD),
        email: process.env.EMAIL,
        roleId: 1
      };

      request
        .post('/v1/users/')
        .set('X-Auth', authToken)
        .send(user)
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(400);
            expect(res.body.message).to
              .equal('username and email must be unique');
          }
          done();
        });
    });

    it('POSTs a valid user data', (done) => {
      const user = {
        username: 'acedcoder',
        firstname: 'Kennedy',
        lastname: 'John',
        password: hashPassword('test'),
        email: 'devjckennedy@gmail.com',
        roleId: 1
      };

      request
        .post('/v1/users')
        .set('X-Auth', authToken)
        .send(user)
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('data');
            expect(res.body.data.username).to.equal('acedcoder');
            expect(res.body.data.firstname).to.equal('Kennedy');
            expect(res.body.data.lastname).to.equal('John');
            expect(res.body.data.email).to.equal('devjckennedy@gmail.com');
            expect(res.body.data).to.have.property('createdAt');
            expect(res.body.data).to.have.property('updatedAt');
          }
          done();
        });
    });
  });

  // POST /v1/users/login
  describe('POST /v1/users/login', () => {
    beforeEach((done) => {
      User.bulkCreate([{
        username: process.env.USERNAME,
        firstname: process.env.FIRSTNAME,
        lastname: process.env.LASTNAME,
        password: hashPassword(process.env.PASSWORD),
        email: process.env.EMAIL,
        roleId: 1
      }, {
        username: 'acedcoder',
        firstname: 'Kennedy',
        lastname: 'John',
        password: hashPassword('test'),
        email: 'devjckennedy@gmail.com',
        roleId: 2
      }]).then(() => {
        done();
      });
    });

    it('successfully authenticates a user', (done) => {
      request
        .post('/v1/users/login')
        .send({
          email: process.env.EMAIL,
          password: process.env.PASSWORD
        })
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
          }
          done();
        });
    });

    it('generates a token on successful authentication', (done) => {
      request
        .post('/v1/users/login')
        .send({
          email: process.env.EMAIL,
          password: process.env.PASSWORD
        })
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
            expect(res.body.token).to.be.a('string');
          }
          done();
        });
    });

    it('sets the token on the header with a key of  X-Auth', (done) => {
      request
        .post('/v1/users/login')
        .send({
          email: process.env.EMAIL,
          password: process.env.PASSWORD
        })
        .end((err, res) => {
          if (!err) {
            expect(res.header['x-auth']).to.equal(res.body.token);
          }
          done();
        });
    });
  });

  // GET /v1/users/:id route
  describe('GET /v1/users/:id', () => {
    beforeEach((done) => {
      User.create({
        username: process.env.USERNAME,
        firstname: process.env.FIRSTNAME,
        lastname: process.env.LASTNAME,
        password: hashPassword(process.env.PASSWORD),
        email: process.env.EMAIL,
        roleId: 1
      }).then((err) => {
        if (!err) {
          //
        }
        done();
      });
    });

    it('gets a user by id', (done) => {
      request
        .get('/v1/users/1')
        .set('X-Auth', authToken)
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
            expect(res.body.id).to.equal(1);
            expect(res.body.username).to.equal(process.env.USERNAME);
            expect(res.body.firstname).to.equal(process.env.FIRSTNAME);
            expect(res.body.lastname).to.equal(process.env.LASTNAME);
            expect(res.body.email).to.equal(process.env.EMAIL);
          }
          done();
        });
    });

    it('returns a 404 status message for non-existing user', (done) => {
      request
        .get('/v1/users/10')
        .set('X-Auth', authToken)
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('User not found');
          }
          done();
        });
    });

    it('returns a 400 status message for invalid param', (done) => {
      request
        .get('/v1/users/cj')
        .set('X-Auth', authToken)
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Param must be a number');
          }
          done();
        });
    });
  });

  // GET /v1/users/:id/documents
  describe('GET /v1/users/:id/documents', () => {
    beforeEach((done) => {
      User.bulkCreate([{
        username: process.env.USERNAME,
        firstname: 'Kennedy',
        lastname: 'John',
        password: hashPassword(process.env.PASSWORD),
        email: process.env.EMAIL,
        roleId: 1
      }, {
        username: 'acedcoder',
        firstname: 'Kennedy',
        lastname: 'John',
        password: hashPassword('test'),
        email: 'devjckennedy@gmail.com',
        roleId: 2
      }]).then(() => {
        Document.create({
          title: 'PUT test',
          content: 'Running Tests',
          author: 'John Kennedy',
          userId: 1,
          roleId: 1,
          access: 'public'
        })
          .then(() => {
            done();
          });
      });
    });

    it('returns error on invalid document id', (done) => {
      request
        .get('/v1/users/cj/documents')
        .set('X-Auth', authToken)
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Param must be a number');
          }
          done();
        });
    });

    it('returns a 404 status for non-existing user', (done) => {
      request
        .get('/v1/users/10/documents')
        .set('X-Auth', authToken)
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('User not found');
          }
          done();
        });
    });

    it('returns a 404 status if a document is not found for a user', (done) => {
      request
        .get('/v1/users/2/documents')
        .set('X-Auth', authToken)
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('No document found for this user');
          }
          done();
        });
    });

    it('returns all documents belonging to the user', (done) => {
      request
        .get('/v1/users/1/documents')
        .set('X-Auth', authToken)
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
            // expect(res.body.message).to.equal('No document found for this user');
          }
          done();
        });
    });
  });

  // PUT /v1/users/:id route
  describe('PUT /v1/users/:id', () => {
    beforeEach((done) => {
      User.create({
        username: process.env.USERNAME,
        firstname: process.env.FIRSTNAME,
        lastname: process.env.LASTNAME,
        password: hashPassword(process.env.PASSWORD),
        email: process.env.EMAIL,
        roleId: 1
      }).then((err) => {
        if (!err) {
          //
        }
        done();
      });
    });

    it('returns a 400 status for invalid input param', (done) => {
      request
        .put('/v1/users/cj')
        .set('X-Auth', authToken)
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Param must be a number');
          }
          done();
        });
    });

    it('returns a 404 status for non-existing user', (done) => {
      request
        .put('/v1/users/10')
        .set('X-Auth', authToken)
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('User not found');
          }
          done();
        });
    });

    it('returns a 401 status for unauthorised user', (done) => {
      request
        .put('/v1/users/1')
        .set('X-Auth', token)
        .send({
          email: 'devjckennedy@gmail.com',
          username: 'acedcoder'
        })
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(401);
            // expect(res.body.message).to
            //   .equal('Unauthorised user. You don\'t have permission to update this user');
          }
          done();
        });
    });

    it('returns a 400 status for duplicate email or username', (done) => {
      User.bulkCreate([{
        username: 'acedcoder',
        firstname: 'Kennedy',
        lastname: 'John',
        password: hashPassword('test'),
        email: 'devjckennedy@gmail.com',
        roleId: 1,
      }, {
        username: 'intelbrainee',
        firstname: 'Kennedy',
        lastname: 'John',
        password: hashPassword('test'),
        email: 'kennedy20000@yahoo.com',
        roleId: 2,
      }])
        .then(() => {
          request
            .put('/v1/users/1')
            .set('X-Auth', authToken)
            .send({
              email: 'kennedy20000@yahoo.com',
            })
            .end((err, res) => {
              if (!err) {
                expect(res.status).to.equal(400);
                expect(res.body.message).to.equal('A user exist with same email or username');
              }
              done();
            });
        });
    });

    it('updates a user by id', (done) => {
      request
        .put('/v1/users/1')
        .set('X-Auth', authToken)
        .send({
          lastname: 'Nwaorgu',
        })
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(201);
            expect(res.body.data.username).to.equal(process.env.USERNAME);
            expect(res.body.data.firstname).to.equal(process.env.FIRSTNAME);
            expect(res.body.data.lastname).to.equal('Nwaorgu');
            expect(res.body.data.email).to.equal(process.env.EMAIL);
          }
          done();
        });
    });
  });

  // DELETE /v1/users/:id route
  describe('DELETE /v1/users/:id', () => {
    beforeEach((done) => {
      User.create({
        username: process.env.USERNAME,
        firstname: process.env.FIRSTNAME,
        lastname: process.env.LASTNAME,
        password: hashPassword(process.env.PASSWORD),
        email: process.env.EMAIL,
        roleId: 1
      }).then((err) => {
        if (!err) {
          //
        }
        done();
      });
    });

    it('returns a 400 status for invalid input param', (done) => {
      request
        .delete('/v1/users/cj')
        .set('X-Auth', authToken)
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Param must be a number');
          }
          done();
        });
    });

    it('returns a 404 status for non-existing user', (done) => {
      request
        .put('/v1/users/10')
        .set('X-Auth', authToken)
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('User not found');
          }
          done();
        });
    });

    it('returns a 401 status for unauthorised user', (done) => {
      request
        .put('/v1/users/1')
        .set('X-Auth', token)
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(401);
            // expect(res.body.message).to
            //   .equal('Unauthorised user. You don\'t have permission to update this user');
          }
          done();
        });
    });

    it('deletes a user by id', (done) => {
      request
        .delete('/v1/users/1')
        .set('X-Auth', authToken)
        .end((err, res) => {
          if (!err) {
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('User deleted successfully');
          }
          done();
        });
    });
  });
});
