const lsdl = require('lsdl-wrapper');
const puppeteer = require('puppeteer');

const dir = process.argv[2];
const URL = process.argv[3];
const lsdl_opts = {};

const launch_opts = [
    '--no-zygote',
    '--no-sandbox',
    '--no-first-run',
    '--disable-gpu',
    '--disable-setuid-sandbox',
];

const get_option = async (URL) => {
    const browser = await puppeteer.launch({ args: launch_opts });
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'ja-JP' });
    const response = await page.goto(URL);
    const status = response.status();
    if (status === 200) {
        const item_selector = 'body > div.LyWrap > div.LyContents.MdCF > div.LyMain > section > div.mdBox03Inner01 > div.MdCMN38EndTop.mdCMN38Sticker > div > span';
        const item = await page.$(item_selector);
        if (item === null) {
            await browser.close();
            return true;
        } else {
            const data = await (await item.getProperty('textContent')).jsonValue();
            const judge = data.replace(/\n/g, '').replace(/^ *| *$/g, '');
            if (judge === 'Animation only icon') {
                lsdl_opts.animation = true;
                lsdl_opts.gif = true;
            }
            if (judge === 'Popup only effect icon') {
                lsdl_opts.effect = true;
                lsdl_opts.gif = true;
            }
            if (judge == 'Sound only icon') {
                lsdl_opts.sound = true;
            }
            if (judge === 'Animation & Sound icon') {
                lsdl_opts.animation = true;
                lsdl_opts.gif = true;
                lsdl_opts.sound = true;
            }
            if (judge === 'Name sticker') {
                lsdl_opts.custom = true;
            }
            if (judge === '') {
                lsdl_opts.manga = true;
            }
            await browser.close();
            return lsdl_opts
        }
    } else {
        await browser.close();
        return false
    }
}

(async () => {
    const auto_lsdl_opt = await get_option(URL);
    if (auto_lsdl_opt === true) {
        lsdl(URL, dir);
    } else if (auto_lsdl_opt != false) {
        lsdl(URL, dir, auto_lsdl_opt);
    } else {
        process.on("exit", () => {
            process.exit(1);
        });
    }
})();