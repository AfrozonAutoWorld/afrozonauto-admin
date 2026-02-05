'use client';

import { useState } from 'react';
import { useCreateVehicle } from '@/lib/hooks/useVehicles';
import { Modal } from '../shared';
import { FormField, SelectField } from '@/components/Form';
import { Switch } from '@nextui-org/react';
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

const vehicleTypeOptions = [
  { value: "CAR", label: "Car" },
  { value: "SEDAN", label: "Sedan" },
  { value: "SUV", label: "SUV" },
  { value: "TRUCK", label: "Truck" },
  { value: "VAN", label: "Van" },
  { value: "COUPE", label: "Coupe" },
  { value: "HATCHBACK", label: "Hatchback" },
  { value: "WAGON", label: "Wagon" },
  { value: "CONVERTIBLE", label: "Convertible" },
  { value: "MOTORCYCLE", label: "Motorcycle" },
  { value: "OTHER", label: "Other" },
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

const availabilityOptions = [
  { value: "IN_STOCK", label: "In Stock" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "AT_PORT", label: "At Port" },
  { value: "READY_FOR_PICKUP", label: "Ready for Pickup" },
  { value: "OUT_OF_STOCK", label: "Out of Stock" },
];


interface AddCarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

  const [availability, setAvailability] = useState<string>("IN_STOCK");

  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [uploading, setUploading] = useState(false);
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


  const handleImageChange = (index: number, value: string) => {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  };

  const addImageField = () => setImageUrls([...imageUrls, ""]);
  const removeImageField = (index: number) =>
    setImageUrls(imageUrls.filter((_, i) => i !== index));



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

  type InputEvent = React.ChangeEvent<HTMLInputElement>;

  const makeEvent = (value: string): InputEvent =>
  ({
    target: { value },
  } as InputEvent);


  const resetForm = () => {
    handleVinChange(makeEvent(''));
    handleMakeChange(makeEvent(''));
    handleModelChange(makeEvent(''));
    handleYearChange(makeEvent(String(new Date().getFullYear())));
    handlePriceChange(makeEvent(''));
    handleOriginalPriceChange(makeEvent(''));
    handleMileageChange(makeEvent('0'));

    setVehicleType('');
    setTransmission('');
    setFuelType('');
    setStatus('AVAILABLE');
    setAvailability('IN_STOCK');
    setImageUrls(['']);
    setFeatured(false);
    setIsActive(true);
    setIsHidden(false);

    setVehicleTypeError('');
    setTransmissionError('');
    setFuelTypeError('');
    setStatusError('');
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setUploading(true);


      // Create the payload matching the API format
      const payload = {
        vin,
        slug: generateSlug(make, model, year, vin),
        make,
        model,
        year: Number(year),
        vehicleType,
        priceUsd: Number(price),
        transmission,
        fuelType,
        source: 'MANUAL',
        status,
        availability,
        featured,
        isActive,
        isHidden,
        ...(originalPrice ? { originalPriceUsd: Number(originalPrice) } : {}),
        ...(mileage ? { mileage: Number(mileage) } : {}),
        ...(imageUrls.filter(Boolean).length
          ? { images: imageUrls.filter(url => url.trim() !== "") }
          : {}),
      };


      // Send as JSON, not FormData
      createVehicle.mutate(payload, {
        onSuccess: () => {
          onOpenChange(false);
          resetForm();
        },
        onError: (error: unknown) => {
          console.error('Create vehicle error:', error);
          const message =
            error instanceof Error
              ? error.message
              : "Unexpected error occurred";
          const errorMessage = message.includes("Network")
            ? "Network error. Please check your internet connection."
            : message;

          toast.error(errorMessage || 'Failed to create vehicle');
        },
      });
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
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
      isLoading={createVehicle.isPending || uploading}
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

          <SelectField
            label="Availability"
            htmlFor="availability"
            id="availability"
            placeholder="Select Availability"
            value={availability}
            onChange={setAvailability}
            options={availabilityOptions}
          />
        </div>

        {/* Image Upload Section */}
        {/* Image URL Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Image URLs</label>

          {imageUrls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/car.jpg"
                value={url}
                onChange={(e) => handleImageChange(index, e.target.value)}
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              {imageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageField(index)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addImageField}
            className="text-sm text-blue-600"
          >
            + Add another image
          </button>

          <p className="text-xs text-muted-foreground">
            Paste direct image links. First image will be the cover.
          </p>
        </div>

        {/* <div className="space-y-2">
          <MediaUpload
            onFileSelect={handleImagesSelect}
            maxFiles={5}
          />
          {images.length > 0 && (
            <p className="text-xs text-gray-500">
              {images.length} image{images.length > 1 ? 's' : ''} selected.
              The first image will be used as the cover.
            </p>
          )}
          <p className="text-xs text-amber-600">
            Note: Images will be uploaded to the server before creating the vehicle.
          </p>
        </div> */}

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