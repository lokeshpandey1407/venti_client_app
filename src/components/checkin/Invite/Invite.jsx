import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

const Invite = ({ showAlert }) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [activeInput, setActiveInput] = useState(0);
  const [isAlpha, setIsAlpha] = useState(false);
  const inputRefs = useRef([]);
  const submitRef = useRef(null);
  const [loader, setLoader] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [paramDetails, setParamDetails] = useState({});

  const [isIframe, setIsIframe] = useState(true);

  useEffect(() => {
    if (!IsInIframe()) setIsIframe(false);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const eParam = searchParams.get("e") || "";

    if (eParam) {
      setParamDetails((prevDetails) => ({
        ...prevDetails,
        event: eParam,
      }));
    } else {
      alert("No event details attached");
      navigate("/verify");
    }
  }, [location.search]);

  // useEffect(() => {
  //     let isMounted = true;

  //     const fetchEvent = async () => {
  //         if (!paramDetails.event) return;

  //         try {
  //             const result = await getEvent(paramDetails.event);
  //             if (isMounted) {
  //                 if (result.status === RESULT_STATUS.SUCCESS) {
  //                     setEventData(result.data);
  //                     console.log(result.data);
  //                 } else if (result.status === RESULT_STATUS.ERROR) {
  //                     console.error("Error getting new event:", result.message);
  //                     showAlert(result.message, "alert");
  //                 }
  //             }
  //         } catch (error) {
  //             if (isMounted) {
  //                 console.error("Error:", error.message);
  //                 showAlert(error.message, "alert");
  //             }
  //         }
  //     };

  //     fetchEvent();

  //     console.log(eventData);
  //     return () => {
  //         isMounted = false;
  //     };
  // }, [paramDetails.event]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 4);
  }, []);

  // const handleKeyDown = (e, index) => {
  //   if (
  //     !/^[0-9]{1}$/.test(e.key) &&
  //     e.key !== "Backspace" &&
  //     e.key !== "Delete" &&
  //     e.key !== "Tab" &&
  //     !e.metaKey
  //   ) {
  //     e.preventDefault();
  //   }

  //   if (e.key === "Delete" || e.key === "Backspace") {
  //     if (index > 0 && !otp[index]) {
  //       const newOtp = [...otp];
  //       newOtp[index - 1] = "";
  //       setOtp(newOtp);
  //       inputRefs.current[index - 1].focus();
  //     }
  //   }
  // };

  useEffect(() => {
    const state = window.history.state;
    if (state && state.isFullscreen) {
      setIsFullscreen(state.isFullscreen);
      toggleFullscreen();
    }
  }, [window.history.state]);

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

  // const handleChange = (e, index) => {
  //   const value = e.target.value;
  //   if (isNaN(value)) return;
  //   const newOtp = [...otp];
  //   newOtp[index] = value.substring(value.length - 1);
  //   setOtp(newOtp);

  //   if (value && index < 3) {
  //     inputRefs.current[index + 1].focus();
  //   } else if (index === 3) {
  //     submitRef.current.focus();
  //   }
  //   setActiveInput(index);
  // };

  const handleFocus = (e, index) => {
    e.target.select();
    setActiveInput(index);
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    // if (/[^0-9]/.test(value)) return; // Prevent non-digit input

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to the next input automatically
    if (value !== "" && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "") {
      // Focus previous input on backspace
      if (index > 0) {
        document.getElementById(`otp-input-${index - 1}`).focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    if (!new RegExp(`^[0-9]{4}$`).test(text)) {
      return;
    }
    const digits = text.split("");
    setOtp(digits);
    submitRef.current.focus();
  };

  const generateAttendeeBadge = async (attendeeId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/project-attendee-badge/${
          paramDetails.event
        }/generate-attendee-badge/${attendeeId}/staffId`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(),
        }
      );
      const res = await response.json();
      if (!response.ok) {
        alert(res.message || "Some error occurred. Please try again");
      }

      if (res.success) {
        showAlert(`The badge has been generated successfully `, "success");
        return res;
      }
    } catch (error) {
      console.log("Fetch error:", error);
      alert(error?.message || "Some error occured. Please try again");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.includes("")) {
      showAlert("Please fill in the complete invite code.", "alert");
      return;
    }
    const submittedOtp = otp.join("");
    console.log("Submitted OTP:", submittedOtp, paramDetails.event);
    // alert('Submitted OTP: ' + submittedOtp);
    setLoader(true);

    if (paramDetails.event && submittedOtp) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/project-attendee-pass/${
            paramDetails.event
          }/get-attendee-pass/${submittedOtp}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const userResult = await response.json();
        if (userResult.success) {
          if (userResult.data.status === "used") {
            showAlert(
              "Badge has already been printed. Please contact admin",
              "error"
            );
            setLoader(false);
            return;
          }
          if (!IsInIframe()) {
            const badge = await generateAttendeeBadge(
              userResult.data.attendee_id
            );
            // addToPrintQueue(
            //     "zd421_1",
            //     userResult.data.user_id,
            //     userResult.data.event_id,
            //     userResult.data.name,
            //     userResult.data.company,
            //     userResult.data.designation,
            //     userResult.data.interest
            // );
            navigate("/validate", {
              state: { name: userResult.data.first_name },
            });
          } else {
            console.log("Sending iframe data");
            window.top.postMessage(
              { type: "userData", data: userResult.data },
              "*"
            );
          }
        } else {
          console.error("Error getting new user:", userResult);
          showAlert("Invalid/ Wrong otp", "alert");
        }
      } catch (error) {
        console.error("Error:", error.message);
        showAlert(error.message, "alert");
        setLoader(false);
      }
    }
    setLoader(false);
  };

  const handleDialPadClick = (digit) => {
    if (activeInput < 4) {
      const newOtp = [...otp];
      newOtp[activeInput] = digit;
      setOtp(newOtp);

      if (activeInput < 3) {
        setActiveInput(activeInput + 1);
        inputRefs.current[activeInput + 1].focus();
      } else {
        submitRef.current.focus();
      }
    }
  };

  const handleBackspace = () => {
    if (activeInput > 0 && activeInput < 3) {
      const newOtp = [...otp];
      newOtp[activeInput] = "";
      setOtp(newOtp);
      setActiveInput(activeInput - 1);
      inputRefs.current[activeInput - 1].focus();
    } else if (activeInput === 0) {
      const newOtp = [...otp];
      newOtp[activeInput] = "";
      setOtp(newOtp);
      inputRefs.current[activeInput].focus();
    } else {
      const newOtp = [...otp];
      if (newOtp[activeInput] != "") {
        newOtp[activeInput] = "";
        setOtp(newOtp);
        setActiveInput(activeInput);
        inputRefs.current[activeInput].focus();
      } else {
        newOtp[activeInput - 1] = "";
        setOtp(newOtp);
        setActiveInput(activeInput - 1);
        inputRefs.current[activeInput - 1].focus();
      }
    }
  };

  const renderDialPad = () => {
    // const digits = [
    //   [1, 2, 3],
    //   [4, 5, 6],
    //   [7, 8, 9],
    //   [null, 0, "back"],
    // ];

    const digits = [
      [1, 2, 3, 4, 5, 6, 7],
      [8, 9, 0, "a", "b", "c", "d"],
      ["e", "f", "g", "h", "i", "j", "k"],
      ["l", "m", "n", "o", "p", "q", "r"],
      ["s", "t", "u", "v", "w", "x", "y"],
      ["z", null, null, null, null, null, "back"],
    ];
    return (
      <div className="grid grid-cols-7  lg:grid-cols-7 gap-4 mt-4 w-fit justify-center items-center ">
        {digits.flat().map((digit, index) =>
          digit !== null ? (
            <button
              key={index}
              type="button"
              onClick={() =>
                digit === "back"
                  ? handleBackspace()
                  : handleDialPadClick(digit.toString())
              }
              className={`w-[4rem] xs:w-[4rem] lg:w-[4rem] h-[4rem] xs:h-[4rem] lg:h-[4rem] transition ease-in-out duration-150 text-center items-center flex justify-center text-[2rem] lg:text-[2rem] font-bold 
                            ${
                              digit === "back"
                                ? "hover:text-red-500"
                                : "bg-background-accent hover:bg-[#333333] hover:text-text hover:ring-2 hover:ring-white/50 focus:outline-none focus:ring-1"
                            }  rounded-full   ${
                digit === "back" ? "text-background-accent" : "text-slate-700 "
              }`}
            >
              {digit === "back" ? (
                <svg
                  viewBox="0 0 21 21"
                  width="4rem"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <g
                      fill="none"
                      fill-rule="evenodd"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      transform="matrix(0 -1 1 0 2.5 15.5)"
                    >
                      {" "}
                      <path d="m0 5.82842712v7.17157288c0 1.1045695.8954305 2 2 2h6c1.1045695 0 2-.8954305 2-2v-7.17157288c0-.53043297-.21071368-1.0391408-.58578644-1.41421356l-3.70710678-3.70710678c-.39052429-.39052429-1.02368927-.39052429-1.41421356 0l-3.70710678 3.70710678c-.37507276.37507276-.58578644.88378059-.58578644 1.41421356z"></path>{" "}
                      <g transform="matrix(0 1 -1 0 14 4)">
                        {" "}
                        <path d="m3 11 4-4"></path> <path d="m3 7 4 4"></path>{" "}
                      </g>{" "}
                    </g>{" "}
                  </g>
                </svg>
              ) : (
                digit
              )}
            </button>
          ) : (
            <div key={index} className="w-14 h-14"></div>
          )
        )}
      </div>
    );
  };

  const preventKeyboard = (e) => {
    e.preventDefault();
  };

  return (
    <>
      {isIframe ? (
        <>
          <div className="flex flex-col justify-start items-start h-screen w-full text-text px-2 overflow-y-auto md:pt-0 bg-verify-bg pb-[8rem] sm:pb-0">
            <div className="relative bg-verify-bg rounded-[1.1rem] w-full sx:w-[30rem] sm:w-[40rem] h-fit aspect-square flex flex-col justify-start items-start xs:justify-center xs:items-center">
              <div className="max-w-md mx-auto text-center  px-4 sm:px-8 py-10 rounded-xl shadow">
                <header className="mb-8 flex justify-center flex-col items-center">
                  <h1 className="text-transparent bg-gradient-to-l from-gradient-left to-gradient-right bg-clip-text font-bold font-sora sm:w-[50rem] text-[2rem] mb-1">
                    Enter 4 digit invite code
                  </h1>
                  <p className="md:text-[13px] max-w-[20rem] text-text text-center font-sora">
                    Please enter the 4 digit invite code that came with
                    registration message.
                  </p>
                </header>
                <form id="otp-form" onSubmit={handleSubmit}>
                  <div className="flex items-center justify-center gap-3">
                    {/* {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="none"
                        readOnly
                        value={digit}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onFocus={(e) => handleFocus(e, index)}
                        onTouchStart={preventKeyboard}
                        onMouseDown={preventKeyboard}
                        className="w-[3rem] xs:w-[4rem] lg:w-[5rem] h-[3rem] xs:h-[4rem] lg:h-[5rem] text-center text-[2.5rem] font-extrabold text-text bg-transparent border border-background-accent appearance-none rounded p-4  border-1 focus:border-background-accent focus:ring-1 focus:ring-background-accent outline-none focus:shadow focus:shadow-background-accent transition ease-in-out duration-150"
                        maxLength="1"
                      />
                    ))} */}
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-input-${index}`}
                        type="text"
                        value={digit}
                        onChange={(e) => handleChange(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        maxLength={1}
                        className="w-[3rem] xs:w-[4rem] lg:w-[5rem] h-[3rem] xs:h-[4rem] lg:h-[5rem] text-center text-[2.5rem] font-extrabold text-text bg-transparent border-background-accent appearance-none rounded p-4  border-1 focus:border-background-accent focus:ring-1 focus:ring-background-accent outline-none focus:shadow focus:shadow-background-accent transition ease-in-out duration-150"
                      />
                    ))}
                  </div>
                  {/* <div className="flex w-full justify-center items-center">
                    {renderDialPad()}
                  </div> */}
                  <div className="w-[18rem] sm:max-w-[40rem] mx-auto mt-4">
                    <button
                      type="submit"
                      ref={submitRef}
                      className="w-full flex items-center justify-center rounded-lg bg-transparent px-3.5 h-[3rem] text-[1.5rem] font-bold shadow-sm hover:bg-[#333333] hover:text-text ring-[0.1rem] ring-background-accent hover:ring-white/50 focus:outline-none focus:ring-1 transition text-background-accent duration-150"
                    >
                      {!loader ? (
                        "Verify Invite Code"
                      ) : (
                        <svg
                          width="4rem"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 200 60"
                        >
                          <circle
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth="15"
                            r="15"
                            cx="40"
                            cy="30"
                          >
                            <animate
                              attributeName="opacity"
                              calcMode="spline"
                              dur="2"
                              values="1;0;1;"
                              keySplines=".5 0 .5 1;.5 0 .5 1"
                              repeatCount="indefinite"
                              begin="-.4"
                            ></animate>
                          </circle>
                          <circle
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth="15"
                            r="15"
                            cx="100"
                            cy="30"
                          >
                            <animate
                              attributeName="opacity"
                              calcMode="spline"
                              dur="2"
                              values="1;0;1;"
                              keySplines=".5 0 .5 1;.5 0 .5 1"
                              repeatCount="indefinite"
                              begin="-.2"
                            ></animate>
                          </circle>
                          <circle
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth="15"
                            r="15"
                            cx="160"
                            cy="30"
                          >
                            <animate
                              attributeName="opacity"
                              calcMode="spline"
                              dur="2"
                              values="1;0;1;"
                              keySplines=".5 0 .5 1;.5 0 .5 1"
                              repeatCount="indefinite"
                              begin="0"
                            ></animate>
                          </circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </form>
                {/* <div className="text-sm text-slate-500 mt-4">Didn't receive code? <a className="font-medium text-indigo-500 hover:text-indigo-600" href="#0">Resend</a></div> */}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col justify-start items-center h-screen w-full text-text px-2 overflow-y-auto pt-2 md:pt-0 bg-gradient-to-b from-primary to-primary-grad pb-[8rem] sm:pb-0">
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
          <div className="flex flex-col justify-center items-center w-fit h-fit">
            <div className="w-fit h-fit p-[2px] bg-gradient-to-b from-border-gradient-left to-verify-border rounded-[1.2rem] gap-[2px] drop-shadow-3xl mb-[2rem] mt-[2rem] lg:mt-[2rem]">
              <div className="relative bg-verify-bg rounded-[1.1rem] w-full sx:w-[40rem] sm:w-[50rem] h-fit aspect-square flex flex-col justify-start items-start xs:justify-center xs:items-center">
                <div className="max-w-full mx-auto text-center  px-4 sm:px-8 py-10 rounded-xl shadow">
                  <header className="mb-8 flex justify-center flex-col items-center">
                    <h1 className="text-transparent bg-gradient-to-l from-gradient-left to-gradient-right bg-clip-text font-bold font-sora sm:w-[40rem] text-[2rem] mb-1">
                      Enter 4 digit invite code
                    </h1>
                    <p className="md:text-[13px] max-w-[20rem] text-text text-center font-sora">
                      Please enter the 4 digit invite code that came with
                      registration message.
                    </p>
                  </header>
                  <form id="otp-form" onSubmit={handleSubmit}>
                    <div className="flex items-center justify-center gap-3">
                      {/* {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (inputRefs.current[index] = el)}
                          type="text"
                          inputMode="none"
                          readOnly
                          value={digit}
                          onChange={(e) => handleChange(e, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          onFocus={(e) => handleFocus(e, index)}
                          onTouchStart={preventKeyboard}
                          onMouseDown={preventKeyboard}
                          className="w-[3rem] xs:w-[4rem] lg:w-[5rem] h-[3rem] xs:h-[4rem] lg:h-[5rem] text-center text-[2.5rem] font-extrabold text-text bg-transparent border border-background-accent appearance-none rounded p-4  border-1 focus:border-background-accent focus:ring-1 focus:ring-background-accent outline-none focus:shadow focus:shadow-background-accent transition ease-in-out duration-150"
                          maxLength="1"
                        />
                      ))} */}
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-input-${index}`}
                          type="text"
                          value={digit}
                          onChange={(e) => handleChange(e, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          maxLength={1}
                          className="w-[3rem] xs:w-[4rem] lg:w-[5rem] h-[3rem] xs:h-[4rem] lg:h-[5rem] text-center text-[2.5rem] font-extrabold text-text bg-transparent border-background-accent appearance-none rounded p-4  border-1 focus:border-background-accent focus:ring-1 focus:ring-background-accent outline-none focus:shadow focus:shadow-background-accent transition ease-in-out duration-150"
                        />
                      ))}
                    </div>
                    {/* <div className="flex w-full justify-center items-center">
                      {renderDialPad()}
                    </div> */}
                    <div className="w-[18rem] sm:max-w-[40rem] mx-auto mt-4">
                      <button
                        type="submit"
                        ref={submitRef}
                        className="w-full flex items-center justify-center rounded-lg bg-transparent px-3.5 h-[3rem] text-[1.5rem] font-bold shadow-sm hover:bg-[#333333] hover:text-text ring-[0.1rem] ring-background-accent hover:ring-white/50 focus:outline-none focus:ring-1 transition text-background-accent duration-150"
                      >
                        {!loader ? (
                          "Verify Invite Code"
                        ) : (
                          <svg
                            width="4rem"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 200 60"
                          >
                            <circle
                              fill="currentColor"
                              stroke="currentColor"
                              strokeWidth="15"
                              r="15"
                              cx="40"
                              cy="30"
                            >
                              <animate
                                attributeName="opacity"
                                calcMode="spline"
                                dur="2"
                                values="1;0;1;"
                                keySplines=".5 0 .5 1;.5 0 .5 1"
                                repeatCount="indefinite"
                                begin="-.4"
                              ></animate>
                            </circle>
                            <circle
                              fill="currentColor"
                              stroke="currentColor"
                              strokeWidth="15"
                              r="15"
                              cx="100"
                              cy="30"
                            >
                              <animate
                                attributeName="opacity"
                                calcMode="spline"
                                dur="2"
                                values="1;0;1;"
                                keySplines=".5 0 .5 1;.5 0 .5 1"
                                repeatCount="indefinite"
                                begin="-.2"
                              ></animate>
                            </circle>
                            <circle
                              fill="currentColor"
                              stroke="currentColor"
                              strokeWidth="15"
                              r="15"
                              cx="160"
                              cy="30"
                            >
                              <animate
                                attributeName="opacity"
                                calcMode="spline"
                                dur="2"
                                values="1;0;1;"
                                keySplines=".5 0 .5 1;.5 0 .5 1"
                                repeatCount="indefinite"
                                begin="0"
                              ></animate>
                            </circle>
                          </svg>
                        )}
                      </button>
                    </div>
                  </form>
                  {/* <div className="text-sm text-slate-500 mt-4">Didn't receive code? <a className="font-medium text-indigo-500 hover:text-indigo-600" href="#0">Resend</a></div> */}
                </div>
              </div>
            </div>
            <div className="flex justify-between w-full items-center px-[2rem] z-50">
              <button onClick={() => navigate("/verify")}>
                <p className="font-roboto font-bold text-[0.9rem] text-text-inactive hover:text-text transition duration-150 ease-in-out hover:bg-white/5 px-5 py-2 rounded-xl">
                  Go back to <b className="underline">Verify Page</b>
                </p>
              </button>
              <button
                className="flex justify-center items-center text-text-inactive hover:text-text transition duration-150 ease-in-out rounded-full w-[3rem] h-[3rem] hover:bg-white/10"
                onClick={() => navigate(`/search-user?e=${paramDetails.event}`)}
              >
                <svg
                  fill="currentColor"
                  width="2rem"
                  className="pl-[0.2rem]"
                  version="1.1"
                  id="Capa_1"
                  viewBox="0 0 612 612"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <g>
                      {" "}
                      <path d="M273.053,273.046c75.399,0,136.524-61.124,136.524-136.523S348.454,0,273.053,0c-75.4,0-136.522,61.124-136.522,136.523 S197.654,273.046,273.053,273.046z M338.347,191.161c-6.209,20.535-32.814,35.971-64.698,35.971 c-31.885,0-58.489-15.437-64.699-35.971H338.347z M566.878,582.625l-52.115-52.102c16.502-18.348,26.629-42.539,26.629-69.158 c0-57.199-46.369-103.568-103.57-103.568c-57.199,0-103.568,46.369-103.568,103.568c0,57.201,46.369,103.57,103.568,103.57 c16.871,0,32.748-4.119,46.824-11.275l55.605,55.594c3.662,3.662,9.654,3.66,13.314,0l13.312-13.312 C570.54,592.279,570.54,586.287,566.878,582.625z M437.823,527.273c-36.4,0-65.908-29.508-65.908-65.908 c0-36.398,29.508-65.906,65.908-65.906c36.398,0,65.908,29.508,65.908,65.906C503.731,497.766,474.222,527.273,437.823,527.273z M310.716,461.363c0,16.277,3.188,31.795,8.787,46.113c-14.46,0.613-29.923,0.955-46.45,0.955 c-131.637,0-196.056-21.51-219.673-32.02c-6.094-2.711-11.004-10.463-11.004-17.133v-45.002 c0-67.436,51.344-123.381,116.86-130.874c1.991-0.228,4.943,0.624,6.565,1.799c30.208,21.87,67.191,34.92,107.25,34.92 c40.06,0,77.042-13.051,107.251-34.92c1.621-1.175,4.574-2.027,6.564-1.799c39.754,4.547,74.201,26.995,95.215,58.962 c-13.807-5.154-28.68-8.109-44.262-8.109C367.735,334.256,310.716,391.271,310.716,461.363z"></path>{" "}
                    </g>{" "}
                  </g>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Invite;
