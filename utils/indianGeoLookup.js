/**
 * Pan-India Geographic Lookup Utility
 * Automatically resolves City, State, and PIN Code for all Indian regions.
 */

export const INDIAN_CITIES = [
  // Bihar
  { city: "Ara", state: "Bihar", pincode: "802301" },
  { city: "Patna", state: "Bihar", pincode: "800001" },
  { city: "Gaya", state: "Bihar", pincode: "823001" },
  { city: "Muzaffarpur", state: "Bihar", pincode: "842001" },
  { city: "Bhagalpur", state: "Bihar", pincode: "812001" },
  { city: "Darbhanga", state: "Bihar", pincode: "846004" },
  { city: "Purnia", state: "Bihar", pincode: "854301" },
  { city: "Begusarai", state: "Bihar", pincode: "851101" },

  // Jharkhand
  { city: "Ranchi", state: "Jharkhand", pincode: "834001" },
  { city: "Jamshedpur", state: "Jharkhand", pincode: "831001" },
  { city: "Dhanbad", state: "Jharkhand", pincode: "826001" },
  { city: "Bokaro", state: "Jharkhand", pincode: "827001" },
  { city: "Hazaribagh", state: "Jharkhand", pincode: "825301" },
  { city: "Deoghar", state: "Jharkhand", pincode: "814112" },

  // West Bengal
  { city: "Kolkata", state: "West Bengal", pincode: "700001" },
  { city: "Howrah", state: "West Bengal", pincode: "711101" },
  { city: "Siliguri", state: "West Bengal", pincode: "734001" },
  { city: "Durgapur", state: "West Bengal", pincode: "713201" },
  { city: "Asansol", state: "West Bengal", pincode: "713301" },

  // Delhi NCR
  { city: "New Delhi", state: "Delhi", pincode: "110001" },
  { city: "Noida", state: "Uttar Pradesh", pincode: "201301" },
  { city: "Greater Noida", state: "Uttar Pradesh", pincode: "201310" },
  { city: "Gurugram", state: "Haryana", pincode: "122001" },
  { city: "Faridabad", state: "Haryana", pincode: "121001" },
  { city: "Ghaziabad", state: "Uttar Pradesh", pincode: "201001" },

  // Maharashtra
  { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
  { city: "Pune", state: "Maharashtra", pincode: "411001" },
  { city: "Nagpur", state: "Maharashtra", pincode: "440001" },
  { city: "Thane", state: "Maharashtra", pincode: "400601" },
  { city: "Nashik", state: "Maharashtra", pincode: "422001" },

  // Karnataka
  { city: "Bengaluru", state: "Karnataka", pincode: "560001" },
  { city: "Mysuru", state: "Karnataka", pincode: "570001" },
  { city: "Mangaluru", state: "Karnataka", pincode: "575001" },

  // Tamil Nadu
  { city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
  { city: "Coimbatore", state: "Tamil Nadu", pincode: "641001" },
  { city: "Madurai", state: "Tamil Nadu", pincode: "625001" },

  // Telangana & AP
  { city: "Hyderabad", state: "Telangana", pincode: "500001" },
  { city: "Visakhapatnam", state: "Andhra Pradesh", pincode: "530001" },
  { city: "Vijayawada", state: "Andhra Pradesh", pincode: "520001" },

  // Gujarat
  { city: "Ahmedabad", state: "Gujarat", pincode: "380001" },
  { city: "Surat", state: "Gujarat", pincode: "395001" },
  { city: "Vadodara", state: "Gujarat", pincode: "390001" },

  // Uttar Pradesh
  { city: "Lucknow", state: "Uttar Pradesh", pincode: "226001" },
  { city: "Kanpur", state: "Uttar Pradesh", pincode: "208001" },
  { city: "Varanasi", state: "Uttar Pradesh", pincode: "221001" },
  { city: "Agra", state: "Uttar Pradesh", pincode: "282001" },
  { city: "Prayagraj", state: "Uttar Pradesh", pincode: "211001" },

  // Rajasthan
  { city: "Jaipur", state: "Rajasthan", pincode: "302001" },
  { city: "Jodhpur", state: "Rajasthan", pincode: "342001" },
  { city: "Udaipur", state: "Rajasthan", pincode: "313001" },

  // Odisha
  { city: "Bhubaneswar", state: "Odisha", pincode: "751001" },
  { city: "Cuttack", state: "Odisha", pincode: "753001" },

  // Madhya Pradesh
  { city: "Indore", state: "Madhya Pradesh", pincode: "452001" },
  { city: "Bhopal", state: "Madhya Pradesh", pincode: "462001" },

  // Punjab & Chandigarh
  { city: "Chandigarh", state: "Chandigarh", pincode: "160017" },
  { city: "Ludhiana", state: "Punjab", pincode: "141001" },
  { city: "Amritsar", state: "Punjab", pincode: "143001" },

  // Assam
  { city: "Guwahati", state: "Assam", pincode: "781001" },
];

/**
 * Lookup state by city name
 */
export function lookupStateByCity(cityName) {
  if (!cityName) return null;
  const match = INDIAN_CITIES.find(
    (c) => c.city.toLowerCase() === cityName.trim().toLowerCase(),
  );
  return match || null;
}

/**
 * Lookup location by 6-digit PIN code (offline first, Postal API fallback)
 */
export async function lookupByPincode(pincode) {
  if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
    return null;
  }

  // 1. Offline fast lookup
  const localMatch = INDIAN_CITIES.find((c) => c.pincode === pincode);
  if (localMatch) {
    return localMatch;
  }

  // 2. Official India Postal API fallback
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    if (!res.ok) return null;
    const data = await res.json();

    if (
      Array.isArray(data) &&
      data[0]?.Status === "Success" &&
      data[0]?.PostOffice?.length > 0
    ) {
      const po = data[0].PostOffice[0];
      return {
        city: po.District || po.Name || po.Block,
        state: po.State,
        pincode: pincode,
      };
    }
  } catch (e) {
    console.warn("India Postal API lookup failed:", e);
  }

  return null;
}
