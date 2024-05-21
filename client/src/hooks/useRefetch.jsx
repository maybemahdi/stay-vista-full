import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const useRefetch = () => {
  const { refetch, data: rooms, isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/rooms`);
      return data;
    },
  });
  return { rooms, refetch, isLoading };
};

export default useRefetch;
