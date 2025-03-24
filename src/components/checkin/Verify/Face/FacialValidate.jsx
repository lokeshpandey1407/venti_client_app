import React, { useEffect, useState } from "react";
import Modal from "../../Modal";
import { useLocation, useNavigate } from "react-router-dom";
import verifyuser from "./../../../../assets/verifyuser.svg";

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

const Verify = ({ showAlert }) => {
  const [userList, setUserList] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [modalData, setModalData] = useState();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageData, setImageData] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFetchingUser, setIsFetchingUser] = useState(false);
  const [badgeError, setBadgeError] = useState(false);
  const [projectId, setProjectId] = useState("");

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

  useEffect(() => {
    if (location.state && location.state.listInput) {
      console.log(location.state.listInput);
      setUserList(location.state.listInput);
      setImageData(location.state.imageData);
      console.log(location.state.imageData);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsFetchingUser(true);
      if (userList.length > 0) {
        await fetchUser();
      }
      setIsFetchingUser(false);
    };

    fetchUserData();
    const eventId = localStorage.getItem("verificationEvent");
    if (!eventId) {
      showAlert("Event id is not configured", "error");
      return;
    }
    setProjectId(eventId);
  }, [userList, currentIndex]);

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
        }/project-attendee-badge/${projectId}/generate-attendee-badge/${attendeeId}/staffId`,
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
        showAlert(`The badge has been generated successfully`, "success");
        return res;
      }
    } catch (error) {
      console.log("Fetch error:", error);
      alert(error?.message || "Some error occured. Please try again");
      return null;
    }
  };

  const handleYesClick = async () => {
    if (currentUser.id) {
      if (currentUser.status === "used") {
        showAlert(
          "Badge has already been printed. Please contact admin",
          "error"
        );
        return;
      }
      if (!IsInIframe()) {
        const badge = await generateAttendeeBadge(currentUser.id);
        // addToPrintQueue(
        //   "zd421_1",
        //   currentUser.user_id,
        //   currentUser.event_id,
        //   currentUser.first_name,
        //   currentUser.company,
        //   currentUser.designation,
        //   currentUser.interest
        // );
        navigate("/validate", {
          state: { name: currentUser.first_name, imageData },
        });
      } else {
        console.log("Sending iframe data");
        window.top.postMessage({ type: "userData", data: currentUser }, "*");
      }
    } else {
      console.log("Can't get the user here");
    }
  };

  const handleNoClick = () => {
    if (currentIndex < userList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate("/verify", {
        state: { faceResponse: "no matching entries", imageData },
      });
    }
  };

  const handleBackClick = () => {
    navigate("/verify", {
      state: { faceResponse: "no such user exists", imageData },
    });
  };

  const getUserPass = async (passId) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/project-attendee-pass/${projectId}/get-attendee-pass/${passId}`,
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
        // setCurrentUser(res.data);
        return res;
      } else {
        return { success: false, message: "Unable to find User" };
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUser = async () => {
    try {
      const userMatches = userList[currentIndex];
      if (userMatches && userMatches.User) {
        const userId = userMatches.User.UserId;
        let result = await getUserPass(userId);
        if (result.success) {
          console.log("got the user:", result.data.id);
          if (result.data.status === "used") {
            showAlert(
              "Badge has already been printed. Please contact admin",
              "error"
            );
            setBadgeError(true);
            return;
          }
          setCurrentUser(result.data);
        } else {
          console.error("Error getting user data:", result.message);
        }
      } else {
        console.error("Invalid user data:", userMatches);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen text-text p-12 w-full">
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

      <div className="flex flex-col justify-center items-center w-fit h-fit drop-shadow-3xl p-[2px] bg-gradient-to-r from-border-gradient-left to-border-gradient-right rounded-[1.2rem] gap-[3px] overflow-hidden">
        <div className="flex flex-col justify-start items-center w-[20rem] xs:w-[30rem] sm:w-[35rem] md:w-[45rem] min-h-[28rem] max-h-[45rem] h-fit overflow-y-auto py-5 bg-verify-bg rounded-[1.1rem]">
          {userList.length > 0 && currentIndex < userList.length ? (
            <div className="flex flex-col justify-center items-center w-full py-5 px-8">
              <div className="flex justify-center items-center w-[7rem] h-[7rem] bg-black/10 rounded-full">
                <img
                  src={verifyuser}
                  alt="validate"
                  className="w-[4rem] h-[4rem]"
                />
              </div>

              <p className="font-extrabold font-sora bg-clip-text text-transparent bg-[linear-gradient(to_left,theme(colors.gradient-left),theme(colors.gradient-right))] bg-[length:200%_auto] animate-gradient text-[2.5rem] sm:text-[3.5rem]">
                {isFetchingUser
                  ? `Validating...`
                  : `${
                      currentUser.first_name
                        ? `Are you ${currentUser.first_name}?`
                        : `No Such User Exists`
                    }`}
              </p>
              <div className="flex justify-center items-center w-full gap-8 mt-12">
                {!isFetchingUser && (
                  <>
                    {currentUser.first_name ? (
                      <>
                        <button
                          onClick={handleNoClick}
                          className="text-white bg-gray-900 rounded-lg w-[8rem] h-[3rem] sm:h-[4rem] sm:w-[10rem]  font-medium text-[1.5rem] sm:text-[2rem] font-roboto hover:bg-black transition ease-in-out duration-150"
                        >
                          No
                        </button>
                        <button
                          onClick={handleYesClick}
                          className="text-white bg-blue-800 rounded-lg w-[8rem] h-[3rem] sm:h-[4rem] sm:w-[10rem]  font-medium text-[1.5rem] sm:text-[2rem] font-roboto hover:bg-blue-700 transition ease-in-out duration-150"
                        >
                          Yes
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleBackClick}
                          className="text-white bg-gray-900 rounded-lg w-[8rem] h-[3rem] sm:h-[4rem] sm:w-[10rem]  font-medium text-[1.5rem] sm:text-[2rem] font-roboto hover:bg-black transition ease-in-out duration-150"
                        >
                          Go Back
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-between h-full">
              <p className="text-xl">No users to validate.</p>
              <button
                onClick={handleBackClick}
                className="text-white bg-gray-900 rounded-lg w-[5rem] h-[3rem] sm:h-[4rem] sm:w-[10rem]  font-medium text-[1.5rem] sm:text-[2rem] font-roboto hover:bg-black transition ease-in-out duration-150"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
        {modalData && <Modal title={modalData.title} body={modalData.body} />}
      </div>
    </div>
  );
};

export default Verify;
