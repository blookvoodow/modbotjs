import { add, multiply } from './sample';
import * as _ from 'lodash';
console.log('sample app');
console.log('1 + 1 is ', add(1, 1));
console.log('3 * 4 is ', multiply(3, 4));
let numbers = [1, 2, 3, 4, 5, 6, 7, 8];
let processedNumbers = _.filter(
	_.map(numbers, x => x * 2),
	x => x % 2 === 0);

console.log(processedNumbers);