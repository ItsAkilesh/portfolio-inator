import React, { Component } from "react";
import ResearchCard from "../../components/researchCard/ResearchCard.js";
import "./ResearchAccordion.css";
import { Accordion, Panel } from "baseui/accordion";

class ResearchAccordion extends Component {
  render() {
    const theme = this.props.theme;
    return (
      <div className="research-accord">
        <Accordion>
          {this.props.sections.map((section) => {
            return (
              <Panel
                className="accord-panel"
                title={section["title"]}
                key={section["title"]}
                overrides={{
                  Header: {
                    style: () => ({
                      backgroundColor: `${theme.body}`,
                      border: `1px solid`,
                      borderRadius: `5px`,
                      borderColor: `${theme.headerColor}`,
                      marginBottom: `3px`,
                      fontFamily: "Google Sans Regular",
                      color: `${theme.text}`,
                      ":hover": {
                        color: `${theme.secondaryText}`,
                      },
                    }),
                  },
                  Content: {
                    style: () => ({
                      backgroundColor: `${theme.body}`,
                    }),
                  },
                }}
              >
{section["research"].map((research,index) => {
                  return (
                    <ResearchCard index={index} totalCards={section["research"].length} research={research} theme={theme} />
                  );
                })}
              </Panel>
            );
          })}
        </Accordion>
      </div>
    );
  }
}

export default ResearchAccordion;
