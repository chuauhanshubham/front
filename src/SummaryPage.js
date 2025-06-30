import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SummaryPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [dateRange, setDateRange] = useState('');

  useEffect(() => {
    const data = sessionStorage.getItem('summary');
    if (!data) {
      navigate('/upload');
      return;
    }

    setSummary(JSON.parse(data));
    setDownloadUrl(sessionStorage.getItem('downloadUrl'));
    setDateRange(sessionStorage.getItem('dateRange'));
  }, [navigate]);

  return (
    <div style={{ padding: 20 }}>
      <h2>📄 Merchant Summary</h2>
      <p><strong>Date Range:</strong> {dateRange}</p>

      {summary.length > 0 && (
        <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {Object.keys(summary[0]).map((key, idx) => (
                <th key={idx}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {summary.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((val, j) => (
                  <td key={j}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <br />
      {downloadUrl && (
        <a
          href={`https://excel-1whh.onrender.com${downloadUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 18 }}
        >
          ⬇️ Download Excel Report
        </a>
      )}
    </div>
  );
}

export default SummaryPage;
