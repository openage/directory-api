'use strict'
let chai = require( 'chai' );
let chaiHttp = require( 'chai-http' );
chai.use( chaiHttp );
let server = require( '../../bin/app' );
let testData = require( '../testData' )
var expect = require( 'chai' ).expect



describe( 'employee api', function () {

    beforeEach( function () { } )
    afterEach( function () { } )

    describe( 'search', () => {
        it( 'should return employees', function () {
            let roleKey = testData.roles.obj( 'test' ).key
            chai.request( server )
                .get( '/api/employees' )
                .set( 'x-role-Key', roleKey )
                .then( res => {
                    expect( res ).to.have.status( 200 )
                    expect( res.body.isSuccess ).to.be.true
                } )
        } );
    } )


    describe( 'update', () => {
        it( 'should update employee', function () {
            let roleKey = testData.roles.obj( 'test' ).key
            let employee = testData.employees.obj( 'test' )
            chai.request( server )
                .put( `/api/employees/${employee.id}` )
                .set( 'x-role-Key', roleKey )
                .send( {
                    status: 'active'
                } )
                .then( res => {
                    expect( res ).to.have.status( 200 )
                    expect( res.body.isSuccess ).to.be.true
                } )
        } );
    } )
} )
