import { Base_Url } from "@/config/BaseUrl";
import { useQuery, useQueryClient } from "@tanstack/react-query";


const STALE_TIME = 5 * 60 * 1000;
const CACHE_TIME = 30 * 60 * 1000;

const fetchData = async (endpoint, token) => {
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${Base_Url}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error(`Failed to fetch data from ${endpoint}`);
  return response.json();
};

const createQueryConfig = (queryKey, endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  return {
    queryKey,
    queryFn: () => fetchData(endpoint, token),
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    retry: 2,
    ...options,
  };
};



// Team hooks

export const useFetchCompanies = () => {
    return useQuery(createQueryConfig(["companies"], "/api/panel-fetch-company"));
  };
  
  
  export const useFetchUserType = () => {
    return useQuery(
      createQueryConfig(["usertype"], "/api/panel-fetch-usertypes")
    );
  };