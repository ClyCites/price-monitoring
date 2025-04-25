import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface Market {
  _id?: string;
  name: string;
  location: string;
  region: string;
  country?: string;
}

// Get all markets
export const getMarkets = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/markets`);
    return data;
  } catch (error) {
    console.error("Error fetching markets:", error);
    throw error;
  }
};

// Get a specific market by ID
export const getMarketById = async (id: string) => {
  try {
    const { data } = await axios.get(`${API_URL}/markets/${id}`);
    return data;
  } catch (error) {
    console.error("Error fetching market:", error);
    throw error;
  }
};

// Add a new market
export const addMarket = async (marketData: Market) => {
  try {
    const { data } = await axios.post(`${API_URL}/markets`, marketData);
    return data;
  } catch (error) {
    console.error("Error adding market:", error);
    throw error;
  }
};

// Update a market
export const updateMarket = async (id: string, marketData: Partial<Market>) => {
  try {
    const { data } = await axios.put(`${API_URL}/markets/${id}`, marketData);
    return data;
  } catch (error) {
    console.error("Error updating market:", error);
    throw error;
  }
};

// Delete a market
export const deleteMarket = async (id: string) => {
  try {
    const { data } = await axios.delete(`${API_URL}/markets/${id}`);
    return data;
  } catch (error) {
    console.error("Error deleting market:", error);
    throw error;
  }
};

// Get prices for a specific market
export const getPricesForMarket = async (marketId: string) => {
  try {
    const { data } = await axios.get(`${API_URL}/markets/${marketId}/prices`);
    return data;
  } catch (error) {
    console.error("Error fetching prices for market:", error);
    throw error;
  }
};
