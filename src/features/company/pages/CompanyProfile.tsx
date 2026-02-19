import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import CompanyPageContainer from "@/features/company/components/CompanyPageContainer";
import {
  COMPANY_INPUT_STYLES,
  COMPANY_SELECT_STYLES,
  COMPANY_TEXTAREA_STYLES,
} from "@/features/company/components/companyFormStyles";
import Card, { CardContent, CardTitle } from "@/components/common/Card";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Alert from "@/components/common/Alert";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Badge from "@/components/common/Badge";
import { useNotification } from "@/contexts/NotificationContext";
import { api, fetchApi } from "@/services/api/client";
import { getMediaUrl } from "@/services/media";
import { Company, CompanyStatus } from "@/types";
import { useAuthContext } from "@/contexts/AuthContext";
import { Globe, Linkedin, Twitter } from "lucide-react";

interface CompanyProfileFormValues {
  name: string;
  description: string;
  industry: string;
  size: string;
  website: string;
  linkedin: string;
  twitter: string;
  foundedYear: string;
}

const INDUSTRY_OPTIONS = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Consulting",
  "Media & Entertainment",
  "Consumer Goods",
  "Other",
];

const COMPANY_SIZE_OPTIONS = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

const CURRENT_YEAR = new Date().getFullYear();
const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_FILE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const CARD_BASE_CLASSES = "bg-white border border-gray-200 rounded-xl shadow-sm";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return "";
  }
})();

// Check if a string looks like an S3 key (not a URL)
const isS3Key = (value: string): boolean => {
  // S3 keys don't start with http, blob, data, or //
  return !/^(https?:|blob:|data:|\/\/)/i.test(value);
};

const resolveLogoUrl = (logo?: string | null): string | null => {
  if (!logo) return null;

  const sanitized = logo.replace(/\\/g, "/");

  if (/^(https?:|blob:|data:)/i.test(sanitized)) {
    return sanitized;
  }

  if (sanitized.startsWith("//")) {
    return `${window.location.protocol}${sanitized}`;
  }

  if (!API_ORIGIN) {
    return sanitized;
  }

  if (sanitized.startsWith("/")) {
    return `${API_ORIGIN}${sanitized}`;
  }

  return `${API_ORIGIN}/${sanitized}`;
};

// Async version that handles S3 keys
const resolveLogoUrlAsync = async (logo?: string | null): Promise<string | null> => {
  if (!logo) return null;

  const sanitized = logo.replace(/\\/g, "/");

  // If it looks like an S3 key, fetch the presigned URL
  if (isS3Key(sanitized)) {
    return getMediaUrl(sanitized);
  }

  // Otherwise use the sync resolver
  return resolveLogoUrl(logo);
};

function mapProfileToFormValues(
  profile: Company | null,
): CompanyProfileFormValues {
  return {
    name: profile?.name ?? "",
    description: profile?.description ?? "",
    industry: profile?.industry ?? "",
    size: profile?.size ?? "",
    website: profile?.website ?? "",
    linkedin: profile?.socialLinks?.linkedin ?? "",
    twitter: profile?.socialLinks?.twitter ?? "",
    foundedYear: profile?.foundedYear ? String(profile.foundedYear) : "",
  };
}

