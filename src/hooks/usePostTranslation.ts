
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { languages } from '@/utils/formatUtils';
import { translateText, detectLanguage } from '@/services/translationService';

export const usePostTranslation = (postText: string, autoTranslate: boolean = false) => {
  const { profile } = useAuth();
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);

  // Function to handle translation
  const performTranslation = async () => {
    if (!postText.trim()) return;
    
    setIsTranslating(true);
    try {
      // Get user's preferred language or default to English
      const targetLang = profile?.preferredLanguage || 'en';
      
      // First detect the language of the post
      const sourceLang = await detectLanguage(postText);
      setDetectedLanguage(sourceLang);
      
      // Don't translate if the source language is already the target language
      if (sourceLang === targetLang.toLowerCase()) {
        if (autoTranslate) {
          // Don't show toast for automatic translation when no translation is needed
          setIsTranslating(false);
          return;
        }
        
        toast({
          title: "No translation needed",
          description: "The post is already in your preferred language."
        });
        setIsTranslating(false);
        return;
      }
      
      // Translate the text
      const translated = await translateText(postText, targetLang, sourceLang);
      setTranslatedText(translated);
      
      // Only show toast for manual translations
      if (!autoTranslate) {
        toast({
          title: "Post translated",
          description: `Post has been translated from ${languages.find(l => l.value === sourceLang)?.label || sourceLang} to ${languages.find(l => l.value === targetLang)?.label || targetLang}.`
        });
      }
    } catch (error) {
      console.error("Error translating post:", error);
      if (!autoTranslate) {
        toast({
          title: "Translation failed",
          description: "We couldn't translate this post. Please try again later.",
          variant: "destructive"
        });
      }
    } finally {
      setIsTranslating(false);
    }
  };

  // Effect to automatically translate when autoTranslate is true
  useEffect(() => {
    if (autoTranslate && profile?.preferredLanguage && postText.trim()) {
      performTranslation();
    }
  }, [postText, profile?.preferredLanguage, autoTranslate]);

  const handleTranslate = async () => {
    // If we already have a translation, toggle back to original text
    if (translatedText) {
      setTranslatedText(null);
      return;
    }
    
    await performTranslation();
  };

  return { isTranslating, translatedText, detectedLanguage, handleTranslate };
};
