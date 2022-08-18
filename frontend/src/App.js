import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";

import Login from "./components/signin/Login";
import Registration from "./components/signin/Registration";
import Adminpage from "./components/admin/Admin";
import AuthProvider from "./providers/AuthProvider";
import Maincontent from "./components/user/Maincontent"
import { RequireToken,RequireAdmin } from "./components/auth/RequireAuth";

function App() {
  return (
    <>
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/admin/*" element={<RequireAdmin><Adminpage /></RequireAdmin>} />
          <Route path="/" element={<Login />} />
          <Route path="/homepage" element={<RequireToken><Maincontent /></RequireToken>} />
          <Route path="/registration" element={<Registration />} />
        </Routes>
      </div>
    </AuthProvider>
  </>
  );
}

export default App;
