import React, { Component } from "react";
import researchImg from "../../assests/images/research.svg";

export default class ResearchImg extends Component {
  render() {
    return (
      <img
        src={researchImg}
        alt="Research"
        style={{ width: "100%", maxWidth: 600 }}
      />
    );
  }
}
