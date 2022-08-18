import { React, useState } from "react";
import formCSS from "./Form.module.css";

const Formreg = (props) => {
  const [focused, setFocused] = useState(false);
  const Focus = (e) => {
    setFocused(true);
  };
  const { id, errorMessage, onChange, ...inputProps } = props;
  return (
    <div className={formCSS.formInputs}>
      <input
        {...inputProps}
        onChange={onChange}
        onBlur={Focus}
        onFocus={() =>
          inputProps.name === "confirmPassword" && setFocused(true)
        }
        focused={focused.toString()}
      />

      <span>{errorMessage}</span>
    </div>
  );
};

export default Formreg;
