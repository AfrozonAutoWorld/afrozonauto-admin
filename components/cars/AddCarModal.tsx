'use client';

import { useState } from 'react';
import { useCreateVehicle } from '@/lib/hooks/useVehicles';
import { Modal } from '../shared';
import { FormField, SelectField, TextAreaField } from '@/components/Form';
import { Switch } from '@nextui-org/react';
import {
  MakeSchema,
  ModelSchema,
  YearSchema,
  PriceSchema,
  MileageSchema,
  RequiredSchema,
} from '@/lib/schema';
import { useField } from '@/lib';
import MediaUpload from '../shared/MediaFilepload';

const vehicleTypeOptions = [
  { value: "CAR", label: "Car" },
  { value: "SEDAN", label: "Sedan" },
  { value: "SUV", label: "SUV" },
  { value: "TRUCK", label: "Truck" },
  { value: "VAN", label: "Van" },
  { value: "COUPE", label: "Coupe" },
];

const transmissionOptions = [
  { value: "Automatic", label: "Automatic" },
  { value: "Manual", label: "Manual" },
  { value: "Automated Manual", label: "Automated Manual" },
  { value: "CVT", label: "CVT" },
];

const fuelTypeOptions = [
  { value: "Gasoline", label: "Gasoline" },
  { value: "Diesel", label: "Diesel" },
  { value: "Electric", label: "Electric" },
  { value: "Hybrid", label: "Hybrid" },
  { value: "Premium Unleaded (Recommended)", label: "Premium Unleaded" },
];

const statusOptions = [
  { value: "AVAILABLE", label: "Available" },
  { value: "SOLD", label: "Sold" },
  { value: "PENDING", label: "Pending" },
];

interface AddCarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCarModal({ open, onOpenChange }: AddCarModalProps) {
  const createVehicle = useCreateVehicle();

  const { value: vin, error: vinError, handleChange: handleVinChange } =
    useField('', RequiredSchema('VIN'));

  const { value: make, error: makeError, handleChange: handleMakeChange } =
    useField('', MakeSchema);

  const { value: model, error: modelError, handleChange: handleModelChange } =
    useField('', ModelSchema);

  const { value: year, error: yearError, handleChange: handleYearChange } =
    useField(String(new Date().getFullYear()), YearSchema);

  const { value: price, error: priceError, handleChange: handlePriceChange } =
    useField('', PriceSchema);

  const {
    value: originalPrice,
    error: originalPriceError,
    handleChange: handleOriginalPriceChange,
  } = useField('', PriceSchema);

  const {
    value: mileage,
    error: mileageError,
    handleChange: handleMileageChange,
  } = useField('0', MileageSchema);

  const [vehicleType, setVehicleType] = useState<string>("");
  const [vehicleTypeError, setVehicleTypeError] = useState('');

  const [transmission, setTransmission] = useState<string>("");
  const [transmissionError, setTransmissionError] = useState('');

  const [fuelType, setFuelType] = useState<string>("");
  const [fuelTypeError, setFuelTypeError] = useState('');

  const [status, setStatus] = useState<string>("AVAILABLE");
  const [statusError, setStatusError] = useState('');

  const [image, setImage] = useState<File | null>(null);
  const [featured, setFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isHidden, setIsHidden] = useState(false);

