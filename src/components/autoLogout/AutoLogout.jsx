import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

const AUTO_LOGOUT_TIME = 10 * 1000; // 2 hours

const AutoLogout = ({ expiryTime, onLogout }) => {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const isTabActive = useRef(true);
  const inactivityTimer = useRef(null);
  const hasLoggedOut = useRef(false);
  const tokenCheckInterval = useRef(null);

  console.log(
    "🔄 AutoLogout component mounted",
    expiryTime ? "with expiryTime" : "without expiryTime"
  );

  const handleLogout = () => {
    if (hasLoggedOut.current) {
      console.log("⚠️ Logout already triggered, skipping...");
      return;
    }

    console.log("🔒 Triggering logout due to inactivity or token expiry");

    hasLoggedOut.current = true;
    clearTimeout(inactivityTimer.current);
    clearInterval(tokenCheckInterval.current);

    toast.info("You have been logged out due to inactivity");

    if (onLogout) {
      console.log("✅ Calling onLogout callback");
      onLogout();
    }
  };

  const resetTimers = () => {
    // Only reset timers if we have an expiryTime
    if (!expiryTime) {
      console.log("⏭️ Not resetting timers: expiryTime not available");
      return;
    }

    console.log("🔁 Resetting inactivity timer");
    setLastActivity(Date.now());
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      console.log("🕒 Inactivity timeout reached");
      handleLogout();
    }, AUTO_LOGOUT_TIME);
  };

  // User activity listener
  useEffect(() => {
    // Only set up activity tracking if we have an expiryTime
    if (!expiryTime) {
      console.log(
        "⏭️ Not setting up activity tracking: expiryTime not available"
      );
      return;
    }

    const handleActivity = () => {
      if (!isTabActive.current) {
        console.log("🛑 Activity ignored because tab is inactive");
        return;
      }
      console.log("📌 User activity detected, resetting timer");
      resetTimers();
    };

    const events = ["keypress", "scroll", "touchstart", "click", "keydown",];

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    console.log("✅ User activity listeners registered");
    resetTimers();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearTimeout(inactivityTimer.current);
      console.log("🧹 Cleaned up activity listeners and timers");
    };
  }, [expiryTime]);

  // Tab visibility change
  useEffect(() => {
    // Only set up visibility tracking if we have an expiryTime
    if (!expiryTime) {
      console.log(
        "⏭️ Not setting up visibility tracking: expiryTime not available"
      );
      return;
    }

    const handleVisibilityChange = () => {
      const isNowActive = !document.hidden;
      isTabActive.current = isNowActive;

      console.log(
        `🪟 Tab visibility changed: ${isNowActive ? "active" : "inactive"}`
      );

      if (isNowActive) {
        const inactiveDuration = Date.now() - lastActivity;
        console.log(`⏱️ Inactive for ${inactiveDuration / 1000} seconds`);

        if (inactiveDuration >= AUTO_LOGOUT_TIME) {
          console.log(
            "🚨 Logged out due to being inactive while tab was hidden"
          );
          handleLogout();
        } else {
          resetTimers();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    console.log("👁️ Tab visibility listener added");

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      console.log("🧹 Tab visibility listener removed");
    };
  }, [expiryTime, lastActivity]);

  // Token expiry check
  useEffect(() => {
    if (!expiryTime) {
      console.log(
        "⏭️ Not setting up token expiry check: expiryTime not available"
      );
      return;
    }

    console.log(
      "🧾 Token expiration monitor initialized with expiry:",
      expiryTime
    );

    const checkTokenExpiration = () => {
      const currentTime = Date.now();

      // Handle the date string format "2025-05-20 18:39:45"
      let expiryTimestamp;
      if (typeof expiryTime === "string") {
        // Check if it's in the format "YYYY-MM-DD HH:MM:SS"
        if (expiryTime.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
          expiryTimestamp = new Date(expiryTime.replace(" ", "T")).getTime();
          console.log(
            `🕒 Parsed date string "${expiryTime}" to timestamp ${expiryTimestamp}`
          );
        } else {
          // Try to parse as a numeric string
          expiryTimestamp = parseInt(expiryTime, 10);
        }
      } else {
        expiryTimestamp = expiryTime;
      }

      if (isNaN(expiryTimestamp)) {
        console.error("⚠️ Invalid expiryTime format:", expiryTime);
        return;
      }

      const minutesLeft = (expiryTimestamp - currentTime) / 1000 / 60;
      console.log(`⏳ Token check: ${minutesLeft.toFixed(2)} minutes left`);

      if (currentTime >= expiryTimestamp) {
        console.log("🚫 Token expired, triggering logout");
        handleLogout();
      }
    };

    checkTokenExpiration(); // Initial check on mount
    tokenCheckInterval.current = setInterval(checkTokenExpiration, 60000);

    return () => {
      clearInterval(tokenCheckInterval.current);
      console.log("🧹 Cleared token expiration interval");
    };
  }, [expiryTime]);

  // Clean up everything when component unmounts or expiryTime changes
  useEffect(() => {
    // Reset logout state when expiryTime changes
    hasLoggedOut.current = false;

    return () => {
      clearTimeout(inactivityTimer.current);
      clearInterval(tokenCheckInterval.current);
      console.log("🧹 Component unmounting, cleaned up all resources");
    };
  }, [expiryTime]);

  return null;
};

export default AutoLogout;
