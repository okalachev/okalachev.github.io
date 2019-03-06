var ajv = new require('ajv')();

const MAX_POINTS = 3000;
const MAX_COORD = 9999;

var schema = {
	type: 'object',
	additionalProperties: false,
	required: ['points'],
	properties: {
		points: {
			type: 'array',
			minItems: 1,
			maxItems: MAX_POINTS,
			items: {
				type: 'array',
				minItems: 2,
				maxItems: 2,
				items: {
					type: 'number',
					minimum: 0,
					maximum: MAX_COORD
				}
			}
		}
	}
}

exports.validatePath = ajv.compile(schema);
