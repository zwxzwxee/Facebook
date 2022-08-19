import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import Login from "../pages/login";

export default function LoggedinRoutes() {
  // if the user exists then access the outlet, otherwise render the login page
  const { user } = useSelector((state) => ({ ...state }));
  return user ? <Outlet /> : <Login />;
}
