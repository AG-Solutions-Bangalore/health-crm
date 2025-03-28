
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/api/use-auth";
import DashboardSkeleton from "../components/skeletonLoader/DashboardSkeleton";



const ProtectedRoute = () => {
  const { data: authData, isLoading } = useAuth();
  const user = authData?.user;
   

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return user ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;