import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveIIIFUrl } from '../src/lib/functions/ease_of_use/resolveIIIFUrl.ts';

test('resolves first facsimile filenames and preserves existing image URLs', () => {
	const base = 'https://iiif.ub.unibe.ch/image/v3/ceresa/';
	assert.equal(resolveIIIFUrl('A-1-b_6-2_002'), `${base}A-1-b_6-2_002.tif`);
	assert.equal(resolveIIIFUrl('A-1-b_6-2_002.tif'), `${base}A-1-b_6-2_002.tif`);
	assert.equal(resolveIIIFUrl('A-5-b_15_001??'), `${base}A-5-b_15_001%3F%3F.tif`);
	assert.equal(
		resolveIIIFUrl('https://example.test/image.tif'),
		'https://example.test/image.tif'
	);
	assert.equal(resolveIIIFUrl(''), null);
	assert.equal(resolveIIIFUrl(undefined), null);
});
