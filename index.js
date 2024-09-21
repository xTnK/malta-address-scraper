require('dotenv').config();
const { parse } = require('json2csv');
const axios = require('axios');
const fs = require('fs');

// Constants declaration
const googleApiKey = process.env.GOOGLE_API_KEY;
const maltapostBaseUrl = 'https://www.maltapost.com/postcode/api/v1/Address/';
const geocodeCache = new Map(); // Cache to store geocode results

// Fetch data (GET only) from an URL with parameters and retry on failure
async function fetch(url, params) {
    const maxAttempts = 10; // Maximum number of retries
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const response = await axios.get(url, { params });
            return response.data;
        } catch (error) {
            // No retry for 404 errors
            if (error.response && error.response.status === 404) {
                console.error(`Failed to fetch data from ${url} with params: ${JSON.stringify(params)}: ${error.message}`);
                return [];
            }
            console.error(`[${attempt}/${maxAttempts}] Failed to fetch data from ${url} with params: ${JSON.stringify(params)}: ${error.message}`);
            console.log(`Retrying in 30s`);
            if (attempt === 10) throw new Error('Maximum retries reached');
            await new Promise(resolve => setTimeout(resolve, 30000)); // Wait for 30 seconds before retrying
        }
    }
}

// Get all towns from MaltaPost API
async function getAllTowns() {
    return await fetch(`${maltapostBaseUrl}GetAllTowns`);
}

// Get all the streets of a town from MaltaPost API
async function getStreetsForTown(townId) {
    return await fetch(`${maltapostBaseUrl}GetAllStreets`, { townId });
}

// Get all the addresses of a street from MaltaPost API
async function getAddressesForStreet(streetId) {
    return await fetch(`${maltapostBaseUrl}GetAddresses`, { streetId });
}

// Get geocode data for an address from Google Geocoding API
async function getGeocode(address) {
    // Skip geocoding if no API key is provided
    if (!googleApiKey || googleApiKey === "your_google_api_key_here") return {};

    // Return cached result if available
    if (geocodeCache.has(address)) return geocodeCache.get(address);

    const data = await fetch(`https://maps.googleapis.com/maps/api/geocode/json`, {
        address: address,
        key: googleApiKey
    });
    const location = data.results[0]?.geometry.location;
    const geocodeResult = location ? { latitude: location.lat, longitude: location.lng } : {}; // Return the location latitude and longitude if available
    geocodeCache.set(address, geocodeResult);
    return geocodeResult;
}

// Format address parts into a single string to be used for geocoding request
function formatAddress(address) {
    const parts = [];
    if (address.houseName) parts.push(address.houseName);
    parts.push(address.houseNo || address.houseAlpha || '');
    if (address.street) parts.push(address.street);
    if (address.locality) parts.push(address.locality);
    if (address.country) parts.push(address.country);
    return parts.filter(Boolean).join(', ');
}

// Parse all towns, streets and addresses and aggregate the data into a single array
async function aggregateData() {
    const towns = await getAllTowns();
    const results = [];

    for (const [index, town] of towns.entries()) {
        console.log(`[${index + 1}/${towns.length}] [TOWN] ${town.name}`);
        const streets = await getStreetsForTown(town.id);

        for (const [index, street] of streets.entries()) {
            console.log(`[${index + 1}/${streets.length}] [STREET] ${street.name}`);
            const addresses = await getAddressesForStreet(street.id);

            for (const address of addresses) {
                const formattedAddress = formatAddress(address);
                const geoData = await getGeocode(formattedAddress);

                results.push({
                    id: address.id,
                    houseName: address.houseName,
                    houseAlpha: address.houseAlpha,
                    houseNo: address.houseNo,
                    flatNo: address.flatNo,
                    street: address.street,
                    postCode: address.postCode,
                    locality: address.locality,
                    country: address.country,
                    latitude: geoData.latitude,
                    longitude: geoData.longitude
                });
            }
        }
    }
    return results;
}

// Write the results to a JSON file
function writeToJson(results) {
    fs.writeFileSync('data.json', JSON.stringify(results));
}

// Write the results to a CSV file
function writeToCsv(results) {
    const csv = parse(results);
    fs.writeFileSync('data.csv', '\uFEFF' + csv); // Add BOM for UTF-8 encoding otherwise Excel will not display special (maltese) characters correctly
}

// Main function to run the data aggregation process
async function run() {
    if (!googleApiKey || googleApiKey === "your_google_api_key_here") {
        console.error("[!] Google Geocoding API key has not been set");
        console.error("[!] Replace 'your_google_api_key_here' with your actual API key in the .env file");
        console.error("[!] Latitude and longitude data will not be loaded");
        console.error("\t\t-------")
    }
    console.log("Starting data aggregation...");
    const data = await aggregateData();
    writeToJson(data);
    writeToCsv(data);
    console.log("Data aggregation completed.");
}

// Start the data aggregation process
run();