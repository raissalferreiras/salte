import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, RotateCcw, Check, X, AlertCircle, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  currentPhotoUrl?: string | null;
  className?: string;
}

export function CameraCapture({ onCapture, currentPhotoUrl, className }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      // Set streaming first so the video element renders in the DOM
      setIsStreaming(true);
      setCapturedImage(null);
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Permissão de câmera negada. Habilite nas configurações do navegador.');
      } else if (err.name === 'NotFoundError') {
        setError('Nenhuma câmera encontrada neste dispositivo.');
      } else {
        setError('Erro ao acessar a câmera. Tente novamente.');
      }
    }
  };

  // Attach the stream to the video element once it's rendered
  useEffect(() => {
    if (isStreaming && videoRef.current && streamRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      video.onloadedmetadata = () => {
        video.play().catch(() => {
          setError('Erro ao iniciar a câmera.');
          stopCamera();
        });
      };
    }
  }, [isStreaming, stopCamera]);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    // Ensure video is actually playing with data
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Câmera ainda não está pronta. Aguarde um momento e tente novamente.');
      return;
    }
    const canvas = canvasRef.current;
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = 480;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, 480, 480);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const confirmPhoto = () => {
    if (!capturedImage) return;
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => onCapture(blob));
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem válido.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
      onCapture(file);
    };
    reader.readAsDataURL(file);
  };

  const displayImage = capturedImage || currentPhotoUrl;

  return (
    <div className={cn('space-y-3', className)}>
      <canvas ref={canvasRef} className="hidden" />

      {/* Preview area */}
      <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden bg-muted border-2 border-border">
        {isStreaming ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : displayImage ? (
          <img src={displayImage} alt="Foto da criança" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-2">
        {isStreaming ? (
          <>
            <Button type="button" size="sm" variant="destructive" onClick={stopCamera}>
              <X className="h-4 w-4 mr-1" /> Cancelar
            </Button>
            <Button type="button" size="sm" onClick={takePhoto}>
              <Camera className="h-4 w-4 mr-1" /> Capturar
            </Button>
          </>
        ) : capturedImage ? (
          <>
            <Button type="button" size="sm" variant="outline" onClick={retakePhoto}>
              <RotateCcw className="h-4 w-4 mr-1" /> Tirar outra
            </Button>
            <Button type="button" size="sm" onClick={confirmPhoto}>
              <Check className="h-4 w-4 mr-1" /> Confirmar
            </Button>
          </>
        ) : (
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={startCamera}>
              <Camera className="h-4 w-4 mr-1" /> {displayImage ? 'Trocar foto' : 'Tirar foto'}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-1" /> Enviar
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        )}
      </div>
    </div>
  );
}
