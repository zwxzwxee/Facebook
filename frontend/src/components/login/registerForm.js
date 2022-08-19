import { Formik, Form } from "formik";
import RegisterInput from "../inputs/registerinput";
import { useState } from "react";
import * as Yup from "yup";
import DateOfBirthSelect from "./dateOfBirthSelect";
import GenderSelect from "./genderSelect";
import DotLoader from "react-spinners/DotLoader";
import axios from "axios";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const userInfos = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  bYear: new Date().getFullYear(),
  bMonth: new Date().getMonth() + 1,
  bDay: new Date().getDate(),
  gender: "",
};

export default function RegisterForm({ setVisible }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [user, setUser] = useState(userInfos);
  console.log(user);
  const {
    first_name,
    last_name,
    email,
    password,
    bYear,
    bMonth,
    bDay,
    gender,
  } = user;
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };
  const yearTemp = new Date().getFullYear();
  const years = Array.from(new Array(108), (value, index) => yearTemp - index);
  const months = Array.from(new Array(12), (value, index) => 1 + index);
  const getDays = () => {
    return new Date(bYear, bMonth, 0).getDate();
  };
  const days = Array.from(new Array(getDays()), (value, index) => index + 1);

  const registerValidation = Yup.object({
    first_name: Yup.string()
      .required("What is your first name?")
      .min(2, "First name must be between 2 and 16 characters.")
      .max(16, "First name must be between 2 and 16 characters.")
      .matches(/^[aA-zZ]+$/, "Numbers and special characters are not allowed."),
    last_name: Yup.string()
      .required("What is your last name?")
      .min(2, "Last name must be between 2 and 16 characters.")
      .max(16, "Last name must be between 2 and 16 characters.")
      .matches(/^[aA-zZ]+$/, "Numbers and special characters are not allowed."),
    email: Yup.string()
      .required(
        "You'll need this when you log in and if you ever need to reset your password."
      )
      .email("Enter a valid email address."),
    password: Yup.string()
      .required(
        "Enter a combination of at least six numbers, letters and punctuation marks (such as ! and &)."
      )
      .min(6, "Password must be at least 6 characters")
      .max(36, "Password can't be more than 36 characters"),
  });

  const [dateError, setDateError] = useState("");
  const [genderError, setGenderError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const registerSubmit = async () => {
    try {
      const { data } = await axios.post(
        process.env.REACT_APP_BACKEND_URL + "/register",
        {
          first_name,
          last_name,
          email,
          password,
          bYear,
          bMonth,
          bDay,
          gender,
        }
      );
      setError("");
      setSuccess(data.message);
      // post the object data to the backend url and get the return
      const { message, ...rest } = data; // extract the message and the rest components of response data
      setTimeout(() => {
        dispatch({ type: "LOGIN", payload: rest }); // dispatch the action object to the userReducer
        Cookies.set("user", JSON.stringify(rest)); // set cookies
        navigate("/"); // navigate to the home page
      }, 2000);
    } catch (error) {
      setLoading(false);
      setSuccess("");
      setError(error.response.data.message);
      // the error.data is coming from the backend json object
    }
  };

  return (
    <div className="blur">
      <div className="register">
        <div className="register_header">
          <i className="exit_icon" onClick={() => setVisible(false)}></i>
          <span>Sign Up</span>
          <span> It's quick and easy</span>
        </div>
        <Formik
          enableReinitialize
          initialValues={{
            first_name,
            last_name,
            email,
            password,
            bYear,
            bMonth,
            bDay,
            gender,
          }}
          validationSchema={registerValidation}
          onSubmit={() => {
            // after clicking the submit check the age
            let curDate = new Date();
            let pickedDate = new Date(bYear, bMonth - 1, bDay);
            // define the user age limit
            let atleast14 = new Date(1970 + 14, 0, 1);
            let nomore70 = new Date(1970 + 70, 0, 1);
            if (curDate - pickedDate < atleast14) {
              setDateError(
                "It looks like you've entered the wrong info. Please make sure that you use your real date of birth."
              );
            } else if (curDate - pickedDate > nomore70) {
              setDateError(
                "It looks like you've entered the wrong info. Please make sure that you use your real date of birth."
              );
            } else {
              setDateError("");
            }

            if (gender === "") {
              setGenderError(
                "Please choose a gender, you can change who can see this later."
              );
            } else {
              setGenderError("");
            }

            if (dateError === "" && genderError === "") {
              registerSubmit();
            }
          }}
        >
          {(formik) => (
            <Form className="register_form">
              <div className="regi_line">
                <RegisterInput
                  type="text"
                  name="first_name"
                  placeholder="First Name"
                  onChange={handleRegisterChange}
                />
                <RegisterInput
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
                  onChange={handleRegisterChange}
                />
              </div>
              <div className="regi_line">
                <RegisterInput
                  type="text"
                  name="email"
                  placeholder="Mobile number or email address"
                  onChange={handleRegisterChange}
                />
              </div>
              <div className="regi_line">
                <RegisterInput
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleRegisterChange}
                />
              </div>
              <div className="regi_col">
                <div className="regi_line_header">
                  Date of birth <i className="info_icon"></i>
                </div>
                <DateOfBirthSelect
                  bDay={bDay}
                  bMonth={bMonth}
                  bYear={bYear}
                  years={years}
                  months={months}
                  days={days}
                  dateError={dateError}
                  handleRegisterChange={handleRegisterChange}
                />
              </div>
              <div className="regi_col">
                <div className="regi_line_header">
                  Gender <i className="info_icon"></i>
                </div>
                <GenderSelect
                  genderError={genderError}
                  handleRegisterChange={handleRegisterChange}
                />
              </div>
              <div className="regi_infos">
                By clicking Sign Up, you agree to our{" "}
                <span>Terms, Data Policy &nbsp;</span>
                and <span>Cookie Policy.</span> You may receive SMS
                notifications from us and can opt out at any time.
              </div>
              <div className="regi_btn_wrapper">
                <button className="blue_btn open_signup">Sign Up</button>
              </div>
              <DotLoader color="#1876f2" loading={loading} size={30} />
              {/* if the loading state is false the loader will not show */}
              {error && <div className="error_text">{error}</div>}
              {success && <div className="success_text">{success}</div>}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
