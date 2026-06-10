
import { api } from "@/axios";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { TMetaSchema } from "@/types/meta";
// import type { TSearchSchema } from "@/types/search";
import type { TDashboardData } from "../../-types/dashboard";


type TApiResponse = {
  data: TDashboardData[];
  meta: TMetaSchema;
};

type TProps = {
  // params: {
  //   week?: number;
  //   month?: number;
  //   year?: number;
  // },

  options: Omit<
    UseQueryOptions<
      TApiResponse,
      Error,
      TApiResponse
      
    >,
    "queryKey" | "queryFn"
  >;
};

export const useGetDashboard = ({  options }: TProps) => {
  // const {week,month, year} = params;

  return useQuery({
    ...options,
    queryKey: ["dashboard"],
    queryFn: async (): Promise<TApiResponse> => {
      const response = await api.get("/dashboard");
      const {data: { data },
      } = response;
      
      return data;
    },
  });
};


