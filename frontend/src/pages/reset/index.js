import "./style.css";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Cookie from "js-cookie";
import { useState } from "react";
import SearchAccount from "./searchAccount";
import SendEmail from "./sendEmail";
import CodeVerification from "./codeVerification";
import Footer from "../../components/login/footer";
import ChangePassword from "./changePassword";

export default function Reset() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(0);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [conf_password, setConf_password] = useState("");
  const [userInfos, setUserInfos] = useState("");

  const logOut = () => {
    // after logout, delete all the info of the user inside the redux store and cookie
    dispatch({
      type: "LOGOUT",
    });
    Cookie.set("user", "");
    navigate("/login");
  };
  const { user } = useSelector((state) => ({ ...state }));
  return (
    <div className="reset">
      <div className="reset_header">
        <img src="../../../icons/facebook.svg" alt="" />
        {user ? (
          <div className="right_reset">
            <Link to="/profile">
              <img src={user.picture} alt="" />
            </Link>
            <button className="blue_btn" onClick={() => logOut()}>
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="right_reset">
            <button className="blue_btn">Login</button>
          </Link>
        )}
      </div>
      <div className="reset_wrap">
        {visible === 0 && (
          <SearchAccount
            email={email}
            setEmail={setEmail}
            error={error}
            setLoading={setLoading}
            setError={setError}
            setUserInfos={setUserInfos}
            setVisible={setVisible}
          />
        )}
        {visible === 1 && userInfos && (
          <SendEmail
            error={error}
            setLoading={setLoading}
            setError={setError}
            setVisible={setVisible}
            userInfos={userInfos}
          />
        )}
        {visible === 2 && (
          <CodeVerification
            code={code}
            setCode={setCode}
            error={error}
            setError={setError}
            setLoading={setLoading}
            setVisible={setVisible}
            userInfos={userInfos}
          />
        )}
        {visible === 3 && (
          <ChangePassword
            password={password}
            setPassword={setPassword}
            conf_password={conf_password}
            setConf_password={setConf_password}
            error={error}
            setError={setError}
            setLoading={setLoading}
            userInfos={userInfos}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}
