import { useAuth } from '@/auth/AuthContext';
import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { useParams, useNavigate } from 'react-router-dom';

function GetQR() {
    const { cafeId } = useParams();
    const { token, load} = useAuth();
    const [cafeName, setCafeName] = useState('');
    const [numTables, setNumTables] = useState(0); 
    const [qrCodes, setQrCodes] = useState([]);   
    const [loading, setLoading] = useState(false);
    const [generateQR, setGenerateQR] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!load && !token) {
            navigate('/', { replace: true });
        }
    }, [token, load, navigate]);

    const fetchCafeDetails = async () => {
        try {
            const res = await fetch(
              `${
                import.meta.env.VITE_APP_URL
              }/server/cafeDetails/getCafeDetails/${cafeId}`
            );
            const data = await res.json();
            if (res.ok) {
                setCafeName(data.name);
                setNumTables(data.tables);
            } else {
                console.error(`Error: ${data.message}`);
            }
        } catch (err) {
            console.error(err);
        } 
    };

    useEffect(() => {
        fetchCafeDetails();
    }, []);

    const generateQRCodes = () => {
        setLoading(true);
        const generatedQRs = [];
        for (let i = 1; i <= numTables; i++) {
            const qrData = `/userInfo/${cafeId}/${i}`;
            generatedQRs.push(qrData);
        }
        setQrCodes(generatedQRs);
        setGenerateQR(true);
        setLoading(false);
    };

    // Function to download the QR codes as PNG by converting SVG to Canvas
    const downloadQRCode = (index) => {
        const svg = document.getElementById(`qrcode-${index}`);
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const pngFile = canvas.toDataURL("image/png");

            const downloadLink = document.createElement("a");
            downloadLink.href = pngFile;
            downloadLink.download = `table-${index + 1}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        };

        img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    };

    const handleBackButton = () => {
        navigate(`/menu/${cafeId}`);
    }

    return (
        <div className='flex flex-col'>
            <div className="flex justify-between items-center bg-base1 p-4">
                <div className='uppercase font-montsarret font-montserrat-700 text-4xl pt-8 px-4'>{cafeName}</div>
                <div onClick={handleBackButton} className='mt-8 py-2 px-8 bg-blue text-white rounded-full cursor-pointer'>Back</div>
            </div>

            {!generateQR &&
            <div className='my-2 h-80 flex flex-col justify-center items-center'>
                <div className='text-center'>You don't have any QR generated.<br></br> Please click on the button below to generate.</div>
                <button className="py-2 px-8 my-2 bg-blue text-white rounded-full shadow-[0_0_8.7px_5px_#0158A124]" onClick={generateQRCodes} disabled={loading}>
                    {loading ? "Generating..." : "Generate QR Codes"}
                </button>        
            </div>}

            <div className="flex flex-wrap justify-center items-center gap-7 py-3 h-[530px] overflow-y-auto">
                {qrCodes.map((qrData, index) => (
                    <div key={index} className="flex flex-col items-center border-2 border-blue rounded-2xl p-2">
                        <QRCode
                            id={`qrcode-${index}`}
                            value={`${window.location.origin}${qrData}`}
                            size={128}
                            className='p-1'
                        />
                        <div className='pt-1 text-sm font-montserrat-600 my-1 font-montsarret'>
                            {`Table - ${index+1}`}
                        </div>
                        <div className="mt-1">
                            <button
                                onClick={() => downloadQRCode(index)}
                                className="px-6 mb-2 bg-blue text-sm w-full text-white rounded-full flex items-center"
                            >
                                Download
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default GetQR;
