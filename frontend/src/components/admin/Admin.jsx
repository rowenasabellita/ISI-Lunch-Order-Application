import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Nav, NavDropdown } from "react-bootstrap";

import logo from "../../images/logo.png";
import adminCSS from "./Admin.module.css";
import Submenu from "./Submenu";
import Addsupp from "../../pages/Dish/Addsupp";
import Addmenu from "../../pages/Dish/Addmenu";
import Menuday from "../../pages/Dashboard/Dashboard";
import Order from "../../pages/Ordersummary/Ordersummary";
import Weeklyreport from "../../pages/Weeklyreport/Weeklyreport";
import Usermanagement from "../../pages/Usermanagement/Usermanagement";
import { Sidebardata } from "./Sidebardata";
import Cookies from "js-cookie";

const Admin = () => {
  const [headername, setHeadername] = useState(
    Cookies.get("lastname") + ", " + Cookies.get("firstname")
  );
  const navigate = useNavigate();
  const signOut = () => {
    localStorage.removeItem("temporary");
    localStorage.removeItem("admin");
    navigate("/");
    Cookies.remove("email");
    Cookies.remove("password");
  };

  return (
    <div className={adminCSS.mainContainer}>
      <div className={adminCSS.headerContainer}>
        <div className={adminCSS.leftHeader}>
          <img src={logo} alt="img" className={adminCSS.logo} />
          <h5>INNOVUZE SOLUTIONS INC. </h5>
          <h5 id={adminCSS.title}> LUNCH BUDDIES</h5>
        </div>
        <div className={adminCSS.rightHeader}>
          <label>{headername}</label>
          <Nav className={adminCSS.nav}>
            <NavDropdown id="nav-dropdown" title="">
              <NavDropdown.Item href="#action/3.1">
                {headername}
              </NavDropdown.Item>

              <NavDropdown.Item
                href="#action/3.2"
                onClick={navigate("/homepage")}
              >
                Homepage
              </NavDropdown.Item>

              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4" onClick={signOut}>
                Log Out
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </div>
      </div>
      <div className={adminCSS.mainContent}>
        <div className={adminCSS.leftContent}>
          {Sidebardata.map((item, key) => {
            return <Submenu item={item} key={key} title={item.title} />;
          })}
        </div>
        <div className={adminCSS.rightContent}>
          <Routes>
            <Route path="/dashboard" element={<Menuday />} />
            <Route path="/addsupplier" element={<Addsupp />} />
            <Route path="/addmenu" element={<Addmenu />} />
            <Route path="/ordersummary" element={<Order />} />
            <Route path="/weeklyreport" element={<Weeklyreport />} />
            <Route path="/usermanagement" element={<Usermanagement />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Admin;
