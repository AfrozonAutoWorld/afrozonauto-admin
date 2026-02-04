import { createSchema } from "./zodValidator";

export const FullNameSchema = createSchema(
  (value: string) => /^[a-zA-Z\s]{1,}$/.test(value.trim()),
  "Please enter your fullname",
);

export const EmailSchema = createSchema((value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}, "Please enter a valid email address");

export const PhoneSchema = createSchema(
  (value) => /^[0-9]{11}$/.test(value),
  "Phone number must be exactly 11 digits",
);

export const PasswordSchema = createSchema(
  (value) => value.length >= 4,
  "Password must be at least 4 characters",
);

export const MakeSchema = createSchema(
  (v: string) => v.trim().length >= 2,
  "Make must be at least 2 characters",
);

export const ModelSchema = createSchema(
  (v: string) => v.trim().length >= 2,
  "Model must be at least 2 characters",
);

export const YearSchema = createSchema((v: string) => {
  const year = Number(v);
  return year >= 1990 && year <= new Date().getFullYear() + 1;
}, "Enter a valid year");

export const PriceSchema = createSchema(
  (v: string) => Number(v) > 0,
  "Price must be greater than 0",
);

export const MileageSchema = createSchema(
  (v: string) => Number(v) >= 0,
  "Mileage cannot be negative",
);

export const VinSchema = createSchema(
  (value: string) => value.length === 17,
  "VIN must be exactly 17 characters",
);

export const RequiredSchema = (label: string) =>
  createSchema((v: string) => v.trim().length > 0, `${label} is required`);
