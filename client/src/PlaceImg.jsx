import React from "react";
import Image from "./Image";

const PlaceImg = ({ place, index = 0, className = null }) => {
  if (!place.photos?.length) {
    return "";
  }
  if (!className) {
    className = "object-cover h-full";
  }
  return (
    // <img
    //   className={className}
    //   src={"http://localhost:4000/uploads/" + place.photos[index]}
    //   alt="photo"
    // />
    <Image className={className} src={place.photos[index]} alt="photo" />
  );
};

export default PlaceImg;
