'use client';

import { useState } from 'react';
import { useCreateVehicle } from '@/lib/hooks/useVehicles';
import { Modal } from '../shared';
import { FormField, SelectField, TextAreaField } from '@/components/Form';
import { MakeSchema, ModelSchema, YearSchema, PriceSchema, MileageSchema } from '@/lib/schema';
import { useField } from '@/lib';
import { toast } from 'sonner';

const conditionOptions = [
  { value: 'EXCELLENT', label: 'Excellent' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'BAD', label: 'Bad' },
];

const vehicleTypeOptions = [
  { value: 'OTHER', label: 'Other' },
  { value: 'CAR', label: 'Car' },
  { value: 'SUV', label: 'SUV' },
  { value: 'TRUCK', label: 'Truck' },
  { value: 'VAN', label: 'Van' },
  { value: 'SEDAN', label: 'Sedan' },
  { value: 'COUPE', label: 'Coupe' },
  { value: 'HATCHBACK', label: 'Hatchback' },
  { value: 'WAGON', label: 'Wagon' },
  { value: 'CONVERTIBLE', label: 'Convertible' },
  { value: 'MOTORCYCLE', label: 'Motorcycle' },
];

const transmissionOptions = [
  { value: 'Automatic', label: 'Automatic' },
  { value: 'Manual', label: 'Manual' },
  { value: 'CVT', label: 'CVT' },
  { value: 'Automated Manual', label: 'Automated Manual' },
];

const fuelTypeOptions = [
  { value: 'Petrol', label: 'Petrol' },
  { value: 'Diesel', label: 'Diesel' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'Electric', label: 'Electric' },
];

const drivetrainOptions = [
  { value: 'FWD', label: 'FWD' },
  { value: 'RWD', label: 'RWD' },
  { value: 'AWD', label: 'AWD' },
  { value: '4WD', label: '4WD' },
];

const booleanOptions = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
];

const preferredContactOptions = [
  { value: 'Email', label: 'Email' },
  { value: 'Phone', label: 'Phone' },
  { value: 'WhatsApp', label: 'WhatsApp' },
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

const encodeListField = (value: string) => {
  const items = value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length === 0) return undefined;
  if (items.length === 1) return items[0];
  return JSON.stringify(items);
};

