
export const fileToBase64 = (file: File): Promise<{ data: string; mimeType: 'image/png' }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        
        ctx.drawImage(img, 0, 0);
        
        try {
          const dataUrl = canvas.toDataURL('image/png');
          const base64 = dataUrl.split(',')[1];
          if (!base64) {
            return reject(new Error('Failed to extract base64 data from canvas.'));
          }
          resolve({ data: base64, mimeType: 'image/png' });
        } catch (e) {
          reject(new Error(`Failed to convert canvas to data URL: ${e}`));
        }
      };
      
      img.onerror = (error) => {
        reject(new Error(`Image failed to load: ${error}`));
      };
      
      if (event.target?.result) {
        img.src = event.target.result as string;
      } else {
        reject(new Error('FileReader did not successfully read the file.'));
      }
    };
    
    reader.onerror = (error) => {
      reject(new Error(`FileReader error: ${error}`));
    };
    
    reader.readAsDataURL(file);
  });
};
