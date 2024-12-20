import React from "react";
import { useNavigate } from "react-router-dom";

function Registerd() {
  const nav = useNavigate();
  const handelSigninClick = () => {
    nav("/");
  };
  return (
    <>
      <div className="flex items-center justify-center h-screen bg-slate-500">
        <div className="signin bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">Congrats!!!</h1>
          <p>
            You are Registerd successfully. Now you can head back to the sign
            page
          </p>
          <button 
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 mt-3"
          type="button" onClick={handelSigninClick}>
            Sign-In
          </button>
        </div>
      </div>
    </>
  );
}

export default Registerd;
