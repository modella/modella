global.chai = require('chai');
global.sinon = require('sinon');
global.sinonChai = require('sinon-chai');
global.should = chai.should();
global.exprect = chai.expect;
chai.use(sinonChai)
