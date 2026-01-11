"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

interface RestCountry {
  name: {
    common: string;
  };
}

interface CountrySelectProps {
  label?: string;
  value: string;
  onChange: (country: string) => void;
  placeholder?: string;
  isInvalid?: boolean;
  errorMessage?: string;
  required?: boolean;
  reqValue?: string;
  className?: string;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  label,
  value,
  onChange,
  placeholder = "Select country",
  isInvalid,
  errorMessage,
  required,
  reqValue,
  className,
}) => {
  const [countries, setCountries] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name"
        );

        const data: RestCountry[] = await res.json();

        const countryNames = data
          .map((c) => c.name.common)
          .sort((a, b) => a.localeCompare(b));

        setCountries(countryNames);
      } catch (err) {
        console.error("Failed to fetch countries", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = countries.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (country: string) => {
    onChange(country);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className="flex flex-col space-y-1 w-full" ref={dropdownRef}>
      {label && (
        <label htmlFor="country" className="text-base text-dark font-normal">
          {label} {required && <sup className="text-red-500">{reqValue || "*"}</sup>}
        </label>
      )}

      <div className="relative">
        {/* Main Input */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between border rounded-lg px-3 py-2 text-sm text-left bg-white hover:bg-gray-50 transition-colors ${isInvalid ? "border-red-500" : "border-gray-300"
            } ${className}`}
        >
          <span className={value ? "text-gray-900" : "text-gray-400"}>
            {value || placeholder}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""
              }`}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search countries..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Country List */}
            <div className="max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Loading countries...
                </div>
              ) : filtered.length > 0 ? (
                filtered.map((country) => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => handleSelect(country)}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors ${value === country ? "bg-blue-50 text-blue-600" : "text-gray-900"
                      }`}
                  >
                    <span>{country}</span>
                    {value === country && <Check className="h-4 w-4" />}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  No countries found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isInvalid && errorMessage && (
        <p className="text-xs text-red-500">{errorMessage}</p>
      )}
    </div>
  );
};