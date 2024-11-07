type GraphData = {
  vertices: { id: string; name: string; type: string; group: string; }[];
  edges: { fromID: string; toID: string; }[];
};
