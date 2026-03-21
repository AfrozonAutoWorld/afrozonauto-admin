'use client';

import { useState } from 'react';
import { useCreateVehicle } from '@/lib/hooks/useVehicles';
import { Modal } from '../shared';
import { CountrySelect, FormField, SelectField, TextAreaField } from '@/components/Form';
import { FileText, ListChecks } from 'lucide-react';
import {
  MakeSchema,
  ModelSchema,
  YearSchema,
  PriceSchema,
  MileageSchema,
  VinSchema
} from '@/lib/schema';
import { useField } from '@/lib';
import { toast } from 'sonner';

const conditionOptions = [
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'certified', label: 'Certified' },
];

const bodyTypeOptions = [
  { value: 'CAR', label: 'Car' },
  { value: 'SEDAN', label: 'Sedan' },
  { value: 'SUV', label: 'SUV' },
  { value: 'TRUCK', label: 'Truck' },
  { value: 'VAN', label: 'Van' },
  { value: 'COUPE', label: 'Coupe' },
  { value: 'HATCHBACK', label: 'Hatchback' },
  { value: 'WAGON', label: 'Wagon' },
  { value: 'CONVERTIBLE', label: 'Convertible' },
  { value: 'MOTORCYCLE', label: 'Motorcycle' },
];

const transmissionOptions = [
  { value: 'Automatic', label: 'Automatic' },
  { value: 'Manual', label: 'Manual' },
  { value: 'Automated Manual', label: 'Automated Manual' },
  { value: 'CVT', label: 'CVT' },
];

const fuelTypeOptions = [
  { value: 'Gasoline', label: 'Gasoline' },
  { value: 'Diesel', label: 'Diesel' },
  { value: 'Electric', label: 'Electric' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'Premium Unleaded (Recommended)', label: 'Premium Unleaded' },
];

const driveTypeOptions = [
  { value: 'FWD', label: 'FWD' },
  { value: 'RWD', label: 'RWD' },
  { value: 'AWD', label: 'AWD' },
  { value: '4WD', label: '4WD' },
];

interface AddCarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type InputEvent = React.ChangeEvent<HTMLInputElement>;

const makeEvent = (value: string): InputEvent =>
({
  target: { value },
} as InputEvent);

