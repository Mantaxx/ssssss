import React, { useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface Props {
  onCommand: (cmd: { layer?: string; altitude?: string; time?: string }) => void;
}

const grammar = '#JSGF V1.0;';

export const VoiceCommands: React.FC<Props> = ({ onCommand }) => {
  const { transcript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) return;
    if (!listening) SpeechRecognition.startListening({ continuous: true, language: 'pl-PL' });
  }, [browserSupportsSpeechRecognition, listening]);

  useEffect(() => {
    const t = transcript.toLowerCase();
    // simple patterns: "pokaż {warstwa} na {wysokość}", "ustaw czas na {czas}"
    const layerMatch = t.match(/pokaż\s+(\w+)\s+na\s+([\w\d]+)/);
    if (layerMatch) onCommand({ layer: layerMatch[1], altitude: layerMatch[2] });
    const timeMatch = t.match(/ustaw\s+czas\s+na\s+(.+)$/);
    if (timeMatch) onCommand({ time: timeMatch[1] });
  }, [transcript, onCommand]);

  return null;
};

