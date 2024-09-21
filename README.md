# Malta Address Scraper

## Overview
This project is a Node.js scraper designed to collect address data from the MaltaPost API and enrich it with geographical coordinates using the Google Geocoding API. The scraper retrieves all towns, streets, and addresses in Malta, and for each address, it fetches latitude and longitude coordinates. This data is useful for various applications, such as mapping, analysis, and logistics.

## How to Use
This scraper is already executed, and the collected data is available in the repository. You can directly use the pre-generated `addresses-results.csv` and `addresses-results.json` files without running the scraper yourself.

If you wish to update the data or customize the scraping process, follow the setup and execution instructions below.

### Prerequisites
- Node.js
- npm

### Installation
1. Clone this repository or download the ZIP file.
2. Open your terminal and navigate to the project directory.
3. Run `npm install` to install the dependencies.

### Configuration
An example `.env` file is included in the root directory. Before running the scraper, open this file and replace `your_google_api_key_here` with your actual Google Geocoding API key. If this key remains unchanged or is missing, the scraper will not retrieve latitude and longitude data, limiting the details available in the output files.

**⚠️ Be aware that running the scraper fully with Geocoding data will use around 140 USD of Google API credits as of 21/09/2024 ⚠️** 

### Running the Scraper
Execute the scraper by running: `node index.js`
This will start the process of data collection, and you will see progress logs in the terminal indicating the number of addresses processed.

### Results
After the scraper has finished, the collected data will be saved in the root directory as:
- `addresses-results.json` - A JSON file containing the aggregated data.
- `addresses-results.csv` - A CSV file with the same data for use in spreadsheets or other applications.

## Output Data Format
The data files include the following fields for each address:
- ID
- House Name
- House Alpha
- House Number
- Flat Number
- Street
- Post Code
- Locality
- Country
- Latitude
- Longitude

## Geocoding Accuracy Disclaimer
While efforts are made to ensure the accuracy of the geographical coordinates provided, the data returned by the Google Geocoding API may sometimes be inaccurate. Most coordinates accurately pinpoint the exact house, street or worst case the city. However, in rare cases, the coordinates may be significantly incorrect, sometimes pointing to a location in another country (e.g., latitude 27.6648274, longitude -81.5157535). These errors are beyond our control. We advise users to verify the coordinates when accuracy is crucial, as we do not take responsibility for any inaccuracies.

## License
This project is available under the MIT License, which allows for free use, modification, and distribution.

## Contribution
Contributions are welcome! Please feel free to fork this repository, make changes, and submit pull requests.
