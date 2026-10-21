import React from "react";
import { Star } from "lucide-react";

export default function Stars({ rating }) {
  const full = Math.round(rating);
  return (
    <span className="stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < full ? "star-filled" : "star-empty"}
          fill={i < full ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}
