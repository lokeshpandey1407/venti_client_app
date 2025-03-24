import React, { useRef, useEffect, useState, useCallback } from "react";
import jsQR from "jsqr";

const QrScanner = ({ onScan, allowMultiple, qrstyles }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const getCameras = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setCameras(videoDevices);

        const storedCameraId = localStorage.getItem("selectedCamera");
        if (
          storedCameraId &&
          videoDevices.some((device) => device.deviceId === storedCameraId)
        ) {
          setSelectedCamera(storedCameraId);
        } else if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
          localStorage.setItem("selectedCamera", videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error("Error getting cameras:", error);
      }
    };
    getCameras();
  }, []);

  const handleScan = useCallback(
    (result) => {
      if (result && isScanning) {
        onScan(result);
        setIsScanning(false);
        setTimeout(() => setIsScanning(true), 2000);
      }
    },
    [onScan, isScanning]
  );

  useEffect(() => {
    if (!selectedCamera) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    let animationFrameId;
    let retryTimeout;

    const startScanning = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: selectedCamera },
        });
        video.srcObject = stream;

        // Use a promise to handle the play() method
        await new Promise((resolve, reject) => {
          video.onloadedmetadata = () => {
            video.play().then(resolve).catch(reject);
          };
        });

        const scanQRCode = () => {
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );
            const code = jsQR(
              imageData.data,
              imageData.width,
              imageData.height
            );

            if (code) {
              handleScan(code.data);
            }
          }
          animationFrameId = requestAnimationFrame(scanQRCode);
        };
        scanQRCode();
      } catch (error) {
        console.error("Error accessing camera:", error);
        // Retry after a short delay
        retryTimeout = setTimeout(startScanning, 1000);
      }
    };

    startScanning();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      if (video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [selectedCamera, handleScan]);

  const cycleCamera = () => {
    const currentIndex = cameras.findIndex(
      (camera) => camera.deviceId === selectedCamera
    );
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];
    setSelectedCamera(nextCamera.deviceId);
    localStorage.setItem("selectedCamera", nextCamera.deviceId);
  };

  return (
    <div style={qrstyles?.container || styles.container}>
      <video ref={videoRef} style={{ display: "none" }}></video>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", maxWidth: "500px" }}
      ></canvas>
      {cameras.length > 1 && (
        <button
          className="absolute z-50 bottom-2 right-2 mb-2 bg-black/50 p-2 rounded-full hover:cursor-pointer"
          onClick={cycleCamera}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="currentColor"
            className="bi bi-arrow-clockwise"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"
            />
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
          </svg>
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
    height: "100%",
    margin: "auto",
  },
};

export default QrScanner;
