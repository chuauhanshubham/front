import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchants, setSelectedMerchants] = useState([]);
  const [merchantPercents, setMerchantPercents] = useState({});
  const [defaultPercent, setDefaultPercent] = useState(3.5);
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
      const res = await axios.post('http://localhost:5000/upload', formData);
      setMerchants(res.data.merchants);
      setSelectedMerchants([]);
      setMerchantPercents({});
      setSummary(null);
      setDownloadUrl(null);
      alert('✅ File uploaded successfully');
    } catch (err) {
      alert('❌ Upload failed: ' + (err.response?.data?.error || err.message));
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
      const res = await axios.post('http://localhost:5000/generate', {
        merchantPercents: selectedPercents,
        startDate,
        endDate
      });

      setSummary(res.data.summary);
      setDownloadUrl(`http://localhost:5000${res.data.downloadUrl}`);
    } catch (err) {
      alert('❌ Error generating summary: ' + (err.response?.data?.error || err.message));
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
    <div className="app-container">
      <div className="sidebar">
        <h2>📊 Excel Summary Generator</h2>

        <div style={{ marginBottom: '8px' }}>
          <input
            id="file-upload"
            type="file"
            accept=".xls,.xlsx"
            onChange={e => setFile(e.target.files[0])}
            style={{ display: 'none' }}
          />
          <label htmlFor="file-upload" className="custom-file-upload">
            📁 Choose File
          </label>
          {file && <span style={{ marginLeft: '10px' }}>{file.name}</span>}
        </div>

        <button onClick={handleUpload} disabled={!file || loading}>
          {loading ? 'Uploading...' : '⬆️ Upload File'}
        </button>

        <h3>🗓️ Filter Options</h3>
        <label>Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />
        <label>End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />

        <div style={{ marginTop: '20px' }}>
          <h3>🛍️ Select Merchants & %</h3>
          <button onClick={handleSelectAll} style={{ marginBottom: '10px' }}>
            Select All
          </button>

          <div style={{ marginBottom: '10px' }}>
            <label>Default %: </label>
            <input
              type="number"
              style={{ width: '60px' }}
              value={defaultPercent}
              onChange={e => setDefaultPercent(parseFloat(e.target.value))}
            />
          </div>

          {merchants.map((merchant, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <input
                type="checkbox"
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
              <span style={{ marginLeft: '8px', marginRight: '8px', minWidth: '100px' }}>
                {merchant}
              </span>
              <input
                type="number"
                placeholder="%"
                style={{ width: '60px' }}
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

        <button onClick={handleGenerate} disabled={loading} style={{ marginTop: '10px' }}>
          {loading ? 'Generating...' : '📈 Generate Summary'}
        </button>
      </div>

      <div className="summary-panel">
        <h2>📄 Merchant Summary</h2>

        {startDate && endDate && (
          <p><strong>Date Range:</strong> {startDate} to {endDate}</p>
        )}

        {summary && (
          <table>
            <thead>
              <tr>
                {Object.keys(summary[0]).map((key, i) => (
                  <th key={i}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((val, i) => (
                    <td key={i}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {downloadUrl && (
          <div className="download-btn">
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
              ⬇️ Download Excel
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
