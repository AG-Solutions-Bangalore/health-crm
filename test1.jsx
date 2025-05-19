import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { useMousePosition } from "@/hooks/useMousePosition";

const SessionTimeoutTracker = ({ expiryTime, onLogout }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [isExpiring, setIsExpiring] = useState(false);
  const hasLoggedOut = useRef(false);

  // mousePosition hook
  const mousePosition = useMousePosition();
  const lastMousePosition = useRef({ x: 0, y: 0 });
  
  const lastActivityTime = useRef(Date.now());
  const isTabActive = useRef(true);
  const inactivityTimer = useRef(null);
  const isInitialized = useRef(false);

  const isTokenPresent = () => {
    return !!localStorage.getItem("token");
  };

  const resetInactivityTimer = (isFromTabChange = false) => {
    console.log("Activity detected, resetting inactivity timer");
    lastActivityTime.current = Date.now();
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    
   
    const timeoutDuration = isFromTabChange ? 70 * 1000 : 7 * 1000;
    inactivityTimer.current = setTimeout(checkInactivity, timeoutDuration);
  };

  const checkInactivity = () => {
    console.log("Checking inactivity status");
    if (!hasLoggedOut.current && isTokenPresent()) {
      const now = Date.now();
      const timeElapsed = now - lastActivityTime.current;
      console.log(`Time since last activity: ${timeElapsed / 1000} seconds`);
      
      if (timeElapsed >= 7 * 1000) {
        console.log("Inactive for too long, logging out");
        performLogout();
      } else {
        resetInactivityTimer();
      }
    }
  };

  // mouse position handling from the hooks -- only when tab is active
  useEffect(() => {
    if (!isInitialized.current || !isTokenPresent() || !isTabActive.current) return;
    
    const hasMoved = (
      lastMousePosition.current.x !== mousePosition.x ||
      lastMousePosition.current.y !== mousePosition.y
    );
    
    if (hasMoved) {
      console.log("Mouse moved:", { 
        previous: lastMousePosition.current, 
        current: mousePosition 
      });
      lastMousePosition.current = { x: mousePosition.x, y: mousePosition.y };
      resetInactivityTimer(false); 
    }
  }, [mousePosition.x, mousePosition.y]);

 
  const handleVisibilityChange = () => {
    const isNowActive = !document.hidden;
    console.log("Tab visibility changed:", { isNowActive });
    
    if (isNowActive) {
     
      const timeSinceLastActivity = Date.now() - lastActivityTime.current;
      console.log("Time since last activity (ms):", timeSinceLastActivity);
      
      if (timeSinceLastActivity >= 70 * 1000) { 
        console.log("Inactive while tab was hidden, logging out");
        performLogout();
      } else {
        console.log("Tab became active, resetting timer with longer duration");
        resetInactivityTimer(true);
      }
    } else {
      
      console.log("Tab became inactive, pausing mouse tracking");
    }
    
    isTabActive.current = isNowActive;
  };

  const checkExpiry = () => {
    if (hasLoggedOut.current || !isTokenPresent()) {
      setShowBanner(false);
      return;
    }

    const now = new Date();
    const expiry = new Date(expiryTime);
    const timeUntilExpiry = expiry - now;
    const fiveMinutes = 5 * 60 * 1000;

    if (timeUntilExpiry <= fiveMinutes && timeUntilExpiry > 0) {
      if (!isExpiring) {
        console.log("Session expiring soon, showing banner");
        setIsExpiring(true);
        setShowBanner(true);
        setCountdown(Math.floor(timeUntilExpiry / 1000));
      }
    } else if (timeUntilExpiry <= 0) {
      console.log("Session expired, logging out");
      performLogout();
    }
  };

  const performLogout = () => {
    if (!hasLoggedOut.current && isTokenPresent()) {
      console.log("Performing logout");
      hasLoggedOut.current = true;
    
      clearTimeout(inactivityTimer.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      onLogout();
      console.log("Logout completed");
    }
  };

  useEffect(() => {
    const initializeSessionTracking = () => {
      if (!isTokenPresent()) {
        console.log("No token present, not initializing session tracking");
        return false;
      }

      console.log("Initializing session timeout tracker");
      console.log("Session expiry time:", new Date(expiryTime).toLocaleString());
      
      hasLoggedOut.current = false;
      
      lastActivityTime.current = Date.now();
      resetInactivityTimer(false);
      
      return true;
    };

    isInitialized.current = initializeSessionTracking();
    
    if (!isInitialized.current) {
      const checkForToken = setInterval(() => {
        if (isTokenPresent() && !isInitialized.current) {
          console.log("Token detected after initialization, reinitializing tracker");
          isInitialized.current = initializeSessionTracking();
          clearInterval(checkForToken);
        }
      }, 1000);
      
      return () => clearInterval(checkForToken);
    }
    
    if (isInitialized.current) {
      window.addEventListener("keydown", () => {
        if (isTabActive.current) {
          resetInactivityTimer(false);
        }
      });
      window.addEventListener("scroll", () => {
        if (isTabActive.current) {
          resetInactivityTimer(false);
        }
      });
      document.addEventListener("visibilitychange", handleVisibilityChange);

      checkExpiry();

      let intervalIds = [];
      const countdownTimer = () => {
        if (isExpiring && !hasLoggedOut.current && isTokenPresent()) {
          setCountdown((prev) => {
            if (prev <= 1) {
              console.log("Countdown reached zero, logging out");
              performLogout();
              return 0;
            }
            return prev - 1;
          });
        }
      };

      const checkInterval = setInterval(checkExpiry, 1000);
      const countdownInterval = setInterval(countdownTimer, 1000);
      intervalIds.push(checkInterval, countdownInterval);

      const handleStorageChange = (e) => {
        if (e.key === "token") {
          if (!e.newValue) {
            console.log("Token removed from storage, cleaning up");
            setShowBanner(false);
            hasLoggedOut.current = true;
            isInitialized.current = false;
            intervalIds.forEach((id) => clearInterval(id));

            clearTimeout(inactivityTimer.current);
            window.removeEventListener("keydown", resetInactivityTimer);
            window.removeEventListener("scroll", resetInactivityTimer);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
          } else {
            if (!isInitialized.current) {
              console.log("Token added to storage, initializing tracking");
              isInitialized.current = initializeSessionTracking();
            }
          }
        }
      };

      window.addEventListener("storage", handleStorageChange);

      console.log("Session timeout tracker initialized");

      return () => {
        console.log("Cleaning up session timeout tracker");
        intervalIds.forEach((id) => clearInterval(id));
        clearTimeout(inactivityTimer.current);
        window.removeEventListener("keydown", resetInactivityTimer);
        window.removeEventListener("scroll", resetInactivityTimer);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("storage", handleStorageChange);
        isInitialized.current = false;
      };
    }
  }, [expiryTime, onLogout]);

  useEffect(() => {
    if (isInitialized.current && expiryTime) {
      checkExpiry();
    }
  }, [expiryTime]);

  useEffect(() => {
    const tokenObserver = setInterval(() => {
      const hasToken = isTokenPresent();
      
      if (!hasToken && isInitialized.current) {
        console.log("Token removed, deactivating session tracker");
        isInitialized.current = false;
        setShowBanner(false);
      }
      
      if (hasToken && !isInitialized.current && !hasLoggedOut.current) {
        console.log("Token added, activating session tracker");
        hasLoggedOut.current = false;
      }
    }, 1000);
    
    return () => clearInterval(tokenObserver);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (!showBanner || hasLoggedOut.current || !isTokenPresent() || !isInitialized.current) return null;

  return (
    <div className="space-y-20">
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md animate-slide-down">
        <div className="mx-4">
          <div className="bg-white rounded-lg shadow-xl border border-gray-300">
            <div
              className="h-1 bg-blue-500 rounded-tl-lg"
              style={{
                width: `${(countdown / 300) * 100}%`,
                transition: "width 1s linear",
              }}
            />
            <div className="p-2">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 rounded-full p-2">
                  <AlertTriangle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-gray-800 text-sm">
                    Session timeout in{" "}
                    <span className="text-blue-600 font-bold font-mono">
                      {formatTime(countdown)}
                    </span>
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    Save your work to prevent data loss
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutTracker;