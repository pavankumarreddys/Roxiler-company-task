import React from 'react';
import ReactApexChart from 'react-apexcharts';

const ApexChart = (props) => {
  const { barChartData } = props;

  const chartData = {
    series: [
      {
        name: 'Sold',
        data: barChartData.map(item => item.count),
      },
    ],
    options: {
      annotations: {},
      chart: {
        height: 350,
        type: 'bar',
      },
      plotOptions: {
        bar: {
          borderRadius: 10,
          columnWidth: '50%',
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 2,
      },
      grid: {
        row: {
          colors: ['#fff', '#f2f2f2'],
        },
      },
      xaxis: {
        labels: {
          rotate: -45,
        },
        categories: barChartData.map(item => item.range),
        tickPlacement: 'on',
      },
      yaxis: {
        title: {
          text: 'Sold',
        },
        labels: {
          formatter: (val) => Math.floor(val),
        },
        tickAmount: 2, 
      },
      
    },
  };
  
  


const lastItem = barChartData[barChartData.length - 1];
if (lastItem && lastItem.range && lastItem.range.includes('Infinity')) {
  chartData.options.xaxis.categories[chartData.options.xaxis.categories.length - 1] = '901 - Above';
}


  return (
    <div id="chart">
      <ReactApexChart options={chartData.options} series={chartData.series} type="bar" height={350} />
    </div>
  );
};

export default ApexChart;
