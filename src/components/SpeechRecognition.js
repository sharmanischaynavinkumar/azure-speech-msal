import React, { useState, useRef, useCallback } from 'react';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { useMsal } from '@azure/msal-react';
import { speechConfig } from '../config';

const SpeechRecognition = () => {
  const { instance, accounts } = useMsal();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [status, setStatus] = useState('stopped');
  const [error, setError] = useState('');
  const recognizerRef = useRef(null);

  const getSpeechToken = useCallback(async () => {
    try {
      // Request token silently
      const response = await instance.acquireTokenSilent({
        scopes: [
          `${speechConfig.url}/.default`
        ],
        account: accounts[0]
      });

      return response.accessToken;
    } catch (error) {
      console.error("Token acquisition failed", error);
      // Fallback to popup
      const popupResponse = await instance.acquireTokenPopup({
        scopes: [
          `${speechConfig.url}/.default`
        ]
      });
      return popupResponse.accessToken;
    }
  }, [instance, accounts]);

  const startListening = useCallback(async () => {
    try {
      // Get speech token
      const token = await getSpeechToken();
      const authToken = `aad#${speechConfig.resourceId}#${token}`;
      
      // Configure Speech SDK with token-based authentication
      const speechConfigObj = SpeechSDK.SpeechConfig.fromAuthorizationToken(
        authToken, 
        speechConfig.region
      );
      speechConfigObj.speechRecognitionLanguage = 'en-US';

      // Create audio config
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

      // Create recognizer
      const recognizer = new SpeechSDK.SpeechRecognizer(speechConfigObj, audioConfig);
      recognizerRef.current = recognizer;

      // Set up event handlers
      recognizer.recognizing = (s, e) => {
        console.log(`RECOGNIZING: Text=${e.result.text}`);
      };

      recognizer.recognized = (s, e) => {
        if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          console.log(`RECOGNIZED: Text=${e.result.text}`);
          
          if (e.result.text.trim()) {
            const newTranscript = {
              id: Date.now(),
              text: e.result.text,
              timestamp: new Date().toLocaleTimeString()
            };
            
            setTranscript(prev => [...prev, newTranscript]);
          }
        } else if (e.result.reason === SpeechSDK.ResultReason.NoMatch) {
          console.log('NOMATCH: Speech could not be recognized.');
        }
      };

      recognizer.canceled = (s, e) => {
        console.log(`CANCELED: Reason=${e.reason}`);
        
        if (e.reason === SpeechSDK.CancellationReason.Error) {
          setError(`Speech recognition error: ${e.errorDetails}`);
          setStatus('error');
        }
        
        setIsListening(false);
        recognizer.close();
        recognizerRef.current = null;
      };

      recognizer.sessionStopped = (s, e) => {
        console.log('\nSession stopped event.');
        setIsListening(false);
        setStatus('stopped');
        recognizer.close();
        recognizerRef.current = null;
      };

      // Start continuous recognition
      recognizer.startContinuousRecognitionAsync(
        () => {
          console.log('Speech recognition started');
          setIsListening(true);
          setStatus('listening');
          setError('');
        },
        (err) => {
          console.error('Failed to start speech recognition:', err);
          setError(`Failed to start speech recognition: ${err}`);
          setStatus('error');
          setIsListening(false);
          recognizer.close();
          recognizerRef.current = null;
        }
      );

    } catch (err) {
      console.error('Error initializing speech recognition:', err);
      setError(`Error initializing speech recognition: ${err.message}`);
      setStatus('error');
    }
  }, [getSpeechToken]);

  const stopListening = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.stopContinuousRecognitionAsync(
        () => {
          console.log('Speech recognition stopped');
          setIsListening(false);
          setStatus('stopped');
          recognizerRef.current.close();
          recognizerRef.current = null;
        },
        (err) => {
          console.error('Failed to stop speech recognition:', err);
          setError(`Failed to stop speech recognition: ${err}`);
          setStatus('error');
          setIsListening(false);
          if (recognizerRef.current) {
            recognizerRef.current.close();
            recognizerRef.current = null;
          }
        }
      );
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript([]);
    setError('');
  }, []);

  return (
    <div className="speech-container">
      <h2>Speech Recognition</h2>
      
      <div className="speech-controls">
        {!isListening ? (
          <button className="btn" onClick={startListening}>
            🎤 Start Listening
          </button>
        ) : (
          <button className="btn btn-danger" onClick={stopListening}>
            ⏹️ Stop Listening
          </button>
        )}
        
        <button 
          className="btn btn-secondary" 
          onClick={clearTranscript}
          disabled={transcript.length === 0}
        >
          🗑️ Clear Transcript
        </button>
      </div>

      <div className={`status ${status}`}>
        {status === 'listening' && '🔴 Listening... Speak into your microphone'}
        {status === 'stopped' && '⏸️ Speech recognition stopped'}
        {status === 'error' && '❌ Error occurred'}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="transcript-container">
        <h3>Transcript ({transcript.length} items)</h3>
        <div className="transcript">
          {transcript.length === 0 ? (
            <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
              No transcript yet. Click "Start Listening" and speak into your microphone.
            </p>
          ) : (
            transcript.map((item) => (
              <div key={item.id} className="transcript-item">
                <div className="transcript-text">{item.text}</div>
                <div className="transcript-time">{item.timestamp}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeechRecognition;
