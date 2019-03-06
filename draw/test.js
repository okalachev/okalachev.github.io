var should = require('should');
var validatePath = require('./validate').validatePath;

describe('validatePath', function() {
	it('should pass correct path', function() {
		validatePath({points: [[0,0],[5,5],[100,200]]}).should.be.true();
		validatePath({points: [[0,0],[1000,1000]]}).should.be.true();
		validatePath({points: [[5,5]]}).should.be.true();
	});
	it('should not pass objects without points', function() {
		validatePath({}).should.be.false();
		validatePath({foo:'bar'}).should.be.false();
	});
	it('should not pass non-object', function() {
		validatePath(true).should.be.false();
		validatePath(false).should.be.false();
		validatePath('foo').should.be.false();
		validatePath(null).should.be.false();
		validatePath(NaN).should.be.false();
		validatePath(Infinity).should.be.false();
		validatePath(5).should.be.false();
		validatePath(0).should.be.false();
		validatePath(-1).should.be.false();
		validatePath(-5.12).should.be.false();
	});
	it('should not pass non-array points', function() {
		validatePath({points: null}).should.be.false();
		validatePath({points: NaN}).should.be.false();
		validatePath({points: 123}).should.be.false();
		validatePath({points: 'foo'}).should.be.false();
		validatePath({points: {foo:'bar'}}).should.be.false();
	});
	it('should not pass empty points', function() {
		validatePath({points: []}).should.be.false();
	});
	it('should not pass redundant fields', function() {
		validatePath({points: [[1,1]], foo: 'bar'}).should.be.false();
		validatePath({points: [[1,1],[2,3]], zzz: 666}).should.be.false();
	});
	it('should not pass inf and nan points', function() {
		validatePath({points:[[1,2],[NaN,0]]}).should.be.false();
		validatePath({points:[[1,2],[0,Infinity]]}).should.be.false();
		validatePath({points:[[1,-Infinity],[0,2]]}).should.be.false();
	});
	it('should not pass non-number points', function() {
		validatePath({points:[[1,2],['foo',0]]}).should.be.false();
		validatePath({points:[[1,2],[0,{foo:'bar'}]]}).should.be.false();
		validatePath({points:[[1,true],[0,2]]}).should.be.false();
	})
	it('should not pass out-of-limits points', function() {
		validatePath({points:[[1,2],[99999,0]]}).should.be.false();
		validatePath({points:[[1,2],[0,99999]]}).should.be.false();
		validatePath({points:[[1,2],[-5,5]]}).should.be.false();
		validatePath({points:[[-99,2],[5,23]]}).should.be.false();
	});
	it('should not pass ill-formed points', function() {
		validatePath({points:[[1,2],[]]}).should.be.false();
		validatePath({points:[[1,2],[5]]}).should.be.false();
		validatePath({points:[[1,2],[5,6,7]]}).should.be.false();
		validatePath({points:[[1,2,3,2],[5,6]]}).should.be.false();
	});
	it('should not pass too many points', function() {
		let points = []
		for (let i = 0; i < 4000; i++) points.push([0, 0]);
		validatePath({points:points}).should.be.false();
	});
});
