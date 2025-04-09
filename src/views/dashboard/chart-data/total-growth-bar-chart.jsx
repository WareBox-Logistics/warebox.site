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
    title: {
      text: 'Delivered closed in the last 7 days',
      align: 'center',
      style: {
        fontSize: '18px',
        color: '#333'
      }
    },
    colors: ['#34c38f', '#f46a6a'],
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
      categories: ['Lun', 'Mar', 'Mier', 'Jue', 'Vir', 'Sab', 'Dom'],
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
      name: 'Trabajos exitosos',
      data: [35, 125, 35, 35, 35, 80, 60]
    },
    {
      name: 'Perdidas',
      data: [35, 15, 15, 35, 65, 40, 80]
    },
  ]
};

export default chartData;
