import React, { useState } from "react";
import submenuCSS from "./Submenu.module.css";

const Submenu = ({ item }) => {
  const [subnav, setSubnav] = useState(false);
  const showSubnav = () => setSubnav(!subnav);
  return (
    <>
      <div className={submenuCSS.sidebarList}>
        <a href={item.to} className={submenuCSS.link}>
          <div
            className={submenuCSS.itemList}
            onClick={item.subNav && showSubnav}
          >
            <div id={submenuCSS.icon}>{item.icon}</div>
            <div id={submenuCSS.title}>{item.title}</div>
          </div>
        </a>
        {subnav &&
          item.subNav.map((item, key) => {
            return (
              <a href={item.to} className={submenuCSS.link}>
                <div
                  className={submenuCSS.subitemList}
                  key={key}
                  onClick={(e) => e.preventPropagation()}
                >
                  {item.title}
                </div>
              </a>
            );
          })}
      </div>
    </>
  );
};

export default Submenu;
