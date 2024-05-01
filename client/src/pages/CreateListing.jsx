import React, { useState } from 'react'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import { useNavigate  }from 'react-router-dom';

export default function CreateListing() {

  const {currentUser} = useSelector(state => state.user);
  const navigate = useNavigate();

   const [files, setFiles] = useState([]);
   const [formdata, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountedPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  })
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  console.log(formdata);



    const handleImageSubmit = (e) => {
      if(files.length > 0 && files.length + formdata.imageUrls.length < 7 ){
        setUploading(true);
        setImageUploadError(false);
        const promises = [];

        for (let i = 0; i < files.length; i++){
          promises.push(storeImage(files[i]));
        }
        Promise.all(promises).then((urls) => {
          setFormData({ ...formdata, imageUrls: formdata.imageUrls.concat(urls) }); // concat lines only keeps new images rest is same
          setImageUploadError(false);
          setUploading(false);   
          
        }).catch((error) => {
          setImageUploadError('Image upload failed (2 mb max per image)');
          setUploading(false);
        })
      }
      else{
        setImageUploadError('You can only upload 6 images per listing');
        setUploading(false);
      }

    }

    const storeImage = async (file) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage(app);
        const fileName = new Date().getTime() + file.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on("state_changed", (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`upload is ${progress}% done`);

        }, (error) => {
          reject(error);
        },
        ()=>{
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          })
        }
      )
      });

    }

    const handleImageDelete = (index) => {
         setFormData({...formdata, imageUrls: formdata.imageUrls.filter(( _ , i) => i !== index)}); // only removing index image from all
    }

    const handleChange = (e) => {
        if(e.target.id === 'sale' || e.target.id === 'rent'){
          setFormData({...formdata, type: e.target.id});
        }

        if(e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer'){
          setFormData({...formdata, [e.target.id]: e.target.checked });
        }

        if(e.target.type === 'number' || e.target.type === 'text' || e.target.type === 'textarea'){
          setFormData({...formdata, [e.target.id]: e.target.value });
        }


    }

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if(formdata.imageUrls.length < 1) return setError('You need to upload atleast 1 image');
        // Adding + in beginning to convert them to number to avoid any error of types
        if(+formdata.regularPrice < +formdata.discountedPrice) return setError('Discounted price must be lower than regular price');

        setLoading(true);
        setError(false);
        const res = await fetch('api/listing/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formdata,
            userRef: currentUser._id
          }),
        });
        const data = await res.json();
        setLoading(false);
        if(data.success === false) {
          setError(data.message);
        }
        navigate(`/listing/${data._id}`);
        
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }

    }



  return (
    <main className='p-3 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Create a New Listing</h1>
      <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
          <div className='flex flex-col gap-4 flex-1'>
            <input type="text" placeholder='Name' className='border p-3 rounded-lg' id="name" maxLength={62} minLength={10} required onChange={handleChange} value={formdata.name}/>
            <input type="textarea" placeholder='Description' className='border p-3 rounded-lg' id="description" required onChange={handleChange} value={formdata.description}/>
            <input type="text" placeholder='Address' className='border p-3 rounded-lg' id="address"  required onChange={handleChange} value={formdata.address}/>
            <div className='flex gap-6 flex-wrap'>
                <div className="flex gap-2">
                  <input type="checkbox" id='sale' className='w-5' onChange={handleChange} checked={formdata.type === 'sale'} />
                  <span>Sell</span>
                </div>
                <div className="flex gap-2">
                  <input type="checkbox" id='rent' className='w-5' onChange={handleChange} checked={formdata.type === 'rent'} />
                  <span>Rent</span>
                </div>
                <div className="flex gap-2">
                  <input type="checkbox" id='parking' className='w-5' onChange={handleChange} checked={formdata.parking} />
                  <span>Parking spot</span>
                </div>
                <div className="flex gap-2">
                  <input type="checkbox" id='furnished' className='w-5' onChange={handleChange} checked={formdata.furnished} />
                  <span>Furnished</span>
                </div>
                <div className="flex gap-2">
                  <input type="checkbox" id='offer' className='w-5' onChange={handleChange} checked={formdata.offer} />
                  <span>Offer</span>
                </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className='flex items-center gap-2'>
                <input type="number" id='bedrooms' min={1} required className='p-3 border border-gray-300 rounded-lg' onChange={handleChange} value={formdata.bedrooms} />
                <p>Beds</p>
              </div>
              <div className='flex items-center gap-2'>
                <input type="number" id='bathrooms' min={1} required className='p-3 border border-gray-300 rounded-lg' onChange={handleChange} value={formdata.bathrooms} />
                <p>Baths</p>
              </div>
              <div className='flex items-center gap-2'>
                <input type="number" id='regularPrice' min={0} max={100000} required className='p-3 border border-gray-300 rounded-lg' onChange={handleChange} value={formdata.regularPrice} />
                <div className='flex flex-col items-center'>
                <p>Regular price</p>
                <span className='text-xs'>($ / month)</span>
                </div>
              </div>
              {formdata.offer && (
              <div className='flex items-center gap-2'>
                <input type='number' id='discountedPrice' min={0} max={100000} required className='p-3 border border-gray-300 rounded-lg' onChange={handleChange} value={formdata.discountedPrice} />
                <div className='flex flex-col items-center'>
                <p>Discounted price</p>
                <span className='text-xs'>($ / month)</span>
                </div>
              </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4 flex-1">
            <p className='font-semibold'>Images:
                <span className='font-normal text-gray-600 ml-2' >The first image will be the cover (max 6)</span>
            </p>
            <div className="flex gap-4">
              <input onChange={(e) => setFiles(e.target.files)} className='p-3 border-gray-300 rounded w-full' type="file" id='images' accept='images/*' multiple />
              <button disabled={uploading} type='button' onClick={handleImageSubmit} className='p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80'>{uploading ? 'uploading...' : 'upload'}</button>
            </div>
            <p className='text-red-700 text-sm'>{imageUploadError && imageUploadError}</p>
            {
              formdata.imageUrls.length > 0 && formdata.imageUrls.map((url, index) => (
                <div key={url} className=" flex justify-between p-3 border items-center">
                  <img src={url} alt="listing image" className='w-20 h-20 object-contain rounded-lg' />
                  <button type='button' onClick={ () => handleImageDelete(index) } className='p-3 text-red-700 rounded-lg uppercase hover:opacity-75 '>Delete</button>
                </div>

              ))
            }
          <button disabled={loading || uploading} className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>{loading ? 'Creating...' : 'Create Listing'}</button>
          {error && <p className='text-red-700 text-sm'>{error}</p>}
          </div>
          
      </form>
    </main>
  )
}
