import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import { ArrowRightIcon, ClockIcon } from "lucide-react";
import isoTimeformat from "../library/isoTimeformat";
import BlurCircle from "../components/BlurCircle";
import toast from "react-hot-toast";
import { useApi } from "../library/api";

const groupRows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", "J"]];

const SeatLayout = () => {
  const { id, date } = useParams();
  const { request } = useApi();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    request(`/api/show/${id}`)
      .then((data) => {
        if (!active) return;
        setShow({ movie: data.movie, dateTime: data.dateTime || {} });
        if (!data.dateTime?.[date]?.length) setError("No showtimes available for this date.");
      })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, date]);

  useEffect(() => {
    let active = true;
    if (!selectedTime?.showId) return;
    request(`/api/booking/seats/${selectedTime.showId}`)
      .then((data) => { if (active) setOccupiedSeats(data.occupiedSeats || []); })
      .catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [selectedTime?.showId]);

  const handleSeatClick = (seatId) => {
    if (!selectedTime) return toast.error("Please select a showtime first.");
    if (occupiedSeats.includes(seatId)) return;
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) return prev.filter((seat) => seat !== seatId);
      if (prev.length >= 5) {
        toast.error("You can select a maximum of 5 seats.");
        return prev;
      }
      return [...prev, seatId];
    });
  };

  const handleCheckout = async () => {
    if (!selectedTime) return toast.error("Please select a showtime.");
    if (!selectedSeats.length) return toast.error("Please select at least one seat.");
    setBooking(true);
    setError("");
    try {
      const data = await request("/api/booking/create", {
        method: "POST",
        body: JSON.stringify({ showId: selectedTime.showId, selectedSeats }),
      });
      if (!data.url) throw new Error("Payment checkout URL was not returned.");
      window.location.assign(data.url);
    } catch (err) {
      setError(err.message);
      setBooking(false);
    }
  };

  if (loading) return <Loading />;
  if (!show) return <div className="min-h-[70vh] px-6 pt-40 text-center text-red-400">{error || "Show not found."}</div>;

  const renderSeats = (row, count = 9) => (
    <div key={row} className="mt-2 flex gap-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: count }, (_, index) => {
          const seatId = `${row}${index + 1}`;
          const isOccupied = occupiedSeats.includes(seatId);
          const isSelected = selectedSeats.includes(seatId);
          return (
            <button key={seatId} type="button" disabled={isOccupied} onClick={() => handleSeatClick(seatId)}
              aria-label={`Seat ${seatId} ${isOccupied ? "occupied" : isSelected ? "selected" : "available"}`}
              className={`h-8 w-8 rounded border text-xs transition ${isOccupied ? "cursor-not-allowed border-gray-700 bg-gray-700 text-gray-500" : isSelected ? "border-primary bg-primary text-white" : "cursor-pointer border-primary/60 hover:bg-primary/30"}`}>
              {seatId}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col px-6 py-30 md:flex-row md:px-16 md:pt-50 lg:px-40">
      <div className="h-max rounded-lg border border-primary/20 bg-primary/10 py-8 md:sticky md:top-30 md:w-80">
        <p className="px-6 text-lg font-semibold">Available Timings</p>
        <div className="mt-5 space-y-1">
          {(show.dateTime[date] || []).map((item) => (
            <button key={item.showId} type="button" onClick={() => { setSelectedTime(item); setSelectedSeats([]); }}
              className={`flex w-full items-center gap-2 px-6 py-2 text-left transition ${selectedTime?.showId === item.showId ? "bg-primary text-white" : "hover:bg-primary/20"}`}>
              <ClockIcon className="h-4 w-4" /><span className="text-sm">{isoTimeformat(item.time)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col items-center max-md:mt-16">
        <BlurCircle top="-100px" left="-100px" /><BlurCircle bottom="0" right="0" />
        <h1 className="mb-4 text-2xl font-semibold">Select your seat — {show.movie.title}</h1>
        <div className="mb-2 h-1 w-2/3 rounded-full bg-primary/70" />
        <p className="mb-6 text-sm text-gray-400">SCREEN SIDE</p>
        <div className="mt-10 flex flex-col items-center text-xs text-gray-300">
          <div className="mb-6 grid grid-cols-2 gap-8 md:grid-cols-1 md:gap-2">
            {groupRows[0].map((row) => renderSeats(row))}
          </div>
          <div className="grid grid-cols-2 gap-11">
            {groupRows.slice(1).map((group, index) => <div key={index}>{group.map((row) => renderSeats(row))}</div>)}
          </div>
        </div>
        <p className="mt-6 text-sm text-gray-400">Selected seats: {selectedSeats.join(", ") || "None"}</p>
        {error && <p role="alert" className="mt-4 text-red-400">{error}</p>}
        <button disabled={booking || !selectedTime || !selectedSeats.length} onClick={handleCheckout}
          className="mt-10 flex items-center gap-2 rounded-full bg-primary px-10 py-3 text-sm font-medium transition hover:bg-primary-dull disabled:cursor-not-allowed disabled:opacity-50">
          {booking ? "Redirecting..." : "Proceed to payment"}<ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SeatLayout;
