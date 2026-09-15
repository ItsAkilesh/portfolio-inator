import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Fade } from "react-reveal";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import TopButton from "../../components/topButton/TopButton";
import ResearchMetrics from "../../components/researchMetrics/ResearchMetrics";
import { greeting, links } from "../../portfolio.js";
import "./Links.css";

function isExternalLink(url) {
  return /^(https?:\/\/|mailto:|tel:)/i.test(url);
}

function LinkItem({ item, theme }) {
  const style = {
    color: theme.text,
    borderColor: theme.text,
    backgroundColor: theme.body,
  };

  const onMouseEnter = (event) => {
    event.currentTarget.style.color = theme.body;
    event.currentTarget.style.backgroundColor = item.backgroundColor || theme.text;
    event.currentTarget.style.borderColor = item.backgroundColor || theme.text;
  };

  const onMouseOut = (event) => {
    event.currentTarget.style.color = theme.text;
    event.currentTarget.style.backgroundColor = theme.body;
    event.currentTarget.style.borderColor = theme.text;
  };

  const icon = item.iconifyIcon ? (
    <span
      className="iconify"
      data-icon={item.iconifyIcon}
      data-inline="false"
    ></span>
  ) : (
    <i className={`${item.fontAwesomeClass || "fas"} ${item.fontAwesomeIcon}`}></i>
  );

  const content = (
    <>
      <span className="links-item-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="links-item-name">{item.name}</span>
    </>
  );

  if (isExternalLink(item.link)) {
    return (
      <a
        className="links-item"
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        style={style}
        onMouseEnter={onMouseEnter}
        onMouseOut={onMouseOut}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      className="links-item"
      to={item.link}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseOut={onMouseOut}
    >
      {content}
    </Link>
  );
}

class Links extends Component {
  render() {
    const theme = this.props.theme;
    const configuredLinks = links.links || [];

    return (
      <div className="links-main">
        <Header theme={theme} />
        <div className="basic-links">
          <Fade bottom duration={1000} distance="40px">
            <div className="links-heading-div">
              {links.profile_image_path && (
                <div className="links-heading-img-div">
                  <img
                    src={require(`../../assests/images/${links.profile_image_path}`)}
                    alt={greeting.title}
                  />
                </div>
              )}
              <h1 className="links-heading-text" style={{ color: theme.text }}>
                {greeting.title}
              </h1>
              <ResearchMetrics
                theme={theme}
                className="research-metrics-links"
              />
            </div>
            <h2
              className="links-section-title"
              style={{ color: theme.text }}
            >
              {links.title || "Links"}:
            </h2>
            <div className="links-list">
              {configuredLinks.map((item, index) => (
                <LinkItem key={`${item.name}-${index}`} item={item} theme={theme} />
              ))}
            </div>
          </Fade>
        </div>
        <Footer theme={theme} />
        <TopButton theme={theme} />
      </div>
    );
  }
}

export default Links;
