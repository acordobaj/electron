import React from "react";

export default function Button({ name, color }) {
  return (
    <button
      className={`flex justify-center ${color} rounded-md p-2 m-3 w-3/12 font-bold text-white hover:text-gray-200`}
    >
      {name}
    </button>
  );
}
