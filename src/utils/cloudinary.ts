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

export function compressImage(file: File, maxSizeMB: number = 1): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      reject(new Error(`File size must be less than ${maxSizeMB}MB.`));
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        } else if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
