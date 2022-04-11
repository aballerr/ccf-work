const puppeteer = require("puppeteer");
const services = require("./services/service-db");
const serviceDb = require("./services/service-property");

const url = "https://www.google.com";

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

const pullAndSaveLinks = async () => {
  await services.init();
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);

  await page.waitForSelector('[aria-label="Search"]', {
    timeout: 10000,
  });
  const searchTerm = "we buy hagerstown md";

  await page.$eval(
    '[aria-label="Search"]',
    (el, searchTerm) => (el.value = searchTerm),
    searchTerm
  );

  const button = await page.$('[aria-label="Google Search"]');
  await button.evaluate((b) => b.click());

  await page.waitForNavigation({ waitUntil: "networkidle2" });
  const allHouseSites = {};

  const hrefs = await page.$$eval("a", (as) =>
    as
      .map((a) => {
        return a.href;
      })
      .filter(
        (val) => !val.match("google") && val.length && !val.match("javascript")
      )
  );

  for (let href of hrefs) {
    allHouseSites[href] = true;
  }

  const table = await page.$("tbody");
  const allLinks = await table.$$eval("a", (as) => as.map((a) => a.href));

  for (let link of allLinks) {
    await page.goto(link);
    const hrefs = await page.$$eval("a", (as) =>
      as
        .map((a) => {
          return a.href;
        })
        .filter(
          (val) =>
            !val.match("google") && val.length && !val.match("javascript")
        )
    );

    for (let href of hrefs) {
      allHouseSites[href] = true;
    }
  }

  for (let site of Object.keys(allHouseSites)) {
    await serviceDb.addHref(site, searchTerm);
  }

  await page.close();
  await browser.close();

  return Promise.resolve();
};

const getPhoneNumber = async (page, result) => {
  const url = result.href;

  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  let res = await page.$eval("body", (element) => {
    const regex = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/im;
    const results = [];

    function searchChildren(node) {
      if (node === undefined || node.children === undefined) return null;
      if (node?.children?.length === 0) return;
      const content = node.textContent || "";
      const phone = content.match(regex);
      if (phone?.length) {
        results.push(...phone);
      }

      for (let child of node.children) {
        searchChildren(child);
      }
    }

    searchChildren(element);

    const finalResult = results.reduce((reducer, val) => {
      reducer[val] = true;
      return reducer;
    }, {});

    return Promise.resolve(Object.keys(finalResult));
  });

  result.phone = JSON.stringify(res);
  result.phone_lookup = true;

  await serviceDb.updateHref(result);

  return Promise.resolve();
};

const getPhoneNumbers = async () => {
  await services.init();
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const results = await serviceDb.getAll({ phone_lookup: false });

  for (let result of results) {
    try {
      await getPhoneNumber(page, result.dataValues);
    } catch (err) {
      console.log("errored for some reason");
      console.log(err);
    }
  }

  await page.close();
  await browser.close();

  return Promise.resolve();
};

const searchPhoneNumber = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const results = await serviceDb.getAll({ address_lookup: false });

  for (const { dataValues } of results) {
    const result = dataValues;
    result.address_lookup = true;
    await serviceDb.updateHref(result);
    const phoneNumbers = JSON.parse(result.phone);
    console.log(phoneNumbers);

    for (const phoneNumber of phoneNumbers) {
      await page.goto("https://www.google.com");

      await page.waitForSelector('[aria-label="Search"]', {
        timeout: 10000,
      });

      await page.$eval(
        '[aria-label="Search"]',
        (el, searchTerm) => (el.value = searchTerm),
        phoneNumber
      );

      const button = await page.$('[aria-label="Google Search"]');
      await button.evaluate((b) => b.click());

      await page.waitForNavigation({ waitUntil: "networkidle2" });
      const capatchExists = (await page.$("#recaptcha")) || "";

      if (capatchExists) {
        await delay(15000);
      }

      const titleExists = (await page.$('[data-attrid="title"]')) || "";
      const addressExists = (await page.$('[data-md="1002"]')) || "";

      const title = titleExists
        ? await page.$eval('[data-attrid="title"]', (el) => el.textContent)
        : "";

      const address = addressExists
        ? await page.$eval('[data-md="1002"]', (el) => el.textContent)
        : "";

      if (address.length === 0) {
        continue;
      }

      const finalText = address.replace("Address:", "").trim();
      const [street, city, stateAndZip] = finalText.split(",");
      const [state, zip] = stateAndZip.trim().split(" ");

      result.address = finalText;
      result.companyName = title;
      result.street = street;
      result.city = city;
      result.state = state;
      result.zip = zip;
      break;
    }
    await serviceDb.updateHref(result);
  }
};

(async () => {
  await services.init();

  // get the links from the website
  // await pullAndSaveLinks();

  // get the phone numbers from each site
  // await getPhoneNumbers();

  // Searching
  searchPhoneNumber();
})();
