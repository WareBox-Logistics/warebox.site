const chartData = {
  height: 480,
  type: 'bar',
  options: {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: true
      }
    },
    colors: ['#556ee6', '#34c38f', '#f46a6a', '#50a5f1'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      axisBorder: {
        show: true
      },
      axisTicks: {
        show: true
      },
      labels: {
        style: {
          colors: '#787878'
        }
      }
    },
    yaxis: {
      axisBorder: {
        show: true
      },
      axisTicks: {
        show: true
      },
      labels: {
        style: {
          colors: '#787878'
        }
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter(val) {
          return `$ ${val} thousands`;
        }
      }
    },
    grid: {
      borderColor: '#f1f1f1'
    }
  },
  series: [
    {
      name: 'Investment',
      data: [35, 125, 35, 35, 35, 80, 35, 20, 35, 45, 15]
    },
    {
      name: 'Loss',
      data: [35, 15, 15, 35, 65, 40, 80, 25, 15, 85, 25]
    },
  ]
};

export default chartData;