
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { languages } from '@/utils/formatUtils';
import { translateText, detectLanguage } from '@/services/translationService';

export const usePostTranslation = (postText: string) => {
  const { profile } = useAuth();
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);

  const handleTranslate = async () => {
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
      
      toast({
        title: "Post translated",
        description: `Post has been translated from ${languages.find(l => l.value === sourceLang)?.label || sourceLang} to ${languages.find(l => l.value === targetLang)?.label || targetLang}.`
      });
    } catch (error) {
      console.error("Error translating post:", error);
      toast({
        title: "Translation failed",
        description: "We couldn't translate this post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  return { isTranslating, translatedText, detectedLanguage, handleTranslate };
};
