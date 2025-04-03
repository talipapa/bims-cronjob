import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import AutomaticRecalculation from "./cron-modules/AutomaticRecalculation.js";

const argv = yargs(hideBin(process.argv))
  .option('recalculate', {
    describe: 'Specify recalculation action',
    type: 'string',
    choices: ['deductions', '13th-month-pay'],
    demandOption: false
  })
  .help()
  .argv;

if (argv.recalculate) {
  console.log(chalk.blue.bold(`Executing: ${chalk.green(argv.recalculate)}`));
  
  // Define the recalculation actions here, add more actions as needed
  const recalculationMap = {
    'deductions': new AutomaticRecalculation(
      "/compensation-management/recalculate-deductions", 
      "deductions"
    ),
    '13th-month-pay': new AutomaticRecalculation(
      "/compensation-management/recalculate-13th-month-pay", 
      "13th month pay"
    )
  };
  
  const instance = recalculationMap[argv.recalculate];
  
  if (instance) {
    instance.main()
      .then(() => {
        console.log(chalk.green.bold(`✓ Successfully completed ${argv.recalculate} recalculation`));
      })
      .catch(error => {
        console.error(chalk.red.bold(`✗ Error during execution:`));
        console.error(chalk.red(error.message));
        process.exit(1);
      });
  }
} else {
  console.log(chalk.yellow('No execution target specified.'));
  console.log(chalk.cyan(`Use ${chalk.white.bold('--recalculate=deductions')} or ${chalk.white.bold('--recalculate=13th-month-pay')}`));
  yargs().showHelp();
}