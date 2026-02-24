// src\api\openPlot.api.ts
import { OpenPlotFormValues } from "@/types/OpenPlots";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_URL,
  withCredentials: true,
});

export const saveOpenPlot = async (
  data: OpenPlotFormValues,
  thumbnail: File,
  images: File[],
  brochure: File
) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  formData.append("thumbnailUrl", thumbnail);
  formData.append("brochureUrl", brochure);

  images.forEach((img) => formData.append("images", img));

  const res = await api.post("/api/openPlot/saveOpenplot", formData);
  return res.data.data;
};

export const updateOpenPlot = async (
  id: string,
  data: OpenPlotFormValues,
  thumbnail?: File,
  images?: File[],
  brochure?: File,
  removedImages?: string[]
) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  if (thumbnail) formData.append("thumbnailUrl", thumbnail);
  if (brochure) formData.append("brochureUrl", brochure);

  images?.forEach((img) => formData.append("images", img));

  removedImages?.forEach((img) => {
    formData.append("removedImages", img);
  });

  const res = await api.put(`/api/openPlot/updateOpenplot/${id}`, formData);
  return res.data.data;
};
