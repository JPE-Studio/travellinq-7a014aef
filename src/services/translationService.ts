
import { supabase } from "@/integrations/supabase/client";

// Creates a proper DeepL API key format by combining the key and suffix
const formatDeepLApiKey = (key: string): string => {
  // DeepL Free API keys end with ":fx"
  if (key.includes(':fx')) return key;
  // DeepL Pro API keys don't have a suffix
  return key;
};

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

    if (secretsError || !secrets?.DEEPL_API_KEY) {
      console.error("Failed to get DeepL API key:", secretsError);
      throw new Error("Translation API key not available");
    }

    const apiKey = formatDeepLApiKey(secrets.DEEPL_API_KEY);
    const apiUrl = "https://api-free.deepl.com/v2/translate";
    
    const formData = new FormData();
    formData.append("text", text);
    formData.append("target_lang", targetLang.toUpperCase());
    
    if (sourceLang) {
      formData.append("source_lang", sourceLang.toUpperCase());
    }
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${apiKey}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("DeepL API error:", errorBody);
      throw new Error(`Translation API returned ${response.status}`);
    }
    
    const data = await response.json();
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

    if (secretsError || !secrets?.DEEPL_API_KEY) {
      console.error("Failed to get DeepL API key:", secretsError);
      throw new Error("Translation API key not available");
    }

    const apiKey = formatDeepLApiKey(secrets.DEEPL_API_KEY);
    const apiUrl = "https://api-free.deepl.com/v2/translate";
    
    const formData = new FormData();
    formData.append("text", text);
    formData.append("target_lang", "EN"); // Doesn't matter for detection
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${apiKey}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Translation API returned ${response.status}`);
    }
    
    const data = await response.json();
    return data.translations[0].detected_source_language.toLowerCase();
  } catch (error) {
    console.error("Error detecting language:", error);
    return "en"; // Default to English on error
  }
};
