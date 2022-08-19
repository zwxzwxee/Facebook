import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function NotLoggedinRoutes() {
  // if the user exists then access the home page, otherwise render the login page
  const { user } = useSelector((state) => ({ ...state }));
  return user ? <Navigate to="/" /> : <Outlet />;
}
