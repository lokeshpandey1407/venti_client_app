import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

const width = 600;
const height = 700;
const faceHoldTimeInSeconds = 1;

const WebcamCapture = ({ onCapture, isDisabled = false }) => {
  const [instruction, setInstruction] = useState("Initializing...");
  const [percent, setPercent] = useState(0);
  const [isUserDetected, setIsUserDetected] = useState(false);
  const faceDetectorRef = useRef(null);
  const webcamRef = useRef(null);
  const animationRef = useRef(null);
  const canvasRef = useRef(null);
  const hasCaptureedRef = useRef(false);

  const initializeFaceDetector = useCallback(async () => {
    try {
      console.log("Initializing FilesetResolver...");
      const vision = await FilesetResolver.forVisionTasks(
        "./face/tasks-vision-0.10.0/wasm"
      );
      console.log("FilesetResolver initialized. Creating FaceDetector...");
      const detector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `./face/blaze_face_short_range.tflite`,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
      });
      console.log("FaceDetector created successfully.");
      faceDetectorRef.current = detector;
      console.log("facedector", faceDetectorRef.current);
      setInstruction("Face detector ready. Waiting for webcam...");
    } catch (error) {
      console.error("Error initializing face detector:", error);
      setInstruction(
        "Error initializing face detector. Please check file paths and refresh the page."
      );
    }
  }, []);

  useEffect(() => {
    console.log("Component mounted. Initializing face detector...");
    initializeFaceDetector();
    return () => {
      console.log("Component unmounting. Cleaning up...");
      if (webcamRef.current && webcamRef.current.video) {
        const stream = webcamRef.current.video.srcObject;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initializeFaceDetector]);

  const predictWebcam = useCallback(() => {
    // console.log(faceDetectorRef.current, webcamRef.current);
    if (
      !faceDetectorRef.current ||
      !webcamRef.current ||
      !webcamRef.current.video
    ) {
      // console.log("FaceDetector or webcam not ready. Skipping prediction.");
      animationRef.current = requestAnimationFrame(predictWebcam);
      return;
    }

    const video = webcamRef.current.video;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log("Video dimensions are not valid. Skipping prediction.");
      animationRef.current = requestAnimationFrame(predictWebcam);
      return;
    }

    try {
      const startTimeMs = performance.now();
      const detections = faceDetectorRef.current.detectForVideo(
        video,
        startTimeMs
      ).detections;

      const processedDetections = detections.map((detection) => {
        if (!detection.boundingBox) {
          const keypoints = detection.keypoints;
          if (keypoints && keypoints.length > 0) {
            const xCoords = keypoints.map(
              (kp) => (1 - kp.x) * video.videoWidth
            ); //flip x
            const yCoords = keypoints.map((kp) => kp.y * video.videoHeight);
            const minX = Math.min(...xCoords);
            const maxX = Math.max(...xCoords);
            const minY = Math.min(...yCoords);
            const maxY = Math.max(...yCoords);

            detection.boundingBox = {
              originX: minX - 100,
              originY: minY - 100,
              width: maxX - minX,
              height: maxY - minY,
            };
          }
        } else {
          // Flip the bounding box x-coordinate
          detection.boundingBox.originX =
            video.videoWidth -
            (detection.boundingBox.originX + detection.boundingBox.width);
        }
        return detection;
      });

      validateFaceTracking(processedDetections);
      drawBoundingBox(processedDetections);
    } catch (error) {
      console.error("Error in face detection:", error);
      setInstruction("Face detection error. Please try again.");
    }

    animationRef.current = requestAnimationFrame(predictWebcam);
  }, []);

  useEffect(() => {
    let timerId;

    if (isUserDetected && !hasCaptureedRef.current) {
      const startTime = new Date().getTime();

      const updateTimer = () => {
        const currentTime = new Date().getTime();
        const elapsedTime = currentTime - startTime;
        const percent = Math.min(
          100,
          (elapsedTime / (faceHoldTimeInSeconds * 1000)) * 100
        );

        if (elapsedTime >= faceHoldTimeInSeconds * 1000) {
          if (!hasCaptureedRef.current) {
            setInstruction("Analyzing facial data");
            capturePhoto();
            hasCaptureedRef.current = true;
          }
          clearInterval(timerId);
        } else {
          setPercent(percent);
        }
      };

      timerId = setInterval(updateTimer, 100);
      updateTimer();
    } else if (!isUserDetected) {
      setInstruction("Face lost. Please reposition.");
      hasCaptureedRef.current = false;
      setPercent(0);
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
        setPercent(0);
      }
    };
  }, [isUserDetected]);

  const validateFaceTracking = (detections) => {
    let isValid = false;

    if (!isUserDetected && detections.length === 0) {
      setInstruction("Step in front of camera for facial check-in");
    } else if (!isUserDetected && detections.length > 1) {
      setInstruction("Too many faces in view");
    } else {
      const face = detections[0];
      if (
        face.categories.length > 0 &&
        face.categories[0].score > 0.75 &&
        face.boundingBox.width > 0 &&
        face.boundingBox.height > 0
      ) {
        isValid = true;
      } else {
        setInstruction("Face detected, but bounding box not valid");
      }
    }

    setIsUserDetected(isValid);
  };

  const drawBoundingBox = (detections) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((detection) => {
      if (
        detection.boundingBox &&
        detection.boundingBox.width > 0 &&
        detection.boundingBox.height > 0
      ) {
        const { originX, originY, width, height } = detection.boundingBox;

        // Draw bounding box
        ctx.strokeStyle = "green";
        ctx.lineWidth = 1;
        // ctx.strokeRect(originX + width/4, originY, width * 1.2, height * 1.5);
        ctx.strokeRect(originX, originY, 0.75 * width, 0.75 * height);

        // Draw keypoints
        if (detection.keypoints) {
          detection.keypoints.forEach((keypoint) => {
            ctx.beginPath();
            // ctx.arc(keypoint.x * canvas.width *1.3, keypoint.y * canvas.height *1.3, 1, 0, 3 * Math.PI);
            const flippedX = canvas.width - keypoint.x * canvas.width;
            ctx.arc(
              flippedX * canvas.width * 0.75,
              keypoint.y * canvas.height,
              1,
              0,
              1.5 * Math.PI
            );
            ctx.fillStyle = "red";
            ctx.fill();
          });
        }
      }
    });
  };

  const capturePhoto = useCallback(async () => {
    console.log("Capturing photo...");
    if (!webcamRef.current) {
      console.log("Webcam ref not available. Cannot capture photo.");
      return;
    }
    const imageSrc = webcamRef.current.getScreenshot();
    setInstruction("100%");
    // Stop the webcam stream
    if (webcamRef.current.video) {
      const stream = webcamRef.current.video.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        console.log("Webcam stream stopped.");
      }
    }

    console.log("Calling onCapture with the captured image...");
    console.log(imageSrc);
    await onCapture(imageSrc);
    // navigate("/verify")
    // Reset states
    setIsUserDetected(false);
    setInstruction("Photo captured");
    console.log("States reset after photo capture.");
  }, []);

  return (
    <div
      className="w-full h-full flex flex-col justify-center items-center"
      style={{ position: "relative", width, height }}
    >
      <Webcam
        ref={webcamRef}
        audio={false}
        width={width}
        height={height}
        screenshotFormat="image/jpeg"
        className="object-cover w-full h-full"
        videoConstraints={{ width, height }}
        mirrored={true}
        onUserMedia={() => {
          console.log("Webcam stream started. Beginning face detection...");
          setInstruction("Webcam enabled. Detecting faces...");
          predictWebcam();
        }}
        onUserMediaError={(error) => {
          console.error("Error accessing webcam:", error);
          setInstruction(
            "Error accessing webcam. Please check permissions and try again."
          );
        }}
      />
      <canvas
        ref={canvasRef}
        width={600}
        height={700}
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      <div className="items-end bottom-0 flex end-0 justify-center absolute start-0 top-0 z-50">
        {percent === 0 ? (
          <div>{instruction}</div>
        ) : (
          <div className="w-full rounded-full h-[0.5rem] mx-[2rem] my-[1rem] bg-black/50">
            <div
              className="bg-blue-600 h-[0.5rem] rounded-full"
              style={{ width: `${Math.ceil(Math.min(percent, 100))}%` }}
            ></div>
          </div>
        )}
      </div>
      <div className="absolute w-full h-full bg-transparent z-20">
        <div className="hidden sm:flex relative w-full h-full">
          <div className="absolute inset-0 bg-black/50 w-full h-full"></div>
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[17rem] h-[17rem] border-[60rem] border-black/10 box-content">
            <svg
              className="absolute w-[17.5rem] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
              viewBox="0 0 275 276"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M252.427 4H267.996C269.653 4 270.996 5.34315 270.996 7V20.3109"
                stroke="white"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M252.427 272H267.996C269.653 272 270.996 270.657 270.996 269V255.689"
                stroke="white"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M22.5693 4H7.00005C5.3432 4 4.00005 5.34315 4.00005 7V20.3109"
                stroke="white"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M22.5693 272H7.00005C5.3432 272 4.00005 270.657 4.00005 269V255.689"
                stroke="white"
                strokeWidth="7"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebcamCapture;
