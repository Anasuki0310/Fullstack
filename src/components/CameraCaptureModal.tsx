import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, Check, RotateCcw, AlertCircle, SwitchCamera } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  language: 'en' | 'th';
}

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
  language,
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    stopCamera();
    setErrorMsg(null);
    setIsInitializing(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          language === 'th'
            ? 'เบราว์เซอร์นี้ไม่รองรับการเปิดกล้องถ่ายภาพ'
            : 'Browser Camera API is not supported in this environment.'
        );
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsStreaming(true);
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      const error = err as { name?: string; message?: string };
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setErrorMsg(
          language === 'th'
            ? 'กรุณาอนุญาตการเข้าถึงกล้องในเบราว์เซอร์ เพื่อถ่ายภาพจุดชำรุด'
            : 'Camera permission was denied. Please allow camera access in browser settings.'
        );
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setErrorMsg(
          language === 'th'
            ? 'ไม่พบอุปกรณ์กล้องบนคอมพิวเตอร์หรือมือถือนี้'
            : 'No camera device found on this system.'
        );
      } else {
        setErrorMsg(
          language === 'th'
            ? `ไม่สามารถเปิดกล้องได้: ${error.message || 'โปรดตรวจสอบการอนุญาตใช้งานกล้อง'}`
            : `Unable to access camera: ${error.message || 'Please check device camera permissions.'}`
        );
      }
    } finally {
      setIsInitializing(false);
    }
  }, [language, stopCamera]);

  // Handle modal open / close
  useEffect(() => {
    if (isOpen) {
      setCapturedDataUrl(null);
      startCamera(facingMode);
    } else {
      stopCamera();
      setCapturedDataUrl(null);
      setErrorMsg(null);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera, facingMode]);

  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const handleCapture = () => {
    if (!videoRef.current || !isStreaming) return;

    // Trigger flash animation
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If front camera, mirror image for natural selfie feel
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedDataUrl(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedDataUrl(null);
    startCamera(facingMode);
  };

  const handleConfirm = () => {
    if (!capturedDataUrl) return;

    // Convert dataUrl to blob then File
    fetch(capturedDataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const file = new File([blob], `maintenance-camera-${timestamp}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        onCapture(file);
        handleClose();
      })
      .catch((err) => {
        console.error('Failed to convert photo blob:', err);
      });
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white leading-tight">
                {language === 'th' ? 'ถ่ายภาพจุดชำรุด' : 'Take Photo of Maintenance Issue'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'th'
                  ? 'จัดภาพจุดชำรุดให้อยู่ในกรอบเพื่อความชัดเจน'
                  : 'Align the issue within the viewfinder'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!capturedDataUrl && isStreaming && (
              <button
                type="button"
                onClick={handleToggleFacingMode}
                title={language === 'th' ? 'สลับกล้องหน้า/หลัง' : 'Switch Camera'}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewfinder / Preview Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] sm:min-h-[420px] overflow-hidden select-none">
          
          {/* Flash Effect */}
          {isFlashing && (
            <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200 pointer-events-none" />
          )}

          {/* Hidden Canvas for capture processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Error State */}
          {errorMsg ? (
            <div className="p-8 text-center max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">
                  {language === 'th' ? 'ไม่สามารถเข้าถึงกล้องได้' : 'Camera Unavailable'}
                </h4>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{errorMsg}</p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  {language === 'th' ? 'ลองใหม่อีกครั้ง' : 'Retry'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                >
                  {language === 'th' ? 'ปิด' : 'Close'}
                </button>
              </div>
            </div>
          ) : isInitializing ? (
            /* Loading / Starting Camera */
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm">
                {language === 'th' ? 'กำลังเปิดใช้งานกล้อง...' : 'Initializing camera...'}
              </p>
            </div>
          ) : capturedDataUrl ? (
            /* Captured Snapshot Preview */
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedDataUrl}
                alt="Captured maintenance preview"
                className="max-h-[60vh] max-w-full object-contain"
              />
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                {language === 'th' ? 'ภาพที่บันทึกแล้ว' : 'Captured Photo'}
              </div>
            </div>
          ) : (
            /* Live Camera Feed */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`max-h-[60vh] max-w-full object-contain ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Viewfinder Target Framing Overlay */}
              <div className="absolute inset-8 sm:inset-12 pointer-events-none border border-white/20 rounded-xl flex items-center justify-center">
                {/* Center crosshair */}
                <div className="w-6 h-6 border-t border-l border-white/40 absolute top-2 left-2" />
                <div className="w-6 h-6 border-t border-r border-white/40 absolute top-2 right-2" />
                <div className="w-6 h-6 border-b border-l border-white/40 absolute bottom-2 left-2" />
                <div className="w-6 h-6 border-b border-r border-white/40 absolute bottom-2 right-2" />
                <div className="w-2 h-2 rounded-full bg-white/40" />
              </div>

              {/* Facing mode badge */}
              <div className="absolute bottom-4 left-4 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-md text-[11px] text-slate-300 border border-white/10">
                {facingMode === 'environment'
                  ? (language === 'th' ? '📷 กล้องหลัง' : '📷 Rear Camera')
                  : (language === 'th' ? '🤳 กล้องหน้า' : '🤳 Front Camera')}
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
          {capturedDataUrl ? (
            /* Post-capture Action Buttons */
            <div className="w-full flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors border border-slate-700"
              >
                <RotateCcw className="w-4 h-4" />
                {language === 'th' ? 'ถ่ายใหม่' : 'Retake'}
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-emerald-900/30"
              >
                <Check className="w-4 h-4" />
                {language === 'th' ? 'ใช้รูปนี้' : 'Use Photo'}
              </button>
            </div>
          ) : (
            /* Shutter Live Controls */
            <div className="w-full flex items-center justify-between">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                {language === 'th' ? 'ยกเลิก' : 'Cancel'}
              </button>

              {/* Center Shutter Button */}
              <div className="flex-1 flex justify-center">
                <button
                  type="button"
                  disabled={!isStreaming}
                  onClick={handleCapture}
                  title={language === 'th' ? 'กดเพื่อถ่ายภาพ' : 'Press to take photo'}
                  className="w-16 h-16 rounded-full border-4 border-white/80 p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:pointer-events-none group"
                >
                  <div className="w-full h-full rounded-full bg-white group-hover:bg-blue-400 transition-colors shadow-inner" />
                </button>
              </div>

              <div className="w-16 text-right">
                {isStreaming && (
                  <button
                    type="button"
                    onClick={handleToggleFacingMode}
                    className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg border border-slate-700 inline-flex sm:hidden"
                    title={language === 'th' ? 'สลับกล้อง' : 'Switch Camera'}
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
