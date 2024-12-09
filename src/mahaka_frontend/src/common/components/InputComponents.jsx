import { useEffect, useRef } from "react";

// input field
export const FormFieldInput = ({
  type,
  value,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 border border-border rounded-md -z-1"></div>
      <div className="px-4">
        <input
          type={type}
          className="bg-transparent w-full my-3"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          onKeyDown={(e) => {
            const key = e.key;
            // console.log(key);
            if (type === "number" && key === "-") {
              e.preventDefault();
            }
          }}
        />
      </div>
      <div className="absolute -top-6">{label}</div>
    </div>
  );
};

// Form field textarea
export const FormFieldTextArea = ({ value, onChange, label }) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 border border-border rounded-md -z-1"></div>
      <div className="px-4">
        <textarea
          type="text"
          className="bg-transparent w-full my-3"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <div className="absolute -top-6">{label}</div>
    </div>
  );
};

// input options
export const FormFieldOptions = ({
  value,
  onChange,
  label,
  optionInit,
  options,
}) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 border border-border rounded-md -z-1"></div>
      <select
        className="px-4 py-3 w-full bg-transparent"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {optionInit && (
          <option value="" disabled className="w-full my-3 text-black">
            {optionInit}
          </option>
        )}
        {options.map((option) => (
          <option key={option.id} value={option.id} className="text-black">
            {option.Title}
          </option>
        ))}
      </select>
      {label && <div className="absolute -top-6">{label}</div>}
    </div>
  );
};

// Form field image
export const FormFieldImageUpload = ({ label, image, onChange }) => {
  const fileInputRef = useRef(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onChange(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 border border-border rounded-md -z-1"></div>
      <div className="px-4">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        <div className="px-2 py-4">
          <button
            type="button"
            onClick={triggerFileInput}
            className="bg-secondary text-white py-2 px-4 rounded-md"
          >
            Choose Image
          </button>
        </div>
      </div>
      <div className="absolute -top-6">{label}</div>
      {image && (
        <div className="mt-2 mb-4 h-48">
          <img
            src={image}
            alt="Uploaded preview"
            className="w-full h-full object-contain"
          />
        </div>
      )}
    </div>
  );
};

// Form field date picker
export const FormFieldDate = ({ value, onChange, label, minDate = "" }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      flatpickr(inputRef.current, {
        dateFormat: "Y-m-d",
        minDate: minDate,
        onChange: (selectedDates, dateStr) => {
          onChange(dateStr);
        },
      });
    }
  }, [minDate, onChange]);

  return (
    <div className="relative">
      <div className="absolute inset-0 border border-border rounded-md -z-1"></div>
      <div className="px-4">
        <input
          ref={inputRef}
          type="text"
          className="bg-transparent w-full my-3"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Select a date"
        />
      </div>
      <div className="absolute -top-6">{label}</div>
    </div>
  );
};

// Form field for time picker
export const FormFieldTime = ({ value, onChange, label }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      flatpickr(inputRef.current, {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        onChange: (selectedDates, dateStr) => {
          onChange(dateStr);
        },
      });
    }
  }, [onChange]);

  return (
    <div className="relative">
      <div className="absolute inset-0 border border-border rounded-md -z-1"></div>
      <div className="px-4">
        <input
          ref={inputRef}
          type="text"
          className="bg-transparent w-full my-3"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Select time"
        />
      </div>
      <div className="absolute -top-6">{label}</div>
    </div>
  );
};
