import React, { Component } from "react";
import { Route, Switch, BrowserRouter, withRouter } from "react-router-dom";
import Home from "../pages/home/HomeComponent";
import Splash from "../pages/splash/Splash";
import Education from "../pages/education/EducationComponent";
import Experience from "../pages/experience/Experience";

import Contact from "../pages/contact/ContactComponent";
import Projects from "../pages/projects/Projects";
import { settings } from "../portfolio.js";
import Error404 from "../pages/errors/error404/Error";
import Research from "../pages/research/Research";
import Links from "../pages/links/Links";
import { pageview } from "../analytics";

// Sitemap component that serves the XML content
class Sitemap extends Component {
  componentDidMount() {
    // Set the content type to XML
    document.contentType = 'application/xml';
    
    // Fetch the sitemap.xml file and display it
    fetch('/sitemap.xml')
      .then(response => response.text())
      .then(xmlContent => {
        // Create a new document with the XML content
        const parser = new DOMParser();
        // eslint-disable-next-line no-unused-vars
        const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
        
        // Replace the current document content with the XML
        document.open();
        document.write(xmlContent);
        document.close();
      })
      .catch(error => {
        console.error('Error loading sitemap:', error);
        document.body.innerHTML = '<h1>Sitemap not found</h1>';
      });
  }

  render() {
    return <div>Loading sitemap...</div>;
  }
}

export default class Main extends Component {
  render() {
    return (
      <BrowserRouter basename="/">
        {/* Analytics tracker: records pageviews on route change */}
        <Route
          render={withRouter(
            class extends Component {
              componentDidMount() {
                try {
                  pageview(window.location.pathname + window.location.search);
                } catch (e) {}
              }

              componentDidUpdate(prevProps) {
                if (
                  this.props.location.pathname !== prevProps.location.pathname ||
                  this.props.location.search !== prevProps.location.search
                ) {
                  try {
                    pageview(this.props.location.pathname + this.props.location.search);
                  } catch (e) {}
                }
              }

              render() {
                return null;
              }
            }
          )}
        />
        <Switch>
          <Route
            path="/"
            exact
            render={(props) =>
              settings.isSplash ? (
                <Splash {...props} theme={this.props.theme} />
              ) : (
                <Home {...props} theme={this.props.theme} />
              )
            }
          />
          <Route
            path="/home"
            render={(props) => <Home {...props} theme={this.props.theme} />}
          />
          <Route
            path="/experience"
            exact
            render={(props) => (
              <Experience {...props} theme={this.props.theme} />
            )}
          />
          <Route
            path="/research"
            exact
            render={(props) => (
              <Research {...props} theme={this.props.theme} />
            )}
          />
          <Route
            path="/education"
            render={(props) => (
              <Education {...props} theme={this.props.theme} />
            )}
          />
          <Route
            path="/contact"
            render={(props) => <Contact {...props} theme={this.props.theme} />}
          />
          <Route
            path="/links"
            exact
            render={(props) => <Links {...props} theme={this.props.theme} />}
          />

          {settings.isSplash && (
            <Route
              path="/splash"
              render={(props) => <Splash {...props} theme={this.props.theme} />}
            />
          )}

          <Route
            path="/projects"
            render={(props) => <Projects {...props} theme={this.props.theme} />}
          />
          <Route
            path="/sitemap"
            component={Sitemap}
          />
          <Route
            path="*"
            render={(props) => <Error404 {...props} theme={this.props.theme} />}
          />
        </Switch>
      </BrowserRouter>
    );
  }
}
