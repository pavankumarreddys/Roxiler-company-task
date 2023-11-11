import {useState, useEffect } from 'react';
import ApexChart from './ApexChart';
import axios from 'axios';
import './App.css'
const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState('3'); 
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statistics, setStatistics] = useState({});
  const [barChartData, setBarChartData] = useState([]);

  useEffect(() => {
    async function datab(){
      const p = await axios.get("http://localhost:5000/initialize-database");
      const d = p.data; 
      console.log("d", d);

    }
    datab()
    fetchDataAndPopulateUI();
  }, [month, search, page]);

  const fetchDataAndPopulateUI = async () => {
    try {
      const transactionsResponse = await fetchTransactions();
      setTransactions(transactionsResponse);

      const statisticsResponse = await fetchStatistics();
      setStatistics(statisticsResponse);

      const barChartDataResponse = await fetchBarChartData();
      setBarChartData(barChartDataResponse);
      console.log("work",barChartDataResponse)
    } catch (error) {
      console.log("no")
      console.error(error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/list-transactions?month=${month}&search=${search}&page=${page}`);
      return response.data.transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/statistics?month=${month}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {};
    }
  };

  const fetchBarChartData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/bar-chart?month=${month}`);
      return response.data.priceRanges || [];
    } catch (error) {
      console.error('Error fetching bar chart data:', error);
      return [];
    }
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };

  const handlePrevPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  function getMonthName(monthNumber) {
    const months = [
      'January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ];
  
    // Adjust the monthNumber to be within a valid range (1-12)
    const normalizedMonth = (monthNumber - 1 + 12) % 12;
  
    return months[normalizedMonth];
  }
  
  
  

  return (
    <div className="container">
      <h1>Transactions Dashboard</h1>

      
      <label htmlFor="monthSelector">Select Month:</label>
      <select id="monthSelector" value={month} onChange={handleMonthChange}>
        {Array.from({ length: 12 }, (_, index) => (
          <option key={index + 1} value={index + 1}>
            {new Date(0, index).toLocaleString('en-US', { month: 'long' })}
          </option>
        ))}
      </select>

      
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Category</th>
            <th>Sold</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.id}</td>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>{transaction.price}</td>
              <td>{transaction.category}</td>
              <td>{transaction.sold}</td>
              <td>
                <img src={transaction.image} alt={transaction.title} style={{ width: '50px', height: '50px' }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <label htmlFor="searchBox">Search Transaction:</label>
      <input type="text" id="searchBox" value={search} onChange={handleSearchChange} />

      <div>
        <button onClick={handlePrevPage}>Previous</button>
        <button onClick={handleNextPage}>Next</button>
      </div>

      <div className="statistics">
        <h2>Transactions Statistics</h2>
        <p>Total Sale Amount: {statistics.totalSaleAmount}</p>
        <p>Total Sold Items: {statistics.totalSoldItems}</p>
        <p>Total Not Sold Items: {statistics.totalNotSoldItems}</p>
      </div>

      <div>
      <h2>Bar Chart Stats - {getMonthName(month)}</h2>
        {barChartData&&<ApexChart barChartData={barChartData}/>}
        
      </div>
    </div>
  );
};

export default App;

