import { describe } from 'node:test';
import { messagify } from './sse';

describe('lib/sse', () => {
    describe('messagify()', () => {
        it('should return a string', () => {
            expect(messagify('test')).toBe('data: test\n\n');
        });
    });
});
