import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function SummaryPanel({ panelType, onSummaryUpdate }) {
  const [file, setFile] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchants, setSelectedMerchants] = useState([]);
  const [merchantPercents, setMerchantPercents] = useState({});
  const [defaultPercent, setDefaultPercent] = useState(3.6);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summary, setSummary] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert('Please select a file.');

    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/upload?type=${panelType}`, formData);
      setMerchants(res.data.merchants);
      setSelectedMerchants([]);
      setMerchantPercents({});
      setSummary(null);
      setDownloadUrl(null);
      alert(`✅ ${panelType} - File uploaded successfully`);
    } catch (err) {
      alert(`❌ ${panelType} - Upload failed: ` + (err.response?.data?.error || err.message));
    }

    setLoading(false);
  };

  const handleGenerate = async () => {
    if (selectedMerchants.length === 0 || !startDate || !endDate) {
      return alert('Please fill in all filters.');
    }

    const selectedPercents = {};
    selectedMerchants.forEach(m => {
      selectedPercents[m] = parseFloat(merchantPercents[m] || defaultPercent);
    });

    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/generate?type=${panelType}`, {
        merchantPercents: selectedPercents,
        startDate,
        endDate
      });

      setSummary(res.data.summary);
      setDownloadUrl(`${API_BASE_URL}${res.data.downloadUrl}`);
      onSummaryUpdate(panelType, res.data.summary);
    } catch (err) {
      alert(`❌ ${panelType} - Error generating summary: ` + (err.response?.data?.error || err.message));
    }

    setLoading(false);
  };

  const handleSelectAll = () => {
    const allMerchants = [...merchants];
    const defaultPercents = {};
    allMerchants.forEach(m => {
      defaultPercents[m] = merchantPercents[m] || defaultPercent;
    });
    setSelectedMerchants(allMerchants);
    setMerchantPercents(defaultPercents);
  };

  return (
    <div className="panel-container">
      <h2>Excel {panelType}</h2>

      <div className="section">
        <h3>Choose File</h3>
        <div className="file-upload-section">
          <input
            id={`file-upload-${panelType}`}
            type="file"
            accept=".xls,.xlsx"
            onChange={e => setFile(e.target.files[0])}
            style={{ display: 'none' }}
          />
          <label htmlFor={`file-upload-${panelType}`} className="custom-file-upload">
            📁 Choose File
          </label>
          {file && <span className="file-name">{file.name}</span>}
        </div>
        <button 
          onClick={handleUpload} 
          disabled={!file || loading}
          className={`upload-btn ${loading ? 'loading' : ''}`}
        >
          {loading ? 'Uploading...' : '⬆️ Upload File'}
        </button>
      </div>

      <div className="section">
        <h3>Filter Options</h3>
        <div className="date-inputs">
          <div className="date-input-group">
            <label>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div className="date-input-group">
            <label>End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="section">
        <h3>Select Merchants & %</h3>
        <div className="merchant-controls">
          <button onClick={handleSelectAll} className="select-all-btn">Select All</button>
          <div className="default-percent">
            <label>Default %: </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={defaultPercent}
              onChange={e => setDefaultPercent(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="merchant-list">
          {merchants.map((merchant, i) => (
            <div key={i} className="merchant-item">
              <input
                type="checkbox"
                id={`merchant-${panelType}-${i}`}
                checked={selectedMerchants.includes(merchant)}
                onChange={e => {
                  if (e.target.checked) {
                    setSelectedMerchants([...selectedMerchants, merchant]);
                    setMerchantPercents(prev => ({
                      ...prev,
                      [merchant]: prev[merchant] || defaultPercent
                    }));
                  } else {
                    setSelectedMerchants(selectedMerchants.filter(m => m !== merchant));
                    const newPercents = { ...merchantPercents };
                    delete newPercents[merchant];
                    setMerchantPercents(newPercents);
                  }
                }}
              />
              <label htmlFor={`merchant-${panelType}-${i}`} className="merchant-name">
                {merchant}
              </label>
              <input
                type="number"
                placeholder="%"
                step="0.1"
                min="0"
                max="100"
                disabled={!selectedMerchants.includes(merchant)}
                value={merchantPercents[merchant] || ''}
                onChange={e =>
                  setMerchantPercents({
                    ...merchantPercents,
                    [merchant]: e.target.value,
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={handleGenerate} 
        disabled={loading || selectedMerchants.length === 0 || !startDate || !endDate} 
        className={`generate-btn ${loading ? 'loading' : ''}`}
      >
        {loading ? 'Generating...' : '📈 Generate Summary'}
      </button>

      {downloadUrl && (
        <div className="download-btn">
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer">⬇️ Download Excel</a>
        </div>
      )}
    </div>
  );
}

function HomePage({ summaries, setSummaries }) {
  const handleSummaryUpdate = (panelType, summary) => {
    setSummaries(prev => ({
      ...prev,
      [panelType]: summary
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
