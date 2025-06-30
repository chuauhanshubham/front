import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function UploadPage() {
  const [file, setFile] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [selectedMerchants, setSelectedMerchants] = useState([]);
  const [merchantPercents, setMerchantPercents] = useState({});
  const [defaultPercent, setDefaultPercent] = useState(3.5);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return alert('Please select a file.');
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    try {
      const res = await axios.post('https://excel-1whh.onrender.com/upload', formData);
      setMerchants(res.data.merchants);
      alert('✅ File uploaded successfully');
    } catch (err) {
      alert('❌ Upload failed: ' + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!startDate || !endDate || selectedMerchants.length === 0) {
      return alert('Please complete all filters.');
    }

    const selectedPercents = {};
    selectedMerchants.forEach(m => {
      selectedPercents[m] = parseFloat(merchantPercents[m] || defaultPercent);
    });

    setLoading(true);
    try {
      const res = await axios.post('https://excel-1whh.onrender.com/generate', {
        merchantPercents: selectedPercents,
        startDate,
        endDate
      });

      sessionStorage.setItem('summary', JSON.stringify(res.data.summary));
      sessionStorage.setItem('downloadUrl', res.data.downloadUrl);
      sessionStorage.setItem('dateRange', res.data.dateRange);
      navigate('/summary');
    } catch (err) {
      alert('❌ Error generating summary: ' + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📁 Upload Excel</h2>
      <input type="file" accept=".xlsx,.xls" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={!file || loading}>
        {loading ? 'Uploading...' : '⬆️ Upload File'}
      </button>

      <h3>🗓️ Filter</h3>
      <label>Start Date:</label>
      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
      <br />
      <label>End Date:</label>
      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />

      <h3>🛒 Select Merchants & %</h3>
      <button onClick={() => {
        const all = [...merchants];
        const updatedPercents = {};
        all.forEach(m => updatedPercents[m] = merchantPercents[m] || defaultPercent);
        setSelectedMerchants(all);
        setMerchantPercents(updatedPercents);
      }}>
        Select All
      </button>

      <label>Default %: </label>
      <input
        type="number"
        value={defaultPercent}
        onChange={e => setDefaultPercent(parseFloat(e.target.value))}
        style={{ width: 60 }}
      />

      {merchants.map((merchant, i) => (
        <div key={i}>
          <input
            type="checkbox"
            checked={selectedMerchants.includes(merchant)}
            onChange={e => {
              if (e.target.checked) {
                setSelectedMerchants([...selectedMerchants, merchant]);
              } else {
                setSelectedMerchants(selectedMerchants.filter(m => m !== merchant));
              }
            }}
          />
          {merchant}
          <input
            type="number"
            value={merchantPercents[merchant] || ''}
            disabled={!selectedMerchants.includes(merchant)}
            placeholder="%"
            onChange={e => setMerchantPercents({ ...merchantPercents, [merchant]: e.target.value })}
            style={{ width: 60, marginLeft: 10 }}
          />
        </div>
      ))}

      <br />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : '📊 Generate Summary'}
      </button>
    </div>
  );
}

export default UploadPage;
