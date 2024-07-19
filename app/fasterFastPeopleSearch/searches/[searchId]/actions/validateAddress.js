"use server"

const apiKey = process.env.GOOGLE_MAPS_API

export async function validateAddress(address) {
  address = {
    "regionCode": "US",
    "locality": address["City"],
    "addressLines": [address["Street Address"]],
  }

  try {
    const response = await fetch(`https://addressvalidation.googleapis.com/v1:validateAddress?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    });

    if (!response.ok) {
      throw new Error('Error in validating address');
    }

    const validatedAddress = await response.json();    
    return validatedAddress.result.address.formattedAddress;
  } catch (error) {
    console.error('Error validating address using Google Maps API: ', error);
    return { error: error.message };
  }
}