export function AddCarModal({ open, onOpenChange }: AddCarModalProps) {
  const createVehicle = useCreateVehicle();

  const { value: vin, error: vinError, handleChange: handleVinChange } =
    useField('', VinSchema);
  const { value: make, error: makeError, handleChange: handleMakeChange } =
    useField('', MakeSchema);
  const { value: model, error: modelError, handleChange: handleModelChange } =
    useField('', ModelSchema);
  const { value: year, error: yearError, handleChange: handleYearChange } =
    useField(String(new Date().getFullYear()), YearSchema);
  const { value: price, error: priceError, handleChange: handlePriceChange } =
    useField('', PriceSchema);
  const { value: mileage, error: mileageError, handleChange: handleMileageChange } =
    useField('', MileageSchema);

  const [condition, setCondition] = useState('');
  const [conditionError, setConditionError] = useState('');
  const [transmission, setTransmission] = useState('');
  const [transmissionError, setTransmissionError] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [fuelTypeError, setFuelTypeError] = useState('');
  const [color, setColor] = useState('');
  const [colorError, setColorError] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [country, setCountry] = useState('');
  const [countryError, setCountryError] = useState('');
  const [city, setCity] = useState('');
  const [cityError, setCityError] = useState('');
  const [engineSize, setEngineSize] = useState('');
  const [doors, setDoors] = useState('');
  const [seats, setSeats] = useState('');
  const [driveType, setDriveType] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [features, setFeatures] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const parsedFeatures = features
    .split('\n')
    .map((feature) => feature.trim())
    .filter(Boolean);
  const descriptionLength = description.trim().length;

  const resetForm = () => {
    handleVinChange(makeEvent(''));
    handleMakeChange(makeEvent(''));
    handleModelChange(makeEvent(''));
    handleYearChange(makeEvent(String(new Date().getFullYear())));
    handlePriceChange(makeEvent(''));
    handleMileageChange(makeEvent(''));
    setCondition('');
    setConditionError('');
    setTransmission('');
    setTransmissionError('');
    setFuelType('');
    setFuelTypeError('');
    setColor('');
    setColorError('');
    setDescription('');
    setDescriptionError('');
    setCountry('');
    setCountryError('');
    setCity('');
    setCityError('');
    setEngineSize('');
    setDoors('');
    setSeats('');
    setDriveType('');
    setBodyType('');
    setFeatures('');
    setFiles([]);
  };

  const validateForm = () => {
    let isValid = true;

    if (!condition) {
      setConditionError('Condition is required');
      isValid = false;
    }
    if (!transmission) {
      setTransmissionError('Transmission is required');
      isValid = false;
    }
    if (!fuelType) {
      setFuelTypeError('Fuel type is required');
      isValid = false;
    }
    if (!color.trim()) {
      setColorError('Color is required');
      isValid = false;
    }
    if (!description.trim()) {
      setDescriptionError('Description is required');
      isValid = false;
    }
    if (!country) {
      setCountryError('Country is required');
      isValid = false;
    }
    if (!city.trim()) {
      setCityError('City is required');
      isValid = false;
    }

    return (
      isValid &&
      !vinError &&
      !makeError &&
      !modelError &&
      !yearError &&
      !priceError &&
      !mileageError
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []);
    setFiles(nextFiles);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append('make', make.trim());
    formData.append('modelName', model.trim());
    formData.append('year', year);
    formData.append('price', price);
    formData.append('mileage', mileage);
    formData.append('condition', condition);
    formData.append('transmission', transmission);
    formData.append('fuelType', fuelType);
    formData.append('color', color.trim());
    formData.append('vin', vin.trim());
    formData.append('description', description.trim());
    formData.append('country', country);
    formData.append('city', city.trim());

    if (engineSize.trim()) formData.append('engineSize', engineSize.trim());
    if (doors.trim()) formData.append('doors', doors.trim());
    if (seats.trim()) formData.append('seats', seats.trim());
    if (driveType) formData.append('driveType', driveType);
    if (bodyType) formData.append('bodyType', bodyType);

    features
      .split('\n')
      .map((feature) => feature.trim())
      .filter(Boolean)
      .forEach((feature) => formData.append('features', feature));

    files.forEach((file) => formData.append('files', file));

    createVehicle.mutate(formData, {
      onSuccess: () => {
        resetForm();
        onOpenChange(false);
      },
      onError: (error: unknown) => {
        const message =
          error instanceof Error ? error.message : 'Failed to create vehicle';
        toast.error(message);
      },
    });
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Vehicle"
      description="Submit a seller vehicle using the current multipart API payload"
      size="lg"
      showFooter
      onConfirm={handleSubmit}
      confirmText="Add Vehicle"
      isLoading={createVehicle.isPending}
    >
      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="VIN"
            id="vin"
            type="text"
            htmlFor="vin"
            placeholder="1HGBH41JXMN109186"
            value={vin}
            onChange={handleVinChange}
            isInvalid={!!vinError}
            errorMessage={vinError}
            reqValue="*"
          />

          <FormField
            label="Make"
            id="make"
            type="text"
            htmlFor="make"
            placeholder="Toyota"
            value={make}
            onChange={handleMakeChange}
            isInvalid={!!makeError}
            errorMessage={makeError}
            reqValue="*"
          />

          <FormField
            label="Model"
            id="model"
            type="text"
            htmlFor="model"
            placeholder="Camry"
            value={model}
            onChange={handleModelChange}
            isInvalid={!!modelError}
            errorMessage={modelError}
            reqValue="*"
          />

          <FormField
            label="Year"
            id="year"
            htmlFor="year"
            type="number"
            value={year}
            onChange={handleYearChange}
            isInvalid={!!yearError}
            errorMessage={yearError}
            reqValue="*"
          />

          <FormField
            label="Price"
            id="price"
            htmlFor="price"
            type="number"
            placeholder="25000"
            value={price}
            onChange={handlePriceChange}
            isInvalid={!!priceError}
            errorMessage={priceError}
            reqValue="*"
          />

          <FormField
            label="Mileage"
            id="mileage"
            htmlFor="mileage"
            type="number"
            placeholder="15000"
            value={mileage}
            onChange={handleMileageChange}
            isInvalid={!!mileageError}
            errorMessage={mileageError}
            reqValue="*"
          />

          <SelectField
            label="Condition"
            htmlFor="condition"
            id="condition"
            placeholder="Select condition"
            isInvalid={!!conditionError}
            errorMessage={conditionError}
            value={condition}
            onChange={(value: string) => {
              setCondition(value);
              setConditionError('');
            }}
            options={conditionOptions}
            required
            reqValue="*"
          />

          <SelectField
            label="Transmission"
            htmlFor="transmission"
            id="transmission"
            placeholder="Select transmission"
            isInvalid={!!transmissionError}
            errorMessage={transmissionError}
            value={transmission}
            onChange={(value: string) => {
              setTransmission(value);
              setTransmissionError('');
            }}
            options={transmissionOptions}
            required
            reqValue="*"
          />

          <SelectField
            label="Fuel Type"
            htmlFor="fuelType"
            id="fuelType"
            placeholder="Select fuel type"
            isInvalid={!!fuelTypeError}
            errorMessage={fuelTypeError}
            value={fuelType}
            onChange={(value: string) => {
              setFuelType(value);
              setFuelTypeError('');
            }}
            options={fuelTypeOptions}
            required
            reqValue="*"
          />

          <FormField
            label="Color"
            id="color"
            type="text"
            htmlFor="color"
            placeholder="Black"
            value={color}
            onChange={(value) => {
              setColor(value);
              setColorError('');
            }}
            isInvalid={!!colorError}
            errorMessage={colorError}
            reqValue="*"
          />

          <CountrySelect
            label="Country"
            value={country}
            onChange={(value) => {
              setCountry(value);
              setCountryError('');
            }}
            placeholder="Select a country"
            required
            isInvalid={!!countryError}
            errorMessage={countryError}
          />

          <FormField
            label="City"
            id="city"
            type="text"
            htmlFor="city"
            placeholder="Lagos"
            value={city}
            onChange={(value) => {
              setCity(value);
              setCityError('');
            }}
            isInvalid={!!cityError}
            errorMessage={cityError}
            reqValue="*"
          />

          <FormField
            label="Engine Size"
            id="engineSize"
            type="text"
            htmlFor="engineSize"
            placeholder="2.5L 4Cyl"
            value={engineSize}
            onChange={setEngineSize}
            isInvalid={false}
            errorMessage=""
          />

          <FormField
            label="Doors"
            id="doors"
            type="number"
            htmlFor="doors"
            placeholder="4"
            value={doors}
            onChange={setDoors}
            isInvalid={false}
            errorMessage=""
          />

          <FormField
            label="Seats"
            id="seats"
            type="number"
            htmlFor="seats"
            placeholder="5"
            value={seats}
            onChange={setSeats}
            isInvalid={false}
            errorMessage=""
          />

          <SelectField
            label="Drive Type"
            htmlFor="driveType"
            id="driveType"
            placeholder="Select drive type"
            value={driveType}
            onChange={setDriveType}
            isInvalid={false}
            errorMessage=""
            options={driveTypeOptions}
          />

          <SelectField
            label="Body Type"
            htmlFor="bodyType"
            id="bodyType"
            placeholder="Select body type"
            value={bodyType}
            onChange={setBodyType}
            isInvalid={false}
            errorMessage=""
            options={bodyTypeOptions}
          />
        </div>

        <div>
          <TextAreaField
            label="Description"
            htmlFor="description"
            id="description"
            placeholder="Example: Clean 2021 Toyota Camry with low mileage, no accident history, cold AC."
            value={description}
            onChange={(value) => {
              setDescription(value);
              setDescriptionError('');
            }}
            isInvalid={!!descriptionError}
            errorMessage={descriptionError}
            required
            rows={6}
            minLen={20}
            maxLen={700}
            disableAutosize
            fixedHeightClassName="h-52"
          />
        </div>

        <div>
          <TextAreaField
            label="Features"
            htmlFor="features"
            id="features"
            placeholder="List of vehicle features, e.g. ['Leather seats', 'Sunroof']"
            value={features}
            onChange={setFeatures}
            isInvalid={false}
            errorMessage=""
            rows={5}
            maxLen={500}
            disableAutosize
            fixedHeightClassName="h-44"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="files" className="text-sm font-medium">
            Vehicle Images(Upto 10)
          </label>
          <input
            id="files"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="block w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Upload one or more images. They will be sent as `files` in multipart form data.
          </p>
          {files.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {files.length} file{files.length > 1 ? 's' : ''} selected
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
