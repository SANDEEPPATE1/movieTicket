import React, { useState } from "react";
import ReactPlayer from "react-player";
import { PlayCircle } from "lucide-react";
import BlurCircle from "./BlurCircle";
import { dummyTrailers } from "../QuickShow-assets/assets/assets";

const TrailerSection = () => {
  const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0]);

  return (
    <section className="relative overflow-hidden px-6 py-16 md:px-16 lg:px-24 xl:px-44">
      <BlurCircle top="-80px" right="-100px" />
      <div className="relative mx-auto max-w-5xl">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Watch & discover</p>
            <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">Movie Trailers</h2>
            <p className="mt-2 text-sm text-gray-400">Watch a preview before choosing your next movie.</p>
          </div>
          <span className="text-xs text-gray-500">{dummyTrailers.length} featured trailers</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
          {currentTrailer?.videoUrl ? (
            <div className="aspect-video w-full">
              <ReactPlayer
                src={currentTrailer.videoUrl}
                controls
                playing={false}
                width="100%"
                height="100%"
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center text-gray-400">Trailer unavailable</div>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
          {dummyTrailers.map((trailer, index) => {
            const active = currentTrailer?.videoUrl === trailer.videoUrl;
            return (
              <button key={trailer.videoUrl} type="button" onClick={() => setCurrentTrailer(trailer)}
                aria-pressed={active}
                className={`group relative overflow-hidden rounded-xl border text-left transition ${active ? "border-primary ring-1 ring-primary" : "border-white/10 hover:border-white/40"}`}>
                <img src={trailer.image} alt={`Trailer ${index + 1}`} loading="lazy"
                  className="aspect-video w-full object-cover transition duration-300 group-hover:scale-105" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/40">
                  <PlayCircle className="h-8 w-8 text-white drop-shadow" />
                </span>
                <span className="block bg-[#17171b] px-3 py-2 text-xs text-gray-300">Trailer {index + 1}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrailerSection;
