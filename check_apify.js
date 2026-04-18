const { ApifyClient } = require('apify-client');
require('dotenv').config({ path: '.env.local' });

const client = new ApifyClient({ token: process.env.APIFY_TOKEN });

async function run() {
  const inputProfile = {
    usernames: ["jeninovaki"],
  };
  
  console.log("Calling profile scraper...");
  const runProfile = await client.actor("apify/instagram-profile-scraper").call(inputProfile);
  const profileDataset = await client.dataset(runProfile.defaultDatasetId).listItems();
  const profileItem = profileDataset.items[0] || {};
  
  const picUrl = profileItem.profilePicUrlHD || profileItem.profilePicUrl;
  console.log("Pic URL:", picUrl);
  
  if (picUrl) {
    const res = await fetch(picUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
      }
    });
    console.log("Fetch status:", res.status);
    console.log("Content-Type:", res.headers.get("content-type"));
  }
}

run().catch(console.error);
