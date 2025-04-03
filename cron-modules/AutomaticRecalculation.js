import AxiosInstance from "../utils/AxiosInstance.js";
import chalk from 'chalk';

class AutomaticRecalculation {

    /**
     * Constructor for AutomaticRecalculation class. 
     * @param {String} apiEndpoint - Example: "/compensation-management/recalculate-deductions"
     * @param {String} nameOfProcess - Example: "deductions"
     * @param {Number} RETRY_SECONDS - Seconds to wait before retrying. Default is 30 seconds.
     * @param {Number} MAX_RETRIES - Optional: Add a maximum retry limit. Default is 3 retries.
     */
    constructor(apiEndpoint, nameOfProcess, RETRY_SECONDS=30, MAX_RETRIES=3) {
      this.apiEndpoint = apiEndpoint;
      this.nameOfProcess = nameOfProcess;
      this.RETRY_SECONDS = RETRY_SECONDS; // Seconds to wait before retrying
      this.MAX_RETRIES = MAX_RETRIES; // Optional: Add a maximum retry limit
    }

    initializeBackendRequest = async () => {
        // Create a loading animation with colored text
        const loadingStates = [' ⠋', ' ⠙', ' ⠹', ' ⠸', ' ⠼', ' ⠴', ' ⠦', ' ⠧', ' ⠇', ' ⠏'];
        let i = 0;
        const loadingInterval = setInterval(() => {
          process.stdout.write(`\r${chalk.cyan(loadingStates[i])} ${chalk.blue(`Updating ${chalk.bold(this.nameOfProcess)}...`)}`);
          i = (i + 1) % loadingStates.length;
        }, 100);
      
        try {
          // Log the base URL to see what's being used with dynamic box width
          const endpointUrl = AxiosInstance.defaults.baseURL + this.apiEndpoint;
          const requestText = `Sending POST request to update ${this.nameOfProcess}`;
          
          // Calculate required width based on content
          const requestTextLength = requestText.length + 2; // include side padding
          const urlLength = endpointUrl.length + 2; // include side padding
          const boxWidth = Math.max(requestTextLength, urlLength) + 2; // Add extra padding
          
          console.log(`\n${chalk.cyan('┌' + '─'.repeat(boxWidth) + '┐')}`);
          console.log(`${chalk.cyan('│')} ${chalk.yellow.bold(requestText)}${' '.repeat(boxWidth - requestTextLength)} ${chalk.cyan('│')}`);
          console.log(`${chalk.cyan('│')} ${chalk.gray(endpointUrl)}${' '.repeat(boxWidth - urlLength)} ${chalk.cyan('│')}`);
          console.log(`${chalk.cyan('└' + '─'.repeat(boxWidth) + '┘')}`);
      
          const response = await AxiosInstance.post(this.apiEndpoint);
      
          // Clear the loading animation
          clearInterval(loadingInterval);
          process.stdout.write('\r' + ' '.repeat(60) + '\r');
      
          if (response.status !== 200) {
            throw new Error(`Failed to update ${this.nameOfProcess}: ${response.statusText}`);
          }
      
          console.log(`\n${chalk.green('✓')} ${chalk.green.bold('Successful Response:')}`);
          console.log(`${chalk.gray('─'.repeat(50))}`);
          console.log(chalk.green(JSON.stringify(response.data, null, 2)));
          console.log(`${chalk.gray('─'.repeat(50))}`);
          return true;
        } catch (error) {
          // Clear the loading animation on error too
          clearInterval(loadingInterval);
          process.stdout.write('\r' + ' '.repeat(60) + '\r');
          
          console.error(`\n${chalk.red('✗')} ${chalk.red.bold(`Error updating ${this.nameOfProcess}:`)}`);
          console.error(chalk.red(error.response?.data?.response || error.message));
          
          return false;
        }
    };


    showProgressBar = (seconds) => {
      const barLength = 30;
      let current = 0;
      
      return new Promise(resolve => {
        const interval = setInterval(() => {
          current++;
          const progress = Math.floor((current / seconds) * barLength);
          const progressBar = chalk.green('█'.repeat(progress)) + chalk.gray('▒'.repeat(barLength - progress));
          const percentage = Math.floor((current / seconds) * 100);
          
          process.stdout.write(`\r${chalk.blue('Waiting:')} [${progressBar}] ${chalk.yellow(`${percentage}%`)} (${chalk.cyan(`${current}/${seconds}s`)})`);
          
          if (current >= seconds) {
            clearInterval(interval);
            process.stdout.write('\n');
            resolve();
          }
        }, 1000);
      });
    };
    
    // Main execution with retry logic
    main = async () => {
      let retryCount = 0;
      
      console.log(`\n${chalk.blue.bold('🔄 Starting recalculation of')} ${chalk.magenta.bold(this.nameOfProcess)}\n`);
    
      while (true) {
        const result = await this.initializeBackendRequest();
        if (result) {
          console.log(`\n${chalk.green.bold('✓ Success!')} ${chalk.green(`${this.nameOfProcess} updated successfully.`)}`);
          break;
        }
        
        retryCount++;
    
        if (retryCount >= this.MAX_RETRIES) {
          console.log(`\n${chalk.red.bold('⚠ Maximum retry attempts')} (${chalk.yellow(this.MAX_RETRIES)}) ${chalk.red.bold('reached. Exiting.')}`);
          process.exit(1);
          break;
        }
    
        console.log(`\n${chalk.yellow('⏱ Waiting')} ${chalk.yellow.bold(this.RETRY_SECONDS)} ${chalk.yellow('seconds before retry...')} (${chalk.blue(`Attempt ${retryCount} of ${this.MAX_RETRIES}`)})`);
        
        await this.showProgressBar(this.RETRY_SECONDS);
        
        console.log(`\n${chalk.blue.bold('🔄 Retrying...')}`);
      }
    
      console.log(`\n${chalk.green.bold('✅ Process complete!')}\n`);
      process.exit(0);
    };
}

export default AutomaticRecalculation;