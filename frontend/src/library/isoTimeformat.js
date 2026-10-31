const isoTimeformat = (dateTime) => {
  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) return "Time unavailable";

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default isoTimeformat;
