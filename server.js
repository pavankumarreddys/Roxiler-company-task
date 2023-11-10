const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors middleware

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

let transactions = [];

// Initialize Database API
app.get('/initialize-database', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    transactions = response.data;

    // You can define your own efficient table/collection structure and initialization logic here

    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// List All Transactions API
app.get('/list-transactions', (req, res) => {
  const { month } = req.query;
  const { search, page = 1, perPage = 10 } = req.query;

  const filteredTransactions = transactions.filter(transaction => {
    const transactionMonth = new Date(transaction.dateOfSale).getMonth() + 1;
    return transactionMonth === parseInt(month, 10);
  });

  const searchedTransactions = search
    ? filteredTransactions.filter(
        transaction =>
          transaction.title.includes(search) ||
          transaction.description.includes(search) ||
          transaction.price.toString().includes(search)
      )
    : filteredTransactions;

  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedTransactions = searchedTransactions.slice(startIndex, endIndex);

  res.status(200).json({ transactions: paginatedTransactions });
});

// Statistics API
app.get('/statistics', (req, res) => {
  const { month } = req.query;

  const filteredTransactions = transactions.filter(transaction => {
    const transactionMonth = new Date(transaction.dateOfSale).getMonth() + 1;
    return transactionMonth === parseInt(month, 10);
  });

  const totalSaleAmount = filteredTransactions.reduce((total, transaction) => total + transaction.price, 0);
  const totalSoldItems = filteredTransactions.length;
  const totalNotSoldItems = transactions.length - totalSoldItems;

  res.status(200).json({
    totalSaleAmount,
    totalSoldItems,
    totalNotSoldItems,
  });
});

// Bar Chart API
app.get('/bar-chart', (req, res) => {
  const { month } = req.query;

  const filteredTransactions = transactions.filter(transaction => {
    const transactionMonth = new Date(transaction.dateOfSale).getMonth() + 1;
    return transactionMonth === parseInt(month, 10);
  });

  const priceRanges = [
    { min: 0, max: 100 },
    { min: 101, max: 200 },
    { min: 201, max: 300 },
    { min: 301, max: 400 },
    { min: 401, max: 500 },
    { min: 501, max: 600 },
    { min: 601, max: 700 },
    { min: 701, max: 800 },
    { min: 801, max: 900 },
    { min: 901, max: Number.POSITIVE_INFINITY },
  ];

  const priceRangeCounts = priceRanges.map(range => {
    const count = filteredTransactions.filter(
      transaction => transaction.price >= range.min && transaction.price <= range.max
    ).length;

    return { range: `${range.min} - ${range.max}`, count };
  });

  res.status(200).json({ priceRanges: priceRangeCounts });
});

// Pie Chart API
app.get('/pie-chart', (req, res) => {
  const { month } = req.query;

  const filteredTransactions = transactions.filter(transaction => {
    const transactionMonth = new Date(transaction.dateOfSale).getMonth() + 1;
    return transactionMonth === parseInt(month, 10);
  });

  const categoryCounts = {};

  filteredTransactions.forEach(transaction => {
    const category = transaction.category; // Replace with your actual category field
    if (categoryCounts[category]) {
      categoryCounts[category]++;
    } else {
      categoryCounts[category] = 1;
    }
  });

  const categoryCountArray = Object.entries(categoryCounts).map(([category, count]) => ({ category, count }));

  res.status(200).json({ categories: categoryCountArray });
});

// Combined Data API
app.get('/combined-data', async (req, res) => {
  const { month } = req.query;

  try {
    const initializeDatabaseResponse = await axios.get(`http://localhost:${port}/initialize-database`);
    const listTransactionsResponse = await axios.get(`http://localhost:${port}/list-transactions?month=${month}`);
    const statisticsResponse = await axios.get(`http://localhost:${port}/statistics?month=${month}`);
    const barChartResponse = await axios.get(`http://localhost:${port}/bar-chart?month=${month}`);
    const pieChartResponse = await axios.get(`http://localhost:${port}/pie-chart?month=${month}`);

    const combinedData = {
      initializeDatabase: initializeDatabaseResponse.data,
      listTransactions: listTransactionsResponse.data,
      statistics: statisticsResponse.data,
      barChart: barChartResponse.data,
      pieChart: pieChartResponse.data,
    };

    res.status(200).json(combinedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
