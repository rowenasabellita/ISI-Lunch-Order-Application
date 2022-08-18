import React from "react";

import footercontentCSS from "./Footer.module.css";
import logo from "../../images/logo.png";

const Footer = () => {
  return (
    <div className={footercontentCSS.mainContent}>
      <div className={footercontentCSS.footerContainer}>
        <div className={footercontentCSS.leftFooter}>
          <img src={logo} alt="img" className={footercontentCSS.logo}></img>
          <h5>© 2022 Innovuze Solutions INC.</h5>
        </div>
        <div className={footercontentCSS.rightFooter}>
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book. It has survived not
            only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
