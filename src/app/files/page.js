'use client';

import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../lib/firebase'; // Adjust the import path as needed
import { v4 as uuidv4 } from 'uuid';

export default function FileUploadPage() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');

  const handleUpload = async () => {
    if (!file) return alert('Please select a file first');

    const fileRef = ref(storage, `uploads/${uuidv4()}-${file.name}`);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    setUrl(downloadURL);
    alert('File uploaded successfully!');
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>📁 Upload Notes or Posters</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <br />
      <button onClick={handleUpload}>Upload</button>
      {url && (
        <p>
          File URL: <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
        </p>
      )}
    </div>
  );
}
