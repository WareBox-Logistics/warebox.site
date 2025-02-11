import useSWR from "swr";



export function useLogin() {
  const { data, error, mutate } = useSWR(
    "/login",
    async (url) => {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    }
  );

  return {
    data,
    error,
    isLoading: !data && !error,
    mutate,
  };
}