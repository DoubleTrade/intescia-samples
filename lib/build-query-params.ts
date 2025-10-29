// get record<string, string|number> and transform it to query params url string
export const buildQueryParams = (params?: Record<string, string | number | string[] |undefined>): string => {
  if(!params) {
    return '';
  }
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });
  return queryParams.toString();
};