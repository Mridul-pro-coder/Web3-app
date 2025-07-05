import React, { useState, useEffect } from 'react';
import { useStateContext } from '../context';
import DisplayCampaigns from '../components/DisplayCampaigns';

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const { address, contract, getCampaigns } = useStateContext();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoading(true);
        if (contract && getCampaigns) {
          const data = await getCampaigns();
          setCampaigns(data);
        }
      } catch (err) {
        console.error("Error fetching campaigns", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (contract) fetchCampaigns();
  }, [address, contract]);

  return (
    <DisplayCampaigns
      title="All Campaigns"
      isLoading={isLoading}
      campaigns={campaigns}
    />
  );
};

export default Home;
