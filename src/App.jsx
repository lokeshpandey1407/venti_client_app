import { useState } from "react";
import "./App.css";
import Validate from "./components/checkin/Verify/Validate";
import { Route, Routes } from "react-router";
import Verify from "./components/checkin/Verify/Verify";
import QRVerify from "./components/checkin/Verify/QR/QRVerify";
import FacialVerify from "./components/checkin/Verify/Face/FacialVerify";
import FacialValidate from "./components/checkin/Verify/Face/FacialValidate";
import Invite from "./components/checkin/Invite/Invite";
import Alert from "./common/Alert";
import SearchUser from "./components/checkin/Invite/SearchUser";

function App() {
  const [alert, setAlert] = useState(null);
  const showAlert = (message, type) => {
    setAlert({
      msg: message,
      type: type,
    });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  return (
    <>
      <Alert alert={alert} setAlert={setAlert} />

      <Routes>
        <Route path="/" element={<Verify />}></Route>
        {/* <Route exact path="/tester" element={<Tester />} /> */}
        {/* <Route path="/ticket" element={<Ticket showAlert={showAlert} />} /> */}
        <Route path="/validate" element={<Validate />} />
        <Route path="/verify" element={<Verify showAlert={showAlert} />} />
        <Route
          path="/face-verification"
          element={<FacialVerify showAlert={showAlert} />}
        />
        <Route
          path="/face-validation"
          element={<FacialValidate showAlert={showAlert} />}
        />
        <Route
          path="/qr-verification"
          element={<QRVerify showAlert={showAlert} />}
        />

        <Route path="/invite-code" element={<Invite showAlert={showAlert} />} />

        <Route
          path="/search-user"
          element={<SearchUser showAlert={showAlert} />}
        />
      </Routes>
    </>
  );
}

export default App;
