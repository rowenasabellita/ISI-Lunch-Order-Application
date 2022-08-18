import axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";
import { Table } from "react-bootstrap";

import Adduser from "./Adduser";
import userCSS from "./Usermanagement.module.css";

const Usermanagement = () => {
  const url = `${process.env.REACT_APP_API_ENDPOINT}/user/`;
  const emailurl = `${process.env.REACT_APP_API_ENDPOINT}/email/sendtouser`;
  const [status, setStatus] = useState(null);
  const [addStatus, setAddStatus] = useState(null);
  function timeout(delay) {
    return new Promise( res =>
      setTimeout(res, delay));
}

  const handleAdd = async (e) => {
    e.preventDefault();

    return rowsData.map((data, index) => {
      const { firstname, lastname, emailaddress, password, usertype} = data;
      if(password !== ""){
      axios.post(url, {
          id: null,
          first_name: firstname,
          last_name: lastname,
          email: emailaddress,
          hashed_password: password,
          role: usertype,
        })
        .then(async function (res) {
          setAddStatus(res.data.message);
          if(res.data.message !=="Email Already Taken"){
          axios.post(emailurl, {
              firstname: firstname,
              lastname: lastname,
              email: emailaddress,
              password: password,
            })
            .then((res) => {
              refreshuser();
              alert(`${res.data.message} ${emailaddress}`);
            })
            await timeout(2000);
            setAddStatus("")
            window.location.reload(false)
          };
        })
        .catch(function (error) {
          if (error.message === "Request failed with status code 422") {
            setAddStatus("Wrong email format");
          }
          else{
            setAddStatus("Please fill out all fields")
          }
        
        });
      }
      else{
        setAddStatus("Please fill out all fields")
      }
    });
  };


  const [rowsData, setRowsData] = useState([]);

  const addTableRows = () => {
    const rowsInput = {
      firstname: "",
      lastname: "",
      emailaddress: "",
      password: "",
      usertype: "",
    };
    setRowsData([...rowsData, rowsInput]);
  };
  const deleteUserRows = (index) => {
    const rows = [...rowsData];
    rows.splice(index, 1);
    setRowsData(rows);
  };
  
  const handleChange = (index, evnt) => {
    const { name, value } = evnt.target;
    const rowsInput = [...rowsData];
    rowsInput[index][name] = value;
    setRowsData(rowsInput);
  };
  function refreshuser(){axios.get(url).then((res) => setData(res.data));}
  const [data, setData] = useState([]);
  useEffect(() => {
    refreshuser();
  }, []);

 function DeleteUser (index, e) {
    confirmAction(index,e);
   
  }
  const confirmAction= async(index, e) => {
    let confirmAction = window.confirm("Are you sure?");
    if (confirmAction){
      axios.delete(`${process.env.REACT_APP_API_ENDPOINT}/user/${index.id}/`)
      .then(() => {
        setStatus("Deleted successfully!!")
        refreshuser();
    });
    await timeout(2000);
    setStatus("")
    }else{
      window.close()
    }
  }

  return (
    <div className={userCSS.mainContainer}>
      <div className={userCSS.container}>
        <div className={userCSS.topContent}>
          <h3>User Management</h3>
        </div>
      </div>
      <div className={userCSS.firstContent}>
        <table className="table">
          <thead>
            <tr>
              <th>Firstname</th>
              <th>Lastname</th>
              <th>Email</th>
              <th>Password</th>
              <th>Usertype</th>
              <th>
                <button className="btn btn-outline-dark" onClick={addTableRows}>
                  Add User
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <Adduser
              rowsData={rowsData}
              deleteUserRows={deleteUserRows}
              handleChange={handleChange}
            />
          </tbody>
        </table>
        <div className={userCSS.btn1}>
          <button className="btn btn-success" onClick={handleAdd}>
            Submit
          </button>
        </div>
        {addStatus && <span className={userCSS.errorMessage}>{addStatus}</span>}
      </div>
      <div className={userCSS.secondContent}>
        {status && <span className={userCSS.errorMessage}>{status}</span>}
        <Table hover>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>User Type</th>
            </tr>
          </thead>
          <tbody>
            {data.map((user, index) => (
              <tr key={index}>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={(e) => DeleteUser(user, e)}
                  >
                    x
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default Usermanagement;
