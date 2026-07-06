import React from 'react';
import { Mic, MicOff, Edit } from 'lucide-react';

const AudioRecorder = ({ isListening, onStart, onStop, transcript, onChange }) => {
  return (
    <div class="w-full flex flex-col gap-4 p-5 rounded-2xl bg-white dark:bg-darkbg-800 border border-gray-200 dark:border-darkbg-700 shadow-sm transition-all">
      <div class="flex items-center justify-between border-b border-gray-100 dark:border-darkbg-700 pb-3">
        <div class="flex items-center gap-2">
          <span class="relative flex h-3 w-3">
            {isListening && (
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            )}
            <span class={`relative inline-flex rounded-full h-3 w-3 ${isListening ? 'bg-red-500' : 'bg-gray-400'}`}></span>
          </span>
          <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {isListening ? 'Interviewer is listening...' : 'Microphone Ready'}
          </span>
        </div>

        {/* Toggle Button */}
        <button
          onClick={isListening ? onStop : onStart}
          class={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
              : 'bg-primary-500 hover:bg-primary-600 text-white'
            }`}
        >
          {isListening ? (
            <>
              <MicOff size={16} /> Stop Recording
            </>
          ) : (
            <>
              <Mic size={16} /> Tap to Speak
            </>
          )}
        </button>
      </div>

      {/* Visual Waveform Animation during Recording */}
      {isListening && (
        <div class="flex items-center justify-center py-4 bg-gray-50 dark:bg-darkbg-900 rounded-xl">
          <div class="flex items-end h-10 gap-1.5">
            <span class="audio-bar"></span>
            <span class="audio-bar"></span>
            <span class="audio-bar"></span>
            <span class="audio-bar"></span>
            <span class="audio-bar"></span>
            <span class="audio-bar"></span>
            <span class="audio-bar"></span>
            <span class="audio-bar"></span>
          </div>
        </div>
      )}

      {/* Transcription Editor */}
      <div class="space-y-1">
        <label class="text-[11px] font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1">
          <Edit size={12} />
          TRANSCRIPT (EDITABLE)
        </label>
        <textarea
          value={transcript}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Speak into your microphone or type your answer here..."
          class="w-full h-32 px-4 py-3 rounded-xl border border-gray-200 dark:border-darkbg-700 bg-gray-50 dark:bg-darkbg-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500/50 resize-none font-sans text-gray-700 dark:text-gray-200"
        />
      </div>
    </div>
  );
};

export default AudioRecorder;
