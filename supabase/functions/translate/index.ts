
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// This edge function serves as a proxy for DeepL API requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }
  
  try {
    const apiKey = "0773e26f-7418-427d-ad2a-c150f9c1910e:fx";
    
    // Determine if it's a Pro API key (no ":fx" suffix)
    const apiUrl = apiKey.includes(':fx') 
      ? "https://api-free.deepl.com/v2/translate"
      : "https://api.deepl.com/v2/translate";
    
    // Get the request body
    const body = await req.json();
    const { text, targetLang, sourceLang, action } = body;
    
    if (!text || !targetLang) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      );
    }
    
    console.log(`Processing ${action || "translation"} request:`, {
      textLength: text.length,
      targetLang,
      sourceLang: sourceLang || "auto-detect"
    });
    
    // Prepare request body according to DeepL API specifications
    const requestBody: Record<string, any> = {
      text: [text],
      target_lang: targetLang.toUpperCase()
    };
    
    // Add source language if provided
    if (sourceLang) {
      requestBody['source_lang'] = sourceLang.toUpperCase();
    }
    
    // Make request to DeepL API
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
    console.log("DeepL API response received");
    
    // Return the response from DeepL
    return new Response(
      JSON.stringify({
        translatedText: data.translations[0].text,
        detectedLanguage: data.translations[0].detected_source_language.toLowerCase()
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error) {
    console.error("Error in translate function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
