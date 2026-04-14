"use client";


import React, { ReactElement } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@nextui-org/react";


interface TextFieldProps {
  label?: string;
  htmlFor: string;
  id: string;
  isInvalid: boolean;
  errorMessage: string;
  placeholder: string;
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  startContent?: string | ReactElement;
  minLen?: number;
  maxLen?: number;
  rows?: number;
  textColor?: string;
  fixedHeightClassName?: string;
  disableAutosize?: boolean;
}

const TextAreaField: React.FC<TextFieldProps> = ({
  textColor,
  label,
  htmlFor,
  id,
  isInvalid,
  errorMessage,
  placeholder,
  value,
  onChange,
  required,
  minLen,
  maxLen,
  rows = 4,
  fixedHeightClassName,
  disableAutosize = false,
}) => {
  const handleChange = (value: string) => {
    onChange(value);
  };

  return (
    <div className="flex flex-col space-y-1.5">
      <label
        htmlFor={htmlFor}
        className={cn(`text-sm lg:text-xl font-medium leading-9.5 ${textColor}`)}>
        {label} {required && <sup className="text-danger">*</sup>}
      </label>
      <Textarea
        id={id}
        placeholder={placeholder}
        aria-label={label}
        value={value}
        onValueChange={handleChange}
        required={required}
        minLength={minLen}
        maxLength={maxLen}
        rows={rows}
        disableAutosize={disableAutosize}
        radius="md"
        //variant="bordered"
        classNames={{
          inputWrapper: [
            "data-[hover=true]:border-white",
            "group-data-[focus=true]:border-transparent",
            "group-data-[focus=true]:shadow-none",
            "bg-white rounded-[5px] py-2 lg:py-4",
            "text-xs lg:text-base font-normal text-svnlGray border border-gray-400",
            fixedHeightClassName,
          ],
          input: [
            fixedHeightClassName ? "overflow-y-auto" : "",
          ],
        }}
      />
      {isInvalid && <div className="text-red-500">{errorMessage}</div>}
    </div>
  );
};

export default TextAreaField;
