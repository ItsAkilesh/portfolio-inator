import React from "react";
import "./LoaderLogo.css";
import animatedLogo from "../../assests/images/animated_logo.svg";

class LogoLoader extends React.Component {
  render() {
    return (
      <img
        src={animatedLogo}
        alt="Animated Logo"
        className="animated-logo-fadein"
        style={{ width: "40vw", maxWidth: 520, minWidth: 320 }}
      />
    );
  }
}

export default LogoLoader;
