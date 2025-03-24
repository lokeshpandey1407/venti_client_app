import React, { useEffect, useRef, useState } from "react";
import WebcamCapture from "../../webcamCapture/WebcamCapture";

import { useNavigate } from "react-router-dom";
import face from "./../../../../assets/face.svg";
import axios from "axios";

export const RESULT_STATUS = {
  ACTIVE: "active",
  USED: "used",
};

export const IsInIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};
const FacialVerify = () => {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isAnalyzingFace, setIsAnalyzingFace] = useState(false);
  const [loader, setLoader] = useState(false);
  const projId = localStorage.getItem("verificationEvent");
  const handleImageCapture = async (imageSrc) => {
    setCapturedImage(imageSrc);
    setLoader(true);
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `https://awsrekognitiondemo-968752068560.asia-south1.run.app/collection/${projId}/user/search`,
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({ imageBase64: imageSrc }),
    };

    try {
      const response = await axios.request(config);
      console.log(response.data);
      if (!response.data.details || !response.data.details.UserMatches) {
        return { status: RESULT_STATUS.ERROR, message: "No face recognized" };
      }

      const userMatches = response.data.details.UserMatches;

      if (
        userMatches.length === 0 ||
        !userMatches[0].User ||
        !userMatches[0].User.UserId
      ) {
        return { status: RESULT_STATUS.ERROR, message: "No face recognized" };
      }

      setIsAnalyzingFace(false);
      setLoader(false);
      return { status: RESULT_STATUS.SUCCESS, data: userMatches };
    } catch (error) {
      console.error("Error adding photo", error);
      setLoader(false);
      return {
        status: RESULT_STATUS.ERROR,
        message:
          "Unable to recognize face, Please scan QR code to check-in instead.",
      };
    }
  };

  const onImageCapture = async (imageSrc) => {
    const result = await handleImageCapture(imageSrc);
    if (result.status === RESULT_STATUS.SUCCESS) {
      console.log("got the user array:", result.data);
      // setVisible(false);
      navigate("/face-validation", {
        state: { listInput: result.data, imageData: imageSrc },
      });
      // const newUrl = '/face-validation';
      // const state = { listInput: result.data };
      // window.history.replaceState(state, '', newUrl);
      // window.location.replace(newUrl);
    } else if (result.status === RESULT_STATUS.ERROR) {
      console.error("Error adding new event:", result.message);
      // setVisible(false);
      navigate("/verify", {
        state: { faceResponse: result.message, imageData: imageSrc },
      });

      // const newUrl = '/verify';
      // const state = { faceResponse: result.message, isFullscreen: isFullscreen };
      // window.history.replaceState(state, '', newUrl);
      // window.location.replace(newUrl);
    }
  };

  const toggleFullscreen = () => {
    const doc = window.document;
    const docEl = doc.documentElement;

    if (!isFullscreen) {
      docEl.requestFullscreen();
    } else {
      doc.exitFullscreen();
    }

    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="flex justify-center items-start xs:justify-center xs:items-start h-screen w-full text-text px-2 overflow-y-auto pt-4 xs:pt-24 md:pt-0 bg-gradient-to-b from-primary to-primary-grad pb-[8rem] sx:pb-0">
      <button
        style={{ position: "absolute", top: "1rem", right: "1rem" }}
        onClick={toggleFullscreen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-arrows-fullscreen"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707m4.344 0a.5.5 0 0 1 .707 0l4.096 4.096V11.5a.5.5 0 1 1 1 0v3.975a.5.5 0 0 1-.5.5H11.5a.5.5 0 0 1 0-1h2.768l-4.096-4.096a.5.5 0 0 1 0-.707m0-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707m-4.344 0a.5.5 0 0 1-.707 0L1.025 1.732V4.5a.5.5 0 0 1-1 0V.525a.5.5 0 0 1 .5-.5H4.5a.5.5 0 0 1 0 1H1.732l4.096 4.096a.5.5 0 0 1 0 .707"
          />
        </svg>
      </button>
      <div className="flex flex-col justify-center items-center gap-12 py-[2rem]">
        <p className="z-50 font-sora font-bold text-transparent bg-gradient-to-l from-gradient-left to-gradient-right bg-clip-text text-[2.5rem]">
          Welcome!
        </p>
        <div className="relative bg-primary rounded-[2rem] h-[30rem] w-[20rem]  sm:h-[35rem] sm:w-[25rem] md:h-[40rem] md:w-[30rem] overflow-hidden drop-shadow-3xl flex justify-center items-center">
          {/* <div className=' bg-black w-full h-full rounded-2xl flex justify-center items-center overflow-hidden text-text'> */}
          {loader ? (
            <svg
              width="7rem"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 200 200"
            >
              <circle
                fill="none"
                stroke-opacity="1"
                stroke="currentColor"
                stroke-width=".5"
                cx="100"
                cy="100"
                r="0"
              >
                <animate
                  attributeName="r"
                  calcMode="spline"
                  dur="3"
                  values="1;80"
                  keyTimes="0;1"
                  keySplines="0 .2 .5 1"
                  repeatCount="indefinite"
                ></animate>
                <animate
                  attributeName="stroke-width"
                  calcMode="spline"
                  dur="3"
                  values="0;25"
                  keyTimes="0;1"
                  keySplines="0 .2 .5 1"
                  repeatCount="indefinite"
                ></animate>
                <animate
                  attributeName="stroke-opacity"
                  calcMode="spline"
                  dur="3"
                  values="1;0"
                  keyTimes="0;1"
                  keySplines="0 .2 .5 1"
                  repeatCount="indefinite"
                ></animate>
              </circle>
            </svg>
          ) : (
            <WebcamCapture
              audio={false}
              // ref={setRef}
              capturedImage={capturedImage}
              onCapture={onImageCapture}
              onSwitchToQR={true}
              isDisabled={false}
              isAnalyzingFace={isAnalyzingFace}
              setIsAnalyzingFace={setIsAnalyzingFace}
            />
          )}
          {/* </div> */}
          {/* <button
                // onClick={stop}
                >Stop</button> */}
          {/* <button onClick={releaseWebcam}>i am the saviour</button> */}
        </div>
        <div className="w-[20rem] px-6 rounded-full h-[5rem] bg-face-bg flex justify-start items-center gap-3 text-white z-50">
          <img src={face} alt="face" />
          <p className="text-left font-sora font-medium">
            Please position your face in the frame.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FacialVerify;
