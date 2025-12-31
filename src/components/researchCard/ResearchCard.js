import React, { Component } from 'react';
import './ResearchCard.css';
import { Fade } from "react-reveal";

class ResearchCard extends Component {
  render() {
    const research = this.props.research;
    const index = this.props.index;
    const totalCards = this.props.totalCards;
    const theme = this.props.theme;
    return (
      <div className="research-list-item" style={{ marginTop: (index === 0 ? 30 : 50) }}>
        <Fade left duration={2000} distance="40px">
          <div className="research-card-logo-div">
            <img
              className="research-card-logo"
              src={require(`../../assests/images/${research["logo_path"]}`)}
              alt=""
            />
          </div>
        </Fade>
        <div className="research-card-stepper">
          <div style={{ width: 20, height: 20, backgroundColor: `${theme.headerColor}`, borderRadius: 50, zIndex: 100 }} />
          {
            index !== (totalCards - 1) &&
            <div style={{ height: 190, width: 2, backgroundColor: `${theme.headerColor}`, position: 'absolute', marginTop: 20 }} />
          }
        </div>
        <Fade right duration={2000} distance="40px">
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div className="arrow-left" style={{ borderRight: `10px solid ${theme.body}` }}></div>
            <div className="research-card" style={{ background: `${theme.body}` }}>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <div>
                  <a href={research["company_url"]} target="_blank" rel="noopener noreferrer">
                    <h3 className="research-card-title" style={{ color: theme.text }}>{research["title"]}</h3>
                  </a>
                  <p className="research-card-company" style={{ color: theme.text }}>
                    {research["company"]}
                  </p>
 
                </div>
                <div>
                  <div className="research-card-heading-right">
                    <p className="research-card-duration" style={{ color: theme.secondaryText }}>{research["duration"]}</p>
                    <p className="research-card-location" style={{ color: theme.secondaryText }}>{research["location"]}</p>
                  </div>

                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 20 }}>
                <div
                  className="repo-description"
                />
                {research["description"]}
              </div>

            </div>

          </div>
        </Fade>
      </div>

    );
  }
}

export default ResearchCard;
