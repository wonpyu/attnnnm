const { chromium } = require("playwright");
const fs = require("fs-extra");

async function fetchDigitalArtists() {
  const browser = await chromium.launch({
    headless: true
  });

  try {
    const page = await browser.newPage();

    await page.goto(
      "https://kworb.net/itunes/",
      {
        waitUntil: "domcontentloaded"
      }
    );

    await page.waitForSelector("table");

    const artists = await page.$$eval(
      "table tr",
      rows => rows
        .slice(1)
        .map(row => {

          const cells = [
            ...row.querySelectorAll("td")
          ];

          if (cells.length < 12) {
            return null;
          }

          return {
            rank: Number(cells[0]?.innerText?.trim()),
            movement: cells[1]?.innerText?.trim(),
            artist: cells[2]?.innerText?.trim(),
            points: Number(cells[3]?.innerText?.replace(/,/g, "")),
            appleMusic: Number(cells[4]?.innerText?.replace(/,/g, "")),
            spotify: Number(cells[5]?.innerText?.replace(/,/g, "")),
            itunes: Number(cells[6]?.innerText?.replace(/,/g, "")),
            youtube: Number(cells[7]?.innerText?.replace(/,/g, "")),
            shazam: Number(cells[8]?.innerText?.replace(/,/g, "")),
            deezer: Number(cells[9]?.innerText?.replace(/,/g, "")),
            topCountry: cells[10]?.innerText?.trim(),
            entries: Number(cells[11]?.innerText?.replace(/,/g, ""))
          };

        })
        .filter(Boolean)
    );

    const data = {
      success: true,
      updated: new Date().toISOString(),
      count: artists.length,
      artists
    };

    await fs.writeJson(
      "./digital-artists.json",
      data,
      { spaces: 2 }
    );

    console.log(
      "✅ Updated:",
      artists.length
    );

  } finally {
    await browser.close();
  }
}

fetchDigitalArtists();
