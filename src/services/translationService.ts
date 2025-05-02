
import { supabase } from "@/integrations/supabase/client";

// Function to translate text using DeepL API
export const translateText = async (
  text: string, 
  targetLang: string, 
  sourceLang?: string
): Promise<string> => {
  try {
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
    
    // Prepare data as JSON as per DeepL documentation
    const requestBody = {
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
    
    // Prepare data as JSON as per DeepL documentation
    const requestBody = {
      text: [text],
      target_lang: "EN" // Doesn't matter for language detection
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
    
    return data.translations[0].detected_source_language.toLowerCase();
  } catch (error) {
    console.error("Error detecting language:", error);
    return "en"; // Default to English on error
  }
};
