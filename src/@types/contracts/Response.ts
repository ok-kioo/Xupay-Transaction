export type Response = {
  method: string;
  path: string;
  body: {
    source: string;
    type: string;
    payload: string;
    timestamp: string;
  };
};
