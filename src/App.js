import './App.css';

import React, { useState, useEffect } from 'react';
import axios from 'axios';


const CurrencyConverter = () => {
  const [amount, setAmount] = useState(1);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [sourceCurrency, setSourceCurrency] = useState('PLN');
  const [targetCurrency, setTargetCurrency] = useState('USD');
  const [conversionRates, setConversionRates] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  const API_URL = 'http://127.0.0.1:8000/api/currencies/'

  useEffect(() => {
    fetchConversionRates();
    const intervalId = setInterval(fetchConversionRates, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchConversionRates = async () => {
    try {
      const response = await axios.get(API_URL);
      setConversionRates(response.data);
      // Jeśli wcześniej wystąpił błąd, zresetuj stan błędu
      setFetchError(null);
    } catch (error) {
      console.error('Błąd podczas pobierania kursów walut:', error);
      setFetchError('Sprawdź połączenie internetowe.');
    }
  };

  const handleConversion = (e) => {
    e.preventDefault();

    let sourceRate = 1;
    let targetRate = 1;

    for (const currency of conversionRates) {
      if (currency.code === sourceCurrency) {
        sourceRate = currency.rate;
      }

      if (currency.code === targetCurrency) {
        targetRate = currency.rate;
      }
    }

    const converted = (amount / targetRate) * sourceRate;
    setConvertedAmount(converted.toFixed(2));

    fetchConversionRates();
  };

  return (
    <form className='col-12' onSubmit={handleConversion}>
      {fetchError && (
        <div className="alert alert-danger" role="alert">
          {fetchError}
        </div>
      )}
      <ul>
          {conversionRates.map(currency => (
            <li key={currency.code}>
              {currency.code}: <b>{currency.rate}</b> <small>{currency.last_updated.toLocaleString()}</small>
            </li>
          ))}
      </ul>
      <div>
        <label>
          Wprowadź kwotę:
          <input
            className='form-control'
            value={amount}
            min={1}
            max={10000000}
            type="number"
            step={0.01}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>
      </div>

      <div className='mt-3'>
        <p>Wybierz walutę źródłową:</p>
        <select
          className='custom-select'
          value={sourceCurrency}
          onChange={(e) => {
            setConvertedAmount(null);
            setSourceCurrency(e.target.value);
          }}
        >
          <option value="PLN" key="PLN" disabled={"PLN" === targetCurrency}>PLN</option>
          {conversionRates.map(currency => (
            <option key={currency.code} value={currency.code} disabled={currency.code === targetCurrency}>{currency.code}</option>
          ))}
        </select>
      </div>

      <div className='mt-3'>
        <p>Wybierz walutę docelową:</p>
        <select
          className='custom-select'
          value={targetCurrency}
          onChange={(e) => {
            setConvertedAmount(null);
            setTargetCurrency(e.target.value)}}
        > 
          <option value="PLN" key="PLN" disabled={"PLN" === sourceCurrency}>PLN</option>
          {conversionRates.map(currency => (
            <option key={currency.code} value={currency.code} disabled={currency.code === sourceCurrency}>{currency.code}</option>
          ))}
        </select>
      </div>

      <div className='col-12 d-flex justify-content-center mt-3'>
        <button className='col-10 btn btn-success' type="submit">Przelicz</button>
      </div>

      <div className='col-12 d-flex justify-content-center mt-3 row'>
        <p className='col-12'>Przeliczona kwota:</p>
        <p className='col-12 font-weight-bold h2'>{targetCurrency.toUpperCase()}: {convertedAmount}</p>
      </div>
    </form>
  );
};

function App() {
  return (
    <div className="border border-success border-r mt-3 p-3 col-6">
      <h2 className='col-12 text-center'>KANTOR</h2>
        <CurrencyConverter />
    </div>
  );
}

export default App;
