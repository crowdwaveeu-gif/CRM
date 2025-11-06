import { useEffect, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';
import { getRevenueStats, RevenueStats } from '../../services/dataService';

const RevenueChart = () => {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  // const [activeDropdown, setActiveDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ApexCharts | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await getRevenueStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching revenue stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // setActiveDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (!loading && stats && chartRef.current) {
      const chartOptions = {
        series: [
          {
            name: 'Revenue',
            data: stats.monthlyData.map((item) => item.revenue),
          },
        ],
        chart: {
          height: 300,
          type: 'bar',
          fontFamily: 'Poppins, sans-serif',
          toolbar: {
            show: false,
          },
        },
        plotOptions: {
          bar: {
            borderRadius: 8,
            dataLabels: {
              position: 'top',
            },
          },
        },
        dataLabels: {
          enabled: false,
        },
        colors: ['#4bc0c0'],
        xaxis: {
          categories: stats.monthlyData.map((item) => item.month),
        },
        yaxis: {
          labels: {
            formatter: function (value: number) {
              return '€' + value.toLocaleString();
            },
          },
        },
        tooltip: {
          y: {
            formatter: function (value: number) {
              return '€' + value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
            },
          },
        },
      };

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new ApexCharts(chartRef.current, chartOptions);
      chartInstanceRef.current.render();
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [loading, stats]);

  // const toggleDropdown = () => {
  //   setActiveDropdown(!activeDropdown);
  // };

  if (loading || !stats) {
    return (
      <div className="card shipment-statistic-card">
        <div className="mb-4 shipment-statistic-header flex-wrap d-flex align-items-center justify-content-between row-gap-2">
          <h5 className="mb-0">Revenue Analytics</h5>
        </div>
        <div className="text-center py-5">
          <p>Loading revenue data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shipment-statistic-card">
      <div className="mb-4 shipment-statistic-header flex-wrap d-flex align-items-center justify-content-between row-gap-2">
        <h5 className="mb-0">Revenue Analytics</h5>
      </div>

      <div ref={chartRef} style={{ height: '300px' }}></div>
    </div>
  );
};

export default RevenueChart;
