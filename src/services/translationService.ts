
import { supabase } from "@/integrations/supabase/client";

// Function to check if translation is available
export const isTranslationAvailable = async (): Promise<boolean> => {
  try {
    // Get the API key from Supabase
    const { data: secrets, error: secretsError } = await supabase
      .functions.invoke("get_secrets", {
        body: { keys: ["DEEPL_API_KEY"] }
      });

    if (secretsError) {
      console.error("Failed to get DeepL API key:", secretsError);
      return false;
    }
    
    const apiKey = secrets?.DEEPL_API_KEY;
    
    // Check if we have a valid API key
    return !!apiKey && typeof apiKey === 'string' && apiKey.trim() !== '';
  } catch (error) {
    console.error("Error checking translation availability:", error);
    return false;
  }
};

// Function to translate text using DeepL API
export const translateText = async (
  text: string, 
  targetLang: string, 
  sourceLang?: string
): Promise<string> => {
  try {
    console.log("Starting translation request...");
    
    // Get the API key from Supabase
    const { data: secrets, error: secretsError } = await supabase
      .functions.invoke("get_secrets", {
        body: { keys: ["DEEPL_API_KEY"] }
      });

    if (secretsError) {
      console.error("Failed to get DeepL API key:", secretsError);
      throw new Error("Translation API key not available");
    }
    
    const apiKey = secrets?.DEEPL_API_KEY;
    
    // Check if we have a valid API key
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      console.error("DeepL API key is missing or invalid");
      throw new Error("Translation API key not configured");
    }

    // DeepL API endpoint (using Free API by default, if Pro is detected it will be changed)
    let apiUrl = "https://api-free.deepl.com/v2/translate";
    
    // If it's a Pro API key (no ":fx" suffix), use the Pro API endpoint
    if (!apiKey.includes(':fx')) {
      apiUrl = "https://api.deepl.com/v2/translate";
    }
    
    // Prepare request body according to DeepL API specifications
    const requestBody: Record<string, any> = {
      text: [text],
      target_lang: targetLang.toUpperCase()
    };
    
    // Add source language if provided
    if (sourceLang) {
      requestBody['source_lang'] = sourceLang.toUpperCase();
    }
    
    console.log("Making DeepL translation request:", {
      apiUrl,
      targetLang: targetLang.toUpperCase(),
      sourceLang: sourceLang?.toUpperCase(),
      textLength: text.length
    });
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("DeepL API error:", errorBody, "Status:", response.status);
      throw new Error(`Translation API returned ${response.status}`);
    }
    
    const data = await response.json();
    console.log("DeepL translation response:", data);
    
    return data.translations[0].text;
  } catch (error) {
    console.error("Error translating text:", error);
    throw error;
  }
};

// Function to detect language
export const detectLanguage = async (text: string): Promise<string> => {
  try {
    console.log("Starting language detection request...");
    
    // Get the API key from Supabase
    const { data: secrets, error: secretsError } = await supabase
      .functions.invoke("get_secrets", {
        body: { keys: ["DEEPL_API_KEY"] }
      });

    if (secretsError) {
      console.error("Failed to get DeepL API key:", secretsError);
      throw new Error("Translation API key not available");
    }
    
    const apiKey = secrets?.DEEPL_API_KEY;
    
    // Check if we have a valid API key
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
      console.error("DeepL API key is missing or invalid");
      throw new Error("Translation API key not configured");
    }

    // DeepL API endpoint (using Free API by default, if Pro is detected it will be changed)
    let apiUrl = "https://api-free.deepl.com/v2/translate";
    
    // If it's a Pro API key (no ":fx" suffix), use the Pro API endpoint
    if (!apiKey.includes(':fx')) {
      apiUrl = "https://api.deepl.com/v2/translate";
    }
    
    // DeepL doesn't have a dedicated language detection endpoint, 
    // so we use a translation request to get the detected language
    const requestBody = {
      text: [text],
      target_lang: "EN" // Target language doesn't matter for detection
    };
    
    console.log("Making DeepL language detection request");
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("DeepL API error:", errorBody, "Status:", response.status);
      throw new Error(`Translation API returned ${response.status}`);
    }
    
    const data = await response.json();
    console.log("DeepL detection response:", data);
    
    if (!data.translations || data.translations.length === 0) {
      console.error("Invalid response from DeepL API:", data);
      throw new Error("Invalid response from translation API");
    }
    
    return data.translations[0].detected_source_language.toLowerCase();
  } catch (error) {
    console.error("Error detecting language:", error);
    return "en"; // Default to English on error
  }
};
