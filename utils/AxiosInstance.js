import Axios from 'axios';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Load environment variables from .env.local file
dotenv.config({ path: './.env.local' });

// Get environment variables
const backendUrl = process.env.BACKEND_URL || 'Not set';
const webhookKey = process.env.BIMS_CRON_WEBHOOK || 'Not set';

// Determine the maximum content length considering only the visible text
const titleText = 'Environment Variables Loaded';
const backendUrlLabel = 'BACKEND_URL: ';
const webhookLabel = 'BIMS_CRON_WEBHOOK: ';

// Calculate the width needed for each line (visible text only)
const titleWidth = titleText.length + 2; // +2 for padding
const backendWidth = backendUrlLabel.length + backendUrl.length + 2;
const webhookWidth = webhookLabel.length + webhookKey.length + 2;
// Get the maximum width needed
const contentWidth = Math.max(titleWidth, backendWidth, webhookWidth);
// Add extra padding
const boxWidth = contentWidth + 2;
// Draw the top of the box
console.log(chalk.cyan('┌' + '─'.repeat(boxWidth) + '┐'));
// Draw the title
const titlePadding = boxWidth - titleText.length;
console.log(chalk.cyan('│') + chalk.yellow.bold(' ' + titleText) + ' '.repeat(titlePadding - 1) + chalk.cyan('│'));
// Draw empty line
console.log(chalk.cyan('│') + ' '.repeat(boxWidth) + chalk.cyan('│'));
// Draw BACKEND_URL line
const backendPadding = boxWidth - (backendUrlLabel.length + backendUrl.length);
console.log(chalk.cyan('│') + chalk.blue(' ' + backendUrlLabel) + chalk.green(backendUrl) + ' '.repeat(backendPadding - 1) + chalk.cyan('│'));
// Draw WEBHOOK line
const webhookPadding = boxWidth - (webhookLabel.length + webhookKey.length);
console.log(chalk.cyan('│') + chalk.blue(' ' + webhookLabel) + chalk.green(webhookKey) + ' '.repeat(webhookPadding - 1) + chalk.cyan('│'));
// Draw the bottom of the box
console.log(chalk.cyan('└' + '─'.repeat(boxWidth) + '┘'));
console.log();


// Define default values
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
const BIMS_CRON_WEBHOOK = process.env.BIMS_CRON_WEBHOOK || "BIMS_QklNU19TRUNSRVRfV0FHX0lCSUdBWQ==";

// Create and configure Axios instance
const AxiosInstance = Axios.create({
    baseURL: BACKEND_URL + '/api',
});

// Add request interceptor to include webhook token in every request
AxiosInstance.interceptors.request.use(
    (config) => {
        config.headers['BIMS_CRON_WEBHOOK'] = BIMS_CRON_WEBHOOK;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default AxiosInstance;