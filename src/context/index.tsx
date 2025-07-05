import React, { useContext, createContext } from "react";
import {
  useContract,
  useAddress,
  useContractWrite,
  metamaskWallet,
  useConnect,
  useConnectionStatus,
} from "@thirdweb-dev/react";
import { ethers } from "ethers";

const StateContext = createContext({});

type StateContextType = {
  createCampaign: (params: any) => Promise<any>;
  address?: string;
  contract?: any;
  connectWithMetamask?: () => void;
  getCampaigns?: () => Promise<any>;
  getUserCampaigns?: () => Promise<any>;
  donate?: (pId: string, amount: string) => Promise<any>;
  getDonations?: (pId: string) => Promise<any>;
};

type CampaignForm = {
  title: string;
  description: string;
  target: string;
  deadline: string;
  image: string;
};

export const StateContextProvider = ({ children }: { children: React.ReactNode }) => {
  const contractAddress = "0x8b05bc8899fa714a3fbfe5339c2a4b9752aa3532"; // Sepolia contract
  const { contract } = useContract(contractAddress);
  const { mutateAsync: createCampaign } = useContractWrite(contract, "createCampaign");

  const address = useAddress();
  const connect = useConnect();
  const status = useConnectionStatus();

  const connectWithMetamask = async () => {
    if (status !== "connected" && status !== "connecting") {
      try {
        await connect(metamaskWallet());
      } catch (err) {
        console.error("Wallet connection error:", err);
      }
    } else {
      console.log("Already connected or in progress");
    }
  };

  const publishCampaign = async (form: CampaignForm) => {
    try {
      const data = await createCampaign({
        args: [
          address,
          form.title,
          form.description,
          form.target,
          new Date(form.deadline).getTime(),
          form.image,
        ],
      });
      console.log("Contract call success", data);
    } catch (error) {
      console.error("Contract call failure", error);
    }
  };

  const getDonations = async (pId: string) => {
    const donations = await contract?.call("getDonators", [pId]);
    const numberOfDonations = donations[0].length;

    const parsedDonations = [];

    for (let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString()),
      });
    }

    return parsedDonations;
  };

  const donate = async (pId: number, amount: string) => {
    const data = await contract?.call("donateToCampaign", [pId], {
      value: ethers.utils.parseEther(amount),
    });

    return data;
  };

  const getCampaigns = async () => {
    const campaigns = await contract?.call('getCampaigns');

    const parsedCampaings = campaigns.map((campaign: any, i: number) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
      image: campaign.image,
      pId: i
    }));

    return parsedCampaings;
  }


  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();
    const filteredCampaigns = allCampaigns?.filter((campaign: any) => campaign.owner === address);
    return filteredCampaigns;
  };

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        connectWithMetamask,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext) as StateContextType;
