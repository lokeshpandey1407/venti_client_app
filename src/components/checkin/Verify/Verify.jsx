import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import faceVerify from "../../../assets/faceverify.png";
import qrVerify from "../../../assets/qrverify.png";
import verifyCover from "../../../assets/verifyCover.svg";

export const RESULT_STATUS = {
  ERROR: "error",
  SUCCESS: "success",
  EMPTY: "empty",
};
export const IsInIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

const Verify = ({ showAlert }) => {
  const [faceResponse, setFaceResponse] = useState("");
  const [imageData, setImageData] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const [isIframe, setIsIframe] = useState(true);

  useEffect(() => {
    if (IsInIframe()) {
      navigate("/qr-verification");
    } else {
      setIsIframe(false);
    }
  }, []);

  useEffect(() => {
    if (location.state && location.state.faceResponse) {
      console.log(location.state.faceResponse);
      setFaceResponse(location.state.faceResponse);
      setImageData(location.state.imageData);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state]);

  useEffect(() => {
    if (faceResponse) {
      const timer = setTimeout(() => {
        setFaceResponse("");
        setImageData("");
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [faceResponse]);

  const [showEventIdModal, setShowEventIdModal] = useState(false);
  const [eventId, setEventId] = useState("");
  const [eventIdAvailable, setEventIdAvailable] = useState(true);
  const [eventIdError, setEventIdError] = useState("");
  const [checking, setChecking] = useState(false);
  const [currentEventId, setCurrentEventId] = useState("ZXhwb19hdXRv");

  useEffect(() => {
    const storedEventId = localStorage.getItem("verificationEvent");
    if (storedEventId) {
      setCurrentEventId(storedEventId);
      setEventId(storedEventId);
    }
    // else {
    //   showAlert("Event id is not configured", "error");
    // }
  }, []);

  const checkEventIdValidity = async (id) => {
    if (id === "" || !id) {
      showAlert("Event id cannot be empty", "error");
      return;
    }
    setChecking(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/project/get-project/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        showAlert("Invalid Event Id", "error");
        setEventIdAvailable(false);
        setEventIdError("Invalid Event Id");
      }
      const result = await response.json();
      if (result && result.success) {
        setEventIdAvailable(true);
        showAlert("Event id configured successfully", "success");
        setEventIdError(
          !result.data.isAvailable ? "" : "No Such Event ID found"
        );
      }
    } catch (error) {
      showAlert("Error checking event ID availability:", "error");
      setEventIdAvailable(false);
      setEventIdError("Error checking event ID availability");
    } finally {
      setChecking(false);
    }
  };

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (eventId) {
  //       checkEventIdValidity(eventId);
  //     }
  //   }, 1000);

  //   return () => clearTimeout(timer);
  // }, [eventId]);

  const handleEventIdSubmit = () => {
    if (eventIdAvailable) {
      console.log("Saving: " + eventId);
      localStorage.setItem("verificationEvent", eventId);
      setCurrentEventId(eventId);

      setShowEventIdModal(false);
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
    <div className="flex flex-col justify-start items-center h-screen w-full text-text px-2 overflow-y-auto pt-24 md:pt-0 bg-gradient-to-b from-primary to-primary-grad py-[2rem] pb-[8rem] xs:pb-0">
      <div className="w-full flex flex-col justify-center items-center gap-4">
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
        <div className="w-fit h-fit p-[2px] bg-gradient-to-b from-border-gradient-left to-verify-border rounded-[1.2rem] gap-[2px] drop-shadow-3xl mt-[2rem]">
          <div className="relative bg-verify-bg rounded-[1.1rem] w-full xs:w-[30rem] md:w-[45rem] lg:w-[60rem] h-fit xs:h-[50rem] aspect-square flex flex-col justify-start items-start xs:justify-center xs:items-center">
            <div className="flex-col xs:flex-row flex w-full justify-start items-start">
              <div className="w-full flex flex-col justify-start items-center mt-8 xs:mt-0 border-r-0 sm:border-r-2 border-dashed border-[#F9D1FF]">
                <p className="w-fit xs:w-[12rem] md:w-[18rem] xs:h-[8rem] md:h-[5rem] flex justify-center text-wrap items-start font-medium text-white uppercase font-sora mb-2">
                  {faceResponse ? faceResponse : "Have a face scan?"}
                </p>

                <div className="relative w-[12rem] md:w-[18rem] h-[12rem] md:h-[18rem]">
                  <div
                    className="absolute 
        right-[8%] md:right-[12%]
        w-[10rem] md:w-[14rem] h-full flex justify-center items-center"
                  >
                    <img
                      className="object-contain w-[9rem] md:w-[12rem] rounded-2xl"
                      src={imageData ? imageData : faceVerify}
                      alt="face_scan"
                    />
                  </div>
                  <div className="absolute w-[12rem] md:w-[18rem] h-[12rem] md:h-[18rem] flex justify-center items-center ">
                    <img
                      className="object-contain"
                      src={verifyCover}
                      alt="face_scan"
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-start items-center h-[15rem] xs:h-full xs:py-6 gap-2 xs:gap-4 md:w-[20rem]">
                  {faceResponse && (
                    <p className=" font-bold font-sora text-[1.2rem] text-verify-error mt-4 xs:mt-0 h-[3rem] xs:h-[6.5rem] md:h-[3rem] md:text-[1.5rem]">
                      Facial Verification Failed.
                    </p>
                  )}
                  <div
                    className={`flex flex-col justify-start items-start xs:gap-2 ${
                      faceResponse === "" &&
                      "mt-[3rem] xs:mt-[7rem] md:mt-[4rem]"
                    }`}
                  >
                    <button
                      className="uppercase font-medium font-roboto rounded-md w-[8rem] h-[3rem] text-[1.1rem] bg-accent text-white"
                      title="Try Face Recognition"
                      onClick={() => navigate("/face-verification")}
                    >
                      {faceResponse ? "retry" : "Try it"}
                    </button>
                  </div>

                  <p className="font-sora font-normal text-[1rem] text-wrap max-w-[12rem] text-center leading-tight">
                    {`Please ${
                      faceResponse ? "retry" : "try"
                    } to verify your face for check-in.`}
                  </p>
                </div>
              </div>

              <div className="w-full flex flex-col justify-start xs:gap-12 md:gap-0 items-center">
                <p className="w-[12rem] md:w-[18rem] h-[5rem] flex justify-center text-wrap items-start font-medium text-white uppercase font-sora mb-2">
                  Please position your QR Code in the frame.
                </p>

                <div className="relative w-[12rem] md:w-[18rem] h-[12rem] md:h-[18rem]">
                  <div
                    className="absolute 
                                right-[8%] md:right-[12%]
                                w-[10rem] md:w-[14rem] h-[12rem] xs:h-full flex justify-center items-center"
                  >
                    <img
                      className="object-contain rounded-2xl overflow-hidden w-[10rem] md:w-[14rem]"
                      src={qrVerify}
                      alt="face_scan"
                    />
                  </div>
                  <div className="absolute w-[12rem] md:w-[18rem] h-[12rem] md:h-[18rem] flex justify-center items-center ">
                    <img
                      className="object-contain"
                      src={verifyCover}
                      alt="face_scan"
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-stretch items-center h-full py-6 gap-2 md:w-[20rem] mt-6 xs:mt-0">
                  <div className="w-full flex flex-col justify-start items-center gap-2 mt-[4rem]">
                    <button
                      className="uppercase font-bold font-roboto rounded-md w-[8rem] h-[3rem] text-[1.1rem] bg-background-accent text-black mb-2"
                      title="Try QR Code"
                      onClick={() => navigate("/qr-verification")}
                    >
                      QR code
                    </button>
                  </div>

                  <p className="font-sora font-normal text-[1rem] text-wrap max-w-[12rem] text-center leading-tight">
                    Please use QR code to sign in.
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full flex justify-center items-center mt-12">
              <div className="w-fit h-full justify-start items-start gap-4 text-center px-12 pb-12 xs:pb-0">
                <p className="text-white font-medium font-sora text-[1.1rem]">
                  Having trouble logging in?{" "}
                </p>
                <button
                  className="text-white font-normal opacity-80 hover:opacity-100 transition ease-in-out duration-200 text-[1.2rem]"
                  title="try invite code"
                  onClick={() => navigate(`/invite-code?e=${currentEventId}`)}
                >
                  Use{" "}
                  <span className="font-black underline text-button-primary">
                    Invite Code
                  </span>{" "}
                  instead.{" "}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end w-[20rem] sm:w-[30rem] md:w-[45rem] lg:w-[60rem] items-center z-50 pb-[1rem]">
          <button onClick={() => setShowEventIdModal(true)}>
            <p className="font-roboto font-bold text-[0.9rem] text-text-inactive hover:text-text transition duration-150 ease-in-out hover:bg-white/5 px-5 py-2 rounded-xl">
              Configure <b className="underline">Event ID</b>
            </p>
          </button>
        </div>
      </div>

      {showEventIdModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50">
          <div className="flex flex-col justify-center items-center w-fit h-fit p-[2px] bg-gradient-to-r from-border-gradient-left to-border-gradient-right rounded-[1.2rem] gap-[2px] shadow-2xl shadow-border-gradient-left/20">
            <div className="z-10 w-[18rem] sm:w-[25rem] md:w-[35rem] h-fit bg-background-primary rounded-[1.1rem] flex flex-col justify-evenly items-center py-[2rem] gap-y-[2rem] text-left">
              <h1 className="text-xl font-bold leading-tight tracking-tight font-natosans md:text-2xl text-text">
                Configure Event ID
              </h1>
              <div className="flex flex-col w-full px-5">
                <label
                  className="block text-sm font-medium mb-2"
                  htmlFor="eventId"
                >
                  Event ID
                </label>
                <input
                  id="eventId"
                  type="text"
                  className="border-[2px] border-border-secondary  bg-transparent transition ease-in-out duration-150 outline-none sm:text-sm rounded-lg focus-visible:bg-white/10 focus-visible:ring-2 focus:ring-border-gradient-right focus:border-none block w-full p-2.5"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  // minLength={4}
                  onBlur={() => checkEventIdValidity(eventId)}
                />
                {eventIdError && (
                  <p className="text-red-500 text-sm mt-1">{eventIdError}</p>
                )}
                {eventIdAvailable && (
                  <p className="text-green-500 text-sm mt-1">
                    Event ID is available
                  </p>
                )}
              </div>
              <div className="mt-6 flex gap-2 w-full px-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowEventIdModal(false);
                    // setEventId("");
                  }}
                  className="inline-flex w-full justify-center rounded-md bg-transparent px-4 py-2 text-text-inactive shadow-sm ring-1 ring-primary-white ring-opacity-10 hover:bg-red-500/30 hover:text-white transition ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEventIdSubmit}
                  className="inline-flex w-full justify-center rounded-md bg-transparent px-4 py-2 text-text-inactive shadow-sm ring-1 ring-primary-white ring-opacity-10 hover:bg-green-500/30 hover:text-white transition ease-in-out disabled:opacity-50"
                  disabled={!eventIdAvailable || !eventId || checking}
                >
                  {checking ? "Checking..." : "Set Event ID"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verify;
