import React, { useState, useRef } from 'react';
import { Mic, MicOff, TrendingUp, DollarSign } from 'lucide-react';
import axios from 'axios';

const App: React.FC = () => {
  const [ticker, setTicker] = useState('');
  const [summary, setSummary] = useState<string>('');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState<string>('');
  const [transcription, setTranscription] = useState<string>('');
  const [recording, setRecording] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fetchSummary = async (customTicker?: string) => {
    const targetTicker = customTicker || ticker;
    setLoading(true);

    try {
      const res = await axios.get(`http://localhost:8000/summary?ticker=${targetTicker}`);
      const data = res.data;

      setSummary(data.summary);
      setCurrentPrice(data.raw_data.summary.currentPrice);
      setEstimatedPrice(data.raw_data.summary.estimation);
      setCompanyName(data.raw_data.summary.shortName);
    } catch (err) {
      setSummary('Unable to fetch market data. Please try again.');
      console.log(err);
      setCurrentPrice(null);
      setEstimatedPrice(null);
    } finally {
      setLoading(false);
    }
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyserRef.current!.getByteTimeDomainData(dataArray);

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      audioContextRef.current = audioContext;

      drawWaveform();

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        audioContextRef.current?.close();

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');

        try {
          await axios.post('http://localhost:8000/transcribe', formData);
          const mockTranscription = ticker.toUpperCase();
          setTranscription(mockTranscription);
          setTicker(mockTranscription);
          fetchSummary(mockTranscription);
        } catch {
          setTranscription('Transcription failed');
        }

        stream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      };

      mediaRecorder.start();
      setRecording(true);

      setTimeout(() => {
        stopRecording();
      }, 5000);
    } catch {
      alert('Microphone access required');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const priceChange =
    currentPrice && estimatedPrice
      ? ((estimatedPrice - currentPrice) / currentPrice * 100).toFixed(2)
      : null;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-light tracking-wide">Market Intelligence</h1>
          <div className="w-16 h-px bg-white mx-auto opacity-30"></div>
        </div>

        {/* Ticker Input */}
        <div className="space-y-4">
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className="w-full bg-transparent border-b border-gray-800 focus:border-white transition-colors duration-300 py-3 text-xl font-light tracking-widest text-center outline-none placeholder-gray-600"
            placeholder="ENTER TICKER"
          />

          <div className="flex gap-3">
            <button
              onClick={() => fetchSummary()}
              disabled={loading}
              className="flex-1 py-3 border border-gray-800 hover:border-white transition-colors duration-300 text-sm font-light tracking-wide disabled:opacity-50"
            >
              {loading ? 'ANALYZING...' : 'ANALYZE'}
            </button>

            <button
              onClick={recording ? stopRecording : startRecording}
              className={`p-3 border transition-colors duration-300 ${
                recording
                  ? 'border-red-500 text-red-500'
                  : 'border-gray-800 hover:border-white'
              }`}
            >
              {recording ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          </div>

          {/* Waveform */}
          {recording && (
            <div className="h-16 border border-gray-800">
              <canvas ref={canvasRef} width={600} height={64} className="w-full h-full" />
            </div>
          )}

          {/* Transcription */}
          {transcription && (
            <div className="text-center text-gray-400 text-sm tracking-wide">
              DETECTED: {transcription}
            </div>
          )}
        </div>

        {/* Price Display */}
        {(currentPrice || estimatedPrice) && (
          <div className="space-y-6">
            {companyName && (
              <div className="text-center text-gray-400 text-sm tracking-wide">
                {companyName}
              </div>
            )}

            <div className="grid grid-cols-2 gap-8">
              {/* Current Price */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <DollarSign size={16} />
                  <span>CURRENT</span>
                </div>
                <div className="text-3xl font-light">
                  {currentPrice !== null ? `$${currentPrice.toFixed(2)}` : '--'}
                </div>
              </div>

              {/* Estimated Price */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <TrendingUp size={16} />
                  <span>ESTIMATED</span>
                </div>
                <div className="text-3xl font-light">
                  {estimatedPrice !== null ? `$${estimatedPrice.toFixed(2)}` : '--'}
                </div>
                {priceChange !== null && (
                  <div
                    className={`text-sm ${
                      parseFloat(priceChange) > 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {parseFloat(priceChange) > 0 ? '+' : ''}
                    {priceChange}%
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div className="space-y-4">
            <div className="w-full h-px bg-gray-800"></div>
            <div className="text-gray-300 text-sm leading-relaxed font-light">
              {summary}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
