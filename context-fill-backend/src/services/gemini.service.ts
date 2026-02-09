import { GoogleGenerativeAI } from '@google/generative-ai';

interface ExtractedFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  company?: string;
  jobTitle?: string;
  department?: string;
  notes?: string;
  [key: string]: string | undefined;
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;

  private getClient(): GoogleGenerativeAI {
    if (!this.genAI) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        throw new Error('GEMINI_API_KEY is not configured. Please set it in your .env file.');
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  async extractFormDataFromImage(imageBase64: string, mimeType: string): Promise<ExtractedFormData> {
    try {
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Analyze this document image and extract any personal or business information that could be used to fill a form. 
      
Please extract and return a JSON object with the following fields (if found):
- firstName: First name of the person
- lastName: Last name of the person  
- email: Email address
- phone: Phone number
- address: Street address
- city: City name
- state: State/Province
- zipCode: ZIP/Postal code
- country: Country name
- company: Company/Organization name
- jobTitle: Job title/Position
- department: Department name
- notes: Any other relevant information

Return ONLY a valid JSON object, no additional text or markdown. Use null for fields that cannot be found.`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: mimeType,
            data: imageBase64
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Clean up null values
        const cleaned: ExtractedFormData = {};
        for (const key in parsed) {
          if (parsed[key] !== null && parsed[key] !== undefined && parsed[key] !== '') {
            cleaned[key] = String(parsed[key]);
          }
        }
        return cleaned;
      }
      
      return {};
    } catch (error) {
      console.error('Error extracting form data from image:', error);
      throw error;
    }
  }

  async extractFormDataFromPDF(pdfBase64: string): Promise<ExtractedFormData> {
    try {
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Analyze this PDF document and extract any personal or business information that could be used to fill a form.
      
Please extract and return a JSON object with the following fields (if found):
- firstName: First name of the person
- lastName: Last name of the person  
- email: Email address
- phone: Phone number
- address: Street address
- city: City name
- state: State/Province
- zipCode: ZIP/Postal code
- country: Country name
- company: Company/Organization name
- jobTitle: Job title/Position
- department: Department name
- notes: Any other relevant information

Return ONLY a valid JSON object, no additional text or markdown. Use null for fields that cannot be found.`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: pdfBase64
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Clean up null values
        const cleaned: ExtractedFormData = {};
        for (const key in parsed) {
          if (parsed[key] !== null && parsed[key] !== undefined && parsed[key] !== '') {
            cleaned[key] = String(parsed[key]);
          }
        }
        return cleaned;
      }
      
      return {};
    } catch (error) {
      console.error('Error extracting form data from PDF:', error);
      throw error;
    }
  }

  async extractFormData(fileBase64: string, mimeType: string): Promise<ExtractedFormData> {
    if (mimeType === 'application/pdf') {
      return this.extractFormDataFromPDF(fileBase64);
    } else if (mimeType.startsWith('image/')) {
      return this.extractFormDataFromImage(fileBase64, mimeType);
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
  }
}

export const geminiService = new GeminiService();
