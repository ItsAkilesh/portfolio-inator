import React, { Component } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import TopButton from "../../components/topButton/TopButton";
import ResearchAccordion from "../../containers/researchAccordion/ResearchAccordion.js";
import ResearchMetrics from "../../components/researchMetrics/ResearchMetrics";
import "./Research.css";
import { research } from "../../portfolio.js";
import { Fade } from "react-reveal";
import ResearchImg from "./ResearchImg";

class Research extends Component {
  render() {
    const theme = this.props.theme;
    return (
      <div className="research-main">
        <Header theme={theme} />
        <div className="basic-research">
          <Fade bottom duration={2000} distance="40px">
            <div className="research-heading-div">
              <div className="research-heading-img-div">
                <ResearchImg theme={theme} />
              </div>
              <div className="research-heading-text-div">
                <h1
                  className="research-heading-text"
                  style={{ color: theme.text }}
                >
                  {research.title}
                </h1>
                <h3
                  className="research-heading-sub-text"
                  style={{ color: theme.text }}
                >
                  {research["subtitle"]}
                </h3>
                <p
                  className="research-header-detail-text subTitle"
                  style={{ color: theme.secondaryText }}
                >
                  {research["description"]}
                </p>
                <ResearchMetrics
                  theme={theme}
                  className="research-metrics-page"
                />
              </div>
            </div>
          </Fade>
        </div>
        <ResearchAccordion sections={research["sections"]} theme={theme} />
        <Footer theme={this.props.theme} onToggle={this.props.onToggle} />
        <TopButton theme={this.props.theme} />
      </div>
    );
  }
}

export default Research;
