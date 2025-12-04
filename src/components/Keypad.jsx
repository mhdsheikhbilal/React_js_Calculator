import React from "react";
import Button from "./Button";

const Keypad = ({ onInput, onClear, onDelete, onEquals }) => {
  const keys = [
    "(",
    ")",
    "C",
    "DEL",
    "7",
    "8",
    "9",
    "/",
    "4",
    "5",
    "6",
    "*",
    "1",
    "2",
    "3",
    "-",
    "0",
    ".",
    "=",
    "+",
  ];

  return (
    <div className="grid grid-cols-4 gap-2 w-full">
      {keys.map((key) => {
        if (key === "C")
          return (
            <Button
              key={key}
              onClick={() => onClear()}
              className="bg-red-400 text-white  w-20"
            >
              C
            </Button>
          );

        if (key === "DEL")
          return (
            <Button
              key={key}
              onClick={() => onDelete()}
              className="bg-yellow-400 w-20"
            >
              DEL
            </Button>
          );

        if (key === "=")
          return (
            <Button
              key={key}
              onClick={() => onEquals()}
              className="col-span-1 bg-blue-500 text-white w-20"
            >
              =
            </Button>
          );

        if (
          key === "+" ||
          key === "-" ||
          key === "*" ||
          key === "/" ||
          key === "(" ||
          key === ")" ||
          key === "."
        )
          return (
            <Button
              key={key}
              onClick={() => onInput(key)}
              className="bg-gray-200 dark:bg-gray-700 w-20"
            >
              {key}
            </Button>
          );
        return (
          <Button
            key={key}
            onClick={() => onInput(key)}
            className="bg-gray-50 dark:bg-gray-600 w-20"
          >
            {key}
          </Button>
        );
      })}
    </div>
  );
};

export default Keypad;
