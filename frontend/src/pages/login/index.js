import Footer from "../../components/login/footer";
import LoginForm from "../../components/login/loginForm";
import RegisterForm from "../../components/login/registerForm";
import { useState } from "react";
import "./style.css";

export default function Login() {
  const [visible, setVisible] = useState(false);
  return (
    <div className="login">
      <div className="login_wrapper">
        <LoginForm setVisible={setVisible} />
        {visible && <RegisterForm setVisible={setVisible} />}
        <Footer />
      </div>
    </div>
  );
}
