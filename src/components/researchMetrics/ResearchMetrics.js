import React from "react";
import { research } from "../../portfolio";
import "./ResearchMetrics.css";

export default function ResearchMetrics({ theme, className = "" }) {
  const { scholarStats, researchGateStats } = research;

  if (!scholarStats && !researchGateStats) {
    return null;
  }

  return (
    <div className={`research-metrics ${className}`.trim()}>
      {scholarStats && (
        <a
          className="research-scholar-stats"
          href={scholarStats.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            borderColor: theme.headerColor || theme.secondaryText,
          }}
        >
          <span
            className="research-scholar-logo iconify"
            data-icon="simple-icons:googlescholar"
            style={{ color: "#4285F4" }}
            aria-hidden="true"
          ></span>
          <div className="research-scholar-stat">
            <span
              className="research-scholar-stat-value"
              style={{ color: theme.text }}
            >
              {scholarStats.citations}
            </span>
            <span
              className="research-scholar-stat-label"
              style={{ color: theme.secondaryText }}
            >
              Citations
            </span>
          </div>
          <div className="research-scholar-stat">
            <span
              className="research-scholar-stat-value"
              style={{ color: theme.text }}
            >
              {scholarStats.hIndex}
            </span>
            <span
              className="research-scholar-stat-label"
              style={{ color: theme.secondaryText }}
            >
              h-index
            </span>
          </div>
          <div className="research-scholar-stat">
            <span
              className="research-scholar-stat-value"
              style={{ color: theme.text }}
            >
              {scholarStats.i10Index}
            </span>
            <span
              className="research-scholar-stat-label"
              style={{ color: theme.secondaryText }}
            >
              i10-index
            </span>
          </div>
        </a>
      )}
      {researchGateStats && (
        <a
          className="research-scholar-stats research-gate-stats"
          href={researchGateStats.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            borderColor: theme.headerColor || theme.secondaryText,
          }}
        >
          <span
            className="research-scholar-logo iconify"
            data-icon="simple-icons:researchgate"
            style={{ color: "#00CCBB" }}
            aria-hidden="true"
          ></span>
          <div className="research-scholar-stat">
            <span
              className="research-scholar-stat-value"
              style={{ color: theme.text }}
            >
              {researchGateStats.interestScore}
            </span>
            <span
              className="research-scholar-stat-label"
              style={{ color: theme.secondaryText }}
            >
              Interest Score
            </span>
          </div>
          <div className="research-scholar-stat">
            <span
              className="research-scholar-stat-value"
              style={{ color: theme.text }}
            >
              {researchGateStats.citations}
            </span>
            <span
              className="research-scholar-stat-label"
              style={{ color: theme.secondaryText }}
            >
              Citations
            </span>
          </div>
          <div className="research-scholar-stat">
            <span
              className="research-scholar-stat-value"
              style={{ color: theme.text }}
            >
              {researchGateStats.hIndex}
            </span>
            <span
              className="research-scholar-stat-label"
              style={{ color: theme.secondaryText }}
            >
              h-index
            </span>
          </div>
        </a>
      )}
    </div>
  );
}
