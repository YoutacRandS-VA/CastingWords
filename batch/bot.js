const puppeteer = require('puppeteer');
const fs = require('fs');
const key = require('./../key.js');

const options = {
  'headless': true,  // no gui browser
  'userDataDir':"./browser" // save browser data,session,cookie
};

const authInfo = JSON.parse(fs.readFileSync('./config.json','utf8'));

const account = authInfo.account;
const password = key.decrypt(authInfo.password);

function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

async function start(order_id) {
  try{
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.96 Safari/537.36');
    await page.setViewport({ width: 1280, height: 1000 })

    browser.addListener('targetchanged',function(event){

    });

    let firstPage = 'https://castingwords.com/store/customer/current_status?pagenumb=1&rows=100';
    await page.goto(firstPage);

    await delay(2000);
    
    console.log(`get order receipt: ${order_id}`);

    await page.waitForSelector('.form-control');

    let needLogin = await page.evaluate(() =>{
      return document.querySelector(".inputsubmit.btn.btn-default.orange").name
    })

    if(needLogin=='form_submit'){
      console.log('will try login');

      await page.waitForSelector('.loginform');
      await page.waitForSelector('.form-control');

      await page.waitForSelector('#loginform-email');

      // await page.type('#loginform-email', account, {delay: 10})
      await page.evaluate((value) => {
        const email = document.querySelector('#loginform-email');
        email.value = value 
      }, account);

      // await page.type('input[name=password]', password, {delay: 5});
      await page.evaluate((value) => {
        const email = document.querySelector('input[name=password]');
        email.value = value 
      }, password);
      
      await page.evaluate(() => {
        document.querySelector('input[type="submit"]').click();
      });

    }

    await page.waitForSelector('.downloads.clearrow .receiptlink');


    // let receiptURL = await page.evaluate(() => {
    //   document.querySelector(".socialbuttons").remove();
    //   let links = [];
    //   let hrefs =  document.querySelectorAll(".downloads.clearrow .receiptlink");
    //   for(let i=0;i<hrefs.length;i++) {
    //     links.push(hrefs[i].href);
    //   }
    //   return links;
    // });
    // console.log(receiptURL);

    await page.goto(`https://castingwords.com/store/customer/receipt?oid=${order_id}`);

    const cdp = await page.target().createCDPSession();
    let html_contents = await page.content();
    html_contents = html_contents.replace(`<p></p>`, `<p> </p>`);
    html_contents = html_contents.replace(`<p></p>`,
    `<div style="float:right;text-align:right;clear:right">
    <h2 style="margin-top:0; margin-bottom:0; ">To: Institue for Information Industry</h2>
    <h2 style="margin-top:0; margin-bottom:0; ">11F, NO. 106, Sec. 2, Heping E. Rd., <br>Taipei 106, Taiwan, R.O.C.</h2>`);
    
    let dir = `transcript/${order_id}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    fs.writeFileSync(`${dir}/Order_${order_id}_Receipt_III.html`, html_contents);

    
    await browser.close();
  
}catch(e) {
    console.error(e);
  }

};

// start('order_id');

module.exports = {
  start 
};