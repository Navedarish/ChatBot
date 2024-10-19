import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface HealthData {
  age: number;
  gender: string;
  weight: number;
  height: number;
  bloodPressure: { systolic: number; diastolic: number; date: string }[];
  heartRate: { value: number; date: string }[];
}

const UserProfile: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/user/health', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setHealthData(response.data);
      } catch (error) {
        console.error('Error fetching health data:', error);
      }
    };

    fetchHealthData();
  }, []);

  if (!healthData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">User Health Profile</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p><strong>Age:</strong> {healthData.age}</p>
          <p><strong>Gender:</strong> {healthData.gender}</p>
        </div>
        <div>
          <p><strong>Weight:</strong> {healthData.weight} kg</p>
          <p><strong>Height:</strong> {healthData.height} cm</p>
        </div>
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Blood Pressure History</h3>
        <LineChart width={600} height={300} data={healthData.bloodPressure}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="systolic" stroke="#8884d8" />
          <Line type="monotone" dataKey="diastolic" stroke="#82ca9d" />
        </LineChart>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-4">Heart Rate History</h3>
        <LineChart width={600} height={300} data={healthData.heartRate}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </div>
    </div>
  );
};

export default UserProfile;