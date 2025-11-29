import { useState, useRef, useEffect } from 'react';

export default function VoiceRecorder({ onRecordingComplete, onCancel }) {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        return () => {
            // Cleanup
            if (timerRef.current) clearInterval(timerRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioBlob(audioBlob);
                setAudioUrl(audioUrl);
                
                // Stop all tracks
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Tidak dapat mengakses mikrofon. Pastikan Anda memberikan izin.');
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current && isPaused) {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const handleSend = () => {
        if (audioBlob) {
            onRecordingComplete(audioBlob, recordingTime);
        }
    };

    const handleCancel = () => {
        if (isRecording) {
            stopRecording();
        }
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        onCancel();
    };

    const handleReset = () => {
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">🎤 Voice Message</h3>
                <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
                    ✕
                </button>
            </div>

            {/* Recording Indicator */}
            {isRecording && (
                <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-full">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-600 font-semibold">
                            {isPaused ? 'PAUSED' : 'RECORDING'}
                        </span>
                        <span className="text-gray-700 font-mono">
                            {formatTime(recordingTime)}
                        </span>
                    </div>
                </div>
            )}

            {/* Audio Preview */}
            {audioUrl && !isRecording && (
                <div className="mb-4">
                    <audio src={audioUrl} controls className="w-full" />
                    <div className="text-sm text-gray-600 mt-2 text-center">
                        Duration: {formatTime(recordingTime)}
                    </div>
                </div>
            )}

            {/* Waveform Animation (while recording) */}
            {isRecording && !isPaused && (
                <div className="flex items-center justify-center gap-1 mb-4 h-16">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="w-1 bg-gradient-to-t from-indigo-500 to-purple-600 rounded-full"
                            style={{
                                height: `${20 + Math.random() * 60}%`,
                                animationName: 'pulse',
                                animationDuration: `${0.5 + Math.random() * 0.5}s`,
                                animationTimingFunction: 'ease-in-out',
                                animationIterationCount: 'infinite',
                                animationDirection: 'alternate',
                                animationDelay: `${i * 0.05}s`
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-2 justify-center">
                {!isRecording && !audioBlob && (
                    <button
                        onClick={startRecording}
                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center gap-2"
                    >
                        <span className="text-xl">🎤</span>
                        Start Recording
                    </button>
                )}

                {isRecording && !isPaused && (
                    <>
                        <button
                            onClick={pauseRecording}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                        >
                            ⏸️ Pause
                        </button>
                        <button
                            onClick={stopRecording}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                        >
                            ⏹️ Stop
                        </button>
                    </>
                )}

                {isRecording && isPaused && (
                    <>
                        <button
                            onClick={resumeRecording}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                        >
                            ▶️ Resume
                        </button>
                        <button
                            onClick={stopRecording}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                        >
                            ⏹️ Stop
                        </button>
                    </>
                )}

                {audioBlob && !isRecording && (
                    <>
                        <button
                            onClick={handleReset}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                        >
                            🔄 Re-record
                        </button>
                        <button
                            onClick={handleSend}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center gap-2"
                        >
                            <span>📤 Send</span>
                        </button>
                    </>
                )}
            </div>

            {/* Timer Limit Warning */}
            {isRecording && recordingTime >= 270 && (
                <div className="mt-3 text-center text-sm text-orange-600 font-medium">
                    ⚠️ Maximum 5 minutes recording time
                </div>
            )}

            {/* Auto-stop at 5 minutes */}
            {recordingTime >= 300 && isRecording && stopRecording()}
        </div>
    );
}
