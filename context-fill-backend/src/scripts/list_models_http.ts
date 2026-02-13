import * as dotenv from 'dotenv';
import path from 'path';
import https from 'https';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('Error: GEMINI_API_KEY is not set in .env file.');
        process.exit(1);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    console.log(`Fetching models from: ${url.replace(apiKey, 'HIDDEN_KEY')}`);

    https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            if (res.statusCode !== 200) {
                console.error(`Error: Failed to fetch models. Status Code: ${res.statusCode}`);
                console.error('Response:', data);
                return;
            }

            try {
                const parsedData = JSON.parse(data);
                if (parsedData.models) {
                    console.log('Available Models:');
                    parsedData.models.forEach((model: any) => {
                        // Filter for generateContent
                        if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes('generateContent')) {
                            console.log(`- ${model.name.replace('models/', '')} (${model.displayName})`);
                        }
                    });
                } else {
                    console.log('No models found in response.');
                    console.log(JSON.stringify(parsedData, null, 2));
                }
            } catch (e) {
                console.error('Error parsing JSON response:', e);
            }
        });

    }).on('error', (err) => {
        console.error('Error making request:', err.message);
    });
}

listModels();