  const generateSlug = (make: string, model: string, year: string, vin: string) => {
    const lastSix = vin.slice(-6);
    return `${year}-${make}-${model}-${lastSix}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const validateForm = () => {
    let isValid = true;

    if (!vehicleType) {
      setVehicleTypeError('Vehicle type is required');
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
    if (!status) {
      setStatusError('Status is required');
      isValid = false;
    }

    return isValid && !vinError && !makeError && !modelError &&
      !yearError && !priceError;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const formData = new FormData();

    // Required fields
    formData.append('vin', vin);
    formData.append('slug', generateSlug(make, model, year, vin));
    formData.append('make', make);
    formData.append('model', model);
    formData.append('year', year);
    formData.append('vehicleType', vehicleType);
    formData.append('priceUsd', price);
    formData.append('transmission', transmission);
    formData.append('fuelType', fuelType);
    formData.append('source', 'MANUAL');
    formData.append('status', status);

    // Optional fields
    if (originalPrice) {
      formData.append('originalPriceUsd', originalPrice);
    }
    if (mileage) {
      formData.append('mileage', mileage);
    }

    // Boolean fields
    formData.append('featured', String(featured));
    formData.append('isActive', String(isActive));
    formData.append('isHidden', String(isHidden));

    // Image
    if (image) {
      formData.append('images', image);
    }

    createVehicle.mutate(formData, {
      onSuccess: () => {
        onOpenChange(false);
        // Reset form
        handleVinChange({ target: { value: '' } } as any);
        handleMakeChange({ target: { value: '' } } as any);
        handleModelChange({ target: { value: '' } } as any);
        handleYearChange({ target: { value: String(new Date().getFullYear()) } } as any);
        handlePriceChange({ target: { value: '' } } as any);
        handleOriginalPriceChange({ target: { value: '' } } as any);
        handleMileageChange({ target: { value: '0' } } as any);
        setVehicleType('');
        setTransmission('');
        setFuelType('');
        setStatus('AVAILABLE');
        setImage(null);
        setFeatured(false);
        setIsActive(true);
        setIsHidden(false);
      },
    });
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Vehicle"
      description="Add a vehicle listing manually to your inventory"
      size="lg"
      showFooter
      onConfirm={handleSubmit}
      confirmText="Add Vehicle"
      isLoading={createVehicle.isPending}
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
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

          <SelectField
            label="Vehicle Type"
            htmlFor="vehicleType"
            id="vehicleType"
            placeholder="Select Type"
            isInvalid={!!vehicleTypeError}
            errorMessage={vehicleTypeError}
            value={vehicleType}
            onChange={(value: string) => {
              setVehicleType(value);
              setVehicleTypeError("");
            }}
            options={vehicleTypeOptions}
            required
            reqValue="*"
          />

          <FormField
            label="Price (USD)"
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
            label="Original Price (USD)"
            id="originalPrice"
            htmlFor="originalPrice"
            type="number"
            placeholder="28000"
            value={originalPrice}
            onChange={handleOriginalPriceChange}
            isInvalid={!!originalPriceError}
            errorMessage={originalPriceError}
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
          />

          <SelectField
            label="Transmission"
            htmlFor="transmission"
            id="transmission"
            placeholder="Select Transmission"
            isInvalid={!!transmissionError}
            errorMessage={transmissionError}
            value={transmission}
            onChange={(value: string) => {
              setTransmission(value);
              setTransmissionError("");
            }}
            options={transmissionOptions}
            required
            reqValue="*"
          />

          <SelectField
            label="Fuel Type"
            htmlFor="fuelType"
            id="fuelType"
            placeholder="Select Fuel Type"
            isInvalid={!!fuelTypeError}
            errorMessage={fuelTypeError}
            value={fuelType}
            onChange={(value: string) => {
              setFuelType(value);
              setFuelTypeError("");
            }}
            options={fuelTypeOptions}
            required
            reqValue="*"
          />

          <SelectField
            label="Status"
            htmlFor="status"
            id="status"
            placeholder="Select Status"
            isInvalid={!!statusError}
            errorMessage={statusError}
            value={status}
            onChange={(value: string) => {
              setStatus(value);
              setStatusError("");
            }}
            options={statusOptions}
            required
            reqValue="*"
          />
        </div>

        <MediaUpload
          onFileSelect={(file) => {
            setImage(file);
          }}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <span className="font-medium">Featured Vehicle</span>
              <p className="text-xs text-muted-foreground">
                Display this vehicle prominently
              </p>
            </div>
            <Switch isSelected={featured} onValueChange={setFeatured} />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <span className="font-medium">Active</span>
              <p className="text-xs text-muted-foreground">
                Vehicle is visible to users
              </p>
            </div>
            <Switch isSelected={isActive} onValueChange={setIsActive} />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <span className="font-medium">Hidden</span>
              <p className="text-xs text-muted-foreground">
                Hide from public listings
              </p>
            </div>
            <Switch isSelected={isHidden} onValueChange={setIsHidden} />
          </div>
        </div>
      </div>
    </Modal>
  );
}