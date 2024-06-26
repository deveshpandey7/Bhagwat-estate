import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

export default function Contact({listing}) {

    const [landlord, setLandlord] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(()=> {
        const fetchLandLord = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/user/${listing.userRef}`);
                const data = await res.json();
                if(data.sucess === false){
                    setError(true);
                    setLoading(false);
                    return;
                }

                setLandlord(data);
                setLoading(false);
                setError(false);
                
            } catch (error) {
                setError(true);
                setLoading(false);
            }
        }
        fetchLandLord();

    }, [listing.userRef]);

    const onchange = (e) => {
        setMessage(e.target.value);
    }

  return (
    <>
      {landlord && (
        <div className="flex flex-col gap-2">
            <p> Contact <span className='font-semi-bold'>{landlord.username}</span> for <span className='font-semi-bold'>{listing.name.toLowerCase()}</span>  </p>
            <textarea name="message" id="message" rows={2} value={message} onChange={onchange} placeholder='Enter your messsage here...' className='w-full border p-3 rounded-lg'></textarea>
           
            {/* thats how mail is going to be used to send message: mailto activates mail system in windows */}
            <Link to={`mailto:${landlord.email}?subject=Regarding ${listing.name}&body=${message}`} className='bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-95'>

                Send Message 
            </Link>
        </div>

      )}

    </>
  )
}
