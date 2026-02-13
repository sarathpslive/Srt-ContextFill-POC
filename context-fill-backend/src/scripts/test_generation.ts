import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('Error: GEMINI_API_KEY is not set in .env file.');
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Models to test, prioritizing flash/lite versions
    const modelsToTest = [
        'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-exp-1206',
        'gemini-2.0-pro-exp-02-05',
        'gemini-flash-latest' // Retry this one last
    ];

    console.log('Testing models for generation capability...');

    for (const modelName of modelsToTest) {
        console.log(`\nTesting model: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Hello, are you working?');
            const response = await result.response;
            console.log(`✅ Success! Model '${modelName}' is working.`);
            console.log(`Response: ${response.text().substring(0, 100)}...`);
            return; // Exit after finding a working model
        } catch (error: any) {
            console.log(`❌ Model '${modelName}' failed.`);
            // Extract error message cleanly
            const msg = error.message || String(error);
            const shortMsg = msg.includes('[429') ? '429 Quota Exceeded' :
                msg.includes('[404') ? '404 Not Found' :
                    msg.substring(0, 200);
            console.log(`Error: ${shortMsg}`);
        }
    }

    console.log('\nCould not find a working model from the list.');
}

testModels();
