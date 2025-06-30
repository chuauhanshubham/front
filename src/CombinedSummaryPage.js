// CombinedSummaryPage.js
import React from 'react';
import { Link } from 'react-router-dom';

function CombinedSummaryPage({ summaries }) {
  // Combine data from both panels
  const combinedData = [...(summaries.Deposite || []), ...(summaries.Withdrawal || [])];

  // Calculate totals
  const calculateTotals = () => {
    const totals = {
      Deposite: { amount: 0, commission: 0 },
      Withdrawal: { amount: 0, commission: 0 },
      Overall: { amount: 0, commission: 0 }
    };

    if (summaries.Deposite) {
      summaries.Deposite.forEach(item => {
        totals.Deposite.amount += parseFloat(item.Amount) || 0;
        totals.Deposite.commission += parseFloat(item.Commission) || 0;
      });
    }

    if (summaries.Withdrawal) {
      summaries.Withdrawal.forEach(item => {
        totals.Withdrawal.amount += parseFloat(item.Amount) || 0;
        totals.Withdrawal.commission += parseFloat(item.Commission) || 0;
      });
    }

    totals.Overall.amount = totals.Deposite.amount + totals.Withdrawal.amount;
    totals.Overall.commission = totals.Deposite.commission + totals.Withdrawal.commission;

    return totals;
  };

  const totals = calculateTotals();

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
        {combinedData.length > 0 ? (
          <>
            <div className="summary-totals">
              <div className="total-card">
                <h3>Deposit Total</h3>
                <p>Amount: ₹{totals.Deposite.amount.toFixed(2)}</p>
                <p>Commission: ₹{totals.Deposite.commission.toFixed(2)}</p>
              </div>
              <div className="total-card">
                <h3>Withdrawal Total</h3>
                <p>Amount: ₹{totals.Withdrawal.amount.toFixed(2)}</p>
                <p>Commission: ₹{totals.Withdrawal.commission.toFixed(2)}</p>
              </div>
              <div className="total-card highlight">
                <h3>Overall Total</h3>
                <p>Amount: ₹{totals.Overall.amount.toFixed(2)}</p>
                <p>Commission: ₹{totals.Overall.commission.toFixed(2)}</p>
              </div>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    {Object.keys(combinedData[0]).map((key, index) => (
                      <th key={index}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {combinedData.map((row, rowIndex) => {
                    const isTotalRow = row.Merchant === 'TOTAL';
                    return (
                      <tr
                        key={rowIndex}
                        style={
                          isTotalRow
                            ? {
                                backgroundColor: '#e6f7ff',
                                fontWeight: 'bold',
                                textAlign: 'center',
                              }
                            : {}
                        }
                      >
                        {Object.values(row).map((value, colIndex) => (
                          <td key={colIndex}>{value}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="download-section">
              <button className="download-btn">
                <a 
                  href={`${process.env.REACT_APP_API_URL}/download-combined`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  ⬇️ Download Combined Report
                </a>
              </button>
            </div>
          </>
        ) : (
          <div className="no-data-message">
            No summary data available. Please generate summaries in both panels first.
          </div>
        )}
      </div>
    </div>
  );
}

export default CombinedSummaryPage;
