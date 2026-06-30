import { useState, useRef } from "react";

export function useRecorder({ onRecordingFinished, onScreenshotCaptured }) {
  const [captureStatus, setCaptureStatus] = useState("Ready");
  const [micEnabled, setMicEnabled] = useState(false);
  const [error, setError] = useState("");
  
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  async function startRecording(videoElement) {
    setError("");
    setCaptureStatus("Starting...");
    chunksRef.current = [];

    if (!navigator.mediaDevices?.getDisplayMedia) {
      const errStr = "Screen capture getDisplayMedia API is not supported in this browser.";
      setError(errStr);
      setCaptureStatus("Ready");
      return;
    }

    try {
      // 1. Get screen capture stream
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: true // request system audio if supported
      });

      let tracks = [...screenStream.getVideoTracks()];

      // 2. Mix in microphone audio if enabled
      let micStream = null;
      if (micEnabled) {
        try {
          micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
          tracks = [...tracks, ...micStream.getAudioTracks()];
        } catch (micErr) {
          console.warn("Microphone access denied or unavailable. Recording screen only.", micErr);
          setError("Microphone permission denied. Recording screen only.");
        }
      } else {
        // Mix in system audio if screen capture provided one
        const screenAudioTracks = screenStream.getAudioTracks();
        if (screenAudioTracks.length > 0) {
          tracks = [...tracks, ...screenAudioTracks];
        }
      }

      // 3. Create combined stream
      const combinedStream = new MediaStream(tracks);
      streamRef.current = combinedStream;

      if (videoElement) {
        videoElement.srcObject = combinedStream;
        videoElement.muted = true; // prevent feedback loop locally
        try {
          await videoElement.play();
        } catch (playErr) {
          console.error("Video element failed to play stream source", playErr);
        }
      }

      // 4. Initialize MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : "video/webm";

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 2500000 // 2.5 Mbps
      });

      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data?.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const chunks = chunksRef.current;
        if (!chunks.length) {
          setError("No video data was recorded.");
          setCaptureStatus("Ready");
          return;
        }

        const blob = new Blob(chunks, { type: "video/webm" });
        const filename = `recording-${Date.now()}.webm`;
        
        if (onRecordingFinished) {
          onRecordingFinished(blob, filename);
        }
        setCaptureStatus("Saved");
      };

      // Stop recorder when user clicks native browser "Stop sharing" button
      screenStream.getVideoTracks()[0]?.addEventListener("ended", () => {
        stopRecording();
      });

      recorder.start(1000); // capture chunks every 1 second
      setCaptureStatus("Recording");
    } catch (captureErr) {
      console.error("Screen recording setup error", captureErr);
      setError(captureErr.message || "Failed to start screen capture.");
      setCaptureStatus("Ready");
    }
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }

  function captureFrame(videoElement) {
    if (!videoElement || !videoElement.videoWidth || !videoElement.videoHeight) {
      setError("Active video stream element is required to capture screenshot.");
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (!blob) {
          setError("Failed to convert canvas frame to image blob.");
          return;
        }
        const filename = `screenshot-${Date.now()}.png`;
        if (onScreenshotCaptured) {
          onScreenshotCaptured(blob, filename);
        }
      }, "image/png");
    } catch (screenshotErr) {
      setError(`Screenshot capture failed: ${screenshotErr.message}`);
    }
  }

  return {
    captureStatus,
    setCaptureStatus,
    micEnabled,
    setMicEnabled,
    error,
    setError,
    startRecording,
    stopRecording,
    captureFrame
  };
}
