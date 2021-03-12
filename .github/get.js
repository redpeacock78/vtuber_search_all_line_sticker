const puppeteer = require('puppeteer');

const URL = process.argv[2];

(async () => {
    const browser = await puppeteer.launch({
        args: [
            '--no-zygote',
            '--no-sandbox',
            '--no-first-run',
            '--disable-gpu',
            '--disable-setuid-sandbox',
        ]
    });
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'ja-JP' });
    await page.goto(URL);
    const result = await page.$$eval("section > div > ul > li > a", list => list.map(elm => elm.href));
    const index = ['javascript:;'];
    result.length > 0 ? console.log(
        result.filter(v => {
            return !index.includes(v)
        }).join('\n')
    ) : "";
    await browser.close();
}
)();