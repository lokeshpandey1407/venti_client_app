import React, { useEffect, useState } from 'react'
import Modal from '../Modal';
import idcard from "./../../../assets/idcard.svg"
import { useLocation, useNavigate } from 'react-router-dom';
const Validate = () => {
  const [modalData, setModalData] = useState();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNextScreen, setNextScreen] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15); 
  const [name, setName] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (location.state && location.state.name) {
      console.log(location.state.name);
      setName(location.state.name);
    }

  }, [location.state]);

  const toggleFullscreen = () => {
    var doc = window.document;
    var docEl = doc.documentElement;

    if (!isFullscreen) docEl.requestFullscreen();
    else doc.exitFullscreen();

    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setNextScreen(false);
    }, 3000);

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          navigate("/verify");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [navigate]);

  return (
    <div className='flex flex-col justify-start xs:justify-center items-center h-screen w-full text-text px-2 overflow-y-auto pt-24 md:pt-0 bg-gradient-to-b from-primary to-primary-grad pb-[8rem] xs:pb-0'>
      <button
        style={{ position: "absolute", top: "1rem", right: "1rem" }}
        onClick={toggleFullscreen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
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
      {/* <button className='text-white border-2 border-white px-[2rem] oy-[1rem]' onClick={takePhoto}>
        take photo
      </button>
      {photos.map((item, index) => (
        <p className="mx-3" key={index}>
          {item}
        </p>
      ))} */}
      {showNextScreen
        ?
        <>
          <div className='relative flex justify-center items-center pt-[3rem] xs:pt-0 h-[5rem] w-[5rem]'>
            <span
              className="absolute inline-flex h-full w-full rounded-full bg-tick-green/20 opacity-75"
              style={{ "animation": "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite" }}
            ></span>
            <span
              className={'relative flex justify-center items-center rounded-full h-[5rem] w-[5rem] '}
            >
              <svg width="65" height="65" viewBox="0 0 65 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32.4512 0.787109C14.9774 0.787109 0.738281 15.0262 0.738281 32.5001C0.738281 49.9739 14.9774 64.213 32.4512 64.213C49.9251 64.213 64.1642 49.9739 64.1642 32.5001C64.1642 15.0262 49.9251 0.787109 32.4512 0.787109ZM47.61 25.2061L29.6288 43.1873C29.1848 43.6313 28.5823 43.885 27.948 43.885C27.3137 43.885 26.7112 43.6313 26.2672 43.1873L17.2924 34.2126C16.3728 33.2929 16.3728 31.7707 17.2924 30.851C18.2121 29.9313 19.7343 29.9313 20.654 30.851L27.948 38.145L44.2485 21.8445C45.1681 20.9248 46.6904 20.9248 47.61 21.8445C48.5297 22.7642 48.5297 24.2547 47.61 25.2061Z" fill="#41D195" />
              </svg>

            </span>
          </div>
          <div className='flex flex-col justify-center items-center pt-8'>
            <p className='font-medium font-roboto text-[1.5rem] text-white'>Verified!</p>
            <p className=' font-roboto text-[1rem] text-text-inactive'>QR Code was successful for check-in.</p>
          </div>
        </>
        :
        <div className='drop-shadow-3.5xl w-full'>
          <div className='flex flex-col justify-center items-center gap-2'>
            <p className='font-bold font-roboto text-[2rem] sm:text-[2.5rem] text-white'>Hello {name}!</p>
            <div className='flex flex-col justify-center items-center gap-8'>
              <p className='font-medium font-roboto text-[1.2rem] sm:text-[1.5rem] text-green-300'>Welcome to Digital Jalebi Event.</p>
              <p className='font-semi-bold font-roboto text-[1.2rem] w-[15rem] xs:w-[20rem] sm:w-full sm:text-[1.5rem] text-text-inactive max-w-[30rem]'> Enjoy and have a great time. Please collect
                your goodies from the desk ahead.</p>
            </div>
          </div>
          <div className='flex flex-col justify-center items-center pt-[2rem] gap-10 mx-8 '>
            <img src={idcard} alt="id_card_asset" style={{ "animation": "bounce 10s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
            <p className='font-semi-bold font-roboto w-[15rem] xs:w-[20rem] sm:w-full text-[1.1rem] text-white max-w-[25rem]'>You have successfully registered. Please collect the printed pass from our volunteer.</p>
          </div>
          <div className='flex justify-between w-full items-center px-[2rem]'>
            <button onClick={() => navigate("/verify")}><p className='font-roboto font-bold text-[0.9rem] text-text-inactive hover:text-text transition duration-150 ease-in-out'>Go back to <b className='underline'>Verify Page</b></p></button>
            <p className='font-sora '>Time left: {timeLeft}s</p>
          </div>
        </div>
      }

      {/* {isVisibleModal && <Modal message={modal} />} */}
      {modalData && <Modal title={modalData.title} body={modalData.body} />}

    </div>
  )
}

export default Validate
