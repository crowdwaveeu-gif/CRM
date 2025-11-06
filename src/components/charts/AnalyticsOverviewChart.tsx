import { useEffect, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';
import {
  getUserGrowthStats,
  getPackageStats,
  getTripStats,
  UserGrowthStats,
  PackageStats,
  TripStats,
} from '../../services/dataService';

const AnalyticsOverviewChart = () => {
  const [userStats, setUserStats] = useState<UserGrowthStats | null>(null);
  const [packageStats, setPackageStats] = useState<PackageStats | null>(null);
  const [tripStats, setTripStats] = useState<TripStats | null>(null);
  const [loading, setLoading] = useState(true);
  // const [activeDropdown, setActiveDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ApexCharts | null>(null);

  useEffect(() => {
    const fetchAllStats = async () => {
      setLoading(true);
      try {
        const [users, packages, trips] = await Promise.all([
          getUserGrowthStats(),
          getPackageStats(),
          getTripStats(),
        ]);
        setUserStats(users);
        setPackageStats(packages);
        setTripStats(trips);
      } catch (error) {
        console.error('Error fetching analytics stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (!loading && userStats && packageStats && tripStats && chartRef.current) {
      const chartOptions = {
        series: [
          {
            name: 'Users',
            data: userStats.monthlyData.map((item) => item.count),
          },
          {
            name: 'Packages',
            data: packageStats.monthlyData.map((item) => item.count),
          },
          {
            name: 'Trips',
            data: tripStats.monthlyData.map((item) => item.count),
          },
        ],
        chart: {
          height: 350,
          type: 'line',
          fontFamily: 'Poppins, sans-serif',
          toolbar: {
            show: false,
          },
        },
        stroke: {
          curve: 'smooth',
          width: 3,
        },
        colors: ['#4bc0c0', '#ff6384', '#36a2eb'],
        xaxis: {
          categories: userStats.monthlyData.map((item) => item.month),
        },
        yaxis: {
          labels: {
            formatter: function (value: number) {
              return Math.floor(value).toString();
            },
          },
        },
        legend: {
          position: 'top',
          horizontalAlign: 'left',
        },
        tooltip: {
          shared: true,
          intersect: false,
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
  }, [loading, userStats, packageStats, tripStats]);

  // const toggleDropdown = () => {
  //   setActiveDropdown(!activeDropdown);
  // };

  if (loading || !userStats || !packageStats || !tripStats) {
    return (
      <div className="card shipment-statistic-card">
        <div className="mb-4 shipment-statistic-header flex-wrap d-flex align-items-center justify-content-between row-gap-2">
          <h5 className="mb-0">Analytics Overview</h5>
        </div>
        <div className="text-center py-5">
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shipment-statistic-card">
      <div className="mb-4 shipment-statistic-header flex-wrap d-flex align-items-center justify-content-between row-gap-2">
        <h5 className="mb-0">Analytics Overview</h5>
      </div>

      <div ref={chartRef} style={{ height: '350px' }}></div>
    </div>
  );
};

export default AnalyticsOverviewChart;
