/**
 * Created by martin on 5/17/16.
 */

var assert = require('assert');
var byuJwt = require('../index');

describe('byuJWTTests', function() {
    it('jwtDecoded', function (done) {
        //to run test case capture a jwt and copy in the function invokation below.
        byuJwt.jwtDecoded('jwtgoes here', 'well known url goes here')
            .then(function (jwtDecoded)
            {
                try
                {
                    assert.equal(jwtDecoded.byu.client_net_id, '?');
                    assert.equal(jwtDecoded.byu.resourceowner_net_id, '?');
                    assert.equal(jwtDecoded.wso2.keytype, '?');
                    done()
                }
                catch (e)
                {
                    console.log(e);
                    done(err);
                }
            });
    });
});
