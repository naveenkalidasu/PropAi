import { useState, useEffect, useRef } from 'react';

export const useSpeech = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check Speech Recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
      };

      rec.onerror = (event) => {
        console.error('Speech Recognition Error:', event.error);
        if (event.error === 'not-allowed') {
          setIsListening(false);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Text-To-Speech (Interviewer speaks)
  const speak = (text, onEndCallback = null) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Attempt to pick a premium English voice
      const voices = window.speechSynthesis.getVoices();
      const engVoice = voices.find(v => v.lang.startsWith('en-US') && v.name.includes('Google')) 
                    || voices.find(v => v.lang.startsWith('en')) 
                    || voices[0];
      if (engVoice) {
        utterance.voice = engVoice;
      }

      if (onEndCallback) {
        utterance.onend = onEndCallback;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Text-to-Speech not supported in this browser.');
      if (onEndCallback) onEndCallback();
    }
  };

  // Cancel any current speaking
  const cancelSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Start Speech-To-Text Listening
  const startListening = (initialText = '') => {
    if (recognitionRef.current && !isListening) {
      setTranscript(initialText);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
  };

  // Stop Speech-To-Text Listening
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }
  };

  return {
    speak,
    cancelSpeech,
    isListening,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    speechSupported
  };
};
