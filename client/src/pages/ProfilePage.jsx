import React, { useContext, useState } from "react";
import { UserContext } from "../UserContext";
import { Link, Navigate, useParams } from "react-router-dom";
import axios from "axios";
import PlacesPage from "./PlacesPage";
import AccountNav from "../AccountNav";

const ProfilePage = () => {
  const [redirect, setRedirect] = useState(null);
  const { user, ready, setUser } = useContext(UserContext);

  let { subpage } = useParams();
  //   console.log(subpage);
  if (subpage === undefined) {
    subpage = "profile";
  }

  // logout işlemi, burada tetikleyeceğiz, be'de logout endpointe gidecek, cookie silinecek vs.
  const logout = async () => {
    await axios.post("logout");
    setRedirect("/");
    setUser(null);
  };

  // eğer user yoksa login'e gitsin ancak burada user'ın olup olmadığı be'ye gidip geliyor bu bir süre alıyor o sırada da burada yani account page'de user yok buda direkt login'e yollluyor ama aslında o arada user bilgisi be'den gelmiş oluyorama login'e de gitmiş oluyor, bunu context'de çözeceğiz

  if (!ready) {
    return "loading...";
  }

  if (ready && !user && !redirect) {
    return <Navigate to={"/login"} />;
  }

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <div>
      <AccountNav />
      {subpage === "profile" && (
        <div className="text-center max-w-lg mx-auto">
          Logged in as {user.name} ({user.email})
          <br />
          <button onClick={logout} className="primary max-w-sm mt-2">
            Logout
          </button>
        </div>
      )}
      {subpage === "places" && <PlacesPage />}
    </div>
  );
};

export default ProfilePage;
