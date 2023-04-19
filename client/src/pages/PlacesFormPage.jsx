import React, { useEffect, useState } from "react";
import PhotosUploader from "../PhotosUploader";
import Perks from "../Perks";
import AccountNav from "../AccountNav";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";

const PlacesFormPage = () => {
  const { id } = useParams();
  console.log({ id });

  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [addedPhotos, setAddedPhotos] = useState([]);
  const [description, setDescription] = useState("");
  const [perks, setPerks] = useState([]);
  const [extraInfo, setExtraInfo] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckout] = useState("");
  const [maxGuests, setMaxGuests] = useState(1);
  const [price, setPrice] = useState(100);
  //   const [redirectToPlacesList, setRedirectToPlacesList] = useState(false);

  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get("/places/" + id).then((response) => {
      const { data } = response;
      setTitle(data.title);
      setAddress(data.address);
      setAddedPhotos(data.photos);
      setDescription(data.description);
      setPerks(data.perks);
      setExtraInfo(data.extraInfo);
      setCheckIn(data.checkIn);
      setCheckout(data.checkOut);
      setMaxGuests(data.maxGuests);
      setPrice(data.price);
    });
  }, [id]);

  const inputHeader = (text) => {
    return <h2 className="mt-4 text-2xl">{text}</h2>;
  };
  const inputDescription = (text) => {
    return <p className="text-gray-500 text-sm">{text}</p>;
  };
  const preInput = (header, description) => {
    return (
      <>
        {inputHeader(header)}
        {inputDescription(description)}
      </>
    );
  };

  // New Place oluşturmak
  const savePlace = async (e) => {
    e.preventDefault();
    const placeData = {
      title,
      address,
      addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    };
    if (id) {
      // DB'deki kaydın editlenmesi, update
      await axios.put("/places", {
        id,
        ...placeData,
      });
      // setRedirectToPlacesList(true);
      setRedirect(true);
    } else {
      // DB'ye yeni kayıt
      await axios.post("/places", placeData);
      // setRedirectToPlacesList(true);
      setRedirect(true);
    }
  };

  //   if (redirectToPlacesList && action !== "new") {
  //     return <Navigate to={"/account/places"} />;
  //   }

  if (redirect) {
    return <Navigate to={"/account/places"} />;
  }

  return (
    <div>
      <AccountNav />
      <form onSubmit={savePlace}>
        {preInput("Title", "Title for your place. Should be short and catchy")}
        {/* <h2 className="mt-4 text-2xl">Title</h2>
  <p className="text-sm text-gray-500">
    Title for your place. Should be short and catchy
  </p> */}
        <input
          type="text"
          value={title}
          onChange={(ev) => setTitle(ev.target.value)}
          placeholder="title, for example my lovely apartment"
        />
        {/* <h2 className="mt-4 text-2xl">Address</h2>
  <p className="text-sm text-gray-500">Address to this place</p> */}
        {preInput("Address", "Address to this place")}
        <input
          type="text"
          placeholder="address"
          value={address}
          onChange={(ev) => setAddress(ev.target.value)}
        />
        {/* <h2 className="mt-4 text-2xl">Photos</h2>
  <p className="text-sm text-gray-500">more = better</p> */}
        {preInput("Photos", "more=better")}
        <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />
        {preInput("Description", "description of the place")}
        {/* <h2 className="mt-4 text-2xl">Description</h2>
  <p className="text-sm text-gray-500">description of the place</p> */}
        <textarea
          value={description}
          onChange={(ev) => setDescription(ev.target.value)}
        />
        {preInput("Perks", "select all the perks of your place")}
        {/* <h2 className="mt-4 text-2xl">Perks</h2>
  <p className="text-sm text-gray-500">
    select all the perks of your place
  </p> */}
        <div className="grid mt-2 gap-2 gird-cols-2 md:grid-cols-4 lg:grid-cols-6">
          <Perks selected={perks} onChange={setPerks} />
        </div>
        <h2 className="mt-4 text-2xl">Extra Info</h2>
        <p className="text-sm text-gray-500">house rules, etc.</p>
        <textarea
          value={extraInfo}
          onChange={(ev) => setExtraInfo(ev.target.value)}
        />
        <h2 className="mt-4 text-2xl">Check in & out times, max guests</h2>
        <p className="text-sm text-gray-500">
          add check in and out times, remember to have some time window for
          cleaning the room between guests
        </p>
        <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
          <div>
            <h3 className="mt-2 -mb-1">Check in time</h3>
            <input
              type="text"
              placeholder="14:00"
              value={checkIn}
              onChange={(ev) => setCheckIn(ev.target.value)}
            />
          </div>
          <div>
            <h3 className="mt-2 -mb-1">Check out time</h3>
            <input
              type="text"
              placeholder="11:00"
              value={checkOut}
              onChange={(ev) => setCheckout(ev.target.value)}
            />
          </div>
          <div>
            <h3 className="mt-2 -mb-1">Max number of guests</h3>
            <input
              type="number"
              placeholder="4"
              value={maxGuests}
              onChange={(ev) => setMaxGuests(ev.target.value)}
            />
          </div>
          <div>
            <h3 className="mt-2 -mb-1">Price per night</h3>
            <input
              type="number"
              placeholder="4"
              value={price}
              onChange={(ev) => setPrice(ev.target.value)}
            />
          </div>
        </div>
        <div>
          <button className="primary my-4">Save</button>
        </div>
      </form>
    </div>
  );
};

export default PlacesFormPage;
