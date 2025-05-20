import { toast, Toaster } from "sonner";

import AppRoutes from "./routes/AppRoutes";
import SessionTimeoutTracker from "./components/sessionTimeout/SessionTimeoutTracker";
import ValidationWrapper from "./lib/encyrption/ValidationWrapper";
import DisableInspect from "./components/disableInspect/DisableInspect";
import AutoLogout from "./components/autoLogout/AutoLogout";
import { useNavigate } from "react-router-dom";

function App() {
  const time = localStorage.getItem("token-expire-time");
const navigate = useNavigate()
  const handleLogout = async () => {
    toast.success("User Logout");
    localStorage.clear();
    navigate('/')
  };
  return (
    <>
      <Toaster richColors position="top-right" />
      <SessionTimeoutTracker expiryTime={time} onLogout={handleLogout} />
      {/* <DisableInspect/> */}
      <ValidationWrapper>
        <AutoLogout expiryTime={time} onLogout={handleLogout} />
        <AppRoutes />
      </ValidationWrapper>
    </>
  );
}

export default App;
