import express from "express";
import cors from "cors";
import morgan from "morgan";
import puppeteer, { TimeoutError } from "puppeteer"

const app = express();
const port = 3000;

app.use(cors());
app.use(morgan("dev"))
app.use(express.json());

app.get('/', async(req, res) => { 
    const browser = await puppeteer.launch({headless: true });
    const page = await browser.newPage();

    await page.goto('https://www.ratemyprofessors.com/professor')
    console.log('goto')

    await page.waitForSelector('.Buttons__Button-sc-19xdot-1.CCPAModal__StyledCloseButton-sc-10x9kq-2.eAIiLw')
    await page.click('.Buttons__Button-sc-19xdot-1.CCPAModal__StyledCloseButton-sc-10x9kq-2.eAIiLw')
    console.log('click cookie')
    
    await page.type('input[placeholder="Your school"]', 'Umass Amherst')
    await page.waitForSelector('.MenuItem__MenuItemHeader-h6a87s-0.lauWml')
    await page.click('.MenuItem__MenuItemHeader-h6a87s-0.lauWml')

    await page.type('.Search__DebouncedSearchInput-sc-10lefvq-1.fwqnjW', 'marius minea')
    await page.waitForSelector('.MenuItem__MenuItemHeader-h6a87s-0.lauWml')
    await page.click('.MenuItem__MenuItemHeader-h6a87s-0.lauWml')
    console.log('search')

    await page.waitForSelector('.Rating__StyledRating-sc-1rhvpxz-1.jcIQzP')
    console.log('load')

    let targetLength = 164;

while (true) {
  const reviews = await page.$$('.Rating__StyledRating-sc-1rhvpxz-1.jcIQzP');

  console.log(`Number of reviews: ${reviews.length}`);

  if (reviews.length >= targetLength) {
    console.log(`Target length of ${targetLength} reached. Exiting the loop.`);
    break;
  }

  try {
    await page.waitForSelector('.Buttons__Button-sc-19xdot-1.PaginationButton__StyledPaginationButton-txi1dr-1.eUNaBX', { visible: true, timeout: 2000 });
    const buttonHandle = await page.$('.Buttons__Button-sc-19xdot-1.PaginationButton__StyledPaginationButton-txi1dr-1.eUNaBX');

    if (buttonHandle) {
      await buttonHandle.click();
      console.log('Button clicked');
    } else {
      console.log('Button element not found');
      break;
    }
  } catch (error) {
    console.error('Error during button interaction:', error);
    break; // Exit the loop in case of an error
  }
}



    
        const data = await page.evaluate(function () {
        const reviews = document.querySelectorAll('.Rating__StyledRating-sc-1rhvpxz-1.jcIQzP')
        const arr = []
        for(i = 0; i < reviews.length; i++){
            arr.push({
                body: reviews[i].querySelector('.Comments__StyledComments-dzzyvm-0.gRjWel').innerText,
            })
        }
        return arr;
    })
    res.json(data)
})

app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
}); 