import React, { useEffect, useState } from "react";
import Modal from "../../Modal";
import QrScanner from "../../QrScanner";
import { useNavigate } from "react-router-dom";
import verifyCover from "./../../../../assets/verifyCover.svg";

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

const QRVerify = ({ showAlert }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pass, setPass] = useState({});
  const [modalData, setModalData] = useState();
  const navigate = useNavigate();

  const [currentEventId, setCurrentEventId] = useState("");

  const [isIframe, setIsIframe] = useState(true);

  useEffect(() => {
    if (!IsInIframe()) setIsIframe(false);
  }, []);

  const getUserPass = async (passId) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/project-attendee-pass/${currentEventId}/get-attendee-pass/${passId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        return;
      }
      const res = await response.json();
      if (res.success) {
        setPass(res.data);
        return res;
      } else {
        return { success: false, message: "Unable to find User" };
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const storedEventId = localStorage.getItem("verificationEvent");
    if (storedEventId) {
      setCurrentEventId(storedEventId);
      console.log("Stored Event ID: ", storedEventId);
    } else {
      showAlert("Event Id is not configured", "error");
      navigate("/verify", { state: { needsConfig: true } });
    }
  }, []);

  const ShowModal = (title, body, timeoutInSeconds, callback) => {
    setModalData({ title, body });
    setTimeout(() => {
      setModalData(undefined);
      if (callback) callback();
    }, timeoutInSeconds * 1000);
  };

  const generateAttendeeBadge = async (attendeeId) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/project-attendee-badge/${currentEventId}/generate-attendee-badge/${attendeeId}/staffId`,
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
        alert(`The badge has been generated successfully`, "success");
        return res;
      }
    } catch (error) {
      console.log("Fetch error:", error);
      alert(error?.message || "Some error occured. Please try again");
      return null;
    }
  };

  const OnQrScan = async (result) => {
    if (result.length > 0) {
      let userDataResult = await getUserPass(result);
      console.log(userDataResult);
      if (userDataResult && userDataResult.success) {
        if (userDataResult.data.status === "used") {
          showAlert(
            "Badge has already been printed. Please contact admin",
            "error"
          );
          return;
        }
        if (!IsInIframe()) {
          const badgeData = await generateAttendeeBadge(
            userDataResult.data.attendee_id
          );
          // addToPrintQueue(
          //   "zd421_1",
          //   userDataResult.data.user_id,
          //   userDataResult.data.event_id,
          //   userDataResult.data.name,
          //   userDataResult.data.company,
          //   userDataResult.data.designation,
          //   userDataResult.data.interest
          // );

          navigate("/validate", {
            state: { name: userDataResult.data.first_name },
          });
        } else {
          console.log("Sending iframe data");
          window.top.postMessage(
            { type: "userData", data: userDataResult.data },
            "*"
          );
        }
      } else {
        showAlert("Unable to find the User with the QR", "error");
      }
    } else {
      console.log("error ");
      showAlert(userDataResult.message, "alert");
    }
  };

  const toggleFullscreen = () => {
    var doc = window.document;
    var docEl = doc.documentElement;

    if (!isFullscreen) docEl.requestFullscreen();
    else doc.exitFullscreen();

    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="flex flex-col justify-start sm:justify-start items-center h-screen w-full text-text px-2 overflow-y-auto py-2 bg-gradient-to-b from-primary to-primary-grad gap-8 pb-[8rem] lg:pb-0">
      {isIframe ? (
        <div className=" bg-verify-bg rounded-[1.1rem] w-[22rem] xs:w-[25rem] md:w-[30rem] h-[30rem] flex flex-col justify-center items-center gap-4">
          <p className="z-10 font-medium font-roboto text-[1.1rem] my-8 xs:my-0 xs:mt-2">
            Please place QR Code in the frame.
          </p>
          <div className="relative w-[30rem] h-[30rem]">
            <div className="absolute z-30 w-[22rem] top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 flex justify-center items-center">
              <QrScanner
                onScan={OnQrScan}
                allowMultiple={false}
                qrstyles={{ container: { width: "100%" } }}
              />
            </div>
            <div className="absolute left-4 z-10 w-fit h-fit flex justify-center items-center ">
              <img
                className="z-10 object-contain w-[28rem]"
                src={verifyCover}
                alt="face_scan"
              />
            </div>
          </div>
        </div>
      ) : (
        <>
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
          <p className="z-50 font-sora font-bold text-transparent bg-gradient-to-l from-gradient-left to-gradient-right bg-clip-text text-[2.5rem]">
            Please use QR Code
          </p>
          <div className="w-fit h-fit p-[2px] bg-gradient-to-b from-border-gradient-left to-verify-border rounded-[1.2rem] gap-[2px] drop-shadow-4xl">
            <div className=" bg-verify-bg rounded-[1.1rem] w-[22rem] xs:w-[30rem] md:w-[40rem] h-[40rem] flex flex-col justify-center items-center gap-4">
              <p className="z-10 font-medium font-roboto text-[1.1rem] my-8 xs:my-0 xs:mt-2">
                Please place QR Code in the frame.
              </p>
              <div className="relative w-[20rem] h-[20rem]">
                <div className="absolute z-30 w-[16rem] top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 flex justify-center items-center">
                  <QrScanner
                    onScan={OnQrScan}
                    allowMultiple={false}
                    qrstyles={{ container: { width: "100%" } }}
                  />
                </div>
                <div className="absolute z-10 w-fit h-fit flex justify-center items-center ">
                  <img
                    className="z-10 object-contain w-[20rem]"
                    src={verifyCover}
                    alt="face_scan"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-center items-center w-fit">
                <p className="font-normal font-sora text-white">
                  Having trouble logging in?{" "}
                </p>
                <div className="flex flex-col justify-center items-center text-wrap">
                  <p className="font-sora text-[1.1rem]">
                    Use{" "}
                    <b className="underline text-button-primary">Invite Code</b>{" "}
                    instead.{" "}
                  </p>
                  <button
                    className="uppercase font-bold font-sora rounded-md w-[14rem] h-[3rem] bg-background-accent text-black mt-8 text-[1.2rem]"
                    title="Try Invite Code"
                    onClick={() => navigate(`/invite-code?e=${currentEventId}`)}
                  >
                    get 4 digit code
                  </button>
                </div>
              </div>
            </div>
          </div>

          {modalData && <Modal title={modalData.title} body={modalData.body} />}

          <button
            className="uppercase font-bold font-sora rounded-md w-[14rem] h-[3rem] bg-orange-500 text-white mt-2 z-50 flex justify-center items-center gap-2 py-2"
            title="Try Invite Code"
            onClick={() => navigate(`/search-user?e=${currentEventId}`)}
          >
            <svg
              fill="currentColor"
              width="2rem"
              className="pl-[0.2rem]"
              version="1.1"
              id="Capa_1"
              viewBox="0 0 612 612"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <g>
                  {" "}
                  <path d="M273.053,273.046c75.399,0,136.524-61.124,136.524-136.523S348.454,0,273.053,0c-75.4,0-136.522,61.124-136.522,136.523 S197.654,273.046,273.053,273.046z M338.347,191.161c-6.209,20.535-32.814,35.971-64.698,35.971 c-31.885,0-58.489-15.437-64.699-35.971H338.347z M566.878,582.625l-52.115-52.102c16.502-18.348,26.629-42.539,26.629-69.158 c0-57.199-46.369-103.568-103.57-103.568c-57.199,0-103.568,46.369-103.568,103.568c0,57.201,46.369,103.57,103.568,103.57 c16.871,0,32.748-4.119,46.824-11.275l55.605,55.594c3.662,3.662,9.654,3.66,13.314,0l13.312-13.312 C570.54,592.279,570.54,586.287,566.878,582.625z M437.823,527.273c-36.4,0-65.908-29.508-65.908-65.908 c0-36.398,29.508-65.906,65.908-65.906c36.398,0,65.908,29.508,65.908,65.906C503.731,497.766,474.222,527.273,437.823,527.273z M310.716,461.363c0,16.277,3.188,31.795,8.787,46.113c-14.46,0.613-29.923,0.955-46.45,0.955 c-131.637,0-196.056-21.51-219.673-32.02c-6.094-2.711-11.004-10.463-11.004-17.133v-45.002 c0-67.436,51.344-123.381,116.86-130.874c1.991-0.228,4.943,0.624,6.565,1.799c30.208,21.87,67.191,34.92,107.25,34.92 c40.06,0,77.042-13.051,107.251-34.92c1.621-1.175,4.574-2.027,6.564-1.799c39.754,4.547,74.201,26.995,95.215,58.962 c-13.807-5.154-28.68-8.109-44.262-8.109C367.735,334.256,310.716,391.271,310.716,461.363z"></path>{" "}
                </g>{" "}
              </g>
            </svg>
            <p>search name</p>
          </button>
        </>
      )}
    </div>
  );
};

export default QRVerify;
