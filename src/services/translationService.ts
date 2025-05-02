
import { supabase } from "@/integrations/supabase/client";

// Function to check if translation is available
export const isTranslationAvailable = async (): Promise<boolean> => {
  try {
    // We're now checking if our translation edge function responds correctly
    const { data, error } = await supabase.functions.invoke("translate", {
      body: { action: "check" }
    });
    
    if (error) {
      console.error("Failed to check translation availability:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error checking translation availability:", error);
    return false;
  }
};

// Function to translate text using our edge function
export const translateText = async (
  text: string, 
  targetLang: string, 
  sourceLang?: string
): Promise<string> => {
  try {
    console.log("Starting translation request via edge function...");
    
    const { data, error } = await supabase.functions.invoke("translate", {
      body: { 
        text, 
        targetLang, 
        sourceLang,
        action: "translate"
      }
    });

    if (error) {
      console.error("Translation error from edge function:", error);
      throw new Error("Translation failed");
    }
    
    console.log("Translation completed successfully");
    return data.translatedText;
  } catch (error) {
    console.error("Error translating text:", error);
    throw error;
  }
};

// Function to detect language
export const detectLanguage = async (text: string): Promise<string> => {
  try {
    console.log("Starting language detection request via edge function...");
    
    const { data, error } = await supabase.functions.invoke("translate", {
      body: { 
        text, 
        targetLang: "EN", // Target language doesn't matter for detection
        action: "detect"
      }
    });

    if (error) {
      console.error("Language detection error from edge function:", error);
      throw new Error("Language detection failed");
    }
    
    return data.detectedLanguage;
  } catch (error) {
    console.error("Error detecting language:", error);
    return "en"; // Default to English on error
  }
};
