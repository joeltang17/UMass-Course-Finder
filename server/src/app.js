import express from "express";
import cors from "cors";
import morgan from "morgan";
import puppeteer, { TimeoutError } from "puppeteer"
import { PuppeteerBlocker } from '@cliqz/adblocker-puppeteer';
import fetch from 'cross-fetch'; // required 'fetch'

const app = express();
const port = 3001;

app.use(cors());
app.use(morgan("dev"))
app.use(express.json());

app.get('/professor/:id/:classNum?', async(req, res) => { 
    const id = req.params.id 
    const classNum = req.params.classNum == undefined ? "" : req.params.classNum
    console.log(id)
    console.log(classNum)
    const browser = await puppeteer.launch({ headless: "new"});
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
    console.log(page.url())
    if(await page.url() == `https://www.ratemyprofessors.com/teacher-not-found`){
      res.send(
        {
          id,
          classNum,
          name: `NA`,
          numReviews: `NA`,
          qualityAvg: `NA`,
          difficultyAvg: `NA`,
          allReviews: `NA`,
        }
      )
      return;
    }

    const numReviews = await page.$eval('a[href="#ratingsList"]', anchor => anchor.textContent);
    const targetLength = parseInt(numReviews.split(' ')[0])
    console.log(targetLength);

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
    await new Promise(resolve => setTimeout(resolve, 225)); //wait for button to load after
  } catch (error) {
    console.error('Error during button interaction:', error);
    break; 
  }
  
}
  const reviews = await page.evaluate(function (classNum) {
  const reviewsQuery = document.querySelectorAll('.Rating__StyledRating-sc-1rhvpxz-1.jcIQzP')
  const arr = []
  for(i = 0; i < reviewsQuery.length; i++){
    if(reviewsQuery[i].querySelector('.RatingHeader__StyledClass-sc-1dlkqw1-3.eXfReS').innerText.includes(classNum)){
      arr.push({
          body: reviewsQuery[i].querySelector('.Comments__StyledComments-dzzyvm-0.gRjWel').innerText,
          title: reviewsQuery[i].querySelector('.RatingHeader__StyledClass-sc-1dlkqw1-3.eXfReS').innerText,
          quality: reviewsQuery[i].querySelector('.CardNumRating__CardNumRatingNumber-sc-17t4b9u-2').innerText,
          difficulty: reviewsQuery[i].querySelector('.CardNumRating__CardNumRatingNumber-sc-17t4b9u-2.cDKJcc').innerText,
      })
    }
  }
  
  let qualitySum = 0.0;
  let difficultySum = 0.0;
  for(i = 0; i < arr.length; i++){
    qualitySum += parseFloat(arr[i].quality)
    difficultySum += parseFloat(arr[i].difficulty)
  }
  
  let qualityAvg = (qualitySum / arr.length).toFixed(2)
  let difficultyAvg = (difficultySum / arr.length).toFixed(2)

    return {
      arr,
      qualityAvg,
      difficultyAvg,
    };
  }, classNum)

  const firstName = await page.$eval('div.NameTitle__Name-dowf0z-0.cfjPUG > span', span => span.textContent);
  const lastName = await page.$eval('span.NameTitle__LastNameWrapper-dowf0z-2.glXOHH', span => span.textContent);
  const name = firstName + " " + lastName
  const obj = {
    id,
    classNum: classNum == "" ? 'All Classes' : classNum,
    name,
    numReviews: reviews.arr.length,
    qualityAvg: reviews.qualityAvg,
    difficultyAvg: reviews.difficultyAvg,
    allReviews: reviews.arr,
  }
  res.json(obj)
  await browser.close()
})

app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
}); 