const isValidUrl = (value: string) => {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export default function CompanyProfile() {
  const { success, error: showError } = useNotification();
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<CompanyProfileFormValues>({
    defaultValues: mapProfileToFormValues(null),
  });

  const watchedValues = watch();

  const isNameReadOnly = user?.company?.status === CompanyStatus.APPROVED;
  const nameFieldOptions = isNameReadOnly
    ? {}
    : {
        required: "Company name is required",
      };

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setSubmitError(null);
    try {
     const response = await api.get<{ profile: Company }>("/company/profile");
const data = response.profile;

setProfile(data);



      const mappedValues = mapProfileToFormValues(data);
      if (!mappedValues.name && user?.company?.name) {
        mappedValues.name = user.company.name;
      }
      reset(mappedValues);
      const logoUrl = await resolveLogoUrlAsync(data.logo);
      setLogoPreview(logoUrl);
      setLogoFile(null);
      setLogoError(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load company profile.";
      setSubmitError(message);
    } finally {
      setIsLoading(false);
    }
  }, [reset, user?.company?.name]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const lockedCompanyName = profile?.name ?? user?.company?.name ?? "";

  useEffect(() => {
    if (isNameReadOnly) {
      setValue("name", lockedCompanyName, { shouldDirty: false });
    }
  }, [isNameReadOnly, lockedCompanyName, setValue]);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setLogoError("Logo must be a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > MAX_LOGO_SIZE) {
      setLogoError("Logo file size must be under 2MB.");
      return;
    }

    if (logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoError(null);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleReset = async () => {
    if (!profile) return;
    reset(mapProfileToFormValues(profile));
    const logoUrl = await resolveLogoUrlAsync(profile.logo);
    setLogoPreview(logoUrl);
    setLogoFile(null);
    setLogoError(null);
  };

  const onSubmit = async (values: CompanyProfileFormValues) => {
    setSubmitError(null);
    setIsSaving(true);
    try {
      const normalizedName = values.name?.trim?.() || "";
      const payload = {
        ...(isNameReadOnly ? {} : { name: normalizedName }),
        description: values.description.trim() || null,
        industry: values.industry || null,
        size: values.size || null,
        website: values.website || null,
        socialLinks: {
          linkedin: values.linkedin || null,
          twitter: values.twitter || null,
        },
        foundedYear: values.foundedYear ? Number(values.foundedYear) : null,
      };

      await api.patch("/company/profile", payload);

      if (logoFile) {
        const formData = new FormData();
        formData.append("logo", logoFile);
        await fetchApi("/company/profile/logo", {
          method: "POST",
          body: formData,
        });
      }

      success("Company profile updated successfully");
      await loadProfile();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile.";
      setSubmitError(message);
      showError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const previewName =
    (isNameReadOnly ? lockedCompanyName : watchedValues.name) ||
    profile?.name ||
    user?.company?.name ||
    "Company";
  const previewDescription = watchedValues.description;
  const previewIndustry = watchedValues.industry;
  const previewSize = watchedValues.size;
  const previewFoundedYear = watchedValues.foundedYear;
  const previewWebsite = watchedValues.website;
  const previewLinkedin = watchedValues.linkedin;
  const previewTwitter = watchedValues.twitter;

  const showPreview = Boolean(profile);

  return (
    <CompanyPageContainer
      title="Company Profile"
      description="Update the information students see on your public profile."
    >
      {submitError && (
        <Alert variant="error" className="mb-6">
          {submitError}
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className={CARD_BASE_CLASSES}>
            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 text-gray-900"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center gap-4">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt={previewName}
                        className="w-24 h-24 object-cover rounded-full border border-gray-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-medium text-gray-500">
                        No Logo
                      </div>
                    )}
                    <div className="text-center">
                      <label className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 cursor-pointer hover:border-blue-400 hover:text-blue-600 transition-colors">
                        Upload Logo
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleLogoChange}
                        />
                      </label>
                      <p className="mt-2 text-xs text-gray-500">
                        JPG, PNG, or WEBP up to 2MB
                      </p>
                      {logoError && (
                        <p className="mt-1 text-xs text-destructive">
                          {logoError}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    {isNameReadOnly ? (
                      <div>
                        <input type="hidden" {...register("name")} />
                        <Input
                          label="Company Name"
                          value={lockedCompanyName}
                          readOnly
                          disabled
                          className={COMPANY_INPUT_STYLES}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Company name is locked after approval. Contact support
                          to request changes.
                        </p>
                      </div>
                    ) : (
                      <Input
                        label="Company Name"
                        {...register("name", nameFieldOptions)}
                        error={errors.name?.message}
                        placeholder="Enter your company name"
                        className={COMPANY_INPUT_STYLES}
                      />
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        {...register("description", {
                          maxLength: {
                            value: 1000,
                            message:
                              "Description must be under 1000 characters",
                          },
                        })}
                        rows={5}
                        className={`${COMPANY_TEXTAREA_STYLES} ${
                          errors.description
                            ? "border-destructive/70 focus:ring-destructive/40 focus:border-destructive"
                            : ""
                        }`}
                        placeholder="Share your mission, culture, and what makes your company unique..."
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-destructive">
                          {errors.description.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <select
                      {...register("industry")}
                      value={watch("industry") || ""}
                      className={COMPANY_SELECT_STYLES}
                    >
                      <option value="">Select industry</option>
                      {INDUSTRY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Size
                    </label>
                    <select
                      {...register("size")}
                      value={watch("size") || ""}
                      className={COMPANY_SELECT_STYLES}
                    >
                      <option value="">Select size</option>
                      {COMPANY_SIZE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Website"
                    type="url"
                    placeholder="https://example.com"
                    {...register("website", {
                      validate: (value) =>
                        isValidUrl(value) ||
                        "Enter a valid URL (https://example.com)",
                    })}
                    error={errors.website?.message}
                    className={COMPANY_INPUT_STYLES}
                  />
                  <Input
                    label="Founded Year"
                    type="number"
                    placeholder="2008"
                    {...register("foundedYear", {
                      validate: (value) => {
                        if (!value) return true;
                        const year = Number(value);
                        if (Number.isNaN(year)) return "Enter a valid year";
                        if (year < 1800 || year > CURRENT_YEAR) {
                          return `Year must be between 1800 and ${CURRENT_YEAR}`;
                        }
                        return true;
                      },
                    })}
                    error={errors.foundedYear?.message}
                    className={COMPANY_INPUT_STYLES}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="LinkedIn"
                    type="url"
                    placeholder="https://linkedin.com/company/your-company"
                    {...register("linkedin", {
                      validate: (value) =>
                        isValidUrl(value) || "Enter a valid LinkedIn URL",
                    })}
                    error={errors.linkedin?.message}
                    className={COMPANY_INPUT_STYLES}
                  />
                  <Input
                    label="Twitter"
                    type="url"
                    placeholder="https://twitter.com/your-company"
                    {...register("twitter", {
                      validate: (value) =>
                        isValidUrl(value) || "Enter a valid Twitter URL",
                    })}
                    error={errors.twitter?.message}
                    className={COMPANY_INPUT_STYLES}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="submit"
                    isLoading={isSaving}
                    disabled={isSaving}
                  >
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={isSaving || !profile || (!isDirty && !logoFile)}
                  >
                    Cancel
                  </Button>
                  <p className="text-sm text-gray-500">
                    Your updates are visible to students once approved by admin
                    moderators.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className={CARD_BASE_CLASSES}>
            <CardContent>
              <CardTitle className="mb-4 text-gray-900">
                Public Preview
              </CardTitle>
              {showPreview ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt={previewName}
                        className="w-20 h-20 object-cover rounded-2xl border border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-medium text-gray-500">
                        No Logo
                      </div>
                    )}
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {previewName}
                      </p>
                      {previewIndustry && (
                        <Badge variant="secondary">{previewIndustry}</Badge>
                      )}
                    </div>
                  </div>
                  {previewDescription ? (
                    <p className="text-sm text-gray-600 line-clamp-5">
                      {previewDescription}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      Add a description to tell students more about your mission
                      and team.
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-gray-600">
                    {previewSize && (
                      <p>
                        <span className="font-medium text-gray-900">
                          Company Size:
                        </span>{" "}
                        {previewSize} people
                      </p>
                    )}
                    {previewFoundedYear && (
                      <p>
                        <span className="font-medium text-gray-900">
                          Founded:
                        </span>{" "}
                        {previewFoundedYear}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    {previewWebsite && (
                      <a
                        href={previewWebsite}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Globe className="h-4 w-4" />
                        Visit Website
                      </a>
                    )}
                    {previewLinkedin && (
                      <a
                        href={previewLinkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </a>
                    )}
                    {previewTwitter && (
                      <a
                        href={previewTwitter}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Twitter className="h-4 w-4" />
                        Twitter
                      </a>
                    )}
                    {!previewWebsite && !previewLinkedin && !previewTwitter && (
                      <p className="text-sm text-gray-500">
                        Add website or social links so students can learn more
                        about you.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500">
                  Fill out your company information to see how it will appear to
                  students.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </CompanyPageContainer>
  );
}
