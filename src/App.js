// src/App.js
import React, { useState } from 'react';
import SummaryPanel from './SummaryPanel';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';

function HomePage({ summaries, setSummaries }) {
  const handleSummaryUpdate = (panelType, summary) => {
    setSummaries((prev) => ({
      ...prev,
      [panelType]: summary,
    }));
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Excel Summary Generator</h1>
        <nav>
          <Link to="/combined" className="nav-link">
            View Combined Summary
          </Link>
        </nav>
      </header>

      <div className="panels-container">
        <SummaryPanel panelType="Deposite" onSummaryUpdate={handleSummaryUpdate} />
        <SummaryPanel panelType="Withdrawal" onSummaryUpdate={handleSummaryUpdate} />
      </div>
    </div>
  );
}

function CombinedSummaryPage({ summaries }) {
  const combined = [...(summaries['Deposite'] || []), ...(summaries['Withdrawal'] || [])];

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Combined Merchant Summary</h1>
        <nav>
          <Link to="/" className="nav-link">
            Back to Panels
          </Link>
        </nav>
      </header>

      <div className="combined-summary-container">
        {combined.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {Object.keys(combined[0] || {}).map((k, i) => (
                    <th key={i}>{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {combined.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data-message">
            No summary data available. Please generate summaries in both panels first.
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [summaries, setSummaries] = useState({});

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<HomePage summaries={summaries} setSummaries={setSummaries} />}
        />
        <Route
          path="/combined"
          element={<CombinedSummaryPage summaries={summaries} />}
        />
      </Routes>
    </Router>
  );
}

export default App;