import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NameLogo from "../assets/cafeNameLogo.png";
import TableLogo from "../assets/tableLogo.png";
import EmailLogo from "../assets/emailLogo.png";
import PhoneLogo from "../assets/callLogo.png";
import AddressLogo from "../assets/addressLogo.png";
import PasswordLogo from "../assets/passwordLogo.png";
import RegistrationBg from "../assets/registrationBg.png";
import UploadLogo from "../assets/uploadLogo.png";
import InstagramLogo from "../assets/instagramLogo.png";

function CafeRegistrationForm() {
  const navigate = useNavigate();
  const [imgFile, setImgFile] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fileName, setFileName] = useState("upload logo (.png, .jpg, .jpeg)");

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    tables: 0,
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    instagram: "",
    logoImg: "",
    gstNumber: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const setFileToBase = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImgFile(reader.result);
      setFormData((prevFormData) => ({
        ...prevFormData,
        logoImg: reader.result,
      }));
    };
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToBase(file);
      setFileName(file.name);
    }
  };

  const isValidGSTNumber = (gst) => {
    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (
      !formData.name ||
      !formData.address ||
      !formData.tables ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.gstNumber
    ) {
      setErrorMessage("Please fill all the fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (!isValidGSTNumber(formData.gstNumber)) {
      setErrorMessage("Please enter a valid GST number");
      return;
    }

    try {
      const res = await fetch(
        "${import.meta.env.VITE_APP_URL}/server/cafeDetails/cafeRegister",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            tables: parseInt(formData.tables),
            phone: parseInt(formData.phone),
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        navigate(`/menu/${data.cafeId}`);
      } else {
        setErrorMessage("Either mail or phone number already exists");
      }
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="relative w-full h-screen flex justify-center items-center">
      <div
        style={{
          backgroundImage: `url(${RegistrationBg})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          filter: "invert(40%)",
        }}
        className="w-[100vw] h-[100vh]"
      ></div>
      <div className="absolute bg-white w-[85%] flex flex-col justify-center items-start m-auto scale-90 border-2 border-blue rounded-xl py-7 px-20 shadow-[0_0_50px_5px_#0158A133]">
        <h1 className="text-6xl mx-auto font-montsarret font-montserrat-700 uppercase mb-6">
          Register Yourself
        </h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-between items-start w-full gap-7 px-10 pt-3"
        >
          <div className="flex justify-between w-full">
            <div className="flex gap-1 w-[43%] items-center border-2 border-[#C6C6C6] rounded-xl">
              <img
                src={NameLogo}
                alt="User Logo"
                className="w-[42px] h-[42px] ml-1 scale-90"
              />
              <input
                onChange={handleChange}
                type="text"
                name="cafeName"
                id="name"
                placeholder="cafe name"
                className="outline-none border-l-2 pl-2 border-black w-[80%]"
                autoComplete="off"
              />
            </div>
            <div className="flex gap-1 w-[43%] items-center border-2 border-[#C6C6C6] rounded-xl">
              <img
                src={TableLogo}
                alt="Table Logo"
                className="w-[34px] h-[34px] mr-1 ml-2 scale-90"
              />
              <input
                onChange={handleChange}
                type="number"
                name="cafeTables"
                id="tables"
                placeholder="number of tables"
                className="outline-none border-l-2 pl-2 border-black w-[80%]"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="flex justify-between w-full">
            <div className="flex gap-1 w-[43%] items-center border-2 border-[#C6C6C6] rounded-xl">
              <img
                src={EmailLogo}
                alt="Email Logo"
                className="w-[42px] h-[42px] ml-1 scale-90"
              />
              <input
                onChange={handleChange}
                type="email"
                name="cafeEmail"
                id="email"
                placeholder="email"
                className="outline-none border-l-2 pl-2 border-black w-[80%]"
                autoComplete="off"
              />
            </div>
            <div className="flex gap-1 w-[43%] items-center border-2 border-[#C6C6C6] rounded-xl">
              <img
                src={PhoneLogo}
                alt="Phone Logo"
                className="w-[44px] h-[44px] ml-1 scale-[60%]"
              />
              <input
                onChange={handleChange}
                type="phone"
                maxLength={10}
                pattern="\d{10}"
                name="cafePhone"
                id="phone"
                placeholder="contact number"
                className="outline-none border-l-2 pl-2 border-black w-[80%]"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="flex gap-1 w-full items-center border-2 border-[#C6C6C6] rounded-xl">
            <img
              src={AddressLogo}
              alt="Address Logo"
              className="w-[42px] h-[42px] ml-1 scale-[80%]"
            />
            <input
              onChange={handleChange}
              type="text"
              name="cafeAddress"
              id="address"
              placeholder="cafe address"
              className="outline-none border-l-2 pl-2 border-black w-[80%]"
              autoComplete="off"
            />
          </div>

          <div className="flex gap-1 w-full items-center border-2 border-[#C6C6C6] rounded-xl">
            <svg
              className="w-[42px] h-[42px] ml-1 scale-[80%] p-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <input
              onChange={handleChange}
              type="text"
              name="cafeGST"
              id="gstNumber"
              placeholder="GST number"
              className="outline-none border-l-2 pl-2 border-black w-[80%]"
              autoComplete="off"
              style={{ textTransform: "uppercase" }}
            />
          </div>

          <div className="flex justify-between w-full">
            <div className="flex gap-1 w-[43%] items-center border-2 border-[#C6C6C6] rounded-xl">
              <img
                src={PasswordLogo}
                alt="Password Logo"
                className="w-[42px] h-[42px] ml-1 pt-1 scale-125"
              />
              <input
                onChange={handleChange}
                type="password"
                name="cafePassword"
                id="password"
                placeholder="password"
                className="outline-none border-l-2 pl-2 border-black w-[80%]"
                autoComplete="off"
              />
            </div>
            <div className="flex gap-1 w-[43%] items-center border-2 border-[#C6C6C6] rounded-xl">
              <img
                src={PasswordLogo}
                alt="Password Logo"
                className="w-[42px] h-[42px] ml-1 pt-1 scale-125"
              />
              <input
                onChange={handleChange}
                type="password"
                name="cafePassword"
                id="confirmPassword"
                placeholder="confirm password"
                className="outline-none border-l-2 pl-2 border-black w-[80%]"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="flex justify-between w-full">
            <div className="flex gap-1 w-[43%] items-center border-2 border-[#C6C6C6] rounded-xl">
              <img
                src={InstagramLogo}
                alt="Instagram Logo"
                className="w-[44px] h-[44px] ml-1 scale-[80%]"
              />
              <input
                onChange={handleChange}
                type="text"
                name="cafeInstagram"
                id="instagram"
                placeholder="instagram handle"
                className="outline-none border-l-2 pl-2 border-black w-[80%]"
                autoComplete="off"
              />
            </div>
            <div className="flex gap-1 w-[43%] items-center border-2 border-[#C6C6C6] rounded-xl cursor-pointer">
              <img
                src={UploadLogo}
                alt="Email Logo"
                className="w-[42px] h-[42px] ml-1 scale-[85%]"
              />
              <input
                onChange={handleImage}
                type="file"
                name="cafeLogo"
                id="cafeLogo"
                placeholder="logo"
                className="outline-non hidden"
                autoComplete="off"
              />
              <label
                htmlFor="cafeLogo"
                className="border-l-2 pl-2 border-black w-[80%] text-[#888888] cursor-pointer"
              >
                {fileName}
              </label>
            </div>
          </div>

          {errorMessage && (
            <div className="text-sm text-red font-montserrat-500 text-center w-full -mb-4">
              {errorMessage}
            </div>
          )}

          <div className="w-full flex justify-center">
            <button className="border-2 border-blue rounded-xl w-[45%] text-xl p-1 shadow-[0_0_7.6px_0_#0158A133]">
              Register
            </button>
          </div>
        </form>

        <div className="mx-auto mt-2">
          <Link
            to="/"
            className="font-montsarret font-montserrat-500 text-sm italic text-blue"
          >
            Login..?
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CafeRegistrationForm;
