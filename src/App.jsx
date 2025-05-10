
import { toast, Toaster } from "sonner";

import AppRoutes from "./routes/AppRoutes";
import { Base_Url } from "./config/BaseUrl";
import { useNavigate } from "react-router-dom";
import SessionTimeoutTracker from "./components/sessionTimeout/SessionTimeoutTracker";
import axios from "axios";
import ValidationWrapper from "./lib/encyrption/ValidationWrapper";
import DisableInspect from "./components/disableInspect/DisableInspect";



function App() {
  const navigate = useNavigate();
    const time = localStorage.getItem("token-expire-time");
    const token = localStorage.getItem("token")
    const handleLogout = async () => {
      try {
        const res = await axios.post(`${Base_Url}/api/panel-logout`,{}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.data.code === 200) {
          toast.success(res.data.msg);
          localStorage.clear();
          navigate("/");
        } else {
          toast.error(res.data.msg);
        }
      } catch (error) {
        console.error("Logout failed:", error);
      }
    };
  return (
    <>
       <Toaster richColors position="top-right" />
         <SessionTimeoutTracker expiryTime={time} onLogout={handleLogout} />
         {/* <DisableInspect/> */}
         <ValidationWrapper>
       <AppRoutes />
       </ValidationWrapper>
    </>
  );
}

export default App;
