'use strict'
process.env.NODE_ENV = 'test'
global.Promise = require( 'bluebird' )
global.processSync = true

if ( !global._tests_setup ) {
    global._tests_setup = true
}
