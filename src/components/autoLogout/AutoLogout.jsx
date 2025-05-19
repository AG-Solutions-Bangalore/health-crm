import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Base_Url } from "@/config/BaseUrl";

const AUTO_LOGOUT_TIME = 2 * 60 * 60 * 1000; 

const AutoLogout = () => {
  const navigate = useNavigate();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [tabActive, setTabActive] = useState(true);
  const [tabInactiveTime, setTabInactiveTime] = useState(null);

  console.log("AutoLogout component initialized");

  const handleLogout = async () => {
    console.log("Logout process initiated");
    const token = localStorage.getItem("token");
    
    try {
      console.log("Making logout API request");
      const res = await axios.post(
        `${Base_Url}/api/panel-logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("Logout API response:", res.data);
      
      if (res.data.code === 200) {
        toast.success(res.data.msg);
        localStorage.clear();
        console.log("Logout successful, redirecting to home");
        navigate("/");
      } else {
        toast.error(res.data.msg);
        console.log("Logout failed with error message:", res.data.msg);
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
     
      localStorage.clear();
      navigate("/");
    }
  };

  
  useEffect(() => {
    const tokenExpireTime = localStorage.getItem("token-expire-time");
    
    console.log("Token expiration checker initialized");
    console.log("Current token-expire-time:", tokenExpireTime);
    
    if (!tokenExpireTime) {
      console.log("No token expiration time found");
      return;
    }
    
    const checkTokenExpiration = () => {
      const currentTime = Date.now();
      const expirationTime = parseInt(tokenExpireTime, 10);
      
      console.log("Checking token expiration:", {
        currentTime,
        expirationTime,
        timeLeft: (expirationTime - currentTime) / 1000 / 60, 
      });
      
   
      if (currentTime >= expirationTime) {
        console.log("Token expired, logging out");
        handleLogout();
      }
    };
    
  
    checkTokenExpiration();
    
   
    const tokenExpirationInterval = setInterval(checkTokenExpiration, 60000); 
    console.log("Token expiration check interval set up");
    
    return () => {
      console.log("Cleaning up token expiration checker");
      clearInterval(tokenExpirationInterval);
    };
  }, []);


  useEffect(() => {
    console.log("Tab visibility tracker initialized");
    
    const handleVisibilityChange = () => {
      const isHidden = document.hidden;
      const currentTime = Date.now();
      
      console.log("Tab visibility changed:", { 
        isHidden, 
        currentTime: new Date(currentTime).toLocaleTimeString() 
      });
      
      if (isHidden) {
      
        setTabActive(false);
        setTabInactiveTime(currentTime);
        console.log("Tab became inactive at:", new Date(currentTime).toLocaleTimeString());
      } else {
       
        setTabActive(true);
        
        if (tabInactiveTime) {
          const inactiveTime = currentTime - tabInactiveTime;
          console.log("Tab became active again. Inactive for:", inactiveTime / 1000, "seconds");
          
          
          if (inactiveTime >= AUTO_LOGOUT_TIME) {
            console.log("Tab inactive threshold reached, logging out");
            toast.info("You have been logged out due to inactivity");
            handleLogout();
            return;
          }
          
          
          setLastActivity(currentTime);
        }
        
        setTabInactiveTime(null);
      }
    };
    
   
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
   
    if (document.hidden) {
      setTabActive(false);
      setTabInactiveTime(Date.now());
      console.log("Tab is already inactive on component mount");
    }
    
    return () => {
      console.log("Cleaning up visibility change tracker");
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [tabInactiveTime]);

 
  useEffect(() => {
    console.log("Activity tracker initialized");
    
    const updateActivity = () => {
      if (!tabActive) return; 
      
      const newActivityTime = Date.now();
      console.log("User activity detected, updating timestamp", {
        previousActivity: new Date(lastActivity).toLocaleTimeString(),
        newActivity: new Date(newActivityTime).toLocaleTimeString(),
        idleTime: (newActivityTime - lastActivity) / 1000, // seconds
      });
      setLastActivity(newActivityTime);
    };


    const events = [
     
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "keydown"
    ];

   
    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });
    console.log("Activity event listeners attached");

   
    const inactivityCheckInterval = setInterval(() => {
      if (!tabActive) return; 
      
      const currentTime = Date.now();
      const inactiveTime = currentTime - lastActivity;
      
      console.log("Checking inactivity status:", {
        lastActivity: new Date(lastActivity).toLocaleTimeString(),
        currentTime: new Date(currentTime).toLocaleTimeString(),
        inactiveTimeMinutes: inactiveTime / 1000 / 60, 
        logoutThresholdMinutes: AUTO_LOGOUT_TIME / 1000 / 60, 
      });
      
      if (inactiveTime >= AUTO_LOGOUT_TIME) {
        console.log("Inactivity threshold reached, logging out");
        toast.info("You have been logged out due to inactivity");
        handleLogout();
      }
    }, 60000);


    return () => {
      console.log("Cleaning up activity tracker");
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(inactivityCheckInterval);
    };
  }, [lastActivity, tabActive]);

 
  useEffect(() => {
    console.log("Tab switching tracker initialized");
    

    const tabSwitchCheckInterval = setInterval(() => {
      const storedTabSwitchTime = localStorage.getItem('tab-switch-time');
      
      if (storedTabSwitchTime) {
        const switchTime = parseInt(storedTabSwitchTime, 10);
        const currentTime = Date.now();
        const timeSinceSwitch = currentTime - switchTime;
        
        console.log("Checking tab switch time:", {
          switchTime: new Date(switchTime).toLocaleTimeString(),
          currentTime: new Date(currentTime).toLocaleTimeString(),
          minutesSinceSwitch: timeSinceSwitch / 1000 / 60,
        });
        
   
        if (timeSinceSwitch >= AUTO_LOGOUT_TIME) {
          console.log("Tab switch timeout reached, logging out");
          toast.info("You have been logged out due to extended time on another tab");
          handleLogout();
        }
      }
    }, 60000); 
    
 
    const updateTabSwitchTime = () => {
      if (document.hidden) {

        localStorage.setItem('tab-switch-time', Date.now().toString());
        console.log("Updated tab-switch-time in localStorage:", new Date().toLocaleTimeString());
      }
    };
    
   
    document.addEventListener("visibilitychange", updateTabSwitchTime);
    
    return () => {
      console.log("Cleaning up tab switch tracker");
      clearInterval(tabSwitchCheckInterval);
      document.removeEventListener("visibilitychange", updateTabSwitchTime);
    };
  }, []);

 
  return null;
};

export default AutoLogout;