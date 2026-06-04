export async function uploadImageToCloudinary(base64Str: string): Promise<string> {
  if (!base64Str || !base64Str.startsWith("data:image")) return base64Str;
  
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dep9ulxwa";
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "evercraft";

  const formData = new FormData();
  formData.append("file", base64Str);
  formData.append("upload_preset", uploadPreset); 
  formData.append("cloud_name", cloudName); 

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.secure_url) return data.secure_url;
    throw new Error(data.error?.message || "Upload failed");
  } catch (e) {
    console.error("Cloudinary Upload Error:", e);
    throw e;
  }
}
