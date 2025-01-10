// Import necessary modules
const express = require('express');
const axios = require('axios');
const cron = require('node-cron');

// Initialize the app
const app = express();

// Middleware
app.use(express.json());

// In-memory database
const cryptoData = {};

// Fetch cryptocurrency data from CoinGecko
const fetchCryptoData = async () => {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: {
          ids: 'bitcoin,matic-network,ethereum',
          vs_currencies: 'usd',
          include_market_cap: true,
          include_24hr_change: true,
        },
      }
    );

    const data = response.data;

    // Map data to in-memory database format and store it
    const coins = [
      { id: 'bitcoin', name: 'Bitcoin' },
      { id: 'matic-network', name: 'Matic' },
      { id: 'ethereum', name: 'Ethereum' },
    ];

    for (const coin of coins) {
      const coinData = data[coin.id];

      cryptoData[coin.id] = {
        coinId: coin.id,
        name: coin.name,
        current_price: coinData.usd,
        market_cap: coinData.usd_market_cap,
        change_24h: coinData.usd_24h_change,
        updated_at: new Date(),
      };
    }

    console.log('Crypto data updated successfully');
  } catch (error) {
    console.error('Error fetching crypto data:', error.message);
  }
};

// Schedule the background job to run every 2 hours
cron.schedule('0 */2 * * *', () => {
  console.log('Running scheduled job: Fetching cryptocurrency data');
  fetchCryptoData();
});

// Endpoint to get cryptocurrency data
app.get('/crypto', (req, res) => {
  res.json(cryptoData);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
