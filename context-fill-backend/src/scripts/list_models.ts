import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('Error: GEMINI_API_KEY is not set in .env file.');
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // Note: The GoogleGenerativeAI SDK for Node.js currently focuses on generateContent.
        // Listing models might need to be done via direct API call or specific method if available.
        // However, let's try a simple generation with a known model first to see if it works,
        // and print what models are available if we can fetch them.
        //
        // Actually, looking at the SDK, we can use the ModelService if it's exposed, but often it isn't directly.
        // Let's try to verify if 'gemini-1.5-flash' works with a simple prompt.
        // If not, we will try 'gemini-pro'.

        const modelsToTest = ['gemini-1.5-flash', 'gemini-1.5-flash-001', 'gemini-1.5-pro', 'gemini-pro'];

        console.log('Testing models...');

        for (const modelName of modelsToTest) {
            console.log(`\nTesting model: ${modelName}`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Hello code verify.');
                const response = await result.response;
                console.log(`✅ Success! Model '${modelName}' is working.`);
                console.log(`Response: ${response.text()}`);
                return; // Exit after finding a working model
            } catch (error: any) {
                console.log(`❌ Model '${modelName}' failed.`);
                if (error.message) {
                    console.log(`Error message: ${error.message}`);
                }
            }
        }

        console.log('\nCould not find a working model from the list.');

    } catch (error) {
        console.error('Error during model testing:', error);
    }
}

listModels();
