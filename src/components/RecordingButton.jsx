import React, { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API = 'http://localhost:5000/api';

function RecordingButton({ roomId, token }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  const headers = { Authorization: `Bearer ${token}` };

  const startRecording = async () => {
    try {
      // Capture the screen for recording
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' },
        audio: true,
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        clearInterval(timerRef.current);
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });

        // Upload recording
        const formData = new FormData();
        formData.append('recording', blob, `recording_${Date.now()}.webm`);
        formData.append('roomId', roomId);
        formData.append('duration', recordingTime);

        try {
          await axios.post(`${API}/recordings/upload`, formData, {
            headers: {
              ...headers,
              'Content-Type': 'multipart/form-data',
            },
          });
          toast.success('Recording saved!');
        } catch (err) {
          // Fallback: download locally
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `watchparty_recording_${Date.now()}.webm`;
          a.click();
          URL.revokeObjectURL(url);
          toast.info('Recording downloaded locally.');
        }

        setRecordingTime(0);
        chunksRef.current = [];
      };

      mediaRecorder.start(1000); // Collect data every second
      mediaRecorderRef.current = mediaRecorder;

      // Timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Handle stream end (user stops sharing)
      stream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      setIsRecording(true);
      toast.info('Recording started!');
    } catch (err) {
      toast.error('Failed to start recording.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <>
      {!isRecording ? (
        <button
          className="control-btn"
          onClick={startRecording}
          title="Start Recording"
          style={{ fontSize: '16px' }}
        >
          ⏺️
        </button>
      ) : (
        <button
          className="control-btn danger"
          onClick={stopRecording}
          title="Stop Recording"
          style={{ fontSize: '12px', width: 'auto', borderRadius: '22px', padding: '0 16px', gap: '6px' }}
        >
          ⏹️ {formatTime(recordingTime)}
        </button>
      )}
    </>
  );
}

export default RecordingButton;