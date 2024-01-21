import express from "express";
import cors from "cors";
import morgan from "morgan";
import puppeteer, { TimeoutError } from "puppeteer"
import { PuppeteerBlocker } from '@cliqz/adblocker-puppeteer';
import fetch from 'cross-fetch'; // required 'fetch'

const app = express();
const port = 3000;

app.use(cors());
app.use(morgan("dev"))
app.use(express.json());

app.get('/professor/:id/:classNum', async(req, res) => { 
    const id = req.params.id //2416008
    const classNum = req.params.classNum //220
    console.log(id)
    console.log(classNum)
    const browser = await puppeteer.launch({headless: true });
    const page = await browser.newPage();

    PuppeteerBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
      blocker.enableBlockingInPage(page);
    });

    await page.setCookie({
      name: 'ccpa-notice-viewed-02',
      value: 'true',
      domain: 'www.ratemyprofessors.com', 
  });

    await page.goto(`https://www.ratemyprofessors.com/professor/${id}`, { waitUntil: 'domcontentloaded' } )
    console.log('goto')

    let targetLength = 170;

while (true) {
  const reviews = await page.$$('.Rating__StyledRating-sc-1rhvpxz-1.jcIQzP');

  console.log(`Number of reviews: ${reviews.length}`);

  if (reviews.length === targetLength) {
    console.log(`Target length of ${targetLength} reached. Exiting the loop.`);
    break;
  }
  else{
    console.log('Length not reached')
  }

  try {
    
    await page.waitForSelector('.Buttons__Button-sc-19xdot-1.PaginationButton__StyledPaginationButton-txi1dr-1.eUNaBX', { timeout: 5000 });
    await page.click('.Buttons__Button-sc-19xdot-1.PaginationButton__StyledPaginationButton-txi1dr-1.eUNaBX');

    // const buttonHandle = await page.$('.Buttons__Button-sc-19xdot-1.PaginationButton__StyledPaginationButton-txi1dr-1.eUNaBX');

    // if (buttonHandle) {
    //   await buttonHandle.click();
    //   console.log('Button clicked');
    // } else {
    //   console.log('Button element not found');
    //   break;
    // }
  } catch (error) {
    console.error('Error during button interaction:', error);
    break; // Exit the loop in case of an error
  }
  
}

  const data = await page.evaluate(function (classNum) {
  const reviews = document.querySelectorAll('.Rating__StyledRating-sc-1rhvpxz-1.jcIQzP')
  const arr = []
  for(i = 0; i < reviews.length; i++){
    if(reviews[i].querySelector('.RatingHeader__StyledClass-sc-1dlkqw1-3.eXfReS').innerText.includes(classNum)){
      arr.push({
          body: reviews[i].querySelector('.Comments__StyledComments-dzzyvm-0.gRjWel').innerText,
          title: reviews[i].querySelector('.RatingHeader__StyledClass-sc-1dlkqw1-3.eXfReS').innerText,
          quality: reviews[i].querySelector('.CardNumRating__CardNumRatingNumber-sc-17t4b9u-2').innerText,
          difficulty: reviews[i].querySelector('.CardNumRating__CardNumRatingNumber-sc-17t4b9u-2.cDKJcc').innerText,
      })
    }
  }
    return arr;
  }, classNum)
  res.json(data)
})

app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
}); 