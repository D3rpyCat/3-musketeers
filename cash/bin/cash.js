'use strict';

const got = require('got');
const money = require('money');
const chalk = require('chalk');
const ora = require('ora');
const currencies = require('../lib/currencies.json');

const {API} = require('./constants');

/**
 * Convert a certain amount of the currency to be converted
 * @param {int} command - Value of the currency to convert
 */
const cash = async command => {
	const {amount} = command;
	/**
	 * @const {string} - Currency which is converted
	 */
	const from = command.from.toUpperCase();
	/**
	 * @const {string} - Currency chosen to convert
	 */
	const to = command.to.filter(item => item !== from).map(item => item.toUpperCase());

	console.log();
	/**
	 * Render of a spinner
	 * @function ora
	 */
	const loading = ora({
		text: 'Converting...',
		color: 'green',
		spinner: {
			interval: 150,
			frames: to
		}
	});

	/**Run the spinner */
	loading.start();

	/**Conversion using base and rates of the currency chosen*/
	await got(API, {
		json: true
	}).then(response => {
		money.base = response.body.base;
		money.rates = response.body.rates;

		/**For each @param {int} item of the table @var currencies,  convert the chosen currency to the new one with the correct amount.*/
		to.forEach(item => {
			if (currencies[item]) {
				loading.succeed(`${chalk.green(money.convert(amount, {from, to: item}).toFixed(3))} ${`(${item})`} ${currencies[item]}`);
			} else {
				loading.warn(`${chalk.yellow(`The "${item}" currency not found `)}`);
			}
		});

		console.log(chalk.underline.gray(`\nConversion of ${chalk.bold(from)} ${chalk.bold(amount)}`));
	}).catch(error => {
		if (error.code === 'ENOTFOUND') {
			loading.fail(chalk.red('Please check your internet connection!\n'));
		} else {
			loading.fail(chalk.red(`Internal server error :(\n${error}`));
		}
		process.exit(1);
	});
};

/**Module export to the list of modules*/
module.exports = cash;
