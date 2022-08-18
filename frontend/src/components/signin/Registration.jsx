import React from "react";
import { Button } from "react-bootstrap";
import { useState } from "react";
import axios from "axios";
import FormInput from "./Form";
import logo from "../../images/logo.png";
import registrationCSS from "./Registration.module.css";

const Registration = () => {
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [status, setStatus] = useState(null);

  const url = `${process.env.REACT_APP_API_ENDPOINT}/email/sendtoadmin`;

  const inputs = [
    {
      id: 1,
      name: "firstname",
      type: "firstname",
      onChange: (e) => setFirstname(e.target.value),
      placeholder: "Enter your First Name ",
      errorMessage: "Please fill the fields",
      required: true,
    },
    {
      id: 2,
      name: "lastname",
      type: "lastname",
      onChange: (e) => setLastname(e.target.value),
      placeholder: "Enter your Last Name ",
      errorMessage: "Please fill the fields",
      required: true,
    },
    {
      id: 3,
      name: "email",
      type: "email",
      onChange: (e) => setEmail(e.target.value),
      placeholder: "Enter your Email Address ",
      errorMessage: "It should be valid email address!",
      required: true,
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(url, {
        firstname: firstname,
        lastname: lastname,
        email: email,
      })
      .then((res) => {
        if(res.data.message === "email has been sent"){
        setStatus("Email has been sent");
        };
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  return (
    <>
      <div className={registrationCSS.mainContainer}>
        <div className={registrationCSS.logoContainer}>
          <div className={registrationCSS.logoContent}>
            <img src={logo} alt="img" width="60rem" height="60rem"></img>
          </div>
          <header>
            <h1>INNOVUZE LUNCH BUDDIES</h1>
          </header>
        </div>
        <div className={registrationCSS.mainContent}>
          <div className={registrationCSS.content}>
            <div className={registrationCSS.regContent}>
              <div className={registrationCSS.regHeader}>
                <h2>
                  <span>Contact Admin</span>
                </h2>
              </div>
              <div className={registrationCSS.formContainer}>
                <form onSubmit={handleSubmit}>
                  {inputs.map((input) => (
                    <FormInput key={input.id} {...input} />
                  ))}
                  <br />
                  <div className="d-grid gap-2">
                    <Button type="submit" variant="dark" size="md">
                      Confirm
                    </Button>
                  </div>
                </form>
                {status && (
                  <span className={registrationCSS.errorMessage}>{status}</span>
                )}
              </div>
              <hr />
              <p>
              Already have an account? <a href="/">Click Here</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Registration;
