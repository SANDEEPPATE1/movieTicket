import React from "react";

const Loading = () => (
  <div className="flex min-h-[55vh] items-center justify-center" role="status" aria-label="Loading">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/15 border-t-primary" />
  </div>
);

export default Loading;