export function AddCarModal({ open, onOpenChange }: AddCarModalProps) {
  const createVehicle = useCreateVehicle();

  const { value: make, error: makeError, handleChange: handleMakeChange } =
    useField('', MakeSchema);
  const { value: model, error: modelError, handleChange: handleModelChange } =
    useField('', ModelSchema);
  const { value: year, error: yearError, handleChange: handleYearChange } =
    useField(String(new Date().getFullYear()), YearSchema);
  const { value: askingPrice, error: askingPriceError, handleChange: handleAskingPriceChange } =
    useField('', PriceSchema);
  const { value: mileage, error: mileageError, handleChange: handleMileageChange } =
    useField('', MileageSchema);

  const [vin, setVin] = useState('');
  const [vehicleType, setVehicleType] = useState('OTHER');
  const [trim, setTrim] = useState('');
  const [bodyStyle, setBodyStyle] = useState('');
  const [transmission, setTransmission] = useState('');
  const [drivetrain, setDrivetrain] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [exteriorColor, setExteriorColor] = useState('');
  const [cylinders, setCylinders] = useState('');
  const [condition, setCondition] = useState('');
  const [conditionError, setConditionError] = useState('');
  const [titleStatus, setTitleStatus] = useState('');
  const [titleStatusError, setTitleStatusError] = useState('');
  const [accidentHistory, setAccidentHistory] = useState('');
  const [accidentHistoryError, setAccidentHistoryError] = useState('');
  const [knownIssues, setKnownIssues] = useState('');
  const [keys, setKeys] = useState('');
  const [features, setFeatures] = useState('');
  const [highlights, setHighlights] = useState('');
  const [modifications, setModifications] = useState('');
  const [showAskingPrice, setShowAskingPrice] = useState('true');
  const [allowOffers, setAllowOffers] = useState('true');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [contactFirstName, setContactFirstName] = useState('');
  const [contactFirstNameError, setContactFirstNameError] = useState('');
  const [contactLastName, setContactLastName] = useState('');
  const [contactLastNameError, setContactLastNameError] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactEmailError, setContactEmailError] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactPhoneError, setContactPhoneError] = useState('');
  const [city, setCity] = useState('');
  const [cityError, setCityError] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [zipCodeError, setZipCodeError] = useState('');
  const [preferredContact, setPreferredContact] = useState('');
  const [bestTimeToReach, setBestTimeToReach] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const resetForm = () => {
    handleMakeChange(makeEvent(''));
    handleModelChange(makeEvent(''));
    handleYearChange(makeEvent(String(new Date().getFullYear())));
    handleAskingPriceChange(makeEvent(''));
    handleMileageChange(makeEvent(''));
    setVin('');
    setVehicleType('OTHER');
    setTrim('');
    setBodyStyle('');
    setTransmission('');
    setDrivetrain('');
    setFuelType('');
    setExteriorColor('');
    setCylinders('');
    setCondition('');
    setConditionError('');
    setTitleStatus('');
    setTitleStatusError('');
    setAccidentHistory('');
    setAccidentHistoryError('');
    setKnownIssues('');
    setKeys('');
    setFeatures('');
    setHighlights('');
    setModifications('');
    setShowAskingPrice('true');
    setAllowOffers('true');
    setAdditionalNotes('');
    setContactFirstName('');
    setContactFirstNameError('');
    setContactLastName('');
    setContactLastNameError('');
    setContactEmail('');
    setContactEmailError('');
    setContactPhone('');
    setContactPhoneError('');
    setCity('');
    setCityError('');
    setZipCode('');
    setZipCodeError('');
    setPreferredContact('');
    setBestTimeToReach('');
    setFiles([]);
  };

  const validateForm = () => {
    let isValid = true;

    if (!condition) {
      setConditionError('Condition is required');
      isValid = false;
    }

    if (!titleStatus.trim()) {
      setTitleStatusError('Title status is required');
      isValid = false;
    } else {
      setTitleStatusError('');
    }

    if (!accidentHistory.trim()) {
      setAccidentHistoryError('Accident history is required');
      isValid = false;
    } else {
      setAccidentHistoryError('');
    }

    if (!contactFirstName.trim()) {
      setContactFirstNameError('First name is required');
      isValid = false;
    } else {
      setContactFirstNameError('');
    }

    if (!contactLastName.trim()) {
      setContactLastNameError('Last name is required');
      isValid = false;
    } else {
      setContactLastNameError('');
    }

    if (!contactEmail.trim()) {
      setContactEmailError('Email is required');
      isValid = false;
    } else {
      setContactEmailError('');
    }

    if (!contactPhone.trim()) {
      setContactPhoneError('Phone is required');
      isValid = false;
    } else {
      setContactPhoneError('');
    }

    if (!city.trim()) {
      setCityError('City is required');
      isValid = false;
    } else {
      setCityError('');
    }

    if (!zipCode.trim()) {
      setZipCodeError('Zip code is required');
      isValid = false;
    } else {
      setZipCodeError('');
    }

    if (files.length > 10) {
      toast.error('You can upload at most 10 files');
      isValid = false;
    }

    return (
      isValid &&
      !makeError &&
      !modelError &&
      !yearError &&
      !askingPriceError &&
      !mileageError
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []).slice(0, 10);
    setFiles(nextFiles);
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append('year', year);
    formData.append('make', make.trim());
    formData.append('model', model.trim());
    formData.append('askingPrice', askingPrice);
    formData.append('mileage', mileage);
    formData.append('condition', condition);
    formData.append('titleStatus', encodeListField(titleStatus) ?? titleStatus.trim());
    formData.append('accidentHistory', accidentHistory.trim());
    formData.append('contactFirstName', contactFirstName.trim());
    formData.append('contactLastName', contactLastName.trim());
    formData.append('contactEmail', contactEmail.trim());
    formData.append('contactPhone', contactPhone.trim());
    formData.append('city', city.trim());
    formData.append('zipCode', zipCode.trim());
    formData.append('vehicleType', vehicleType || 'OTHER');
    formData.append('showAskingPrice', showAskingPrice);
    formData.append('allowOffers', allowOffers);

    if (vin.trim()) formData.append('vin', vin.trim());
    if (trim.trim()) formData.append('trim', trim.trim());
    if (bodyStyle.trim()) formData.append('bodyStyle', bodyStyle.trim());
    if (transmission) formData.append('transmission', transmission);
    if (drivetrain) formData.append('drivetrain', drivetrain);
    if (fuelType) formData.append('fuelType', fuelType);
    if (exteriorColor.trim()) formData.append('exteriorColor', exteriorColor.trim());
    if (cylinders.trim()) formData.append('cylinders', cylinders.trim());
    if (keys.trim()) formData.append('keys', keys.trim());
    if (modifications.trim()) formData.append('modifications', modifications.trim());
    if (additionalNotes.trim()) formData.append('additionalNotes', additionalNotes.trim());
    if (preferredContact) formData.append('preferredContact', preferredContact);
    if (bestTimeToReach.trim()) formData.append('bestTimeToReach', bestTimeToReach.trim());

    const knownIssuesValue = encodeListField(knownIssues);
    if (knownIssuesValue) formData.append('knownIssues', knownIssuesValue);

    const featuresValue = encodeListField(features);
    if (featuresValue) formData.append('features', featuresValue);

    const highlightsValue = encodeListField(highlights);
    if (highlightsValue) formData.append('highlights', highlightsValue);

    files.forEach((file) => formData.append('files', file));

    createVehicle.mutate(formData, {
      onSuccess: () => {
        resetForm();
        onOpenChange(false);
      },
      onError: (error: unknown) => {
        const message =
          error instanceof Error ? error.message : 'Failed to submit vehicle';
        toast.error(message);
      },
    });
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Submit Seller Vehicle"
      description="Send the seller vehicle submission payload as multipart/form-data, including contact details and optional media."
      size="lg"
      showFooter
      onConfirm={handleSubmit}
      confirmText="Submit Vehicle"
      isLoading={createVehicle.isPending}
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div className="grid gap-4 sm:grid-cols-2">
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
            required
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
            required
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
            required
            reqValue="*"
          />

          <FormField
            label="Asking Price (USD)"
            id="askingPrice"
            htmlFor="askingPrice"
            type="number"
            placeholder="18500"
            value={askingPrice}
            onChange={handleAskingPriceChange}
            isInvalid={!!askingPriceError}
            errorMessage={askingPriceError}
            required
            reqValue="*"
          />

          <FormField
            label="Mileage"
            id="mileage"
            htmlFor="mileage"
            type="number"
            placeholder="45000"
            value={mileage}
            onChange={handleMileageChange}
            isInvalid={!!mileageError}
            errorMessage={mileageError}
            required
            reqValue="*"
          />

          <FormField
            label="VIN"
            id="vin"
            type="text"
            htmlFor="vin"
            placeholder="Leave blank to auto-generate"
            value={vin}
            onChange={setVin}
          />

          <SelectField
            label="Condition"
            htmlFor="condition"
            id="condition"
            placeholder="Select condition"
            isInvalid={!!conditionError}
            errorMessage={conditionError}
            value={condition}
            onChange={(value) => {
              setCondition(value);
              setConditionError('');
            }}
            options={conditionOptions}
            required
            reqValue="*"
          />

          <SelectField
            label="Vehicle Type"
            htmlFor="vehicleType"
            id="vehicleType"
            placeholder="Select vehicle type"
            value={vehicleType}
            onChange={setVehicleType}
            options={vehicleTypeOptions}
            isInvalid={false}
            errorMessage=""
          />

          <FormField
            label="Trim"
            id="trim"
            type="text"
            htmlFor="trim"
            placeholder="XSE"
            value={trim}
            onChange={setTrim}
          />

          <FormField
            label="Body Style"
            id="bodyStyle"
            type="text"
            htmlFor="bodyStyle"
            placeholder="Sedan"
            value={bodyStyle}
            onChange={setBodyStyle}
          />

          <SelectField
            label="Transmission"
            htmlFor="transmission"
            id="transmission"
            placeholder="Select transmission"
            value={transmission}
            onChange={setTransmission}
            isInvalid={false}
            errorMessage=""
            options={transmissionOptions}
          />

          <SelectField
            label="Drivetrain"
            htmlFor="drivetrain"
            id="drivetrain"
            placeholder="Select drivetrain"
            value={drivetrain}
            onChange={setDrivetrain}
            isInvalid={false}
            errorMessage=""
            options={drivetrainOptions}
          />

          <SelectField
            label="Fuel Type"
            htmlFor="fuelType"
            id="fuelType"
            placeholder="Select fuel type"
            value={fuelType}
            onChange={setFuelType}
            isInvalid={false}
            errorMessage=""
            options={fuelTypeOptions}
          />

          <FormField
            label="Exterior Color"
            id="exteriorColor"
            type="text"
            htmlFor="exteriorColor"
            placeholder="Silver"
            value={exteriorColor}
            onChange={setExteriorColor}
          />

          <FormField
            label="Cylinders"
            id="cylinders"
            type="number"
            htmlFor="cylinders"
            placeholder="4"
            value={cylinders}
            onChange={setCylinders}
          />

          <FormField
            label="Keys"
            id="keys"
            type="number"
            htmlFor="keys"
            placeholder="2"
            value={keys}
            onChange={setKeys}
          />

          <SelectField
            label="Show Asking Price"
            htmlFor="showAskingPrice"
            id="showAskingPrice"
            value={showAskingPrice}
            onChange={setShowAskingPrice}
            options={booleanOptions}
            isInvalid={false}
            errorMessage=""
          />

          <SelectField
            label="Allow Offers"
            htmlFor="allowOffers"
            id="allowOffers"
            value={allowOffers}
            onChange={setAllowOffers}
            options={booleanOptions}
            isInvalid={false}
            errorMessage=""
          />

          <FormField
            label="Contact First Name"
            id="contactFirstName"
            type="text"
            htmlFor="contactFirstName"
            placeholder="John"
            value={contactFirstName}
            onChange={(value) => {
              setContactFirstName(value);
              setContactFirstNameError('');
            }}
            isInvalid={!!contactFirstNameError}
            errorMessage={contactFirstNameError}
            required
            reqValue="*"
          />

          <FormField
            label="Contact Last Name"
            id="contactLastName"
            type="text"
            htmlFor="contactLastName"
            placeholder="Doe"
            value={contactLastName}
            onChange={(value) => {
              setContactLastName(value);
              setContactLastNameError('');
            }}
            isInvalid={!!contactLastNameError}
            errorMessage={contactLastNameError}
            required
            reqValue="*"
          />

          <FormField
            label="Contact Email"
            id="contactEmail"
            type="email"
            htmlFor="contactEmail"
            placeholder="john@example.com"
            value={contactEmail}
            onChange={(value) => {
              setContactEmail(value);
              setContactEmailError('');
            }}
            isInvalid={!!contactEmailError}
            errorMessage={contactEmailError}
            required
            reqValue="*"
          />

          <FormField
            label="Contact Phone"
            id="contactPhone"
            type="text"
            htmlFor="contactPhone"
            placeholder="+2348012345678"
            value={contactPhone}
            onChange={(value) => {
              setContactPhone(value);
              setContactPhoneError('');
            }}
            isInvalid={!!contactPhoneError}
            errorMessage={contactPhoneError}
            required
            reqValue="*"
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
            required
            reqValue="*"
          />

          <FormField
            label="Zip Code"
            id="zipCode"
            type="text"
            htmlFor="zipCode"
            placeholder="100001"
            value={zipCode}
            onChange={(value) => {
              setZipCode(value);
              setZipCodeError('');
            }}
            isInvalid={!!zipCodeError}
            errorMessage={zipCodeError}
            required
            reqValue="*"
          />

          <SelectField
            label="Preferred Contact"
            htmlFor="preferredContact"
            id="preferredContact"
            placeholder="Select preferred contact"
            value={preferredContact}
            onChange={setPreferredContact}
            options={preferredContactOptions}
            isInvalid={false}
            errorMessage=""
          />

          <FormField
            label="Best Time To Reach"
            id="bestTimeToReach"
            type="text"
            htmlFor="bestTimeToReach"
            placeholder="Morning"
            value={bestTimeToReach}
            onChange={setBestTimeToReach}
          />
        </div>

        <TextAreaField
          label="Title Status"
          htmlFor="titleStatus"
          id="titleStatus"
          placeholder="Clean title, lien free"
          value={titleStatus}
          onChange={(value) => {
            setTitleStatus(value);
            setTitleStatusError('');
          }}
          isInvalid={!!titleStatusError}
          errorMessage={titleStatusError}
          required
          rows={4}
          disableAutosize
          fixedHeightClassName="h-32"
        />

        <TextAreaField
          label="Accident History"
          htmlFor="accidentHistory"
          id="accidentHistory"
          placeholder="No accidents"
          value={accidentHistory}
          onChange={(value) => {
            setAccidentHistory(value);
            setAccidentHistoryError('');
          }}
          isInvalid={!!accidentHistoryError}
          errorMessage={accidentHistoryError}
          required
          rows={4}
          disableAutosize
          fixedHeightClassName="h-32"
        />

        <TextAreaField
          label="Known Issues"
          htmlFor="knownIssues"
          id="knownIssues"
          placeholder="Engine ticking"
          value={knownIssues}
          onChange={setKnownIssues}
          isInvalid={false}
          errorMessage=""
          rows={4}
          disableAutosize
          fixedHeightClassName="h-32"
        />

        <TextAreaField
          label="Features"
          htmlFor="features"
          id="features"
          placeholder="Sunroof, Leather seats"
          value={features}
          onChange={setFeatures}
          isInvalid={false}
          errorMessage=""
          rows={5}
          disableAutosize
          fixedHeightClassName="h-40"
        />

        <TextAreaField
          label="Highlights"
          htmlFor="highlights"
          id="highlights"
          placeholder="New brakes installed 2024"
          value={highlights}
          onChange={setHighlights}
          isInvalid={false}
          errorMessage=""
          rows={5}
          disableAutosize
          fixedHeightClassName="h-40"
        />

        <TextAreaField
          label="Additional Notes"
          htmlFor="additionalNotes"
          id="additionalNotes"
          placeholder="Will consider reasonable offers"
          value={additionalNotes}
          onChange={setAdditionalNotes}
          isInvalid={false}
          errorMessage=""
          rows={5}
          disableAutosize
          fixedHeightClassName="h-40"
        />

        <FormField
          label="Modifications"
          id="modifications"
          type="text"
          htmlFor="modifications"
          placeholder="Aftermarket exhaust"
          value={modifications}
          onChange={setModifications}
        />

        <div className="space-y-2">
          <label htmlFor="files" className="text-sm font-medium">
            Images / Videos
          </label>
          <input
            id="files"
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            className="block w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Upload up to 10 files. They will be sent as repeated `files` fields in multipart form data.
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
