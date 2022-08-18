import React, { useContext, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Navigate, useNavigate } from "react-router-dom";
import { fetchToken, setToken } from "../../components/auth/RequireAuth";
import axios from "axios";
import logo from "../../images/logo.png";
import loginCSS from "./Login.module.css";
import FormInput from "./Form";
import AuthContext from "../../contexts/AuthContext";
import Cookies from "js-cookie";

const Login = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  useEffect(()=>{
    axios.get(`${process.env.REACT_APP_API_ENDPOINT}/user/root`)
  .then((res)=>{
    console.log(res.data.message,"True")
  })
  }, [])
     
  const inputs = [
    {
      id: 1,
      name: "email",
      type: "email",
      placeholder: "Email address",
      onChange: (e) => setEmail(e.target.value),
      errorMessage: "Enter your email",
      required: true,
    },
    {
      id: 2,
      name: "password",
      type: "password",
      placeholder: "Password",
      onChange: (e) => setPassword(e.target.value),
      errorMessage: "Enter your password",
      required: true,
    },
  ];

  if (auth.user) {
    return <Navigate to="/" replace />;
  }

  const Login = (e) => {
    e.preventDefault();

    if ((email === "") && (password === "")) {
      return;
    } else {
      axios
        .post(`${process.env.REACT_APP_API_ENDPOINT}/login/user`, {
          email: email,
          password: password,
        })

        .then(function (response) {
          if (response.data.message !== "Wrong Password") {
            if(response.data.message !== "User doesnt Exists"){
            const userid = response.data.userid
            const lastname = response.data.lastname;
            const firstname = response.data.firstname;
            const role = response.data.role;
            Cookies.set("userid",userid);
            Cookies.set("token", response.data.token);
            Cookies.set("email", email);
            Cookies.set("password", password);
            Cookies.set("role", role);
            Cookies.set("firstname", firstname);
            Cookies.set("lastname", lastname);
          } else {
            throw Error("User Doesn't Exists!");}
          }
          else {
            throw Error("Incorrect Password!");
          }
          if (response.data.message !== "Login Failed") {
            Cookies.set("token", response.data.token);
            Cookies.set("email", email);
            Cookies.set("password", password);
          } else {
            throw Error("User doesn't exists!");
          }

          if (response.data.token) {
            setToken(response.data.token);
            navigate("/homepage");
          }
        })
        .catch(function (err) {
          setError("Incorrect Credentials")
          
        });
    }
  };

  return (
    <>
      <div className={loginCSS.mainContainer}>
        <div className={loginCSS.logoContainer}>
          <div className={loginCSS.logoContent}>
            <img src={logo} alt="img" width="60rem" height="60rem"></img>
          </div>
          <header>
            <h1>INNOVUZE LUNCH BUDDIES</h1>
          </header>
        </div>
        <div className={loginCSS.mainContent}>
          <div className={loginCSS.content}>
            <div className={loginCSS.loginContent}>
              <div className={loginCSS.loginHeader}>
                <h2>
                  <span>Sign In</span>
                </h2>
              </div>

              {fetchToken() ? (
                <div>
                  <p>You are Logged In</p>
                  <br />
                  <a href="/homepage">GO BACK HOMEPAGE</a>
                </div>
              ) : (
                <div className={loginCSS.formContainer}>
                  <form>
                    {inputs.map((input) => (
                      <FormInput key={input.id} {...input} />
                    ))}
                    <br />
                    <div className="d-grid gap-2">
                      <Button
                        type="submit"
                        variant="dark"
                        size="md"
                        onClick={Login}
                      >
                        Confirm
                      </Button>
                    </div>
                  </form>
                  {error && (
                    <span className={loginCSS.errorMessage}>{error}</span>
                  )}
                </div>
              )}
              <hr />
              <p>
                Need Help? <a href="/registration">Contact Admin</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
