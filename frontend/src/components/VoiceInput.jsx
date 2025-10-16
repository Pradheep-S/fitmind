import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import { useSpeechToText } from '../hooks/useSpeechToText';

const VoiceInput = ({ onTranscriptUpdate, className = '' }) => {
  const {
    isListening,
    transcript,
    isSupported,
    error,
    toggleListening,
    resetTranscript
  } = useSpeechToText();

  const lastTranscriptRef = React.useRef('');

  // Update parent component only when transcript changes and we're not listening (i.e., when complete)
  React.useEffect(() => {
    if (transcript && !isListening && transcript !== lastTranscriptRef.current && onTranscriptUpdate) {
      onTranscriptUpdate(transcript.trim());
      lastTranscriptRef.current = transcript;
      // Auto-clear the transcript after sending it
      setTimeout(() => {
        resetTranscript();
        lastTranscriptRef.current = '';
      }, 500);
    }
  }, [transcript, isListening, onTranscriptUpdate, resetTranscript]);

  if (!isSupported) {
    return (
      <div className="flex items-center space-x-2 text-gray-400">
        <AlertCircle size={20} />
        <span className="text-sm">Voice input not supported</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Microphone Button */}
      <motion.button
        onClick={toggleListening}
        className={`relative p-3 rounded-full transition-all duration-300 ${
          isListening 
            ? 'bg-red-500 text-white shadow-lg ring-4 ring-red-200' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={!!error}
      >
        {isListening ? <Mic size={20} /> : <MicOff size={20} />}
        
        {/* Pulsing animation when listening */}
        <AnimatePresence>
          {isListening && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-red-400"
                initial={{ scale: 1, opacity: 0.7 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ scale: 1, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-red-300"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ scale: 1, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
            </>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Status Text */}
      <div className="flex flex-col">
        <AnimatePresence mode="wait">
          {isListening && (
            <motion.div
              key="listening"
              className="flex items-center space-x-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Volume2 size={16} className="text-red-500" />
              <span className="text-sm font-medium text-red-600">
                Listening... (3s silence stops)
              </span>
            </motion.div>
          )}
          
          {!isListening && !error && (
            <motion.span
              key="ready"
              className="text-sm text-gray-600"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              Click to start voice input
            </motion.span>
          )}
          
          {error && (
            <motion.div
              key="error"
              className="flex items-center space-x-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-sm text-red-600">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Real-time transcript preview */}
        <AnimatePresence>
          {transcript && isListening && (
            <motion.div
              className="mt-2 p-2 bg-blue-50/80 border border-blue-200/50 rounded text-sm text-blue-700 max-w-xs"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-xs text-blue-500 uppercase tracking-wide">Preview:</span>
              <div className="italic">"{transcript}"</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Clear button when there's transcript */}
      <AnimatePresence>
        {transcript && !isListening && (
          <motion.button
            onClick={resetTranscript}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceInput;