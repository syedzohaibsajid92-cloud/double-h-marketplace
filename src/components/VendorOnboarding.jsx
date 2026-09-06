import React, { useState } from "react";
import {
  Store,
  Mail,
  Phone,
  MapPin,
  Building2,
  Globe,
  Image as ImageIcon,
  FileText,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import {
  CITIES,
  COUNTRIES,
  EMPTY_VENDOR_FORM,
  EMPTY_VERIFICATION_FORM,
  isValidCnic,
  sanitizeCnicInput,
} from "../data/vendors";
import { isValidEmail, isValidPhone, sanitizePhoneInput } from "../data/users";

export default function VendorOnboarding({
  currentUser,
  onCancel,
  onComplete,
  onFinish,
}) {
  const [step, setStep] = useState(1); // 1 = business info, 2 = verification, 3 = done
  const [form, setForm] = useState({
    ...EMPTY_VENDOR_FORM,
    business_email: currentUser.email,
  });
  const [errors, setErrors] = useState({});
  const [verification, setVerification] = useState(EMPTY_VERIFICATION_FORM);
  const [verificationErrors, setVerificationErrors] = useState({});

  function handleChange(field, value) {
    const clean =
      field === "business_phone" ? sanitizePhoneInput(value) : value;
    setForm((prev) => ({ ...prev, [field]: clean }));
  }

  function validateStep1() {
    const errs = {};
    if (!form.business_name.trim())
      errs.business_name = "Business name is required.";
    if (!form.business_email.trim())
      errs.business_email = "Business email is required.";
    else if (!isValidEmail(form.business_email))
      errs.business_email = "Enter a valid email.";
    if (!form.business_phone.trim())
      errs.business_phone = "Business phone is required.";
    else if (!isValidPhone(form.business_phone))
      errs.business_phone = "Enter an 11-digit number starting with 0.";
    if (!form.business_address.trim())
      errs.business_address = "Business address is required.";
    if (!form.city.trim()) errs.city = "City is required.";
    if (!form.country.trim()) errs.country = "Country is required.";
    return errs;
  }

  function handleStep1Submit(e) {
    e.preventDefault();
    const errs = validateStep1();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setStep(2);
  }

  function validateStep2() {
    const errs = {};
    if (!verification.cnic_number.trim())
      errs.cnic_number = "CNIC number is required.";
    else if (!isValidCnic(verification.cnic_number))
      errs.cnic_number = "Format: 12345-1234567-1";
    if (!verification.verification_document_url.trim())
      errs.verification_document_url = "Attach a document (file name or URL).";
    return errs;
  }

  function handleStep2Submit(e) {
    e.preventDefault();
    const errs = validateStep2();
    setVerificationErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setStep(3);
    onComplete({ ...form, ...verification });
  }

  const onVericiationDocumentUpload = (e) => {
    const file = event.target.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      // reader.result = data:application/pdf;base64,JVBERi0xLjQ...

      const base64 = reader.result.split(",")[1];
      const payload = {
        type: "application/pdf",
        content: base64,
      };
      console.log(payload);
      setVerification((prev) => ({ ...prev, verification_document_url: base64 }));
    };

    reader.onerror = (error) => {
      console.error("FileReader error:", error);
    };

    reader.readAsDataURL(file); // <-- THIS IS REQUIRED
  };
  return (
    <div className="page vendor-onboarding-page">
      <div className="onboarding-card">
        {step !== 3 && (
          <button className="back-link" onClick={onCancel}>
            <ArrowLeft size={15} /> Back to store
          </button>
        )}

        <div className="onboarding-steps">
          <span className={`onboarding-step ${step >= 1 ? "active" : ""}`}>
            1. Business Info
          </span>
          <span className={`onboarding-step ${step >= 2 ? "active" : ""}`}>
            2. Verification
          </span>
          <span className={`onboarding-step ${step >= 3 ? "active" : ""}`}>
            3. Submitted
          </span>
        </div>

        {step === 1 && (
          <>
            <h1 className="auth-title">
              <Store size={18} /> Become a Vendor
            </h1>
            <p className="auth-subtitle">
              Tell us about your business. You'll stay a customer too — vendor
              tools appear alongside your regular account once this is
              submitted.
            </p>

            <form className="auth-form" onSubmit={handleStep1Submit}>
              <label className="auth-field">
                <span>
                  <Building2 size={14} /> Business name
                </span>
                <input
                  type="text"
                  placeholder="e.g. Steel Traders Lahore"
                  value={form.business_name}
                  onChange={(e) =>
                    handleChange("business_name", e.target.value)
                  }
                />
                {errors.business_name && (
                  <em className="auth-field-error">{errors.business_name}</em>
                )}
              </label>

              <div className="auth-field-row">
                <label className="auth-field">
                  <span>
                    <Mail size={14} /> Business email
                  </span>
                  <input
                    type="email"
                    placeholder="business@example.com"
                    value={form.business_email}
                    onChange={(e) =>
                      handleChange("business_email", e.target.value)
                    }
                  />
                  {errors.business_email && (
                    <em className="auth-field-error">
                      {errors.business_email}
                    </em>
                  )}
                </label>

                <label className="auth-field">
                  <span>
                    <Phone size={14} /> Business phone
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={11}
                    placeholder="03XXXXXXXXX"
                    value={form.business_phone}
                    onChange={(e) =>
                      handleChange("business_phone", e.target.value)
                    }
                  />
                  {errors.business_phone && (
                    <em className="auth-field-error">
                      {errors.business_phone}
                    </em>
                  )}
                </label>
              </div>

              <label className="auth-field">
                <span>
                  <MapPin size={14} /> Business address
                </span>
                <input
                  type="text"
                  placeholder="Street, area"
                  value={form.business_address}
                  onChange={(e) =>
                    handleChange("business_address", e.target.value)
                  }
                />
                {errors.business_address && (
                  <em className="auth-field-error">
                    {errors.business_address}
                  </em>
                )}
              </label>

              <div className="auth-field-row">
                <label className="auth-field">
                  <span>
                    <MapPin size={14} /> City
                  </span>
                  <select
                    value={form.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                  >
                    <option value="">Select city</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.city && (
                    <em className="auth-field-error">{errors.city}</em>
                  )}
                </label>

                <label className="auth-field">
                  <span>
                    <Globe size={14} /> Country
                  </span>
                  <select
                    value={form.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="auth-field">
                <span>
                  <FileText size={14} /> Description <small>(optional)</small>
                </span>
                <textarea
                  rows={3}
                  placeholder="What does your business sell?"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </label>

              <div className="auth-field-row">
                <label className="auth-field">
                  <span>
                    <ImageIcon size={14} /> Logo URL <small>(optional)</small>
                  </span>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={form.logo_url}
                    onChange={(e) => handleChange("logo_url", e.target.value)}
                  />
                </label>

                <label className="auth-field">
                  <span>
                    <Globe size={14} /> Website URL <small>(optional)</small>
                  </span>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={form.website_url}
                    onChange={(e) =>
                      handleChange("website_url", e.target.value)
                    }
                  />
                </label>
              </div>

              <button type="submit" className="btn btn-primary auth-submit">
                Continue to Verification <ArrowRight size={15} />
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="auth-title">
              <ShieldCheck size={18} /> Submit Verification Documents
            </h1>
            <p className="auth-subtitle">
              We verify every vendor's identity before their products go live.
              This is a demo — type any file name to simulate an upload.
            </p>

            <form className="auth-form" onSubmit={handleStep2Submit}>
              <label className="auth-field">
                <span>
                  <ShieldCheck size={14} /> CNIC number
                </span>
                <input
                  type="text"
                  placeholder="12345-1234567-1"
                  maxLength={15}
                  value={verification.cnic_number}
                  onChange={(e) =>
                    setVerification((prev) => ({
                      ...prev,
                      cnic_number: sanitizeCnicInput(e.target.value),
                    }))
                  }
                />
                {verificationErrors.cnic_number && (
                  <em className="auth-field-error">
                    {verificationErrors.cnic_number}
                  </em>
                )}
              </label>

              <label className="auth-field">
                <span>
                  <FileText size={14} /> Verification document
                </span>
                <input
                  type="file"
                  placeholder="cnic-front-back.pdf"
                  accept=".pdf,application/pdf"
                  onChange={onVericiationDocumentUpload}
                />
                {verificationErrors.verification_document_url && (
                  <em className="auth-field-error">
                    {verificationErrors.verification_document_url}
                  </em>
                )}
              </label>

              <div className="onboarding-nav">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft size={15} /> Back
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit for Review <ArrowRight size={15} />
                </button>
              </div>
            </form>
          </>
        )}

        {step === 3 && (
          <div className="onboarding-done">
            <CheckCircle2 size={40} className="onboarding-done-icon" />
            <h1 className="auth-title" style={{ justifyContent: "center" }}>
              Application Submitted
            </h1>
            <p className="auth-subtitle" style={{ textAlign: "center" }}>
              Your vendor account has been created with a{" "}
              <strong>Pending</strong> approval status. You can already open the
              Vendor Dashboard to set up your profile and add products — they'll
              appear on the storefront as soon as an admin approves your
              account.
            </p>
            <button className="btn btn-primary auth-submit" onClick={onFinish}>
              Go to Vendor Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
