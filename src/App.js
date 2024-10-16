// App.js
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('image', image);
    formData.append('text', text);

    try {
      const response = await axios.post('http://localhost:5000/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data.result);
    } catch (error) {
      console.error('Error processing image:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold">Image Text Adder</h1>
            </div>
            <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="flex flex-col">
                  <label className="leading-loose">Upload Image</label>
                  <input type="file" onChange={handleImageChange} className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600" />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Text to Add</label>
                  <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600" />
                </div>
              </div>
              <div className="pt-4 flex items-center space-x-4">
                <button className="bg-blue-500 flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none">Process Image</button>
              </div>
            </form>
            {result && (
              <div className="mt-6">
                <img src={`data:image/jpeg;base64,${result}`} alt="Processed" className="w-full" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 